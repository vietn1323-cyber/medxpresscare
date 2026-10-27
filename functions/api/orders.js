import { jsonResponse, errorResponse, CORS_HEADERS, getCollection, setCollection } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const orders = await getCollection(env.DB, 'orders');
  return jsonResponse({ success: true, orders: orders || [] });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    let current = await getCollection(env.DB, 'orders') || [];

    if (Array.isArray(payload)) {
      await setCollection(env.DB, 'orders', payload);
      return jsonResponse({ success: true, count: payload.length });
    } else if (payload && payload.id) {
      const index = current.findIndex(o => o.id === payload.id);
      if (index >= 0) {
        current[index] = payload;
      } else {
        current.unshift(payload);
      }
      await setCollection(env.DB, 'orders', current);
      return jsonResponse({ success: true, order: payload });
    }

    return errorResponse('Invalid order payload', 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function onRequestPut(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  try {
    const payload = await request.json();
    if (Array.isArray(payload)) {
      await setCollection(env.DB, 'orders', payload);
      return jsonResponse({ success: true, count: payload.length });
    }
    return errorResponse('Payload must be array of orders', 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  if (!env.DB) return errorResponse('D1 database not bound', 500);

  const url = new URL(request.url);
  const clearTest = url.searchParams.get('clearTest');
  const id = url.searchParams.get('id');

  let current = await getCollection(env.DB, 'orders') || [];

  if (clearTest === 'true') {
    const testIds = ['MXC-892410', 'MXC-741285', 'MXC-339182', 'MXC-883921'];
    current = current.filter(o => !testIds.includes(o.id));
    await setCollection(env.DB, 'orders', current);
    return jsonResponse({ success: true, clearedTest: true, remaining: current.length });
  }

  if (id) {
    current = current.filter(o => o.id !== id);
    await setCollection(env.DB, 'orders', current);
    return jsonResponse({ success: true, id });
  }

  return errorResponse('Missing parameter', 400);
}
