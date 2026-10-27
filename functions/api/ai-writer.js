import { jsonResponse, errorResponse, CORS_HEADERS } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.AI) {
    return errorResponse('Cloudflare Workers AI binding "AI" is not configured.', 503);
  }

  try {
    const { topic, referenceText } = await request.json();

    const systemPrompt = `Bạn là Dược sĩ Trưởng kiêm Chuyên gia Content Y Dược Chuẩn SEO của MedXpressCare.com.
Nhiệm vụ của bạn là viết một bài cẩm nang sức khỏe y khoa hoàn chỉnh, chuẩn SEO On-Page, bố cục khoa học gồm các thẻ H2, H3, gạch đầu dòng, lời khuyên sinh hoạt và giải pháp từ thảo dược & TPCN chính ngạch.
Định dạng đầu ra là JSON có các trường:
{
  "title": "Tiêu đề bài viết hấp dẫn chứa từ khóa chính",
  "summary": "Đoạn sapo mở đầu súc tích 2-3 câu",
  "content": "Nội dung bài viết đầy đủ định dạng markdown",
  "tags": ["từ khóa 1", "từ khóa 2", "từ khóa 3"],
  "metaTitle": "Tiêu đề SEO dưới 60 ký tự",
  "metaDescription": "Mô tả SEO dưới 160 ký tự"
}`;

    const prompt = `Hãy viết một bài viết y khoa chuẩn SEO về chủ đề: "${topic}".
Tài liệu tham khảo (nếu có):
${referenceText || 'Không có tài liệu, hãy tổng hợp từ kiến thức y khoa lâm sàng chuẩn.'}
Chỉ trả về duy nhất khối JSON hợp lệ.`;

    const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2048,
      temperature: 0.6
    });

    let rawText = aiResult.response || '';
    let parsedJson = null;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // fallback
    }

    return jsonResponse({
      success: true,
      provider: 'cloudflare_workers_ai',
      data: parsedJson || { content: rawText, title: topic }
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
