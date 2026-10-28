/**
 * Cloudflare Pages Function: /functions/get-ghn-data
 * Proxy ẩn bảo mật Server-Side cho GHN Master Data API
 * 
 * Luồng hoạt động:
 * 1. Nhận request từ trình duyệt (Client-side) qua URL /functions/get-ghn-data
 * 2. Đính kèm Token bí mật từ Cloudflare Environment (GHN_API_TOKEN / D1 database)
 * 3. Gọi sang API chính thức của Giao Hàng Nhanh (GHN)
 * 4. Xử lý CORS và trả dữ liệu sạch về trình duyệt mà KHÔNG để lộ Token trên Client (F12)
 */

import { 
  GHN_PROVINCES, 
  getGhnDistricts, 
  getGhnWards 
} from '../src/data/ghnLocationData.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Token',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json; charset=utf-8'
};

/**
 * Helper lấy Token bí mật phía Server Cloudflare
 * Tuyệt đối không để lộ về Client-side
 */
async function resolveServerSecretToken(env) {
  // 1. Biến môi trường bảo mật trên Cloudflare Dashboard (GHN_API_TOKEN hoặc GHN_TOKEN)
  if (env?.GHN_API_TOKEN && String(env.GHN_API_TOKEN).trim()) {
    return String(env.GHN_API_TOKEN).trim();
  }
  if (env?.GHN_TOKEN && String(env.GHN_TOKEN).trim()) {
    return String(env.GHN_TOKEN).trim();
  }

  // 2. Tra cứu từ cơ sở dữ liệu Cloudflare D1 (nếu có binding DB)
  if (env?.DB) {
    try {
      const row = await env.DB.prepare(
        "SELECT config_json FROM store_config WHERE id = 'default_config' LIMIT 1"
      ).first();
      if (row?.config_json) {
        const parsed = JSON.parse(row.config_json);
        const ghn = (parsed.shippingCarriers || []).find(c => c.id === 'ghn');
        if (ghn?.apiKey && String(ghn.apiKey).trim()) {
          return String(ghn.apiKey).trim();
        }
      }
    } catch (err) {
      console.warn('[Functions Proxy get-ghn-data] Lỗi tra cứu D1 store_config:', err.message);
    }
  }

  return '';
}

/**
 * Xử lý chính cho endpoint /functions/get-ghn-data
 */
export async function handleGhnDataRequest(request, env) {
  const url = new URL(request.url);

  // Đọc tham số từ query params (hỗ trợ cả snake_case và camelCase)
  let type = url.searchParams.get('type') || '';
  let provinceId = url.searchParams.get('province_id') || url.searchParams.get('provinceId') || '';
  let districtId = url.searchParams.get('district_id') || url.searchParams.get('districtId') || '';

  // Nếu là POST, hỗ trợ đọc thêm từ body JSON
  if (request.method === 'POST') {
    try {
      const body = await request.clone().json().catch(() => ({}));
      if (body) {
        if (body.type) type = body.type;
        if (body.province_id || body.provinceId) provinceId = body.province_id || body.provinceId;
        if (body.district_id || body.districtId) districtId = body.district_id || body.districtId;
      }
    } catch (_) {
      // Body không phải JSON hoặc rỗng, tiếp tục dùng query params
    }
  }

  type = String(type).trim().toLowerCase();
  const secretToken = await resolveServerSecretToken(env);
  const baseUrl = 'https://online-gateway.ghn.vn/shiip/public-api';

  // 1. YÊU CẦU DANH SÁCH TỈNH / THÀNH PHỐ
  if (type === 'provinces' || type === 'province') {
    if (secretToken) {
      try {
        const ghnRes = await fetch(`${baseUrl}/master-data/province`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Token': secretToken
          }
        });
        const ghnData = await ghnRes.json().catch(() => ({}));
        if (ghnData && ghnData.code === 200 && Array.isArray(ghnData.data)) {
          return new Response(JSON.stringify({
            success: true,
            code: 200,
            message: 'Success',
            data: ghnData.data
          }), { status: 200, headers: CORS_HEADERS });
        }
      } catch (err) {
        console.warn('[GHN Proxy Provinces Error]', err.message);
      }
    }

    // Fallback chuẩn xác 34 tỉnh/thành hiện hành
    return new Response(JSON.stringify({
      success: true,
      code: 200,
      message: 'Success (Local Master Data Fallback)',
      data: GHN_PROVINCES
    }), { status: 200, headers: CORS_HEADERS });
  }

  // 2. YÊU CẦU DANH SÁCH QUẬN / HUYỆN (theo province_id)
  if (type === 'districts' || type === 'district') {
    const pId = Number(provinceId);
    if (secretToken && pId) {
      try {
        const ghnRes = await fetch(`${baseUrl}/master-data/district`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': secretToken
          },
          body: JSON.stringify({ province_id: pId })
        });
        const ghnData = await ghnRes.json().catch(() => ({}));
        if (ghnData && ghnData.code === 200 && Array.isArray(ghnData.data)) {
          return new Response(JSON.stringify({
            success: true,
            code: 200,
            message: 'Success',
            data: ghnData.data
          }), { status: 200, headers: CORS_HEADERS });
        }
      } catch (err) {
        console.warn('[GHN Proxy Districts Error]', err.message);
      }
    }

    // Fallback chuẩn danh sách quận/huyện
    const districts = getGhnDistricts(provinceId);
    return new Response(JSON.stringify({
      success: true,
      code: 200,
      message: 'Success (Local Master Data Fallback)',
      data: districts
    }), { status: 200, headers: CORS_HEADERS });
  }

  // 3. YÊU CẦU DANH SÁCH PHƯỜNG / XÃ (theo district_id)
  if (type === 'wards' || type === 'ward') {
    const dId = Number(districtId);
    if (secretToken && dId) {
      try {
        const ghnRes = await fetch(`${baseUrl}/master-data/ward?district_id=${dId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Token': secretToken
          }
        });
        const ghnData = await ghnRes.json().catch(() => ({}));
        if (ghnData && ghnData.code === 200 && Array.isArray(ghnData.data)) {
          return new Response(JSON.stringify({
            success: true,
            code: 200,
            message: 'Success',
            data: ghnData.data
          }), { status: 200, headers: CORS_HEADERS });
        }
      } catch (err) {
        console.warn('[GHN Proxy Wards Error]', err.message);
      }
    }

    // Fallback chuẩn danh sách phường/xã kèm WardCode
    const wards = getGhnWards(districtId);
    return new Response(JSON.stringify({
      success: true,
      code: 200,
      message: 'Success (Local Master Data Fallback)',
      data: wards
    }), { status: 200, headers: CORS_HEADERS });
  }

  // Nếu không truyền type hợp lệ
  return new Response(JSON.stringify({
    success: false,
    code: 400,
    message: 'Thiếu hoặc sai tham số `type`. Giá trị hợp lệ: `provinces`, `districts`, `wards`.'
  }), { status: 400, headers: CORS_HEADERS });
}

/**
 * Cloudflare Pages Functions Handler
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  return handleGhnDataRequest(context.request, context.env);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
