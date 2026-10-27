import { jsonResponse, errorResponse, CORS_HEADERS, getCollection, setCollection } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const config = await getCollection(env.DB, 'storeConfig');
  return jsonResponse({ success: true, config: config || {} });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    await setCollection(env.DB, 'storeConfig', payload);
    return jsonResponse({ success: true, config: payload });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
