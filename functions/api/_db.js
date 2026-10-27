export const CORS_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

export function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: CORS_HEADERS
  });
}

export async function initDb(db) {
  if (!db) return false;
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS store_data (
        collection TEXT PRIMARY KEY,
        data TEXT,
        updated_at TEXT
      );
    `);
    return true;
  } catch (err) {
    console.error('initDb error:', err);
    return false;
  }
}

export async function getCollection(db, collectionName) {
  if (!db) return null;
  try {
    await initDb(db);
    const stmt = db.prepare('SELECT data FROM store_data WHERE collection = ?').bind(collectionName);
    const row = await stmt.first();
    if (row && row.data) {
      return JSON.parse(row.data);
    }
    return null;
  } catch (err) {
    console.error(`getCollection(${collectionName}) error:`, err);
    return null;
  }
}

export async function setCollection(db, collectionName, data) {
  if (!db) return false;
  try {
    await initDb(db);
    const stmt = db.prepare(`
      INSERT INTO store_data (collection, data, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(collection) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at;
    `).bind(collectionName, JSON.stringify(data));
    await stmt.run();
    return true;
  } catch (err) {
    console.error(`setCollection(${collectionName}) error:`, err);
    return false;
  }
}
