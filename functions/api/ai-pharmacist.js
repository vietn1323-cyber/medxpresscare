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
    const { userMessage, catalogSummary, targetAudience, selectedCondition, chatHistory } = await request.json();

    const systemPrompt = `Bạn là Dược sĩ Lâm sàng Trưởng 24/7 của Hệ Thống Dược Phẩm & TPCN MedXpressCare.com.
Nhiệm vụ của bạn là tư vấn sức khỏe tận tâm, chuẩn xác y khoa, cá nhân hóa cho từng khách hàng.
Bạn luôn tuân thủ nguyên tắc:
1. Phân tích nguyên nhân & giải thích cơ chế sinh lý bệnh ngắn gọn, dễ hiểu.
2. Đề xuất phác đồ điều trị kết hợp song song:
   - 1 Sản phẩm Nội Địa Việt Nam (GMP-WHO)
   - 1 Sản phẩm Nhập Ngoại (Mỹ, Úc, Nhật, Đức - FDA/TGA)
3. Hướng dẫn chế độ sinh hoạt, dinh dưỡng và lưu ý tương tác thuốc (nếu có bệnh nền như dạ dày, huyết áp, tiểu đường).
4. Giọng điệu ân cần, chuyên nghiệp và đáng tin cậy.
5. Luôn trả lời bằng Tiếng Việt chuẩn.

DANH MỤC SẢN PHẨM MEDXPRESSCARE HIỆN CÓ:
${catalogSummary || 'Xem catalogue cửa hàng'}
`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(chatHistory)) {
      for (const msg of chatHistory.slice(-4)) {
        if (msg.sender === 'user' || msg.role === 'user') {
          messages.push({ role: 'user', content: msg.text || msg.content });
        } else if (msg.sender === 'pharmacist' || msg.role === 'assistant') {
          messages.push({ role: 'assistant', content: msg.text || msg.content });
        }
      }
    }

    messages.push({
      role: 'user',
      content: `Khách hàng hỏi: "${userMessage || 'Tư vấn sức khỏe'}". Nhóm đối tượng: ${targetAudience || 'Khách chung'}. Bệnh nền: ${selectedCondition || 'Không'}.`
    });

    const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    return jsonResponse({
      success: true,
      provider: 'cloudflare_workers_ai',
      model: '@cf/meta/llama-3.1-8b-instruct',
      reply: aiResult.response || aiResult
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
