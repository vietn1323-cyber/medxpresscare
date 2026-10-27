import { jsonResponse, errorResponse, CORS_HEADERS, getCollection, setCollection } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const products = await getCollection(env.DB, 'products');
  return jsonResponse({ success: true, products: products || [] });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    let current = await getCollection(env.DB, 'products') || [];

    if (Array.isArray(payload)) {
      // Overwrite full array
      await setCollection(env.DB, 'products', payload);
      return jsonResponse({ success: true, count: payload.length });
    } else if (payload && payload.id) {
      // Upsert single item
      const index = current.findIndex(p => p.id === payload.id);
      if (index >= 0) {
        current[index] = payload;
      } else {
        current.unshift(payload);
      }
      await setCollection(env.DB, 'products', current);
      return jsonResponse({ success: true, product: payload });
    }

    return errorResponse('Invalid product data', 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('Missing product id', 400);

  let current = await getCollection(env.DB, 'products') || [];
  current = current.filter(p => p.id !== id);
  await setCollection(env.DB, 'products', current);

  return jsonResponse({ success: true, id });
}
