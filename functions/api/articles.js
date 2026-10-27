import { jsonResponse, errorResponse, CORS_HEADERS, getCollection, setCollection } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const articles = await getCollection(env.DB, 'articles');
  return jsonResponse({ success: true, articles: articles || [] });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    let current = await getCollection(env.DB, 'articles') || [];

    if (Array.isArray(payload)) {
      await setCollection(env.DB, 'articles', payload);
      return jsonResponse({ success: true, count: payload.length });
    } else if (payload && (payload.id || payload.slug)) {
      const index = current.findIndex(a => (payload.id && a.id === payload.id) || (payload.slug && a.slug === payload.slug));
      if (index >= 0) {
        current[index] = payload;
      } else {
        current.unshift(payload);
      }
      await setCollection(env.DB, 'articles', current);
      return jsonResponse({ success: true, article: payload });
    }

    return errorResponse('Invalid article payload', 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const slug = url.searchParams.get('slug');

  let current = await getCollection(env.DB, 'articles') || [];
  current = current.filter(a => a.id !== id && a.slug !== slug);
  await setCollection(env.DB, 'articles', current);

  return jsonResponse({ success: true, deleted: id || slug });
}
