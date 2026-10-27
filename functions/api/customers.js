import { jsonResponse, errorResponse, CORS_HEADERS, getCollection, setCollection } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const customers = await getCollection(env.DB, 'customers');
  return jsonResponse({ success: true, customers: customers || [] });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    let current = await getCollection(env.DB, 'customers') || [];

    if (Array.isArray(payload)) {
      await setCollection(env.DB, 'customers', payload);
      return jsonResponse({ success: true, count: payload.length });
    } else if (payload && (payload.id || payload.phone || payload.email)) {
      const index = current.findIndex(c => 
        (payload.id && c.id === payload.id) || 
        (payload.phone && c.phone === payload.phone) ||
        (payload.email && c.email === payload.email)
      );
      if (index >= 0) {
        current[index] = { ...current[index], ...payload };
      } else {
        current.unshift(payload);
      }
      await setCollection(env.DB, 'customers', current);
      return jsonResponse({ success: true, customer: payload });
    }

    return errorResponse('Invalid customer payload', 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
