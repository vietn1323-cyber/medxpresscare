import { jsonResponse, errorResponse, CORS_HEADERS, initDb } from './_db.js';

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return errorResponse('D1 database binding "DB" is not configured.', 500);
  }

  try {
    await initDb(env.DB);
    const stmt = env.DB.prepare('SELECT collection, data FROM store_data');
    const { results } = await stmt.all();

    const dataMap = {};
    if (Array.isArray(results)) {
      for (const row of results) {
        try {
          dataMap[row.collection] = JSON.parse(row.data);
        } catch {
          dataMap[row.collection] = null;
        }
      }
    }

    return jsonResponse({
      success: true,
      data: dataMap,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) {
    return errorResponse('D1 database binding "DB" is not configured.', 500);
  }

  try {
    const payload = await request.json();
    await initDb(env.DB);

    const statements = [];
    for (const [key, val] of Object.entries(payload)) {
      if (val !== undefined && val !== null) {
        statements.push(
          env.DB.prepare(`
            INSERT INTO store_data (collection, data, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(collection) DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at;
          `).bind(key, JSON.stringify(val))
        );
      }
    }

    if (statements.length > 0) {
      await env.DB.batch(statements);
    }

    return jsonResponse({ success: true, count: statements.length });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
