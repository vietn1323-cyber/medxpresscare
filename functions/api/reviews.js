import { jsonResponse, errorResponse, CORS_HEADERS, getCollection, setCollection } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const reviews = await getCollection(env.DB, 'reviews');
  return jsonResponse({ success: true, reviews: reviews || [] });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    let current = await getCollection(env.DB, 'reviews') || [];

    if (Array.isArray(payload)) {
      await setCollection(env.DB, 'reviews', payload);
      return jsonResponse({ success: true, count: payload.length });
    } else if (payload && payload.id) {
      const index = current.findIndex(r => r.id === payload.id);
      if (index >= 0) {
        current[index] = payload;
      } else {
        current.unshift(payload);
      }
      await setCollection(env.DB, 'reviews', current);
      return jsonResponse({ success: true, review: payload });
    }

    return errorResponse('Invalid review payload', 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  let current = await getCollection(env.DB, 'reviews') || [];
  current = current.filter(r => r.id !== id);
  await setCollection(env.DB, 'reviews', current);

  return jsonResponse({ success: true, id });
}
