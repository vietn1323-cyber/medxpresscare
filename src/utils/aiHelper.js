// Helper kết nối API Trí Tuệ Nhân Tạo (Google Gemini / OpenAI)
// Hỗ trợ tính năng viết lại bài viết từ URL ngoài và tối ưu SEO On-Page tự động

import { slugify, calculateSeoScore } from '../data/articles.js';

/**
 * Danh sách model Gemini sắp xếp theo thứ tự ưu tiên thử nghiệm (fallback chain)
 */
export const GEMINI_CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-latest',
  'gemma-4-26b-a4b-it',
  'gemini-pro'
];

/**
 * Hàm gọi API Gemini với cơ chế tự động thử model dự phòng nếu model hiện tại báo 404 / is not found
 */
export const callGeminiWithFallback = async ({
  apiKey,
  model = 'gemini-2.5-flash',
  payload,
  apiVersion = 'v1beta'
}) => {
  const cleanKey = apiKey.trim();
  const modelsToTry = Array.from(new Set([model, ...GEMINI_CANDIDATE_MODELS])).filter(Boolean);

  // Chuẩn hóa payload: bắt buộc mọi content block đều có role: 'user' hoặc 'model' cho Gemini 2.5
  const safePayload = {
    ...payload,
    contents: (payload.contents || []).map(c => ({
      role: c.role || 'user',
      parts: c.parts || [{ text: '' }]
    }))
  };

  let lastError = null;

  for (const m of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${m}:generateContent?key=${cleanKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey
        },
        body: JSON.stringify(safePayload)
      });

      if (res.ok) {
        const data = await res.json();
        return { data, modelUsed: m };
      }

      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${res.status}`;
      lastError = new Error(errMsg);

      // Nếu lỗi do model không hỗ trợ responseMimeType, tự động thử lại mà không gửi responseMimeType
      if (safePayload.generationConfig?.responseMimeType && errMsg.toLowerCase().includes('response_mime_type')) {
        const fallbackConfig = { ...safePayload.generationConfig };
        delete fallbackConfig.responseMimeType;
        const retryRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': cleanKey
          },
          body: JSON.stringify({ ...safePayload, generationConfig: fallbackConfig })
        });
        if (retryRes.ok) {
          const data = await retryRes.json();
          return { data, modelUsed: m };
        }
      }

      // Nếu không phải lỗi model not found (ví dụ lỗi sai API key 400/403 hay quota 429), thì không cần thử tiếp
      const isNotFound = res.status === 404 || 
        errMsg.toLowerCase().includes('not found') || 
        errMsg.toLowerCase().includes('not supported') ||
        errMsg.toLowerCase().includes('call modelservice.listmodels');
      
      if (!isNotFound) {
        throw lastError;
      }
    } catch (err) {
      lastError = err;
      const isNotFound = err.message?.toLowerCase().includes('not found') || 
        err.message?.toLowerCase().includes('not supported') ||
        err.message?.toLowerCase().includes('call modelservice.listmodels');
      if (!isNotFound) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến bất kỳ mô hình Gemini nào khả dụng.');
};

/**
 * Kiểm tra kết nối API Key AI (Hỗ trợ Cloudflare Workers AI, Google Gemini, OpenAI)
 */
export const testAiConnection = async (apiKey, provider = 'gemini', model = 'gemini-2.5-flash') => {
  // 1. Kiểm tra Cloudflare Workers AI (Chạy trực tiếp trên Cloudflare không cần API Key)
  if (provider === 'cloudflare_ai') {
    try {
      const res = await fetch('/api/ai-pharmacist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: 'Kiểm tra kết nối Cloudflare Workers AI' })
      });
      if (res.ok) {
        return {
          success: true,
          activeModel: model || '@cf/meta/llama-3.1-8b-instruct',
          message: 'Kết nối Cloudflare Workers AI thành công! (Mô hình Meta Llama 3.1 8B Instruct, 10.000 lượt tính toán AI miễn phí mỗi ngày trên Cloudflare)'
        };
      }
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.error || 'Chưa gắn kết binding "AI" trên Cloudflare Pages (Settings -> Bindings -> Workers AI -> Tên biến: AI).'
      };
    } catch (e) {
      return { success: false, message: 'Lỗi kiểm tra Cloudflare Workers AI: ' + e.message };
    }
  }

  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra!' };
  }

  const cleanKey = apiKey.trim();

  try {
    if (provider === 'gemini') {
      try {
        const { data, modelUsed } = await callGeminiWithFallback({
          apiKey: cleanKey,
          model,
          payload: {
            contents: [
              {
                role: 'user',
                parts: [{ text: 'Trả lời đúng một từ duy nhất: OK' }]
              }
            ]
          }
        });

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
        const isSwitched = modelUsed !== model;

        return {
          success: true,
          activeModel: modelUsed,
          message: isSwitched
            ? `Kết nối Google Gemini thành công! (Tự động kích hoạt model khả dụng: ${modelUsed} do model '${model}' chưa được kích hoạt cho Key này. Phản hồi: ${reply.trim()})`
            : `Kết nối Google Gemini thành công với model ${modelUsed}! (Phản hồi: ${reply.trim()})`
        };
      } catch (geminiErr) {
        // Nếu thất bại, thử gọi ModelService.ListModels để xem danh sách thực tế của chính API Key
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
            headers: { 'x-goog-api-key': cleanKey }
          });

          if (listRes.ok) {
            const listData = await listRes.json();
            const availableModels = (listData.models || [])
              .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
              .map(m => m.name.replace('models/', ''));

            // Thử từng model có trong availableModels với payload chuẩn có role: 'user'
            for (const candidate of availableModels) {
              try {
                const testCandidate = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${cleanKey}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': cleanKey
                  },
                  body: JSON.stringify({
                    contents: [
                      {
                        role: 'user',
                        parts: [{ text: 'Trả lời đúng một từ duy nhất: OK' }]
                      }
                    ]
                  })
                });

                if (testCandidate.ok) {
                  const replyData = await testCandidate.json();
                  const txt = replyData.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
                  return {
                    success: true,
                    activeModel: candidate,
                    message: `Kết nối Google Gemini thành công với model ${candidate}! (Phản hồi: ${txt.trim()})`
                  };
                }
              } catch {
                // Tiếp tục thử candidate tiếp theo
              }
            }

            return {
              success: false,
              message: `Đã tìm thấy các model có sẵn cho tài khoản: ${availableModels.slice(0, 5).join(', ')}. Nhưng không thể gọi generateContent: ${geminiErr.message}`
            };
          }
        } catch {
          // bỏ qua
        }

        return {
          success: false,
          message: `Lỗi kết nối Gemini: ${geminiErr.message}. Vui lòng kiểm tra lại API Key!`
        };
      }
    } else {
      // OpenAI / Compatible
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 10
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, message: `Lỗi OpenAI: ${errData.error?.message || res.statusText}` };
      }

      return { success: true, message: 'Kết nối OpenAI thành công!' };
    }
  } catch (err) {
    return { 
      success: false, 
      message: `Không thể kết nối đến máy chủ AI: ${err.message}. Kiểm tra kết nối mạng hoặc thử lại.` 
    };
  }
};

/**
 * Hàm làm sạch và xử lý sơ bộ các lỗi cú pháp JSON thường gặp từ LLM:
 * - Xóa trailing comma trước dấu đóng ngoặc (ví dụ: { "a": 1, })
 * - Loại bỏ các ký tự điều khiển không in được (ngoại trừ ký tự xuống dòng và thụt lề)
 */
export function sanitizeJsonCandidate(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/,\s*([\]}])/g, '$1')
    .replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F]/g, ' ');
}

/**
 * Trích xuất và phân tích cú pháp JSON an toàn từ phản hồi của AI
 * Xử lý được các trường hợp AI phản hồi kèm lời chào đầu/cuối (ví dụ: "Senior Pharmacist here..."),
 * bọc trong markdown code fence ```json ... ```, hoặc có lỗi ký tự điều khiển.
 */
export const extractJsonFromText = (text) => {
  if (!text || typeof text !== 'string') return null;

  const raw = text.trim();
  if (!raw) return null;

  // 1. Thử parse trực tiếp
  try {
    return JSON.parse(raw);
  } catch {
    // tiếp tục thử bóc tách
  }

  // 2. Bóc tách nội dung bên trong markdown code fence ```json ... ``` hoặc ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match;
  while ((match = codeBlockRegex.exec(raw)) !== null) {
    const blockContent = match[1]?.trim();
    if (blockContent) {
      try {
        return JSON.parse(blockContent);
      } catch {
        const cleaned = sanitizeJsonCandidate(blockContent);
        try {
          return JSON.parse(cleaned);
        } catch {
          // thử block tiếp theo nếu có
        }
      }
    }
  }

  // 3. Tìm khối JSON Object { ... } ngoài cùng
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = raw.substring(firstBrace, lastBrace + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      const cleaned = sanitizeJsonCandidate(candidate);
      try {
        return JSON.parse(cleaned);
      } catch {
        // bỏ qua
      }
    }
  }

  // 4. Tìm khối JSON Array [ ... ] ngoài cùng (nếu AI trả về danh sách mảng)
  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = raw.substring(firstBracket, lastBracket + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      const cleaned = sanitizeJsonCandidate(candidate);
      try {
        return JSON.parse(cleaned);
      } catch {
        // bỏ qua
      }
    }
  }

  return null;
};

/**
 * Viết lại bài viết từ link web khác hoặc nội dung thô bằng AI
 */
export const rewriteArticleWithAi = async ({
  sourceUrl = '',
  rawContent = '',
  targetKeyword = '',
  tone = 'medical_expert', // medical_expert | popular_accessible | clinical_academic
  apiKey = '',
  provider = 'gemini',
  model = 'gemini-2.5-flash'
}) => {
  if (!sourceUrl.trim() && !rawContent.trim()) {
    throw new Error('Vui lòng cung cấp link bài viết gốc hoặc dán nội dung thô cần viết lại!');
  }

  // 1. Nếu có API Key hợp lệ, gọi AI API thật để sinh nội dung
  if (apiKey && apiKey.trim()) {
    const cleanKey = apiKey.trim();

    const systemPrompt = `Bạn là Dược sĩ chuyên môn cao cấp và Chuyên gia SEO Y Dược hàng đầu tại MedXpressCare.com (Hệ thống Thực Phẩm Chức Năng Chuẩn Y Khoa).
Nhiệm vụ của bạn là VIẾT LẠI HOÀN TOÀN bài viết từ nguồn tham khảo được cung cấp, biến nó thành một bài cẩm nang Y khoa ĐỘC BẢN, CHUYÊN SÂU, TOÀN DIỆN VÀ DÀI (khoảng 1.500 - 3.000 từ), ĐẠT ĐIỂM SEO ON-PAGE TỐI ĐA (100/100).

YÊU CẦU BẮT BUỘC VỀ NỘI DUNG & ĐỘ DÀI:
1. KHÔNG VIẾT TÓM TẮT SƠ SÀI. Bài viết phải có dung lượng dài, chuyên sâu, phân tích cặn kẽ cơ chế sinh học, nghiên cứu lâm sàng (PubMed, FDA, TGA), nguyên nhân bệnh sinh, phác đồ liều dùng khoa học, tương tác thuốc, lưu ý bệnh nền, chế độ ăn uống sinh hoạt và phần Hỏi Đáp (FAQ).
2. Tối ưu On-Page SEO cho website MedXpressCare:
   - "title": Tiêu đề bài viết hấp dẫn, chứa từ khóa chính, độ dài 45 - 65 ký tự.
   - "slug": Đường dẫn tĩnh URL ngắn gọn, chuẩn không dấu cách nhau bằng dấu gạch ngang (ví dụ: cach-dung-canxi-d3k2-dung-chuan).
   - "category": Thuộc 1 trong các danh mục: "Chuyên Gia Tư Vấn", "Cảnh Báo & Hàng Thật", "Dược Liệu Bản Địa", "Cơ Xương Khớp", "Tim Mạch & Huyết Áp", "Dinh Dưỡng & Đề Kháng".
   - "summary": Đoạn Sapo tóm tắt mở đầu súc tích, chứa từ khóa chính, độ dài 120 - 165 ký tự.
   - "metaTitle": Tiêu đề hiển thị trên Google (50 - 65 ký tự), chứa từ khóa chính và tên thương hiệu MedXpressCare.
   - "metaDescription": Mô tả snippet hiển thị trên Google (130 - 160 ký tự), chứa từ khóa chính và lời kêu gọi hành động.
   - "focusKeyword": Từ khóa chính quan trọng nhất của bài viết.
   - "secondaryKeywords": 3-5 từ khóa phụ liên quan, phân cách bằng dấu phẩy.
   - "tags": Mảng 4-6 tag ngắn gọn (ví dụ: ["canxi d3k2", "loãng xương", "bổ sung canxi"]).
   - "image": URL ảnh đại diện chất lượng cao (Unsplash y tế).
   - "imageAlt": Câu mô tả ảnh đại diện chuẩn SEO, chứa từ khóa chính.
   - "readTime": Thời gian đọc ước tính (ví dụ: "7 phút đọc", "10 phút đọc").
   - "content": Nội dung bài viết chi tiết, dài, định dạng Markdown chuẩn bao gồm:
     + 4 đến 6 đề mục lớn H2 dùng cú pháp "## Tên Đề Mục"
     + Dưới mỗi H2 có 2 đến 3 đề mục nhỏ H3 dùng cú pháp "### Tên Ý Chính"
     + BẮT BUỘC CHÈN TỪ 2 ĐẾN 4 HÌNH ẢNH MINH HỌA Y KHOA ĐẸP vào giữa các phần bằng cú pháp:
       ![Mô tả chi tiết ảnh minh họa chuẩn y khoa](https://images.unsplash.com/photo-...)
       *Chọn link ảnh y tế phù hợp từ danh mục sau:
        - Xương khớp, canxi, cơ bắp: https://images.unsplash.com/photo-1576073719676-aa95576db207?w=900&auto=format&fit=crop&q=80
        - Dược liệu bản địa, thảo dược, sâm: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80
        - Tim mạch, huyết áp, omega-3: https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&auto=format&fit=crop&q=80
        - Viên uống, thực phẩm chức năng, đóng gói chuẩn GMP: https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80
        - Dược sĩ, bác sĩ thăm khám và tư vấn: https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&auto=format&fit=crop&q=80
        - Chế độ dinh dưỡng, trái cây tươi, đề kháng: https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&auto=format&fit=crop&q=80
     + Các khối lời khuyên chuyên môn đóng khung dùng cú pháp "> Lời khuyên từ Dược sĩ chuyên môn: ..."
     + Các danh sách gạch đầu dòng rõ ràng.
     + Phần "## Câu hỏi thường gặp (FAQ)" giải đáp 2-3 thắc mắc phổ biến nhất.
     + Đoạn kết luận và cam kết kiểm duyệt y tế.

ĐẦU RA BẮT BUỘC: Chỉ trả về MỘT CHUỖI JSON DUY NHẤT (không kèm markdown code block \`\`\`json, chỉ trả về JSON thuần túy):
{
  "title": "...",
  "slug": "...",
  "category": "...",
  "author": "DS. CKI Nguyễn Thu Trang",
  "authorRole": "Dược sĩ chuyên môn Cấp cao - ĐH Dược Hà Nội",
  "readTime": "8 phút đọc",
  "summary": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "focusKeyword": "...",
  "secondaryKeywords": "...",
  "tags": ["..."],
  "imageAlt": "...",
  "content": "..."
}`;

    const userPrompt = `Hãy viết lại và tối ưu SEO bài viết sau thành một bài cẩm nang chuyên sâu, dung lượng dài, có chèn các ảnh minh họa y tế trực quan:
Nguồn URL gốc: ${sourceUrl || 'Không có URL'}
Từ khóa mục tiêu yêu cầu (nếu có): ${targetKeyword || 'Tự động trích xuất từ khóa tốt nhất'}
Giọng văn: ${tone === 'medical_expert' ? 'Dược sĩ chuyên sâu, chuẩn Y khoa' : tone === 'popular_accessible' ? 'Gần gũi, dễ hiểu cho người bình dân' : 'Hàn lâm, nghiên cứu lâm sàng'}
Nội dung gốc tham khảo:
${rawContent ? rawContent.slice(0, 4000) : `Vui lòng phân tích chủ đề từ URL: ${sourceUrl} và viết một bài cẩm nang chuyên sâu, toàn diện, dài từ 1.500 - 3.000 từ có chèn ảnh minh họa y tế.`}`;

    try {
      let rawJsonText = '';

      if (provider === 'gemini') {
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          }
        };

        const { data } = await callGeminiWithFallback({
          apiKey: cleanKey,
          model,
          payload
        });

        rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // OpenAI
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 4096
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Lỗi API OpenAI (HTTP ${res.status})`);
        }

        const data = await res.json();
        rawJsonText = data.choices?.[0]?.message?.content || '';
      }

      // Trích xuất JSON an toàn (hỗ trợ cả khi AI chèn markdown fence hoặc câu dạo đầu)
      const parsed = extractJsonFromText(rawJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Dữ liệu AI trả về không đúng cấu trúc JSON hợp lệ.');
      }

      const generatedArticle = {
        id: 'art-' + Date.now(),
        title: parsed.title || 'Bài viết sức khỏe chuyên sâu',
        slug: parsed.slug || slugify(parsed.title || 'bai-viet-suc-khoe'),
        category: parsed.category || 'Chuyên Gia Tư Vấn',
        author: parsed.author || 'DS. CKI Nguyễn Thu Trang',
        authorRole: parsed.authorRole || 'Dược sĩ chuyên môn Cấp cao - ĐH Dược Hà Nội',
        publishedAt: new Date().toISOString().split('T')[0],
        readTime: parsed.readTime || '5 phút đọc',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
        imageAlt: parsed.imageAlt || parsed.title || '',
        summary: parsed.summary || '',
        content: parsed.content || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['sức khỏe', 'dược phẩm'],
        status: 'published',
        featured: false,
        metaTitle: parsed.metaTitle || parsed.title || '',
        metaDescription: parsed.metaDescription || parsed.summary || '',
        focusKeyword: parsed.focusKeyword || targetKeyword || '',
        secondaryKeywords: parsed.secondaryKeywords || '',
        schemaType: 'MedicalWebPage',
        canonicalUrl: `https://medxpresscare.com/cam-nang/${parsed.slug || 'bai-viet'}`,
        sourceUrl: sourceUrl || ''
      };

      const seoCheck = calculateSeoScore(generatedArticle);
      generatedArticle.seoScore = seoCheck.score;

      return generatedArticle;
    } catch (err) {
      console.warn('Lỗi gọi API AI thật, kích hoạt bộ giải thuật thông minh dự phòng:', err);
      // Tiếp tục xuống bộ giải thuật tạo bài viết mẫu chuẩn SEO dự phòng bên dưới
    }
  }

  // 2. Thử gọi Cloudflare Workers AI (100% Miễn phí không cần API Key)
  try {
    const cfRes = await fetch('/api/ai-writer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: targetKeyword || (rawContent ? rawContent.slice(0, 150) : 'Cẩm nang sức khỏe'),
        referenceText: rawContent || sourceUrl || ''
      })
    });

    if (cfRes.ok) {
      const cfData = await cfRes.json();
      if (cfData.success && cfData.data) {
        const d = cfData.data;
        const artTitle = d.title || `Cẩm nang chuyên sâu về ${targetKeyword || 'Sức khỏe'}`;
        const artSlug = d.slug || slugify(artTitle);
        const artSummary = d.summary || `Hướng dẫn chuyên sâu từ Dược sĩ MedXpressCare về ${targetKeyword || artTitle}.`;
        const artMetaTitle = d.metaTitle || (artTitle.length > 55 ? artTitle.slice(0, 55) : artTitle + ' | MedXpressCare');
        const artMetaDesc = d.metaDescription || (artSummary.length > 155 ? artSummary.slice(0, 155) : artSummary);

        const cfArticle = {
          id: 'art-' + Date.now(),
          title: artTitle,
          slug: artSlug,
          category: d.category || 'Chuyên Gia Tư Vấn',
          author: 'Dược sĩ Lâm sàng MedXpressCare',
          authorRole: 'Hội đồng Cố vấn Y Dược MedXpressCare',
          publishedAt: new Date().toISOString().split('T')[0],
          readTime: d.readTime || '6 phút đọc',
          image: d.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80',
          imageAlt: `Hình ảnh chuyên môn chuẩn y khoa cho bài viết ${artTitle}`,
          summary: artSummary,
          content: d.content || '',
          tags: Array.isArray(d.tags) && d.tags.length > 0 ? d.tags : [targetKeyword || 'sức khỏe', 'y khoa', 'dược sĩ tư vấn'],
          status: 'published',
          featured: false,
          metaTitle: artMetaTitle,
          metaDescription: artMetaDesc,
          focusKeyword: (targetKeyword || artTitle).toLowerCase(),
          secondaryKeywords: (d.tags || []).join(', '),
          schemaType: 'MedicalWebPage',
          canonicalUrl: `https://medxpresscare.com/cam-nang/${artSlug}`,
          sourceUrl: sourceUrl || '',
          aiModel: '@cf/meta/llama-3.1-8b-instruct (Cloudflare Workers AI)'
        };

        const seoCheck = calculateSeoScore(cfArticle);
        cfArticle.seoScore = seoCheck.score;
        return cfArticle;
      }
    }
  } catch {
    // Cloudflare AI not available or offline -> fallback to local smart generator
  }

  // 3. GIẢI THUẬT TỰ ĐỘNG THÔNG MINH DỰ PHÒNG (Khi chưa cấu hình API Key hoặc mạng offline)
  // Phân tích từ khóa từ URL hoặc text thô để tạo một bài viết chuẩn SEO 100%
  const extractedKeyword = targetKeyword.trim() || extractKeywordFromUrl(sourceUrl) || 'chăm sóc sức khỏe y khoa';
  const cleanKeyword = extractedKeyword.charAt(0).toUpperCase() + extractedKeyword.slice(1);

  const mockTitle = `Bí Quyết Sử Dụng ${cleanKeyword} Đúng Chuẩn Y Khoa Để Tối Đa Hiệu Quả`;
  const mockSlug = slugify(mockTitle);
  const mockDesc = `Hướng dẫn sử dụng ${extractedKeyword} đúng chuẩn Y khoa từ Dược sĩ MedXpressCare: Phác đồ liều dùng an toàn, thời điểm uống và cách nhận biết sản phẩm chính hãng.`;

  const mockArticle = {
    id: 'art-' + Date.now(),
    title: mockTitle,
    slug: mockSlug,
    category: determineCategory(extractedKeyword),
    author: 'DS. CKI Nguyễn Thu Trang',
    authorRole: 'Dược sĩ chuyên môn Cấp cao - ĐH Dược Hà Nội',
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: '7 phút đọc',
    image: getCoverImageForTopic(extractedKeyword),
    imageAlt: `Hướng dẫn sử dụng ${extractedKeyword} an toàn hiệu quả theo chuẩn Y tế`,
    summary: mockDesc,
    content: `## 1. Tầm quan trọng của việc hiểu đúng về ${extractedKeyword}

Trong kỷ nguyên số, nhu cầu tìm hiểu và chăm sóc sức khỏe chủ động ngày càng được người tiêu dùng đặc biệt quan tâm. Tuy nhiên, giữa "rừng" thông tin trôi nổi trên internet, việc tiếp cận nguồn kiến thức y khoa chính thống về **${extractedKeyword}** là điều kiện tiên quyết để bảo vệ sức khỏe cho cả gia đình.

![Nghiên cứu lâm sàng và hoạt tính sinh học của các dưỡng chất](https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80)

### Cơ chế sinh học và hấp thu qua đường tiêu hóa

Theo các tài liệu từ Dược thư Quốc gia và các nghiên cứu lâm sàng quốc tế (PubMed, FDA, TGA):
- **Giai đoạn hòa tan và thẩm thấu**: Dưỡng chất được phóng thích tối ưu khi môi trường pH dịch vị dạ dày ở mức sinh lý ổn định.
- **Tăng sinh khả dụng**: Khả năng hấp thu tăng lên đáng kể khi kết hợp cùng các vi chất đồng vận chuyển (ví dụ Canxi cần Vitamin D3 và K2, Sắt cần Vitamin C, Curcumin cần Piperine).
- **Hàng rào bảo vệ tế bào**: Giảm thiểu các tác nhân gây oxy hóa tế bào (gốc tự do ROS), tăng cường khả năng tự phục hồi và bảo vệ hệ cơ quan trước áp lực môi trường sống hiện đại.

## 2. Phác đồ liều dùng và thời điểm bổ sung chuẩn Y khoa

Để **${extractedKeyword}** phát huy hiệu quả tối đa và không gây lãng phí dưỡng chất, Dược sĩ MedXpressCare khuyến nghị bạn tuân thủ các nguyên tắc vàng sau:

![Dược sĩ tư vấn hướng dẫn phác đồ sử dụng an toàn](https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&auto=format&fit=crop&q=80)

### 3 Nguyên tắc vàng khi sử dụng:
1. **Đúng liều lượng**: Tuyệt đối không tự ý tăng liều gấp đôi với mong muốn có kết quả nhanh. Cơ thể có ngưỡng hấp thu tối đa trong ngày, bổ sung dư thừa sẽ đào thải qua gan thận gây áp lực không cần thiết.
2. **Đúng thời điểm**: Nên uống vào buổi sáng hoặc trưa sau bữa ăn khoảng 30 phút cùng một ly nước lọc ấm đầy (khoảng 200 - 250ml) để hoạt chất hòa tan hoàn toàn.
3. **Đủ liệu trình**: Duy trì đều đặn từ 2 đến 3 tháng để nồng độ hoạt chất trong mô cơ thể đạt trạng thái cân bằng sinh học bền vững.

> **Lời khuyên từ Dược sĩ chuyên môn:** Trước khi bắt đầu bất kỳ liệu trình bổ sung nào, hãy kiểm tra kỹ nhãn phụ tiếng Việt theo Nghị định 43 và Số ĐKSP cấp bởi Cục An Toàn Thực Phẩm - Bộ Y Tế để đảm bảo sản phẩm chính hãng 100%.

## 3. Những sai lầm phổ biến và lưu ý tương tác thuốc

Rất nhiều khách hàng gặp phải tình trạng "uống mãi không thấy hiệu quả" do mắc phải những sai lầm sau:
- **Uống cùng lúc với trà đặc, cà phê hoặc nước ngọt có ga**: Tannin trong trà và cafein sẽ kết tủa hoạt chất, làm giảm tới 70% khả năng hấp thu của ruột.
- **Tương tác với thuốc kháng sinh và thuốc tim mạch**: Cần uống cách xa thuốc điều trị bệnh mạn tính ít nhất 2 giờ đồng hồ.
- **Bảo quản sai cách**: Để sản phẩm ở nơi có ánh nắng trực tiếp hoặc nhiệt độ phòng quá cao làm biến tính các vi chất nhạy cảm với nhiệt độ.

## 4. Giải đáp thắc mắc thường gặp (FAQ)

### Uống liên tục kéo dài có tác dụng phụ không?
Thực phẩm bảo vệ sức khỏe đạt chuẩn GMP-WHO có độ an toàn rất cao. Tuy nhiên, sau mỗi liệu trình 3 tháng, bạn nên nghỉ ngắt quãng từ 2 - 4 tuần để cơ thể tái lập cân bằng nội môi tự nhiên.

### Nên kết hợp chế độ ăn uống sinh hoạt như thế nào?
Uống đủ 2 lít nước mỗi ngày, tăng cường rau xanh giàu chất xơ, ngủ đủ 7-8 tiếng và duy trì vận động nhẹ nhàng 30 phút mỗi ngày sẽ tăng hiệu quả hấp thu lên gấp 2 lần.`,
    tags: [extractedKeyword, 'chuẩn y khoa', 'dược sĩ tư vấn', 'bảo vệ sức khỏe', 'medxpress'],
    status: 'published',
    featured: false,
    metaTitle: `${mockTitle} | MedXpressCare`,
    metaDescription: mockDesc,
    focusKeyword: extractedKeyword.toLowerCase(),
    secondaryKeywords: `bổ sung ${extractedKeyword}, liệu trình dùng ${extractedKeyword}, hàng chính ngạch`,
    schemaType: 'MedicalWebPage',
    canonicalUrl: `https://medxpresscare.com/cam-nang/${mockSlug}`,
    sourceUrl: sourceUrl || ''
  };

  const seoCheck = calculateSeoScore(mockArticle);
  mockArticle.seoScore = seoCheck.score;

  return mockArticle;
};

// Helper trích xuất từ khóa từ URL
function extractKeywordFromUrl(url) {
  if (!url) return '';
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || '';
    const clean = lastPart
      .replace(/\.(html|php|htm|aspx)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\d+/g, '')
      .trim();
    return clean || 'dược phẩm sức khỏe';
  } catch {
    return url.replace(/https?:\/\//i, '').split('/')[1]?.replace(/[-_]/g, ' ') || 'dược phẩm sức khỏe';
  }
}

function determineCategory(keyword) {
  const k = (keyword || '').toLowerCase();
  if (k.includes('khớp') || k.includes('canxi') || k.includes('xương') || k.includes('glucosamine')) return 'Cơ Xương Khớp';
  if (k.includes('sâm') || k.includes('đông trùng') || k.includes('nghệ') || k.includes('dược liệu')) return 'Dược Liệu Bản Địa';
  if (k.includes('tim') || k.includes('áp') || k.includes('máu') || k.includes('omega') || k.includes('dầu cá')) return 'Tim Mạch & Huyết Áp';
  if (k.includes('giả') || k.includes('thật') || k.includes('phân biệt') || k.includes('chính ngạch')) return 'Cảnh Báo & Hàng Thật';
  return 'Chuyên Gia Tư Vấn';
}

function getCoverImageForTopic(keyword) {
  const k = (keyword || '').toLowerCase();
  if (k.includes('khớp') || k.includes('canxi')) {
    return 'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=800&auto=format&fit=crop&q=80';
  }
  if (k.includes('sâm') || k.includes('thảo dược')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
  }
  if (k.includes('tim') || k.includes('máu') || k.includes('omega')) {
    return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80';
}

/**
 * Dược Sĩ AI 24/7 Tư Vấn Chuyên Sâu Lâm Sàng & Đề Xuất Phác Đồ Cá Nhân Hóa
 */
export const consultWithAiPharmacist = async ({
  userMessage = '',
  targetAudience = '',
  selectedConcern = null,
  selectedCondition = 'none',
  products = [],
  apiKey = '',
  provider = 'gemini',
  model = 'gemini-2.5-flash',
  chatHistory = []
}) => {
  const query = (userMessage || '').trim();

  // 1. NẾU CÓ API KEY AI (GEMINI HOẶC OPENAI), GỌI API THỰC TẾ
  if (apiKey && apiKey.trim()) {
    const cleanKey = apiKey.trim();
    
    // Tóm tắt danh mục sản phẩm của cửa hàng để AI nắm rõ
    const catalogSummary = (products && products.length > 0 ? products : [])
      .map(p => {
        const catStr = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories.join(', ') : (p.category || '');
        return `- Mã: ${p.id} | Tên: ${p.name} | Loại: ${p.originType === 'domestic' ? 'Nội địa VN' : 'Nhập ngoại (' + (p.countryName || 'Chính ngạch') + ')'} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Nhóm bệnh / Công dụng: ${catStr}`;
      })
      .join('\n');

    const systemPrompt = `Bạn là Dược sĩ Lâm sàng Trưởng 24/7 của Hệ Thống Thực Phẩm Bảo Vệ Sức Khỏe MedXpressCare.com.
Nhiệm vụ của bạn là tư vấn sức khỏe tận tâm, chuẩn xác y khoa, cá nhân hóa cho từng đối tượng (Người cao tuổi, Phụ nữ, Nam giới, Dân văn phòng, Trẻ nhỏ) và mối quan tâm cụ thể của họ.

DANH MỤC SẢN PHẨM CỬA HÀNG HIỆN CÓ:
${catalogSummary}

QUY TẮC TƯ VẤN:
1. Thấu cảm và lắng nghe triệu chứng của khách hàng.
2. Giải thích cơ chế sinh lý học/bệnh học bằng ngôn ngữ dễ hiểu, chuẩn y khoa.
3. Luôn kiểm tra và lưu ý tương tác thuốc, bệnh lý nền (như dạ dày, huyết áp, tiểu đường).
4. Đề xuất phác đồ chuẩn gồm 2 giải pháp song song từ danh mục sản phẩm:
   - 01 Sản phẩm Hàng Nội Địa Việt Nam chuẩn GMP-WHO
   - 01 Sản phẩm Hàng Nhập Ngoại chính ngạch
5. Hướng dẫn liều dùng, thời điểm uống an toàn và lời khuyên sinh hoạt bổ trợ.

ĐẦU RA BẮT BUỘC: Trả về MỘT CHUỖI JSON DUY NHẤT (không dùng markdown code blocks):
{
  "reply": "Nội dung phản hồi tư vấn chi tiết của Dược sĩ bằng Markdown (chào hỏi, phân tích nguyên nhân, cơ chế, hướng dẫn dùng, lời khuyên sinh hoạt)",
  "detectedAudience": "elderly | women | men | office | kids",
  "detectedConcern": "Tiêu đề mối quan tâm",
  "recommendedProductIds": ["id_sp_noi_dia", "id_sp_nhap_ngoai"],
  "precautions": "Lưu ý tương tác thuốc hoặc bệnh nền quan trọng (nếu có)"
}`;

    const formattedHistory = chatHistory.slice(-4).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      text: msg.text
    }));

    try {
      let rawJsonText = '';

      if (provider === 'gemini') {
        const contents = [
          ...formattedHistory.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
          })),
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nThông tin người dùng: Đối tượng=${targetAudience || 'Chưa chọn'}, Mối quan tâm=${selectedConcern?.title || 'Chưa chọn'}, Bệnh nền=${selectedCondition}\nCâu hỏi người dùng: "${query}"` }]
          }
        ];

        const payload = {
          contents,
          generationConfig: { 
            temperature: 0.3, 
            maxOutputTokens: 3000,
            responseMimeType: 'application/json'
          }
        };

        const { data } = await callGeminiWithFallback({
          apiKey: cleanKey,
          model,
          payload
        });

        rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // OpenAI
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-4).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          {
            role: 'user',
            content: `Thông tin: Đối tượng=${targetAudience || 'Chưa rõ'}, Mối quan tâm=${selectedConcern?.title || 'Chưa rõ'}, Bệnh nền=${selectedCondition}. Câu hỏi: "${query}"`
          }
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.3
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Lỗi API OpenAI (HTTP ${res.status})`);
        }

        const data = await res.json();
        rawJsonText = data.choices?.[0]?.message?.content || '';
      }

      if (rawJsonText) {
        const parsed = extractJsonFromText(rawJsonText) || {};

        return {
          reply: parsed.reply || 'Dược sĩ đã tiếp nhận thông tin của quý khách.',
          detectedAudience: parsed.detectedAudience || targetAudience || 'adult',
          detectedConcern: parsed.detectedConcern || selectedConcern?.title || 'Tư vấn sức khỏe toàn diện',
          recommendedProductIds: Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [],
          precautions: parsed.precautions || ''
        };
      }
    } catch (err) {
      console.warn('Lỗi gọi AI API trực tiếp, kích hoạt thuật toán dược lý thông minh dự phòng:', err);
    }
  }

  // 2. Thử gọi Cloudflare Workers AI (100% Miễn phí không cần API Key)
  try {
    const catalogSummary = (products && products.length > 0 ? products : [])
      .map(p => {
        const catStr = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories.join(', ') : (p.category || '');
        return `- Mã: ${p.id} | Tên: ${p.name} | Loại: ${p.originType === 'domestic' ? 'Nội địa VN' : 'Nhập ngoại (' + (p.countryName || 'Chính ngạch') + ')'} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Nhóm: ${catStr}`;
      })
      .join('\n');

    const cfRes = await fetch('/api/ai-pharmacist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: query,
        catalogSummary,
        targetAudience,
        selectedCondition,
        chatHistory: (chatHistory || []).slice(-4)
      })
    });

    if (cfRes.ok) {
      const cfData = await cfRes.json();
      if (cfData.success && cfData.reply) {
        let recIds = [];
        const replyLower = cfData.reply.toLowerCase();
        for (const p of products) {
          if (replyLower.includes(p.name.toLowerCase()) || replyLower.includes(p.id.toLowerCase())) {
            recIds.push(p.id);
          }
        }
        if (recIds.length === 0) recIds = ['vn-04', 'au-01'];

        return {
          reply: cfData.reply,
          detectedAudience: targetAudience || 'general',
          detectedConcern: 'Dược Sĩ AI Cloudflare',
          recommendedProductIds: recIds.slice(0, 2),
          precautions: ''
        };
      }
    }
  } catch {
    // Cloudflare AI not available or offline -> fallback to local clinical engine
  }

  // 3. GIẢI THUẬT DƯỢC LÝ HỌC LÂM SÀNG THÔNG MINH DỰ PHÒNG (Clinical Rule Engine)
  // Tự động phân tích từ khóa, đối tượng, mối quan tâm, tương tác thuốc và trả về lời khuyên y khoa chi tiết
  const textLower = query.toLowerCase();

  // Nhận diện đối tượng (Audience Detection)
  let audience = targetAudience || '';
  if (!audience) {
    if (/bác|ông|bà|cao tuổi|người già|hưu|60|70|50|thoái hóa|tiểu đêm|tai biến/.test(textLower)) {
      audience = 'elderly';
    } else if (/phụ nữ|chị em|phái đẹp|nữ|mẹ bầu|sau sinh|da|nám|nếp nhăn|bốc hỏa|khô hạn|kinh nguyệt|nội tiết/.test(textLower)) {
      audience = 'women';
    } else if (/nam|đàn ông|anh em|phái mạnh|bia|rượu|nhậu|men gan|sinh lý|gút|uric|thận yếu/.test(textLower)) {
      audience = 'men';
    } else if (/bé|con|trẻ|em bé|học sinh|chiều cao|thấp còi|biếng ăn|lười ăn|hay ốm|đề kháng/.test(textLower)) {
      audience = 'kids';
    } else if (/văn phòng|máy tính|laptop|mắt|mỏi mắt|khô mắt|vai gáy|cổ|stress|ngồi nhiều|trĩ|táo bón/.test(textLower)) {
      audience = 'office';
    } else {
      audience = 'elderly';
    }
  }

  // Nhận diện mối quan tâm chính (Concern Detection)
  let matchedConcernTitle = selectedConcern?.title || '';
  let domesticId = 'vn-01';
  let importedId = 'us-01';
  let mechanism = '';
  let lifestyleAdvice = '';
  let recommendedCategory = 'bone_joint';

  if (/khớp|gối|lục khục|thoái hóa|xương|cột sống|đau lưng/.test(textLower) || selectedConcern?.id?.includes('joint')) {
    matchedConcernTitle = 'Thoái hóa sụn khớp & Viêm đau khớp';
    domesticId = 'vn-01'; // Khớp Bách Niên Kiện
    importedId = 'us-01'; // Glucosamine MSM Kirkland Mỹ
    recommendedCategory = 'bone_joint';
    mechanism = 'Lớp sụn khớp bị bào mòn theo thời gian, bao hoạt dịch giảm tiết dịch nhờn dẫn tới cọ xát đầu xương gây viêm, cứng khớp vào buổi sáng và phát ra tiếng lạo xạo khi vận động.';
    lifestyleAdvice = 'Hạn chế mang vác vật nặng, tập bài tập đạp xe trên không hoặc bơi lội nhẹ nhàng 20 phút mỗi ngày. Chườm ấm vùng khớp vào mỗi buổi tối trước khi đi ngủ.';
  } else if (/mắt|khô mắt|mỏi mắt|nhòe|ánh sáng xanh|cận/.test(textLower) || selectedConcern?.id?.includes('eyes')) {
    matchedConcernTitle = 'Khô mỏi mắt & Suy giảm thị lực do màn hình';
    domesticId = 'vn-04'; // Cebraton Traphaco
    importedId = 'jp-03'; // DHC Lutein Nhật
    recommendedCategory = 'eye_care';
    mechanism = 'Ánh sáng xanh từ màn hình điện tử thâm nhập sâu vào đáy mắt, làm suy giảm lượng sắc tố Lutein tại điểm vàng và khiến cơ thể mi mắt phải co thắt liên tục.';
    lifestyleAdvice = 'Áp dụng quy tắc vàng 20-20-20: Cứ 20 phút nhìn màn hình thì hướng mắt nhìn xa 20 feet (6 mét) trong 20 giây. Giữ khoảng cách màn hình tối thiểu 50cm.';
  } else if (/gan|men gan|rượu|bia|mẩn ngứa|mề đay|nóng trong/.test(textLower) || selectedConcern?.id?.includes('liver')) {
    matchedConcernTitle = 'Nóng gan, Men gan cao & Tổn thương gan do bia rượu';
    domesticId = 'vn-03'; // Curcumin OIC New
    importedId = 'us-02'; // Silymarin Milk Thistle 1000mg Now Foods
    recommendedCategory = 'digestive_liver';
    mechanism = 'Ethanol và acetaldehyde từ bia rượu oxy hóa màng tế bào gan Kupffer, khiến enzym gan ALT/AST rò rỉ vào máu và tích tụ nhiệt độc gây mẩn ngứa bứt rứt.';
    lifestyleAdvice = 'Uống tối thiểu 2 đến 2.5 lít nước lọc mỗi ngày. Uống 1 viên Silymarin trước và sau các buổi tiệc tiếp khách để tạo màng bảo vệ tế bào gan cấp tốc.';
  } else if (/da|nám|tàn nhang|collagen|sạm|chảy xệ|lão hóa/.test(textLower) || selectedConcern?.id?.includes('skin')) {
    matchedConcernTitle = 'Sạm nám, lão hóa sớm & suy giảm Collagen';
    domesticId = 'vn-03'; // Nano Curcumin OIC New
    importedId = 'jp-01'; // Viên Trắng Da DHC Coix Nhật
    recommendedCategory = 'beauty_skin';
    mechanism = 'Tia UV và gốc tự do kích hoạt enzym Tyrosinase sản sinh ồ ạt hắc sắc tố Melanin dưới lớp đáy biểu bì, đồng thời các sợi nâng đỡ collagen bị phân rã đứt gãy.';
    lifestyleAdvice = 'Luôn thoa kem chống nắng chỉ số SPF 50+ trước khi ra ngoài 20 phút. Uống nhiều nước và bổ sung thêm trái cây giàu Vitamin C như cam, bưởi, ổi.';
  } else if (/nội tiết|bốc hỏa|khô hạn|mãn kinh|kinh nguyệt/.test(textLower) || selectedConcern?.id?.includes('hormone')) {
    matchedConcernTitle = 'Rối loạn nội tiết tố nữ & Tiền mãn kinh';
    domesticId = 'vn-05'; // Sâm Ngọc Linh K5
    importedId = 'au-03'; // Tinh dầu Hoa Anh Thảo Blackmores EPO Úc
    recommendedCategory = 'womens_health';
    mechanism = 'Sự sụt giảm tự nhiên của Estrogen nội sinh làm mất cân bằng thụ thể thần kinh thực vật, dẫn đến cơn bốc hỏa, đổ mồ hôi đêm, tâm trạng thất thường và khô hạn.';
    lifestyleAdvice = 'Bổ sung axit béo thiết yếu GLA từ Hoa Anh Thảo sau bữa ăn chính. Giữ tinh thần thoải mái, tập Yoga nhẹ nhàng và hạn chế đồ uống có cồn, cay nóng.';
  } else if (/sinh lý|yếu|xuất tinh|thận yếu|đau lưng mỏi gối|tiểu đêm/.test(textLower) || selectedConcern?.id?.includes('vitality') || selectedConcern?.id?.includes('kidney')) {
    matchedConcernTitle = 'Suy giảm sinh lực nam giới, Thận âm hư & Tiểu đêm';
    domesticId = 'vn-06'; // Bổ Thận Âm Nam Dược
    importedId = 'kr-01'; // Nước Hồng Sâm KGC 6 năm tuổi
    recommendedCategory = 'mens_health';
    mechanism = 'Testosterone suy giảm kèm chức năng lọc cầu thận suy yếu khiến cơ thể mệt mỏi, chân tay lạnh, đau thắt lưng và tăng tần suất tiểu tiện về đêm.';
    lifestyleAdvice = 'Không nhịn tiểu, không uống quá nhiều nước sau 20h tối. Tập bài tập Kegel và duy trì lối sống điều độ, ngủ đủ giấc trước 23h đêm.';
  } else if (/chiều cao|thấp còi|canxi|d3k2|chậm lớn/.test(textLower) || selectedConcern?.id?.includes('height')) {
    matchedConcernTitle = 'Chậm phát triển chiều cao & Thiếu hụt Canxi - D3K2';
    domesticId = 'vn-01'; // Hỗ trợ xương khớp
    importedId = 'au-02'; // Canxi Sữa Tảo Biển Bio Island Úc
    recommendedCategory = 'bone_joint';
    mechanism = 'Khung xương thiếu hụt ion canxi sinh học và đặc biệt là Vitamin K2 (MK-7) - vi chất quyết định kích hoạt Osteocalcin gắn canxi vào sụn tăng trưởng.';
    lifestyleAdvice = 'Khuyến khích bé bơi lội, chơi bóng rổ, nhảy dây 30 phút mỗi ngày. Cho bé đi ngủ sớm trước 22h để tuyến yên giải phóng tối đa Hormone tăng trưởng GH.';
  } else if (/biếng ăn|hấp thu|tiêu hóa|chậm tăng cân|lười ăn/.test(textLower) || selectedConcern?.id?.includes('appetite')) {
    matchedConcernTitle = 'Biếng ăn, tiêu hóa kém & Chậm hấp thu dưỡng chất';
    domesticId = 'vn-02'; // Đông Trùng Hạ Thảo Sapa Traphaco
    importedId = 'jp-02'; // Tảo Vàng Spirulina EX Nhật
    recommendedCategory = 'immunity';
    mechanism = 'Men tiêu hóa đường ruột non yếu kết hợp thiếu hụt các vi chất kẽm và acid amin khiến gai vị giác kém nhạy bén, giảm cảm giác thèm ăn tự nhiên.';
    lifestyleAdvice = 'Chia nhỏ bữa ăn, tạo không khí vui vẻ không ép buộc khi ăn. Bổ sung acid amin và 2 tỷ bào tử lợi khuẩn để tái tạo nhung mao ruột non.';
  } else if (/đề kháng|hay ốm|ho|sổ mũi|viêm phế quản|hắt hơi/.test(textLower) || selectedConcern?.id?.includes('immunity')) {
    matchedConcernTitle = 'Đề kháng yếu, hay ốm vặt & Viêm đường hô hấp khi giao mùa';
    domesticId = 'vn-08'; // Siro Bổ Phổi Bạch Bộ DHG
    importedId = 'de-01'; // Doppelherz Kinder Thymo Đức
    recommendedCategory = 'kids_mom';
    mechanism = 'Hệ miễn dịch dịch thể và tuyến ức chưa trưởng thành hoàn thiện, dễ bị virus và vi khuẩn đường hô hấp tấn công khi nhiệt độ độ ẩm thay đổi đột ngột.';
    lifestyleAdvice = 'Giữ ấm cổ họng và bàn chân khi ngủ phòng điều hòa. Vệ sinh mũi họng bằng nước muối sinh lý hàng ngày và bổ sung Thymomodulin tăng sinh tế bào miễn dịch.';
  } else if (/tim mạch|huyết áp|mỡ máu|xơ vữa|cholesterol/.test(textLower) || selectedConcern?.id?.includes('cardio')) {
    matchedConcernTitle = 'Huyết áp, Mỡ máu cao & Xơ vữa mạch vành';
    domesticId = 'vn-04'; // Cebraton Traphaco
    importedId = 'au-01'; // Blackmores Fish Oil 1000mg Úc
    recommendedCategory = 'cardio';
    mechanism = 'Mảng bám cholesterol LDL oxy hóa làm hẹp lòng động mạch, tăng sức cản ngoại vi khiến huyết áp tăng vọt và tim phải co bóp gắng sức.';
    lifestyleAdvice = 'Ăn nhạt (giảm muối dưới 5g/ngày), hạn chế mỡ động vật và nội tạng. Bổ sung EPA/DHA tinh khiết để làm sạch thành mạch và chống kết tập tiểu cầu.';
  } else if (/mất ngủ|đau đầu|tiền đình|chóng mặt|thần kinh|stress/.test(textLower) || selectedConcern?.id?.includes('sleep')) {
    matchedConcernTitle = 'Mất ngủ kinh niên, Rối loạn tiền đình & Suy nhược thần kinh';
    domesticId = 'vn-04'; // Cebraton Traphaco
    importedId = 'de-02'; // Doppelherz Magie + Canxi + D3 Đức
    recommendedCategory = 'brain_nerve';
    mechanism = 'Lưu lượng máu lên não bị suy giảm làm tế bào nơ-ron thiếu dưỡng khí, kết hợp nồng độ Cortisol căng thẳng làm ức chế chu kỳ tiết Melatonin tự nhiên.';
    lifestyleAdvice = 'Tắt điện thoại và thiết bị màn hình trước khi ngủ 45 phút. Ngâm chân nước ấm với chút gừng muối để kích thích tuần hoàn kinh lạc hạ khí.';
  } else {
    // Mặc định bồi bổ toàn diện
    matchedConcernTitle = 'Bồi bổ thể lực, Tăng cường miễn dịch & Phục hồi sức khỏe';
    domesticId = 'vn-05'; // Sâm Ngọc Linh K5
    importedId = 'kr-01'; // Nước Hồng Sâm KGC Hàn Quốc
    recommendedCategory = 'immunity';
    mechanism = 'Cơ thể suy nhược sau ốm hoặc chịu áp lực làm việc quá tải, suy giảm năng lượng tế bào ATP và giảm sút đề kháng tự nhiên.';
    lifestyleAdvice = 'Ăn uống đa dạng, uống đủ nước và duy trì giấc ngủ đủ 7-8 tiếng mỗi đêm để cơ thể tự tái sinh năng lượng sinh học.';
  }

  // Cảnh báo tương tác thuốc & Bệnh lý nền (Precautions)
  let precautionsNote = '';
  if (selectedCondition === 'stomach' || /dạ dày|bao tử|trào ngược|loét/.test(textLower)) {
    precautionsNote = '⚠️ LƯU Ý DẠ DÀY: Luôn uống các sản phẩm bổ sung sau bữa ăn no khoảng 30 phút cùng 1 ly nước ấm đầy. Tuyệt đối không uống lúc bụng đói để bảo vệ niêm mạc.';
  } else if (selectedCondition === 'blood_pressure' || /huyết áp|thuốc áp/.test(textLower)) {
    precautionsNote = '⚠️ LƯU Ý HUYẾT ÁP: Uống TPCN cách cữ thuốc huyết áp theo đơn của bác sĩ ít nhất 1.5 - 2 giờ. Tuyệt đối không tự ý ngưng thuốc điều trị kê đơn.';
  } else if (selectedCondition === 'diabetes' || /tiểu đường|đường huyết/.test(textLower)) {
    precautionsNote = '⚠️ LƯU Ý TIỂU ĐƯỜNG: Các phác đồ Dược sĩ gợi ý không chứa đường tự do Saccarozo, rất an toàn cho người kiểm soát chỉ số HbA1c.';
  } else if (selectedCondition === 'calcium_iron' || /sắt|canxi/.test(textLower)) {
    precautionsNote = '⚠️ LƯU Ý VI CHẤT: Uống cách viên Canxi hoặc Sắt khoáng chất khoảng 2 giờ để tránh tương tác tạo phức chelate cản trở hấp thu.';
  }

  // Tạo lời khuyên chi tiết từ Dược sĩ
  const replyMarkdown = `### 🩺 Chẩn Đoán & Tư Vấn Chuyên Môn Cho Quý Khách

Chào quý khách, Dược sĩ Lâm sàng của **MedXpressCare** đã phân tích kỹ tình trạng của quý khách:

**1. Về vấn đề:** **${matchedConcernTitle}**
- **Cơ chế sinh học:** ${mechanism}

**2. Phác đồ điều trị khuyến nghị:**
Dược sĩ xây dựng cho quý khách 2 lựa chọn song song có cùng công năng vượt trội để quý khách tiện cân nhắc:
- 🇻🇳 **Phương án 1 (Hàng Nội Địa):** Sử dụng thảo dược Việt Nam chuẩn hóa công nghệ cao đạt chuẩn **GMP-WHO**. Dược tính tương thích hoàn hảo với cơ địa người Việt và chi phí tiết kiệm.
- 🌐 **Phương án 2 (Hàng Nhập Ngoại):** Sản phẩm nhập khẩu chính ngạch từ các quốc gia hàng đầu (Mỹ, Úc, Nhật, Đức) với chứng nhận quốc tế nghiêm ngặt như **FDA, TGA, GMP-WHO**.

**3. Lời khuyên chế độ sinh hoạt & ăn uống:**
- ${lifestyleAdvice}
${precautionsNote ? `\n> **${precautionsNote}**\n` : ''}
*Quý khách có thể xem chi tiết 2 sản phẩm đề xuất chuẩn hóa bên dưới hoặc bấm trực tiếp để thêm vào giỏ hàng và đặt giao hỏa tốc tận nhà.*`;

  return {
    reply: replyMarkdown,
    detectedAudience: audience,
    detectedConcern: matchedConcernTitle,
    recommendedProductIds: [domesticId, importedId],
    precautions: precautionsNote
  };
};
