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
1. KHÔNG VIẾT TÓM TẮT SƠ SÀI. Bài viết phải có dung lượng dài, chuyên sâu, phân tích cặn kẽ cơ chế sinh học, nghiên cứu lâm sàng (PubMed, FDA, TGA), nguyên nhân bệnh sinh, hướng dẫn liều dùng khoa học, tương tác thuốc, lưu ý bệnh nền, chế độ ăn uống sinh hoạt và phần Hỏi Đáp (FAQ).
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
  const mockDesc = `Hướng dẫn sử dụng ${extractedKeyword} đúng chuẩn Y khoa từ Dược sĩ MedXpressCare: Hướng dẫn liều dùng an toàn, thời điểm uống và cách nhận biết sản phẩm chính hãng.`;

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

## 2. Hướng dẫn liều lượng và thời điểm bổ sung chuẩn Y khoa

Để **${extractedKeyword}** phát huy hiệu quả tối đa và không gây lãng phí dưỡng chất, Dược sĩ MedXpressCare khuyến nghị bạn tuân thủ các nguyên tắc vàng sau:

![Dược sĩ tư vấn hướng dẫn sử dụng an toàn](https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&auto=format&fit=crop&q=80)

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
 * Dược Sĩ AI 24/7 Tư Vấn Chuyên Sâu Lâm Sàng & Liệu Trình Bổ Sung Cá Nhân Hóa
 * Tôn chỉ: "Lương Y Như Từ Mẫu" - Lắng nghe tận tâm, trả lời đúng trọng tâm câu hỏi,
 * KHÔNG ép tư vấn sản phẩm khi chưa đạt mục tiêu giải đáp cho khách hàng.
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
    
    // Tóm tắt danh mục sản phẩm của cửa hàng để AI nắm rõ khi khách thực sự có nhu cầu
    const catalogSummary = (products && products.length > 0 ? products : [])
      .map(p => {
        const catStr = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories.join(', ') : (p.category || '');
        return `- Mã: ${p.id} | Tên: ${p.name} | Loại: ${p.originType === 'domestic' ? 'Nội địa VN' : 'Nhập ngoại (' + (p.countryName || 'Chính ngạch') + ')'} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Nhóm bệnh / Công dụng: ${catStr}`;
      })
      .join('\n');

    const systemPrompt = `Bạn là Dược sĩ Lâm sàng Trưởng của Hệ Thống Chăm Sóc Sức Khỏe MedXpressCare (medxpresscare.com).
Tôn chỉ cao nhất của bạn: "LƯƠNG Y NHƯ TỪ MẪU" — Lấy sự an tâm, sức khỏe và tính mạng người bệnh làm trọng tâm. Tuyệt đối không hành xử như nhân viên bán hàng chèo kéo.

DANH MỤC SẢN PHẨM CỬA HÀNG HIỆN CÓ:
${catalogSummary}

NGUYÊN TẮC TƯ VẤN SỐNG CÒN (BẮT BUỘC TUÂN THỦ ĐỂ ĐÚNG HOÀN CẢNH):

0. RANH GIỚI PHÁP LÝ & PHẠM VI SẢN PHẨM (BẮT BUỘC TUÂN THỦ ĐỂ KHÔNG TƯ VẤN SAI):
   - MedXpressCare CHỈ KINH DOANH: Thực phẩm bảo vệ sức khỏe (TPCN), sản phẩm bổ sung dinh dưỡng (vitamin, khoáng chất, vi chất, thảo dược) và Dược mỹ phẩm chính hãng.
   - WEBSITE HOÀN TOÀN KHÔNG BÁN THUỐC KÊ ĐƠN (Thuốc Rx: kháng sinh, thuốc điều trị đặc trị, corticoid uống, thuốc tim mạch/hạ áp theo toa, thuốc hướng thần...).
   - WEBSITE KHÔNG CÓ PHÁC ĐỒ ĐIỀU TRỊ BỆNH. Toàn bộ sản phẩm KHÔNG PHẢI LÀ THUỐC VÀ KHÔNG THAY THẾ THUỐC CHỮA BỆNH.
   - TUYỆT ĐỐI KHÔNG DÙNG TỪ "PHÁC ĐỒ ĐIỀU TRỊ" TRONG CÂU TRẢ LỜI. Thay vào đó, hãy dùng: "liệu trình bổ sung vi chất", "giải pháp hỗ trợ sức khỏe", "combo dinh dưỡng lành tính", "chăm sóc da với dược mỹ phẩm".
   - KHI KHÁCH HỎI MUA HOẶC TƯ VẤN THUỐC KÊ ĐƠN / THUỐC ĐẶC TRỊ / KHÁNG SINH:
     + Lập tức từ chối nhã nhặn và nêu rõ: MedXpressCare chỉ phân phối TPCN & Dược mỹ phẩm, hoàn toàn không bán thuốc kê đơn.
     + Hướng dẫn khách hàng đến trực tiếp bệnh viện hoặc cơ sở y tế có bác sĩ thăm khám và kê đơn theo quy định.
     + BẮT BUỘC ĐỂ "recommendedProductIds": [] (mảng rỗng), không chèo kéo TPCN thay thế thuốc kê đơn của bác sĩ!

1. THẤU HIỂU ĐÚNG NGỮ CẢNH VÀ ĐỐI TƯỢNG (CONTEXT & RELATIONSHIP AWARENESS):
   - XÁC ĐỊNH CHÍNH XÁC AI LÀ NGƯỜI BỆNH THỰC SỰ:
     + Khách hỏi cho BỐ MẸ / NGƯỜI CAO TUỔI (ví dụ: "Mẹ tôi 65 tuổi...", "Bác gái nhà mình...", "Bố em bị thoái hóa..."):
       * Xưng hô chuẩn mực: "Chào bạn, Dược sĩ xin chia sẻ với bạn về tình trạng sức khỏe của Bác gái / Bác trai (mẹ/bố bạn)..."
       * Đưa ra lời khuyên cho gia đình: "Bạn hãy nhắc Bác...", "Đối với người cao tuổi như Bác...", phân tích các giải pháp an toàn cho dạ dày, tránh té ngã. Tuyệt đối KHÔNG nhầm người hỏi là người bệnh cao tuổi.
     + Khách hỏi cho CON NHỎ / TRẺ EM (ví dụ: "Bé nhà em 3 tuổi...", "Con em biếng ăn...", "Bé hay ốm sổ mũi..."):
       * Xưng hô: "Dược sĩ chào ba/mẹ! Về tình trạng của bé...", nhắc nhở cẩn trọng về liều lượng theo cân nặng/độ tuổi, không ép trẻ ăn.
     + Khách hỏi cho PHỤ NỮ MANG THAI / MẸ BẦU:
       * Chú trọng tuyệt đối an toàn thai kỳ, chỉ định dinh dưỡng vi chất lành tính (Canxi sữa, Sắt hữu cơ, Axit Folic), cảnh báo chống chỉ định các thảo dược hoạt huyết co bóp tử cung.
     + Khách là DÂN VĂN PHÒNG (ngồi máy tính nhiều, đau vai gáy, khô mắt, trĩ):
       * Thấu cảm với tính chất công việc ngồi tĩnh tại lâu, hướng dẫn bài tập giãn cơ 20-20-20, chỉnh tư thế bàn ghế.
     + Khách hỏi cho BẢN THÂN: Xưng hô tự nhiên, ân cần "Dược sĩ" - "bạn/anh/chị".

2. NGUYÊN TẮC CẤP CỨU ĐỎ (RED FLAG EMERGENCY TRIAGE):
   - Nếu phát hiện các dấu hiệu nguy kịch: Đau thắt ngực dữ dội đè nặng sau xương ức, khó thở cấp tính, méo miệng/nói đớ/tê yếu liệt nửa người (dấu hiệu đột quỵ FAST), co giật, sốt cao co giật ở trẻ, nôn ra máu, mất ý thức/ngất xỉu:
   - HÀNH ĐỘNG KHẨN CẤP: Lập tức đặt CẢNH BÁO ĐỎ, hướng dẫn người nhà gọi ngay Cấp cứu 115 hoặc đưa người bệnh đến Khoa Cấp Cứu Bệnh viện gần nhất NGAY LẬP TỨC.
   - Hướng dẫn sơ cứu tại chỗ: Nằm nơi thoáng, nới lỏng áo, KHÔNG cạo gió, KHÔNG cho ăn uống hay uống thuốc tùy tiện.
   - BẮT BUỘC ĐỂ "recommendedProductIds": [] (mảng rỗng), TUYỆT ĐỐI KHÔNG bán thuốc hay TPCN trong tình huống cấp cứu!

3. PHÂN BIỆT RÕ RÀNG GIỮA "NHU CẦU BỔ SUNG VI CHẤT / DINH DƯỠNG" VÀ "TRIỆU CHỨNG BỆNH TẬT":
   - Rất nhiều khách hàng KHÔNG HỀ CÓ BỆNH TẬT, họ chỉ có NHU CẦU BỒI BỔ & BỔ SUNG VI CHẤT LÀNH MẠNH (ví dụ: mua Canxi/D3K2 cho con cao lớn, mua Collagen làm đẹp da, mua Dầu cá bổ mắt, mua Hồng sâm bồi bổ sức khỏe).
   - TUYỆT ĐỐI KHÔNG dùng các câu khô khan như "đồng cảm với cảm giác khó chịu bạn đang trải qua" hay "tình trạng mệt mỏi bệnh tật" khi khách chỉ đang hỏi bổ sung Canxi cho con hoặc chăm sóc sức khỏe lành mạnh!
   - Thể hiện sự thấu hiểu tình cảm của cha mẹ muốn con phát triển chiều cao, phụ nữ muốn chăm sóc sắc đẹp, hay con cái muốn bồi bổ cho cha mẹ.

4. TRẢ LỜI ĐÚNG TRỌNG TÂM CÂU HỎI TRƯỚC TIÊN:
   - Khách hỏi điều gì, hãy trả lời trực tiếp, chính xác và giải thích rõ ràng điều đó ngay từ câu đầu tiên. Tuyệt đối không vòng vo né tránh.
   - Nếu khách chào hỏi: Hãy chào đón ấm áp, xưng "Dược sĩ" và hỏi thăm khách hàng đang gặp khó khăn hay triệu chứng gì để hỗ trợ.
   - Nếu khách hỏi về dinh dưỡng, kiêng cữ: Hướng dẫn cụ thể món nên ăn, món nên tránh và lý do sinh học đằng sau.
   - Nếu khách hỏi về cách dùng, thời điểm uống: Giải thích chính xác thời điểm vàng cơ thể hấp thu tốt nhất và lưu ý tương tác thuốc/bữa ăn.
   - Nếu khách mô tả triệu chứng: Thấu cảm, giải thích cơ chế bình dị, đưa ra lời khuyên xử trí tại nhà và hỏi thăm thêm các thông tin cần thiết (độ tuổi, bị bao lâu rồi, tiền sử dạ dày/huyết áp/tiểu đường).

5. TUYỆT ĐỐI KHÔNG ÉP BÁN HÀNG — CHỈ ĐỀ XUẤT SẢN PHẨM KHI ĐÚNG MỤC TIÊU:
   - TUYỆT ĐỐI ĐỂ "recommendedProductIds": [] (mảng rỗng) trong các trường hợp:
     + Khách chỉ chào hỏi, làm quen, cảm ơn.
     + Khách hỏi kiến thức y tế, sinh hoạt, chế độ ăn uống, tập luyện, kiêng cữ.
     + Khách hỏi thời điểm uống, cách dùng hoặc kiểm tra tương tác thuốc hiện tại của họ.
     + Triệu chứng của khách còn sơ sài, cần Dược sĩ hỏi thăm thêm để làm rõ tình trạng.
     + Khách hỏi thông tin cửa hàng, vận chuyển, đổi trả.
     + Các trường hợp cấp cứu đỏ (Red Flag).
   - CHỈ ĐỀ XUẤT SẢN PHẨM (tối đa 1-2 mã ID từ danh mục trên) KHI:
     + Khách chủ động hỏi: "nên uống thuốc/TPCN gì?", "có loại nào tốt?", "tư vấn giúp tôi sản phẩm...", "bên shop có bán...", "mua loại nào hiệu quả?"
     + Hoặc sau khi đã giải thích rõ cơ chế và khách cần một liệu trình bổ sung vi chất hoặc dược mỹ phẩm hỗ trợ phục hồi sức khỏe.
   - Khi đề xuất sản phẩm: Trình bày nhẹ nhàng, khách quan, phân tích rõ lý do vì sao sản phẩm đó giúp ích. KHÔNG dùng ngôn từ giục giã mua hàng ("hãy mua ngay", "đặt hỏa tốc").

6. VĂN PHONG TỰ NHIÊN, ẤM ÁP, CHUẨN MỰC:
   - Nói chuyện như một Dược Sĩ Lâm Sàng gia đình ân cần, giàu chuyên môn, thấu hiểu tâm lý người bệnh.
   - KHÔNG dùng các tiêu đề khô cứng, rập khuôn máy móc.
   - Trình bày mạch lạc, ngắn gọn, gạch đầu dòng rõ ràng, dễ đọc trên thiết bị di động.

ĐẦU RA BẮT BUỘC: Trả về MỘT CHUỖI JSON DUY NHẤT (không dùng markdown code blocks):
{
  "reply": "Nội dung phản hồi tư vấn tự nhiên, ấm áp, đúng hoàn cảnh của Dược sĩ bằng Markdown",
  "intent": "greeting | lifestyle_diet | usage_timing | symptom_inquiry | product_consultation | emergency",
  "detectedAudience": "elderly | women | men | office | kids | general",
  "detectedConcern": "Mối quan tâm sức khỏe chính",
  "recommendedProductIds": ["id_sp_1", "id_sp_2"] (HOẶC MẢNG RỖNG [] nếu khách chưa có nhu cầu mua hoặc chỉ đang hỏi thông tin/lối sống!),
  "precautions": "Lưu ý tương tác thuốc hoặc bệnh nền quan trọng nếu có (hoặc để trống)"
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
            parts: [{ 
              text: `[NGỮ CẢNH TƯ VẤN HỆ THỐNG]:
- Đối tượng chỉ định: ${targetAudience || 'Tự động nhận diện từ câu hỏi'}
- Mối quan tâm sức khỏe: ${selectedConcern?.title || 'Chưa chọn cụ thể'}
- Tiền sử bệnh nền: ${selectedCondition || 'Không có'}

[CÂU HỎI TỪ KHÁCH HÀNG]:
"${query}"` 
            }]
          }
        ];

        const payload = {
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: { 
            temperature: 0.65, 
            maxOutputTokens: 2500,
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
            content: `[NGỮ CẢNH]: Đối tượng=${targetAudience || 'Tự động'}, Mối quan tâm=${selectedConcern?.title || 'Chưa rõ'}, Bệnh nền=${selectedCondition}. Câu hỏi: "${query}"`
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
            temperature: 0.65
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
        // Chỉ đính kèm sản phẩm nếu khách có hỏi về sản phẩm
        const asksForProd = /uống gì|thuốc gì|loại nào|sản phẩm|combo|giới thiệu|mua|bổ sung gì/.test(query.toLowerCase());
        if (asksForProd) {
          for (const p of products) {
            if (replyLower.includes(p.name.toLowerCase()) || replyLower.includes(p.id.toLowerCase())) {
              recIds.push(p.id);
            }
          }
        }

        return {
          reply: cfData.reply,
          detectedAudience: targetAudience || 'general',
          detectedConcern: 'Dược Sĩ AI MedXpressCare',
          recommendedProductIds: recIds.slice(0, 2),
          precautions: ''
        };
      }
    }
  } catch {
    // Cloudflare AI not available or offline -> fallback to local clinical engine
  }

  // 3. GIẢI THUẬT DƯỢC LÝ HỌC LÂM SÀNG THÔNG MINH DỰ PHÒNG (Clinical Rule Engine)
  // Phân tích Intent thông minh, nhận diện đúng hoàn cảnh / đối tượng và KHÔNG ép sản phẩm!
  const textLower = query.toLowerCase();

  // A. KIỂM TRA DẤU HIỆU CẤP CỨU ĐỎ (RED FLAG EMERGENCY TRIAGE)
  const isEmergency = /(đau ngực|thắt ngực|khó thở cấp|méo miệng|yếu liệt|liệt nửa người|nói đớ|co giật|sốt cao co giật|nôn ra máu|ngất xỉu|hôn mê)/i.test(textLower);
  if (isEmergency) {
    return {
      reply: `🚨 **CẢNH BÁO Y TẾ KHẨN CẤP (RED FLAG TRIAGE)** 🚨

Chào bạn, các triệu chứng bạn vừa mô tả là **dấu hiệu cảnh báo cấp cứu khẩn cấp** (nguy cơ biến cố tim mạch cấp tính, đột quỵ não hoặc suy hô hấp nguy hiểm).

⚠️ **HÀNH ĐỘNG CẦN THỰC HIỆN NGAY LẬP TỨC:**
1. **Gọi ngay Cấp cứu 115** hoặc nhanh chóng đưa người bệnh đến **Khoa Cấp Cứu của Bệnh viện gần nhất**.
2. **Sơ cứu tại chỗ trong lúc chờ cấp cứu:**
   - Đặt người bệnh nằm nghỉ ở nơi thoáng khí, nới lỏng cổ áo, khăn quàng và thắt lưng.
   - Tuyệt đối **KHÔNG** cạo gió, chích máu đầu ngón tay, vắt chanh vào miệng hay bấm huyệt mạnh.
   - Tuyệt đối **KHÔNG** cho ăn uống hay tự ý uống thuốc để tránh nguy cơ sặc vào đường thở hoặc biến chứng nguy hiểm.
   - Nếu người bệnh hôn mê nhưng còn thở, hãy đặt ở tư thế nằm nghiêng an toàn.

*Hệ thống MedXpressCare cam kết đặt an toàn tính mạng người bệnh lên trên hết. Vui lòng ưu tiên hỗ trợ y tế khẩn cấp ngay lập tức!*`,
      detectedAudience: targetAudience || 'general',
      detectedConcern: 'Cảnh Báo Cấp Cứu Khẩn Cấp (Red Flag)',
      recommendedProductIds: [],
      precautions: 'CẦN ĐI CẤP CỨU BỆNH VIỆN NGAY LẬP TỨC - TUYỆT ĐỐI KHÔNG TỰ DÙNG THUỐC!'
    };
  }

  
  // A2. KIỂM TRA HỎI THUỐC KÊ ĐƠN / THUỐC ĐẶC TRỊ / KHÁNG SINH (WEBSITE HOÀN TOÀN KHÔNG BÁN THUỐC KÊ ĐƠN)
  const isPrescriptionDrug = /(thuốc kê đơn|thuốc theo toa|thuốc đặc trị|thuốc kháng sinh|kháng sinh|corticoid|prednisolon|dexamethason|amoxicillin|augmentin|cefixim|azithromycin|thuốc ngủ seduxen|thuốc thần kinh|thuốc hạ áp amlodipin|thuốc tiểu đường glucophage|insulin|thuốc chống đông|kê đơn cho tôi|cho tôi đơn thuốc|phác đồ điều trị bệnh)/i.test(textLower);
  if (isPrescriptionDrug) {
    return {
      reply: `⚠️ **LƯU Ý CHUYÊN MÔN QUAN TRỌNG TỪ DƯỢC SĨ MEDXPRESSCARE:**

Chào bạn, **MedXpressCare là hệ thống phân phối Thực phẩm bảo vệ sức khỏe (TPCN), sản phẩm bổ sung dinh dưỡng và Dược mỹ phẩm chính hãng**.

Theo đúng quy định của Luật Dược 2016 và Bộ Y Tế:
- ❌ **Website hoàn toàn KHÔNG BÁN THUỐC KÊ ĐƠN (Thuốc Rx)** và **KHÔNG CUNG CẤP PHÁC ĐỒ ĐIỀU TRỊ THAY THẾ BÁC SĨ**.
- Đối với các loại thuốc kháng sinh, thuốc điều trị bệnh lý nền hoặc thuốc đặc trị, quý khách **bắt buộc phải đến trực tiếp các cơ sở y tế / bệnh viện** để được Bác sĩ chuyên khoa thăm khám lâm sàng, làm xét nghiệm và kê đơn theo phác đồ y khoa chuẩn.
- Tuyệt đối **không tự ý tìm mua hay sử dụng thuốc kê đơn qua mạng internet** để tránh các biến chứng nguy hiểm và tình trạng kháng thuốc.

💡 *Nếu bạn đang cần tư vấn các sản phẩm **bổ sung vi chất, vitamin khoáng chất bồi bổ thể lực, nâng cao sức đề kháng** hoặc **Dược mỹ phẩm chăm sóc và phục hồi da**, Dược sĩ luôn sẵn sàng lắng nghe và hỗ trợ chu đáo nhé!*`,
      detectedAudience: targetAudience || 'general',
      detectedConcern: 'Quy định thuốc kê đơn & TPCN',
      recommendedProductIds: [],
      precautions: 'WEBSITE KHÔNG BÁN THUỐC KÊ ĐƠN - VUI LÒNG ĐI KHÁM BÁC SĨ TẠI BỆNH VIỆN!'
    };
  }

  // B. NHẬN DIỆN MỐI QUAN HỆ & NGỮ CẢNH (Hỏi cho bản thân vs Bố Mẹ vs Con nhỏ vs Mẹ bầu)
  const isAskingForParents = /(mẹ|bố|ba|má|ông|bà|phụ huynh).*(tôi|mình|em|nhà tôi|nhà mình)/i.test(textLower) || /(mẹ|bố|ba|má|ông|bà)\s+(\d+|năm nay|đã lớn|cao tuổi)/i.test(textLower);
  const isAskingForKids = /(bé|con|cháu|nhóc|trẻ nhỏ|em bé).*(nhà em|nhà mình|của em|mấy tháng|\d+\s*tuổi|\d+\s*tháng)/i.test(textLower) || /(cho bé|cho con|trẻ nhỏ|trẻ em|bé biếng ăn|bé chậm|bé lười)/i.test(textLower) || /\b(bé|em bé)\b/i.test(textLower);
  const isAskingForPregnant = /(mang thai|bầu|có thai|thai kỳ|dự sinh|mẹ bầu)/i.test(textLower);

  // Nhận diện đối tượng (Audience Detection)
  let audience = targetAudience || '';
  if (!audience || audience === 'general') {
    if (isAskingForParents || /bác|ông|bà|cao tuổi|người già|hưu|60|70|50|thoái hóa|tiểu đêm|tai biến/.test(textLower)) {
      audience = 'elderly';
    } else if (isAskingForKids || /bé|con|trẻ|em bé|học sinh|chiều cao|thấp còi|biếng ăn|lười ăn|hay ốm|đề kháng/.test(textLower)) {
      audience = 'kids';
    } else if (isAskingForPregnant || /phụ nữ|chị em|phái đẹp|nữ|mẹ bầu|sau sinh|da|nám|nếp nhăn|bốc hỏa|khô hạn|kinh nguyệt|nội tiết/.test(textLower)) {
      audience = 'women';
    } else if (/nam|đàn ông|anh em|phái mạnh|bia|rượu|nhậu|men gan|sinh lý|gút|uric|thận yếu/.test(textLower)) {
      audience = 'men';
    } else if (/văn phòng|máy tính|laptop|mắt|mỏi mắt|khô mắt|vai gáy|cổ|stress|ngồi nhiều|trĩ|táo bón/.test(textLower)) {
      audience = 'office';
    } else {
      audience = 'general';
    }
  }

  // Tinh chỉnh lời chào & đại từ xưng hô đúng ngữ cảnh
  let greetingSalutation = 'Chào bạn!';
  if (isAskingForParents) {
    greetingSalutation = 'Chào bạn! Dược sĩ rất hiểu và xin chia sẻ cùng bạn về tình trạng sức khỏe của **Bác (bố/mẹ bạn)**';
  } else if (isAskingForKids || audience === 'kids') {
    greetingSalutation = 'Chào bạn! Dược sĩ rất hiểu và xin đồng hành cùng ba/mẹ chăm sóc sức khỏe cho **bé**';
  } else if (isAskingForPregnant) {
    greetingSalutation = 'Chào bạn! Dược sĩ xin chia sẻ và đồng hành cùng mẹ trong giai đoạn thai kỳ';
  } else if (audience === 'elderly') {
    greetingSalutation = 'Dược sĩ xin kính chào Bác!';
  } else if (audience === 'office') {
    greetingSalutation = 'Chào bạn! Dược sĩ rất thấu hiểu nỗi vất vả của dân văn phòng chúng ta khi phải ngồi máy tính nhiều';
  }

  // Phân loại Intent của người dùng:
  const isGreeting = /^(chào|alo|hello|hi|shop ơi|dược sĩ ơi|admin|có ai|tư vấn giúp|giúp tôi|hỏi chút|xin chào|cảm ơn|thank|cho em hỏi|cho tôi hỏi)/i.test(textLower) && textLower.length < 40;
  const isDietLifestyle = /kiêng|ăn gì|nên ăn|không nên ăn|thực đơn|uống nước|tập luyện|bài tập|sinh hoạt|thể dục|nguyên nhân|tại sao|do đâu|lý do/i.test(textLower);
  const isUsageTiming = /(uống|dùng|bổ sung).*(lúc nào|khi nào|sáng hay tối|trước hay sau|thời điểm nào|thời điểm gì|sau ăn|trước ăn)/i.test(textLower) || /(lúc nào|khi nào|thời điểm nào|thời điểm gì).*(uống|dùng|bổ sung)/i.test(textLower) || /cách dùng|uống bao nhiêu|uống mấy lần|uống cùng|uống chung|uống nước ấm|uống cách/i.test(textLower);
  const isPrecaution = /bà bầu|mang thai|cho con bú|tiểu đường|huyết áp|dạ dày|bao tử|tác dụng phụ|có hại gì|dị ứng|tương tác/i.test(textLower);
  const isStorePolicy = /giao hàng|ship|vận chuyển|địa chỉ|hotline|chính hãng|tem|hóa đơn|đổi trả/i.test(textLower);
  const isProductRequest = /(mua|muốn mua|cần mua|tìm mua|đặt mua|bán cho|lấy cho|báo giá|xin giá)/i.test(textLower) ||
    /(uống gì|thuốc gì|có loại nào|sản phẩm nào|loại nào tốt|combo|phác đồ|bổ sung gì|giới thiệu|tư vấn giúp.*loại)/i.test(textLower) ||
    /(mua|tư vấn|dùng|bổ sung).*(thuốc|sản phẩm|loại nào|combo|canxi|dầu cá|vitamin|omega|sâm|collagen)/i.test(textLower);

  // Lưu ý bệnh lý nền / tương tác thuốc
  let precautionsNote = '';
  if (selectedCondition === 'stomach' || /dạ dày|bao tử|trào ngược|loét/.test(textLower)) {
    precautionsNote = '⚠️ Lưu ý dạ dày: Luôn dùng sau bữa ăn no 30 phút cùng 1 ly nước ấm đầy để bảo vệ niêm mạc.';
  } else if (selectedCondition === 'blood_pressure' || /huyết áp|thuốc áp/.test(textLower)) {
    precautionsNote = '⚠️ Lưu ý huyết áp: Uống cách cữ thuốc huyết áp theo đơn bác sĩ ít nhất 1.5 - 2 giờ.';
  } else if (selectedCondition === 'diabetes' || /tiểu đường|đường huyết/.test(textLower)) {
    precautionsNote = '⚠️ Lưu ý tiểu đường: Ưu tiên dòng sản phẩm không chứa đường tự do Saccarozo để giữ ổn định chỉ số HbA1c.';
  } else if (selectedCondition === 'calcium_iron' || /sắt|canxi/.test(textLower)) {
    precautionsNote = '⚠️ Lưu ý vi chất: Uống Canxi và Sắt cách nhau ít nhất 2 giờ để tránh tương tác cản trở hấp thu.';
  }

  // TRƯỜNG HỢP 1: CHÀO HỎI & BẮT CHUYỆN (TUYỆT ĐỐI KHÔNG BÁN HÀNG)
  if (isGreeting) {
    return {
      reply: `Chào bạn! Tôi là **Dược sĩ Lâm Sàng của MedXpressCare**.

Rất vui được hỗ trợ bạn hôm nay! Tôi sẵn sàng giải đáp mọi thắc mắc về:
- Các triệu chứng khó chịu bạn hoặc người thân đang gặp phải
- Chế độ dinh dưỡng, thực phẩm nên ăn và nên kiêng chuẩn y khoa
- Thời điểm uống, cách dùng và kiểm tra tương tác thuốc, bệnh nền an toàn
- Liệu trình bổ sung vi chất & thảo dược lành tính khi bạn cần giải pháp chăm sóc từ gốc

Bạn có thể chia sẻ cụ thể tình trạng, độ tuổi hoặc câu hỏi bạn đang băn khoăn để Dược sĩ hỗ trợ tư vấn chi tiết nhé!`,
      detectedAudience: audience,
      detectedConcern: 'Chào hỏi & Tư vấn ban đầu',
      recommendedProductIds: [],
      precautions: ''
    };
  }

  // TRƯỜNG HỢP 2: HỎI CHẾ ĐỘ ĂN UỐNG, KIÊNG CỮ, LỐI SỐNG, NGUYÊN NHÂN (TƯ VẤN ĐÚNG TRỌNG TÂM - KHÔNG ÉP SẢN PHẨM)
  if (isDietLifestyle) {
    let dietAdvice = '';
    let topicName = '';

    if (/khớp|gối|lục khục|thoái hóa|xương|cột sống|lưng/.test(textLower)) {
      topicName = 'Đau Nhức Thoái Hóa Khớp';
      dietAdvice = `Về chế độ ăn uống và sinh hoạt cho người bị thoái hóa, đau khớp:

**1. Thực phẩm nên ăn (Giúp giảm viêm, nuôi dưỡng sụn):**
- **Cá béo giàu Omega-3** (cá hồi, cá thu, cá trích): Giúp ức chế các enzym phá hủy sụn khớp tự nhiên.
- **Nước hầm xương ống, sụn bò**: Bổ sung Collagen tuýp II và Glucosamine sinh học.
- **Rau có màu xanh thẫm** (súp lơ xanh, rau bina, cải xoăn): Giàu Vitamin K và Canxi thực vật giúp xương chắc khỏe.
- **Quả mọng & trái cây giàu Vitamin C** (cam, bưởi, dâu tây, việt quất): Kích thích cơ thể tự sản sinh Collagen đệm khớp.

**2. Thực phẩm cần kiêng hoặc hạn chế:**
- **Thịt đỏ** (thịt bò, thịt cừu) và **nội tạng động vật**: Chứa nhiều đạm Purin dễ gây lắng đọng Acid Uric và tăng phản ứng viêm sưng.
- **Thức ăn nhiều dầu mỡ chiên rán, đồ ăn quá mặn**: Muối giữ nước gây phù nề bao hoạt dịch quanh khớp.
- **Đồ muối chua** (dưa muối, cà pháo, măng chua): Dễ gây tích tụ acid lactic làm tăng cảm giác nhức mỏi.
- **Rượu, bia, thuốc lá**: Làm giảm tưới máu vi mạch nuôi dưỡng sụn khớp.

**3. Lối sống & Vận động:**
- Hạn chế ngồi xổm, leo cầu thang nhiều tầng hoặc mang vác vật nặng.
- Tập các bài tập nhẹ nhàng không chịu tải trọng như bơi lội, đạp xe trên không hoặc đi bộ trên nền phẳng 20-30 phút/ngày.
- Chườm ấm vùng khớp gối khoảng 15-20 phút mỗi tối trước khi ngủ để tăng lưu thông dịch khớp.`;
    } else if (/mắt|khô mắt|mỏi mắt|nhòe|cận|ánh sáng xanh/.test(textLower)) {
      topicName = 'Khô Mỏi Mắt Do Màn Hình';
      dietAdvice = `Về dinh dưỡng và thói quen bảo vệ thị lực:

**1. Dinh dưỡng bổ mắt:**
- **Thực phẩm giàu Lutein & Zeaxanthin**: Rau bina, cải xoăn, lòng đỏ trứng, quả bơ (tạo màng lọc tia sáng xanh bảo vệ điểm vàng).
- **Thực phẩm giàu Vitamin A & Beta-Carotene**: Cà rốt, bí đỏ, gấc, cà chua (chống khô giác mạc và quáng gà).
- **Thực phẩm giàu Omega-3 (DHA/EPA)**: Dầu cá, các loại cá biển, hạt óc chó (duy trì độ ẩm màng phim nước mắt).

**2. Thói quen bảo vệ mắt:**
- **Quy tắc vàng 20 - 20 - 20**: Cứ 20 phút nhìn màn hình thì chớp mắt và nhìn xa 20 feet (khoảng 6 mét) trong 20 giây để cơ mi được thư giãn.
- Giữ khoảng cách mắt đến màn hình từ 50 - 60cm, đặt góc nhìn hơi thấp hơn tầm mắt 15-20 độ.
- Chớp mắt chủ động nhiều hơn và có thể nhỏ nước mắt nhân tạo không chất bảo quản khi làm việc trong phòng máy lạnh kéo dài.`;
    } else if (/gan|men gan|rượu|bia|ngứa|mề đay|mẩn ngứa/.test(textLower)) {
      topicName = 'Thanh Lọc Gan & Men Gan Cao';
      dietAdvice = `Về chế độ giải độc gan và hạ men gan:

**1. Thực phẩm và nước uống mát gan:**
- **Uống nhiều nước lọc**: 2 đến 2.5 lít/ngày giúp thận và gan đào thải độc tố tốt nhất.
- **Trà thảo mộc tự nhiên**: Trà Atiso, trà hoa cúc, nhân trần, trà xanh (chứa nhiều chất chống oxy hóa bảo vệ tế bào gan).
- **Rau họ cải** (súp lơ, bắp cải): Chứa Glucosinolate hỗ trợ gan sản sinh enzym giải độc tự nhiên.
- **Tỏi và củ dền**: Kích hoạt enzym thanh lọc kim loại nặng và độc tố cồn.

**2. Điều cần tránh tuyệt đối:**
- Cắt giảm bia rượu, đồ uống có cồn. Nếu bắt buộc phải tiếp khách, hãy uống 1 ly nước đầy sau mỗi ly bia để làm loãng nồng độ cồn trong máu.
- Tránh ăn đồ chiên xào nhiều dầu mỡ cháy, thức ăn nhanh và các món quá cay nóng.
- Không thức khuya sau 23h đêm, vì khung giờ từ 23h - 3h sáng là thời điểm vàng gan thực hiện chức năng tái tạo tế bào và thải độc.`;
    } else if (/mất ngủ|đau đầu|tiền đình|stress|thần kinh/.test(textLower)) {
      topicName = 'Mất Ngủ & Tuần Hoàn Não';
      dietAdvice = `Về dinh dưỡng và vệ sinh giấc ngủ khoa học:

**1. Món ăn thức uống hỗ trợ an thần tự nhiên:**
- **Trà thảo dược dịu thần kinh**: Trà tâm sen, trà hoa cúc, trà lạc tiên ấm trước khi đi ngủ 30-45 phút.
- **Thực phẩm giàu Tryptophan & Magie**: Hạt sen, chuối chín, sữa ấm, quả hạnh nhân (kích thích cơ thể tự tiết Melatonin tự nhiên).
- **Thực phẩm hoạt huyết**: Rau ngót, rau đinh lăng, mộc nhĩ giúp cải thiện lưu lượng máu lên não.

**2. Điều cần kiêng:**
- Tuyệt đối không dùng cà phê, trà xanh đặc, nước ngọt tăng lực sau 14h chiều.
- Tránh ăn quá no hoặc ăn đồ nhiều dầu mỡ vào bữa tối, vì dạ dày hoạt động quá mức sẽ gây trằn trọc khó vào giấc.

**3. Vệ sinh giấc ngủ (Sleep Hygiene):**
- Tắt màn hình điện thoại, tivi, laptop trước khi đi ngủ tối thiểu 45 phút.
- Ngâm chân nước ấm có chút gừng và muối trong 15 phút để hạ hỏa, dẫn huyết xuống dưới giúp dễ ngủ sâu giấc.`;
    } else {
      topicName = 'Dinh Dưỡng & Sinh Hoạt Khỏe Mạnh';
      dietAdvice = `Về chế độ dinh dưỡng và lối sống lành mạnh:

- **Chế độ ăn cân bằng 4 nhóm chất**: Chất đạm nạc, tinh bột chuyển hóa chậm (gạo lứt, yến mạch), chất béo tốt (dầu ô-liu, cá béo) và nhiều chất xơ từ rau củ quả tươi.
- **Uống đủ nước**: Tối thiểu 1.5 - 2 lít nước ấm mỗi ngày, chia thành nhiều ngụm nhỏ.
- **Vận động đều đặn**: Dành ra 30 phút mỗi ngày đi bộ, tập yoga hoặc bơi lội nhẹ nhàng để kích thích tuần hoàn máu và hệ miễn dịch.
- **Giấc ngủ chất lượng**: Cố gắng ngủ đủ 7-8 tiếng/đêm và đi ngủ trước 23h.`;
    }

    let audienceFollowUp = 'Bạn có đang gặp triệu chứng cụ thể nào khác hoặc đang phải dùng thuốc điều trị nào không ạ? Hãy chia sẻ thêm để Dược sĩ đồng hành cùng bạn nhé!';
    if (isAskingForParents) {
      audienceFollowUp = 'Bạn hãy nhắc Bác duy trì chế độ sinh hoạt và kiêng cữ trên nhé. Bác hiện có đang dùng thuốc điều trị nào khác không ạ? Hãy chia sẻ thêm để Dược sĩ lưu ý an toàn cho Bác nhé!';
    } else if (isAskingForKids) {
      audienceFollowUp = 'Ba/mẹ lưu ý kiên nhẫn đồng hành cùng con và không ép bé ăn quá no một lúc. Bé hiện sinh hoạt và lên cân thế nào ạ? Hãy chia sẻ thêm với Dược sĩ nhé!';
    }

    return {
      reply: `${greetingSalutation}, về chế độ ăn uống và lối sống cho tình trạng **${topicName}**:

${dietAdvice}
${precautionsNote ? `\n> **${precautionsNote}**\n` : ''}
${audienceFollowUp}`,
      detectedAudience: audience,
      detectedConcern: topicName,
      recommendedProductIds: [],
      precautions: precautionsNote
    };
  }

  // TRƯỜNG HỢP 3: HỎI CÁCH DÙNG, THỜI ĐIỂM UỐNG, TƯƠNG TÁC THUỐC (TƯ VẤN CHUYÊN MÔN DƯỢC LÝ - KHÔNG ÉP SẢN PHẨM)
  if (isUsageTiming) {
    const adviceParts = [];
    
    if (/canxi|calcium|d3|k2/.test(textLower)) {
      adviceParts.push(`**Quy tắc vàng khi uống Canxi & Vitamin D3/K2:**
- **Thời điểm tốt nhất**: Buổi **SÁNG**, sau bữa ăn khoảng 30 - 60 phút cùng 1 ly nước ấm đầy.
- **Lý do**: Buổi sáng cơ thể được tiếp xúc với ánh nắng mặt trời giúp tổng hợp Vitamin D tự nhiên, hỗ trợ tối đa việc hấp thu ion Canxi qua ruột vào máu.
- **LƯU Ý QUAN TRỌNG**: 
  + Tuyệt đối **KHÔNG uống Canxi vào buổi chiều tối hoặc trước khi ngủ** vì dễ gây lắng đọng tạo sỏi thận và cản trở giấc ngủ.
  + Nếu có uống viên Sắt, phải uống cách Canxi ít nhất 2 giờ vì Canxi và Sắt cạnh tranh hấp thu trực tiếp tại thụ thể ruột non.`);
    }
    
    if (/dầu cá|omega|fish oil|epa|dha/.test(textLower)) {
      adviceParts.push(`**Quy tắc vàng khi uống Dầu Cá Omega-3:**
- **Thời điểm tốt nhất**: Uống **CÙNG HOẶC NGAY SAU BỮA ĂN** (bữa sáng hoặc bữa trưa).
- **Lý do**: Omega-3 là acid béo tan trong dầu. Khi bạn ăn bữa ăn có chất béo tự nhiên (dầu ăn, thịt, cá, trứng), dịch mật sẽ được kích thích tiết ra giúp nhũ hóa và hấp thu tối đa lượng EPA/DHA tinh khiết vào máu, đồng thời giảm hẳn tình trạng ợ hơi mùi cá.
- Người có dạ dày nhạy cảm nên chia làm 2 cữ uống sau bữa ăn sáng và trưa.`);
    }
    
    if (/glucosamine|khớp|sụn/.test(textLower)) {
      adviceParts.push(`**Quy tắc vàng khi uống Glucosamine & Bổ khớp:**
- **Thời điểm tốt nhất**: Uống **NGAY SAU BỮA ĂN NO** cùng một cốc nước đầy (200-250ml).
- **Lý do**: Uống sau ăn no giúp tránh tình trạng kích ứng nhẹ niêm mạc dạ dày và giúp các thảo dược kháng viêm phát huy công dụng êm dịu nhất.
- Nên uống đều đặn mỗi ngày vào khung giờ cố định trong liệu trình tối thiểu 2-3 tháng để sụn khớp có đủ thời gian tái tạo dịch nhờn sinh học.`);
    }
    
    if (/sâm|hồng sâm|đông trùng|ngọc linh/.test(textLower)) {
      adviceParts.push(`**Quy tắc vàng khi dùng Sâm & Đông Trùng Hạ Thảo:**
- **Thời điểm tốt nhất**: Buổi **SÁNG hoặc ĐẦU GIỜ CHIỀU** sau bữa ăn khoảng 30 phút.
- **LƯU Ý QUAN TRỌNG**: 
  + **Tuyệt đối không uống sau 17h chiều hoặc buổi tối** vì sâm làm đại bổ nguyên khí, tăng hưng phấn hệ thần kinh trung ương và tăng tuần hoàn máu khiến bạn bị tỉnh táo, mất ngủ.
  + Người đang bị tiêu chảy hoặc sốt cao tạm thời không dùng sâm. Uống cách thuốc huyết áp ít nhất 1.5 giờ.`);
    }
    
    if (adviceParts.length === 0) {
      adviceParts.push(`**Quy tắc chung về thời điểm sử dụng các nhóm thực phẩm bổ vệ sức khỏe:**
- **Nhóm tan trong dầu (Omega-3, Vitamin D3, E, A, K2)**: Luôn uống cùng hoặc ngay sau bữa ăn chính có chất béo.
- **Nhóm khoáng chất (Canxi, Kẽm)**: Uống buổi sáng sau ăn, uống nhiều nước; uống cách viên Sắt 2 giờ.
- **Nhóm bồi bổ năng lượng & hoạt huyết não (Sâm, Ginkgo, Cebraton)**: Dùng vào ban ngày (sáng/trưa), tránh dùng khuya.
- **Nhóm thảo dược tiêu hóa & lợi khuẩn**: Men vi sinh uống trước ăn 30 phút hoặc lúc bụng rỗng; Tinh nghệ Curcumin uống sau ăn 30 phút cùng nước ấm.`);
    }

    const usageAdvice = adviceParts.join('\n\n');

    let timingFollowUp = 'Nếu bạn đang dùng đồng thời nhiều loại thuốc hoặc có bệnh nền cần kiểm tra tương tác, bạn cứ nhắn chi tiết tên các sản phẩm cho Dược sĩ để được rà soát an toàn nhé!';
    if (isAskingForParents) {
      timingFollowUp = 'Bạn hãy nhắc Bác tuân thủ khung giờ uống trên để đạt hiệu quả tốt nhất. Nếu Bác đang uống thuốc huyết áp hay tim mạch theo đơn bệnh viện, hãy nhắn tên thuốc cho Dược sĩ để rà soát tương tác an toàn cho Bác nhé!';
    } else if (isAskingForKids) {
      timingFollowUp = 'Ba/mẹ lưu ý cho bé uống đúng liều lượng theo lứa tuổi. Nếu bé có đang uống siro hay thuốc điều trị nào khác, hãy nhắn tên cho Dược sĩ kiểm tra an toàn cho con nhé!';
    }

    return {
      reply: `${greetingSalutation}, về câu hỏi **cách dùng và thời điểm uống chuẩn y khoa**, Dược sĩ xin hướng dẫn chi tiết như sau:

${usageAdvice}
${precautionsNote ? `\n> **${precautionsNote}**\n` : ''}
${timingFollowUp}`,
      detectedAudience: audience,
      detectedConcern: 'Hướng dẫn cách dùng & Thời điểm uống',
      recommendedProductIds: [],
      precautions: precautionsNote
    };
  }

  // TRƯỜNG HỢP 4: HỎI THÔNG TIN CỬA HÀNG, CHÍNH SÁCH, GIAO HÀNG (KHÔNG ÉP SẢN PHẨM)
  if (isStorePolicy) {
    return {
      reply: `Chào bạn! Dược sĩ xin cung cấp thông tin về **Chính sách & Dịch vụ của Hệ Thống MedXpressCare**:

🚚 **Chính Sách Giao Hàng & Đóng Gói:**
- Giao hàng hỏa tốc toàn quốc, miễn phí vận chuyển cho đơn hàng đủ điều kiện.
- Đóng gói bảo quản chuẩn GSP (nhiệt độ mát, hộp chống sốc chuyên dụng cho dược phẩm).
- Quý khách được **đồng kiểm khi nhận hàng**, kiểm tra đúng sản phẩm, nguyên vẹn tem niêm phong mới thanh toán.

🛡️ **Cam Kết Chất Lượng:**
- 100% sản phẩm có **Số ĐKSP của Bộ Y Tế**, tem phụ tiếng Việt và hóa đơn chứng từ đầy đủ.
- Tuyệt đối không bán hàng xách tay trôi nổi không rõ nguồn gốc.
- Đổi trả miễn phí trong 7 ngày nếu có lỗi từ nhà sản xuất hoặc vận chuyển.

📞 **Tổng Đài Dược Sĩ Trực Tuyến:**
- Hotline miễn cước: **1800 6868** (Hỗ trợ 24/7).

Bạn đang cần tìm hiểu thông tin cho sản phẩm nào hoặc cần hỗ trợ giao hàng về khu vực nào ạ?`,
      detectedAudience: audience,
      detectedConcern: 'Chính sách cửa hàng & Giao hàng',
      recommendedProductIds: [],
      precautions: ''
    };
  }

  // TRƯỜNG HỢP 5: KHÁCH MÔ TẢ TRIỆU CHỨNG NHƯNG CHƯA HỎI MUA SẢN PHẨM (ĐỒNG CẢM, PHÂN TÍCH, HƯỚNG DẪN TẠI NHÀ, CHƯA ÉP BÁN HÀNG)
  if (!isProductRequest) {
    let symptomAnalysis = '';
    let concernTitle = '';
    let homeCare = '';
    let isNutritionalDemand = false;

    if (/canxi|calcium|d3|k2|chiều cao/.test(textLower)) {
      isNutritionalDemand = true;
      concernTitle = 'Bổ Sung Canxi & Dưỡng Chất Cho Khung Xương Bé';
      symptomAnalysis = 'Canxi là khoáng chất nền tảng cấu tạo nên 99% khung xương và mầm răng. Ở trẻ nhỏ, việc bổ sung đúng Canxi hữu cơ gốc sữa sinh học kết hợp Vitamin D3 và K2 MK-7 giúp canxi được gắn trúng đích vào sụn xương, hỗ trợ bé phát triển chiều cao vượt trội, ngủ sâu giấc không giật mình hay rụng tóc vành khăn mà hoàn toàn không lo nóng trong hay táo bón.';
      homeCare = 'Cho bé uống Canxi vào buổi sáng sau ăn 30-60 phút cùng một ly nước ấm đầy; kết hợp cho bé tắm nắng sớm, chạy nhảy, bơi lội hoặc chơi bóng rổ 30 phút mỗi ngày.';
    } else if (/dầu cá|omega|dha|sáng mắt|não bộ/.test(textLower)) {
      isNutritionalDemand = true;
      concernTitle = 'Bổ Sung Omega-3 DHA/EPA Cho Thị Lực & Não Bộ';
      symptomAnalysis = 'DHA và EPA là các axit béo không no thiết yếu cấu tạo nên màng tế bào thần kinh thị giác và vỏ não, giúp tăng cường độ ẩm màng phim mắt, giảm mỏi mắt và tăng khả năng ghi nhớ, tập trung.';
      homeCare = 'Nên uống ngay trong hoặc sau bữa ăn chính có chất béo để dịch mật nhũ hóa và hấp thu tối đa lượng dưỡng chất.';
    } else if (/collagen|nám|sáng da|đẹp da/.test(textLower)) {
      isNutritionalDemand = true;
      concernTitle = 'Nuôi Dưỡng Làn Da & Chống Lão Hóa';
      symptomAnalysis = 'Bổ sung dưỡng chất chống oxy hóa tự nhiên (Ý dĩ, Vitamin C, Curcumin) giúp ức chế hắc tố Melanin và kích thích cơ thể tự sản sinh Collagen tuýp 1 săn chắc.';
      homeCare = 'Thoa kem chống nắng đều đặn, uống đủ 2 lít nước mỗi ngày và ăn nhiều rau xanh, quả mọng.';
    } else if (/bồi bổ|thể lực|sức đề kháng|hồng sâm|đông trùng/.test(textLower)) {
      isNutritionalDemand = true;
      concernTitle = 'Bồi Bổ Thể Lực & Nâng Cao Sức Đề Kháng';
      symptomAnalysis = 'Các thảo dược đại bổ giúp kích hoạt tế bào miễn dịch tự nhiên, tăng tuần hoàn khí huyết và phục hồi thể lực sau ốm hoặc khi làm việc mệt mỏi.';
      homeCare = 'Nên dùng vào ban ngày (sáng/trưa), kết hợp chế độ nghỉ ngơi điều độ và hạn chế thức khuya.';
    } else if (/khớp|gối|lục khục|thoái hóa|xương|cột sống|lưng/.test(textLower)) {
      concernTitle = 'Đau Nhức Thoái Hóa Khớp';
      symptomAnalysis = 'Lớp sụn bọc đầu xương bị bào mòn mỏng đi theo tuổi tác hoặc do tư thế sai kéo dài, làm giảm tiết dịch nhờn bôi trơn. Khi vận động, hai đầu xương cọ xát gây cảm giác cứng khớp vào buổi sáng và phát ra tiếng lạo xạo.';
      homeCare = 'Trước mắt, bạn nên chườm ấm vị trí đau 15 phút vào buổi tối, tránh mang vác nặng hay ngồi xổm. Bạn có thể tập động tác co duỗi nhẹ nhàng trên giường khi vừa thức dậy.';
    } else if (/mắt|khô mắt|mỏi mắt|nhòe|cận/.test(textLower)) {
      concernTitle = 'Khô Mỏi Mắt';
      symptomAnalysis = 'Khi nhìn màn hình hoặc tập trung cao độ, tần suất chớp mắt giảm từ 15-20 lần/phút xuống còn 4-5 lần/phút, khiến màng phim nước mắt bị bốc hơi nhanh chóng, kết hợp ánh sáng xanh làm thoái hóa điểm vàng hoàng điểm.';
      homeCare = 'Bạn hãy nhắm mắt nghỉ ngơi 3-5 phút, rửa mặt bằng nước mát và áp dụng quy tắc nhìn xa 20-20-20. Có thể nhỏ vài giọt nước mắt nhân tạo để cấp ẩm tức thì cho mắt.';
    } else if (/gan|men gan|rượu|bia|ngứa/.test(textLower)) {
      concernTitle = 'Nóng Gan & Mệt Mỏi Do Bia Rượu';
      symptomAnalysis = 'Chất cồn và các độc tố chuyển hóa làm quá tải chức năng khử độc của tế bào gan Kupffer, khiến enzym gan ALT/AST bị rò rỉ vào máu và nhiệt độc tích tụ gây mẩn ngứa, bứt rứt.';
      homeCare = 'Bạn nên uống ngay 1 ly nước ấm đầy hoặc nước dừa tươi, ăn cháo loãng hoặc súp thanh đạm, tránh hoàn toàn các đồ chiên xào và bia rượu trong vài ngày tới để gan được nghỉ ngơi.';
    } else if (/mất ngủ|đau đầu|tiền đình|chóng mặt/.test(textLower)) {
      concernTitle = 'Mất Ngủ & Tuần Hoàn Máu Não Kém';
      symptomAnalysis = 'Máu mang oxy và dưỡng chất lên vỏ não bị suy giảm (thường do co cứng cơ cổ vai gáy hoặc xơ cứng thành mạch), kết hợp căng thẳng làm thụ thể Melatonin bị ức chế, khiến bạn trằn trọc khó vào giấc hoặc hay tỉnh giữa đêm.';
      homeCare = 'Tối nay bạn hãy thử ngâm chân nước ấm với chút gừng đập dập và muối trong 15 phút, massage nhẹ vùng sau gáy và tắt hoàn toàn điện thoại trước khi lên giường nhé.';
    } else {
      concernTitle = 'Tư Vấn Chăm Sóc Sức Khỏe';
      symptomAnalysis = 'Việc duy trì cơ thể khỏe mạnh bắt nguồn từ chế độ dinh dưỡng cân bằng 4 nhóm chất, bổ sung đủ vi chất thiết yếu và vận động điều độ.';
      homeCare = 'Bạn nên uống đủ 1.5 - 2 lít nước ấm, ăn nhiều rau quả tươi, tập thể dục nhẹ nhàng 30 phút mỗi ngày và ngủ đủ giấc.';
    }

    let adviceFollowUp = `Để Dược sĩ tư vấn chính xác và phù hợp nhất cho bạn, bạn cho Dược sĩ hỏi thêm một chút nhé:
1. Bạn đã quan tâm hoặc gặp tình trạng này bao lâu rồi?
2. Hiện tại bạn có đang dùng thuốc điều trị bệnh nền nào khác không?

*(Nếu bạn muốn tìm hiểu các dòng sản phẩm hoặc vi chất bổ sung phù hợp, hãy cho Dược sĩ biết nhé!)*`;

    if (isAskingForKids || audience === 'kids') {
      adviceFollowUp = `Để Dược sĩ tư vấn chính xác liều lượng vi chất an toàn và hiệu quả nhất cho con, ba/mẹ cho Dược sĩ hỏi thêm một chút nhé:
1. Bé nhà mình năm nay được mấy tuổi/mấy tháng và cân nặng khoảng bao nhiêu kg ạ?
2. Hằng ngày bé uống được khoảng bao nhiêu ml sữa và sinh hoạt ăn ngủ thế nào?

*(Nếu ba/mẹ muốn tìm hiểu các dòng Canxi sữa sinh học hoặc vitamin hữu cơ nhập khẩu cho bé, hãy nhắn để Dược sĩ gửi thông tin nhé!)*`;
    } else if (isAskingForParents) {
      adviceFollowUp = `Để Dược sĩ đánh giá chính xác và tư vấn phương án chăm sóc an toàn nhất cho Bác, bạn cho Dược sĩ hỏi thêm một chút nhé:
1. Bác năm nay bao nhiêu tuổi và ban đêm Bác ngủ có ngon giấc không?
2. Bác hiện có đang dùng thuốc điều trị bệnh nền nào khác (như huyết áp, dạ dày, tim mạch) không?

*(Nếu bạn muốn tìm hiểu các dòng sản phẩm bồi bổ thể lực, bổ sung dưỡng chất lành tính và an toàn cho người lớn tuổi, hãy cho Dược sĩ biết để hỗ trợ nhé!)*`;
    }

    let openingReply = `${greetingSalutation}, Dược sĩ rất hiểu và đồng cảm với nỗi lo lắng về tình trạng **${concernTitle}**:`;
    if (isNutritionalDemand) {
      if (isAskingForKids || audience === 'kids') {
        openingReply = `Chào bạn! Dược sĩ rất hiểu nhu cầu muốn bổ sung dưỡng chất giúp **bé** phát triển khỏe mạnh và toàn diện. Về chủ đề **${concernTitle}**:`;
      } else {
        openingReply = `Chào bạn! Dược sĩ xin chia sẻ cặn kẽ về **nhu cầu dinh dưỡng và bổ sung vi chất** cho **${concernTitle}**:`;
      }
    }

    return {
      reply: `${openingReply}

- **Cơ chế:** ${symptomAnalysis}
- **Cách chăm sóc tại nhà ngay lúc này:** ${homeCare}
${precautionsNote ? `\n> **${precautionsNote}**\n` : ''}
${adviceFollowUp}`,
      detectedAudience: audience,
      detectedConcern: concernTitle,
      recommendedProductIds: [], // KHÔNG ÉP SẢN PHẨM KHI KHÁCH CHƯA HỎI MUA!
      precautions: precautionsNote
    };
  }

  // TRƯỜNG HỢP 6: KHÁCH CHỦ ĐỘNG HỎI MUA SẢN PHẨM / THUỐC / PHÁC ĐỒ ĐIỀU TRỊ (LÚC NÀY MỚI GỢI Ý ĐÚNG TRỌNG TÂM)
  let matchedConcernTitle = selectedConcern?.title || '';
  let domesticId = 'vn-01';
  let importedId = 'us-01';
  let prodExplanation = '';

  if (/khớp|gối|lục khục|thoái hóa|xương|cột sống|đau lưng/.test(textLower) || selectedConcern?.id?.includes('joint')) {
    matchedConcernTitle = 'Thoái hóa sụn khớp & Viêm đau khớp';
    domesticId = 'vn-01'; // Khớp Bách Niên Kiện
    importedId = 'us-01'; // Glucosamine MSM Kirkland Mỹ
    prodExplanation = `Để phục hồi sụn khớp an toàn từ gốc mà không ảnh hưởng dạ dày, Dược sĩ gợi ý 2 giải pháp chuẩn hóa cho bạn lựa chọn:
- 🌿 **Phương án Nội Địa:** **Viên Khớp Bách Niên Kiện** — Chiết xuất Cây Móng Quỷ và Vỏ Liễu Trắng đạt chuẩn GMP-WHO, hỗ trợ giảm đau nhức tự nhiên, an toàn cho dạ dày người Việt.
- 🌐 **Phương án Nhập Khẩu:** **Glucosamine HCL with MSM Kirkland (Mỹ)** — Hộp lớn chuẩn FDA Hoa Kỳ, cung cấp hàm lượng cao 1500mg Glucosamine kết hợp hoạt chất chống viêm khớp MSM tái tạo bao hoạt dịch dẻo dai.`;
  } else if (/mắt|khô mắt|mỏi mắt|nhòe|ánh sáng xanh|cận/.test(textLower) || selectedConcern?.id?.includes('eyes')) {
    matchedConcernTitle = 'Khô mỏi mắt & Suy giảm thị lực do màn hình';
    domesticId = 'vn-04'; // Cebraton Traphaco
    importedId = 'jp-03'; // DHC Lutein Nhật
    prodExplanation = `Để bảo vệ mắt khỏi ánh sáng xanh và chấm dứt tình trạng khô cay nhức mắt:
- 🌿 **Phương án Nội Địa:** **Hoạt Huyết Dưỡng Não Cebraton Traphaco** — Tăng cường lưu thông tuần hoàn vi mạch đáy mắt và nuôi dưỡng tế bào thần kinh thị giác.
- 🌐 **Phương án Nhập Khẩu:** **Viên Uống Bổ Mắt DHC Lutein Quang Học (Nhật Bản)** — Chứa 16mg Lutein chiết xuất từ hoa cúc vạn thọ tự nhiên, tái lập màng lọc ánh sáng xanh cho điểm vàng võng mạc.`;
  } else if (/gan|men gan|rượu|bia|mẩn ngứa|mề đay|nóng trong/.test(textLower) || selectedConcern?.id?.includes('liver')) {
    matchedConcernTitle = 'Nóng gan, Men gan cao & Tổn thương gan do bia rượu';
    domesticId = 'vn-03'; // Curcumin OIC New
    importedId = 'us-02'; // Silymarin Milk Thistle Now Foods
    prodExplanation = `Để bảo vệ màng tế bào gan và hạ men gan hiệu quả:
- 🌿 **Phương án Nội Địa:** **Tinh Nghệ Nano Curcumin OIC New** — Hạt nano siêu nhỏ thẩm thấu trực tiếp, hỗ trợ chống oxy hóa và bảo vệ niêm mạc tiêu hóa, giải độc gan.
- 🌐 **Phương án Nhập Khẩu:** **Silymarin Kế Sữa Milk Thistle 1000mg Now Foods (Mỹ)** — Chiết xuất Cây Kế Sữa chuẩn hóa giúp hạ men gan và tạo lớp màng bảo vệ tế bào gan trước độc tố bia rượu.`;
  } else if (/da|nám|tàn nhang|collagen|sạm|chảy xệ|lão hóa/.test(textLower) || selectedConcern?.id?.includes('skin')) {
    matchedConcernTitle = 'Sạm nám, lão hóa sớm & Suy giảm Collagen';
    domesticId = 'vn-03'; // Nano Curcumin OIC New
    importedId = 'jp-01'; // Viên Trắng Da DHC Coix Nhật
    prodExplanation = `Để cải thiện làn da sáng khỏe, mờ thâm sạm từ bên trong:
- 🌿 **Phương án Nội Địa:** **Tinh Nghệ Nano Curcumin OIC New** — Hỗ trợ ức chế enzyme hắc sắc tố Melanin và làm sáng đều màu da.
- 🌐 **Phương án Nhập Khẩu:** **Viên Trắng Da DHC Coix Chiết Xuất Ý Dĩ (Nhật Bản)** — Tinh chất Ý Dĩ cô đặc gấp 13 lần giúp da mềm mượt và ức chế nám sạm do ánh nắng.`;
  } else if (/nội tiết|bốc hỏa|khô hạn|mãn kinh|kinh nguyệt/.test(textLower) || selectedConcern?.id?.includes('hormone')) {
    matchedConcernTitle = 'Rối loạn nội tiết tố nữ & Tiền mãn kinh';
    domesticId = 'vn-05'; // Sâm Ngọc Linh K5
    importedId = 'au-03'; // Hoa Anh Thảo Blackmores EPO Úc
    prodExplanation = `Để điều hòa nội tiết và chấm dứt các cơn bốc hỏa, khô hạn:
- 🌿 **Phương án Nội Địa:** **Sâm Ngọc Linh K5** — Dược liệu Quốc bảo Việt Nam chứa hàm lượng Saponin MR2 cực cao, giúp cân bằng trục Não bộ - Tuyến yên - Buồng trứng.
- 🌐 **Phương án Nhập Khẩu:** **Tinh Dầu Hoa Anh Thảo Blackmores Evening Primrose Oil (Úc)** — Giàu axit béo GLA tự nhiên hỗ trợ cân bằng nội tiết tố nữ và giữ ẩm cơ thể.`;
  } else if (/sinh lý|yếu|xuất tinh|thận yếu|đau lưng mỏi gối|tiểu đêm/.test(textLower) || selectedConcern?.id?.includes('vitality')) {
    matchedConcernTitle = 'Suy giảm sinh lực, Thận âm hư & Tiểu đêm';
    domesticId = 'vn-06'; // Bổ Thận Âm Nam Dược
    importedId = 'kr-01'; // Nước Hồng Sâm KGC Hàn Quốc
    prodExplanation = `Để bồi bổ thận khí và tăng cường sinh lực bền vững:
- 🌿 **Phương án Nội Địa:** **Bổ Thận Âm Nam Dược** — Thảo dược cổ truyền giúp dưỡng thận âm, giảm tiểu đêm và đau mỏi thắt lưng.
- 🌐 **Phương án Nhập Khẩu:** **Nước Hồng Sâm 6 Năm Tuổi KGC Cheong Kwan Jang (Hàn Quốc)** — Đại bổ nguyên khí, tăng sức bền thể lực và lưu thông khí huyết.`;
  } else if (/biếng ăn|chậm tăng cân|lười ăn|kém hấp thu|tiêu hóa/.test(textLower) || selectedConcern?.id?.includes('appetite') || (audience === 'kids' && /ăn|tăng cân|tiêu hóa/.test(textLower))) {
    matchedConcernTitle = 'Trẻ biếng ăn, hấp thu kém & Kích thích tiêu hóa';
    domesticId = 'vn-02'; // Đông Trùng Hạ Thảo Sapa Traphaco
    importedId = 'jp-02'; // Tảo Xoắn Vàng Spirulina EX Nhật
    prodExplanation = `Để kích thích cảm giác thèm ăn tự nhiên và hỗ trợ hoàn thiện hệ tiêu hóa cho bé:
- 🌿 **Phương án Nội Địa:** **Đông Trùng Hạ Thảo Sapa Traphaco** — Cung cấp 17 loại acid amin thiết yếu và vi chất sinh học kích thích gai vị giác phát triển, giúp trẻ ăn ngon miệng tự nhiên.
- 🌐 **Phương án Nhập Khẩu:** **Tảo Xoắn Vàng Spirulina EX (Nhật Bản)** — Chứa hơn 50 dưỡng chất toàn diện và lợi khuẩn đường ruột, hỗ trợ chuyển hóa và tăng hấp thu dinh dưỡng tối đa.`;
  } else if (/chiều cao|thấp còi|canxi|d3k2/.test(textLower) || selectedConcern?.id?.includes('height')) {
    if (audience === 'kids' || isAskingForKids) {
      matchedConcernTitle = 'Bổ sung Canxi sinh học & Phát triển chiều cao cho bé';
      domesticId = 'vn-01'; // Canxi Nano
      importedId = 'au-02'; // Canxi Sữa Bio Island Úc
      prodExplanation = `Để cung cấp nguồn Canxi sinh học lành tính, giúp bé có hệ xương răng chắc khỏe và phát triển chiều cao vượt trội:
- 🌿 **Phương án Nội Địa:** **Viên Khớp & Bổ Sung Canxi Nano Bách Niên Kiện** — Cung cấp Canxi và khoáng chất tự nhiên đạt chuẩn GMP-WHO.
- 🌐 **Phương án Nhập Khẩu (Khuyên dùng cho bé):** **Canxi Sữa Tảo Biển Bio Island Milk Calcium (Úc)** — Dòng Canxi sữa hữu cơ số 1 của Úc dành riêng cho trẻ nhỏ, chiết xuất từ sữa bò tươi nguyên chất với tỷ lệ vàng Canxi:Phospho 2:1 tương thích sinh học cao nhất, kết hợp sẵn Vitamin D3 giúp hấp thu tối đa vào xương mà hoàn toàn không gây nóng trong hay táo bón.`;
    } else {
      matchedConcernTitle = 'Bổ sung Canxi D3K2 & Phòng ngừa loãng xương';
      domesticId = 'vn-01';
      importedId = 'de-02'; // Doppelherz Magie + Canxi + D3 Đức
      prodExplanation = `Để bổ sung Canxi và khoáng chất vững chắc cho hệ cơ xương khớp:
- 🌿 **Phương án Nội Địa:** **Viên Khớp Bách Niên Kiện** — Giảm đau nhức và bổ sung dưỡng chất sụn khớp chuẩn GMP-WHO.
- 🌐 **Phương án Nhập Khẩu:** **Doppelherz Magie + Canxi + D3 (Đức)** — Công thức tối ưu kết hợp Canxi và Magie hữu cơ giúp tăng mật độ xương và giảm chuột rút co cơ.`;
    }
  } else if (/tim mạch|huyết áp|mỡ máu|xơ vữa|cholesterol/.test(textLower) || selectedConcern?.id?.includes('cardio')) {
    matchedConcernTitle = 'Huyết áp, Mỡ máu cao & Bảo vệ thành mạch';
    domesticId = 'vn-04'; // Cebraton Traphaco
    importedId = 'au-01'; // Blackmores Fish Oil 1000mg Úc
    prodExplanation = `Để làm sạch mảng bám mỡ máu và bảo vệ sự dẻo dai của thành mạch:
- 🌿 **Phương án Nội Địa:** **Cebraton Traphaco** — Tăng tuần hoàn máu não, giảm hoa mắt chóng mặt và giảm nguy cơ tai biến mạch máu.
- 🌐 **Phương án Nhập Khẩu:** **Blackmores Dầu Cá Không Mùi Fish Oil 1000mg (Úc)** — Nguồn EPA/DHA tinh khiết đã loại bỏ thủy ngân, hỗ trợ giảm Triglycerid và cholesterol xấu trong máu.`;
  } else if (/mất ngủ|đau đầu|tiền đình|chóng mặt|thần kinh|stress/.test(textLower) || selectedConcern?.id?.includes('sleep')) {
    matchedConcernTitle = 'Mất ngủ kinh niên, Rối loạn tiền đình & Suy nhược';
    domesticId = 'vn-04'; // Cebraton Traphaco
    importedId = 'de-02'; // Doppelherz Magie + Canxi + D3 Đức
    prodExplanation = `Để thư giãn hệ thần kinh và khôi phục nhịp ngủ sinh học tự nhiên:
- 🌿 **Phương án Nội Địa:** **Hoạt Huyết Dưỡng Não Cebraton Traphaco** — Tăng tưới máu vi mạch não, tạo giấc ngủ êm dịu, sáng dậy đầu óc tỉnh táo không bị nặng nề.
- 🌐 **Phương án Nhập Khẩu:** **Doppelherz Magie + Canxi + D3 (Đức)** — Bổ sung Magie hữu cơ giúp thư giãn trương lực cơ bắp, giải tỏa căng thẳng thần kinh giúp ngủ sâu giấc.`;
  } else {
    matchedConcernTitle = 'Bồi bổ sức khỏe toàn diện & Tăng cường miễn dịch';
    domesticId = 'vn-05'; // Sâm Ngọc Linh K5
    importedId = 'kr-01'; // Hồng sâm KGC
    prodExplanation = `Để phục hồi thể lực và củng cố hệ miễn dịch:
- 🌿 **Phương án Nội Địa:** **Sâm Ngọc Linh K5** — Thảo dược bản địa thượng hạng phục hồi thể lực và đề kháng.
- 🌐 **Phương án Nhập Khẩu:** **Nước Hồng Sâm KGC 6 năm tuổi (Hàn Quốc)** — Bồi bổ cơ thể sau ốm, tăng tuần hoàn và giảm mệt mỏi.`;
  }

  let productOpening = `Chào bạn, theo nhu cầu tìm hiểu sản phẩm hỗ trợ cho tình trạng **${matchedConcernTitle}**, Dược sĩ xin gợi ý liệu trình bổ sung khoa học:`;
  let productClosing = `*Bạn có thể xem chi tiết thông tin thành phần, số ĐKSP Bộ Y Tế của 2 sản phẩm đề xuất bên dưới để tham khảo và lựa chọn phương án phù hợp với mình nhé.*`;

  if (isAskingForParents) {
    productOpening = `${greetingSalutation}, theo nhu cầu tìm hiểu sản phẩm bồi bổ, phục hồi cho **Bác** về tình trạng **${matchedConcernTitle}**, Dược sĩ xin tư vấn giải pháp bổ sung vi chất khoa học, lành tính và an toàn cho người lớn tuổi:`;
    productClosing = `*Bạn có thể xem chi tiết thông tin thành phần, số ĐKSP Bộ Y Tế của 2 sản phẩm đề xuất bên dưới để tham khảo và lựa chọn phương án chăm sóc tốt nhất cho Bác nhé.*`;
  } else if (isAskingForKids || audience === 'kids') {
    productOpening = `Chào bạn! Dược sĩ rất hiểu nhu cầu muốn bổ sung dưỡng chất giúp **bé** phát triển toàn diện. Về giải pháp bổ sung **${matchedConcernTitle}**, Dược sĩ xin tư vấn giải pháp chuẩn y khoa, an toàn cho hệ tiêu hóa của trẻ:`;
    productClosing = `*Ba/mẹ có thể xem chi tiết thông tin sản phẩm chuẩn Bộ Y Tế bên dưới để tham khảo liều lượng phù hợp cho độ tuổi của bé nhé.*`;
  } else if (audience === 'elderly') {
    productOpening = `Dược sĩ xin kính chào Bác! Theo nhu cầu tìm hiểu sản phẩm hỗ trợ cho tình trạng **${matchedConcernTitle}**, Dược sĩ xin tư vấn chi tiết liệu trình bổ sung vi chất êm dịu dạ dày cho Bác:`;
    productClosing = `*Bác có thể xem chi tiết thông tin thành phần, số ĐKSP Bộ Y Tế của 2 sản phẩm đề xuất bên dưới để tham khảo lựa chọn phương án phù hợp với Bác nhé.*`;
  }

  let safeUsage = `**Cách dùng an toàn:**
- Uống sau bữa ăn khoảng 30 phút cùng một ly nước ấm đầy.
- Duy trì liệu trình tối thiểu 1-2 tháng để hoạt chất phát huy hiệu quả tái tạo bền vững.`;

  if (audience === 'kids' || isAskingForKids) {
    safeUsage = `**Cách dùng an toàn cho bé:**
- Cho bé uống vào buổi **SÁNG**, sau bữa ăn khoảng 30 - 60 phút cùng 1 ly nước ấm đầy.
- Tuyệt đối **không cho bé uống Canxi vào buổi chiều tối** để tránh cặn lắng thận và khó ngủ.
- Nếu bé có uống sữa tươi hoặc sữa công thức, nên uống Canxi cách cữ sữa khoảng 1 - 2 giờ để hấp thu tối ưu.`;
  }

  const replyMarkdown = `${productOpening}

${prodExplanation}

${safeUsage}
${precautionsNote ? `\n> **${precautionsNote}**\n` : ''}
${productClosing}`;

  return {
    reply: replyMarkdown,
    detectedAudience: audience,
    detectedConcern: matchedConcernTitle,
    recommendedProductIds: [domesticId, importedId],
    precautions: precautionsNote
  };
};
