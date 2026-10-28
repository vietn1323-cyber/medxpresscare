/**
 * MedXpress Care - Cloudflare Worker + Static Assets + D1 Database + Workers AI
 * Hỗ trợ toàn bộ API Dược phẩm, D1 Database, Đơn hàng, Bài viết & AI Dược Sĩ Lâm Sàng
 */

import webpush from 'web-push';
import { 
  GHN_PROVINCES, 
  GHN_DISTRICTS, 
  GHN_WARDS, 
  getGhnDistricts, 
  getGhnWards, 
  resolveGhnCodes 
} from './src/data/ghnLocationData.js';

const VAPID_PUBLIC_KEY = 'BGiqquRV_799dDEJLH1DYpT-k957puxsiEPvORHnVoh2MZc2wRFxwEWtAJ45_CyQDUUWGrZO2em9KqHJNrybPgA';
const VAPID_PRIVATE_KEY = 'ZmS4M078UwQACEzUmzsGgKQPaSHfcFR2ylEBQjxxaRY';
const VAPID_SUBJECT = 'mailto:support@medxpresscare.com';

// Cấu hình VAPID Signing chuẩn RFC 8292
try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (e) {
  console.warn('[WebPush] setVapidDetails init error:', e);
}

/**
 * Gửi thông báo đẩy chuẩn Web Push protocol (RFC 8030 / RFC 8291 / RFC 8292)
 * Ký VAPID chuẩn và mã hóa payload bằng aes128gcm với cặp khóa của thiết bị
 */
export async function sendPushNotification(subscription, payload, options = {}) {
  if (!subscription || !subscription.endpoint) {
    throw new Error('Subscription endpoint is required');
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys?.p256dh || subscription.p256dh,
      auth: subscription.keys?.auth || subscription.auth
    }
  };

  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

  const pushOptions = {
    TTL: options.TTL || 86400, // 24 giờ
    urgency: options.urgency || 'high',
    topic: options.topic || 'medxpress-reminder',
    ...options
  };

  try {
    const result = await webpush.sendNotification(pushSubscription, payloadString, pushOptions);
    return {
      success: true,
      statusCode: result.statusCode,
      headers: result.headers,
      body: result.body,
      endpoint: subscription.endpoint
    };
  } catch (error) {
    console.error(`[WebPush] sendNotification error (${subscription.endpoint}):`, error?.message || error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      error: error?.message || String(error),
      endpoint: subscription.endpoint
    };
  }
}

const CORS_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: CORS_HEADERS
  });
}

async function initDb(db) {
  if (!db) return false;
  try {
    await db.prepare('CREATE TABLE IF NOT EXISTS store_data (collection TEXT PRIMARY KEY, data TEXT, updated_at TEXT)').run();
    return true;
  } catch (err) {
    console.error('initDb error:', err);
    return false;
  }
}

async function getCollection(db, collectionName) {
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

async function setCollection(db, collectionName, data) {
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // 1. Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 2. Handle /api/* endpoints
    if (pathname.startsWith('/api/')) {
      const db = env.DB;

      // /api/init-db
      if (pathname === '/api/init-db') {
        if (!db) return errorResponse('D1 database not configured', 500);
        try {
          await initDb(db);
          const { results } = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
          return jsonResponse({
            success: true,
            message: 'Bảng store_data đã được khởi tạo và kiểm tra thành công trên Cloudflare D1!',
            tables: results
          });
        } catch (err) {
          return errorResponse(err.message, 500);
        }
      }

      // /api/sync
      if (pathname === '/api/sync') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          try {
            await initDb(db);
            const { results } = await db.prepare('SELECT collection, data FROM store_data').all();
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
            return jsonResponse({ success: true, data: dataMap, timestamp: new Date().toISOString() });
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            await initDb(db);
            const statements = [];
            for (const [key, val] of Object.entries(payload)) {
              if (val !== undefined && val !== null) {
                statements.push(
                  db.prepare(`
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
              await db.batch(statements);
            }
            return jsonResponse({ success: true, count: statements.length });
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }
      }

      // /api/products
      if (pathname === '/api/products') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const products = await getCollection(db, 'products');
          return jsonResponse({ success: true, products: products || [] });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let current = await getCollection(db, 'products') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'products', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && payload.id) {
              const index = current.findIndex(p => p.id === payload.id);
              if (index >= 0) current[index] = payload;
              else current.unshift(payload);
              await setCollection(db, 'products', current);
              return jsonResponse({ success: true, product: payload });
            }
            return errorResponse('Invalid product data', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const id = searchParams.get('id');
          if (!id) return errorResponse('Missing product id', 400);
          let current = await getCollection(db, 'products') || [];
          current = current.filter(p => p.id !== id);
          await setCollection(db, 'products', current);
          return jsonResponse({ success: true, id });
        }
      }

      // /api/orders
      if (pathname === '/api/orders') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const orders = await getCollection(db, 'orders');
          return jsonResponse({ success: true, orders: orders || [] });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let current = await getCollection(db, 'orders') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'orders', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && payload.id) {
              const index = current.findIndex(o => o.id === payload.id);
              if (index >= 0) current[index] = payload;
              else current.unshift(payload);
              await setCollection(db, 'orders', current);
              return jsonResponse({ success: true, order: payload });
            }
            return errorResponse('Invalid order payload', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'PUT') {
          try {
            const payload = await request.json();
            if (Array.isArray(payload)) {
              await setCollection(db, 'orders', payload);
              return jsonResponse({ success: true, count: payload.length });
            }
            return errorResponse('Payload must be array of orders', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const clearTest = searchParams.get('clearTest');
          const id = searchParams.get('id');
          let current = await getCollection(db, 'orders') || [];
          if (clearTest === 'true') {
            const testIds = ['MXC-892410', 'MXC-741285', 'MXC-339182', 'MXC-883921'];
            current = current.filter(o => !testIds.includes(o.id));
            await setCollection(db, 'orders', current);
            return jsonResponse({ success: true, clearedTest: true, remaining: current.length });
          }
          if (id) {
            current = current.filter(o => o.id !== id);
            await setCollection(db, 'orders', current);
            return jsonResponse({ success: true, id });
          }
          return errorResponse('Missing parameter', 400);
        }
      }

      // /api/articles
      if (pathname === '/api/articles') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const articles = await getCollection(db, 'articles');
          return jsonResponse({ success: true, articles: articles || [] });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let current = await getCollection(db, 'articles') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'articles', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && (payload.id || payload.slug)) {
              const index = current.findIndex(a => (payload.id && a.id === payload.id) || (payload.slug && a.slug === payload.slug));
              if (index >= 0) current[index] = payload;
              else current.unshift(payload);
              await setCollection(db, 'articles', current);
              return jsonResponse({ success: true, article: payload });
            }
            return errorResponse('Invalid article payload', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const id = searchParams.get('id');
          const slug = searchParams.get('slug');
          let current = await getCollection(db, 'articles') || [];
          current = current.filter(a => a.id !== id && a.slug !== slug);
          await setCollection(db, 'articles', current);
          return jsonResponse({ success: true, deleted: id || slug });
        }
      }

      // /api/reviews
      if (pathname === '/api/reviews') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const reviews = await getCollection(db, 'reviews');
          return jsonResponse({ success: true, reviews: reviews || [] });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let current = await getCollection(db, 'reviews') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'reviews', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && payload.id) {
              const index = current.findIndex(r => r.id === payload.id);
              if (index >= 0) current[index] = payload;
              else current.unshift(payload);
              await setCollection(db, 'reviews', current);
              return jsonResponse({ success: true, review: payload });
            }
            return errorResponse('Invalid review payload', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const id = searchParams.get('id');
          let current = await getCollection(db, 'reviews') || [];
          current = current.filter(r => r.id !== id);
          await setCollection(db, 'reviews', current);
          return jsonResponse({ success: true, id });
        }
      }

      // /api/config
      if (pathname === '/api/config') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const config = await getCollection(db, 'storeConfig');
          return jsonResponse({ success: true, config: config || {} });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            await setCollection(db, 'storeConfig', payload);
            return jsonResponse({ success: true, config: payload });
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }
      }

      // /api/customers
      if (pathname === '/api/customers') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const customers = await getCollection(db, 'customers');
          return jsonResponse({ success: true, customers: customers || [] });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let current = await getCollection(db, 'customers') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'customers', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && (payload.id || payload.phone || payload.email)) {
              const index = current.findIndex(c => 
                (payload.id && c.id === payload.id) || 
                (payload.phone && c.phone === payload.phone) ||
                (payload.email && c.email === payload.email)
              );
              if (index >= 0) current[index] = { ...current[index], ...payload };
              else current.unshift(payload);
              await setCollection(db, 'customers', current);
              return jsonResponse({ success: true, customer: payload });
            }
            return errorResponse('Invalid customer payload', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }
      }

      // /api/consultations (Lưu giữ lịch sử khảo sát nhu cầu & tương tác chat AI của khách hàng trên Cloudflare D1)
      if (pathname === '/api/consultations') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const customerId = searchParams.get('customerId');
          const phone = searchParams.get('phone');
          const consultations = await getCollection(db, 'consultations') || [];
          
          if (customerId) {
            const filtered = consultations.filter(c => c.customerId === customerId);
            return jsonResponse({ success: true, consultations: filtered });
          }
          if (phone) {
            const filtered = consultations.filter(c => c.customerPhone === phone);
            return jsonResponse({ success: true, consultations: filtered });
          }
          return jsonResponse({ success: true, consultations });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let current = await getCollection(db, 'consultations') || [];
            
            if (Array.isArray(payload)) {
              await setCollection(db, 'consultations', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && (payload.id || payload.customerId || payload.customerPhone)) {
              const consultationId = payload.id || ('cst-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
              const fullRecord = {
                ...payload,
                id: consultationId,
                updatedAt: new Date().toISOString()
              };
              const index = current.findIndex(c => c.id === consultationId);
              if (index >= 0) current[index] = fullRecord;
              else current.unshift(fullRecord);

              await setCollection(db, 'consultations', current);

              // Cập nhật tóm tắt hồ sơ sức khỏe khách hàng vào bảng customers nếu có thông tin khách
              if (payload.customerId || payload.customerPhone) {
                try {
                  let customersList = await getCollection(db, 'customers') || [];
                  const cIdx = customersList.findIndex(c => 
                    (payload.customerId && c.id === payload.customerId) ||
                    (payload.customerPhone && c.phone === payload.customerPhone)
                  );
                  if (cIdx >= 0) {
                    customersList[cIdx] = {
                      ...customersList[cIdx],
                      healthProfile: payload.healthProfile || customersList[cIdx].healthProfile,
                      lastConsultationDate: fullRecord.updatedAt,
                      lastConcern: payload.healthProfile?.primaryConcernTitle || payload.healthProfile?.primaryConcern || ''
                    };
                    await setCollection(db, 'customers', customersList);
                  }
                } catch (e) {
                  console.warn('Sync customer healthProfile error:', e);
                }
              }

              return jsonResponse({ success: true, consultation: fullRecord });
            }
            return errorResponse('Invalid consultation payload', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const id = searchParams.get('id');
          if (!id) return errorResponse('Missing consultation id', 400);
          let current = await getCollection(db, 'consultations') || [];
          current = current.filter(c => c.id !== id);
          await setCollection(db, 'consultations', current);
          return jsonResponse({ success: true, id });
        }
      }

      // /api/ai-pharmacist
      if (pathname === '/api/ai-pharmacist') {
        if (!env.AI) return errorResponse('Workers AI not configured', 503);
        try {
          const { userMessage, catalogSummary, targetAudience, selectedCondition, chatHistory, customerContext } = await request.json();
          let personalizedPrompt = '';
          if (customerContext) {
            personalizedPrompt = `
THÔNG TIN KHÁCH HÀNG ĐÃ ĐƯỢC CÁ NHÂN HÓA:
- Tên khách hàng: ${customerContext.name || 'Quý khách'}
- Nhóm đối tượng: ${customerContext.audience || targetAudience || 'Khách hàng'}
- Nhu cầu / Mối quan tâm đã khảo sát: ${customerContext.concernTitle || customerContext.specificNeeds || 'Chăm sóc sức khỏe'}
- Lưu ý sức khỏe / Bệnh nền: ${customerContext.condition || selectedCondition || 'Bình thường'}
- Lưu ý đặc biệt: Phân biệt rõ nhu cầu bổ sung vi chất hàng ngày (như canxi cho con) với bệnh tật, xưng hô thân thiện, gọi tên khách hàng nếu có.`;
          }
          const systemPrompt = `Bạn là Dược sĩ Lâm sàng Trưởng 24/7 của Hệ Thống Dược Phẩm & TPCN MedXpressCare.com.
Tư vấn chuẩn xác y khoa, cá nhân hóa, đề xuất phác đồ kết hợp 1 sản phẩm Nội địa và 1 sản phẩm Nhập ngoại khi khách cần.
${personalizedPrompt}
DANH MỤC SẢN PHẨM MEDXPRESSCARE:
${catalogSummary || ''}`;

          const messages = [{ role: 'system', content: systemPrompt }];
          if (Array.isArray(chatHistory)) {
            for (const msg of chatHistory.slice(-4)) {
              if (msg.sender === 'user' || msg.role === 'user') messages.push({ role: 'user', content: msg.text || msg.content });
              else if (msg.sender === 'pharmacist' || msg.role === 'assistant') messages.push({ role: 'assistant', content: msg.text || msg.content });
            }
          }
          messages.push({ role: 'user', content: `Khách hỏi: "${userMessage || 'Tư vấn sức khỏe'}". Nhóm: ${targetAudience || 'Chung'}. Bệnh nền: ${selectedCondition || 'Không'}.` });

          const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 1024, temperature: 0.7 });
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

      // /api/ai-writer
      if (pathname === '/api/ai-writer') {
        if (!env.AI) return errorResponse('Workers AI not configured', 503);
        try {
          const { topic, referenceText } = await request.json();
          const systemPrompt = `Bạn là Dược sĩ Trưởng kiêm Chuyên gia Content Y Dược Chuẩn SEO của MedXpressCare.com.
Viết bài y khoa chuẩn SEO On-Page. Trả về JSON: {"title": "...", "summary": "...", "content": "...", "tags": ["..."], "metaTitle": "...", "metaDescription": "..."}`;
          const prompt = `Viết bài y khoa chuẩn SEO về: "${topic}". Tài liệu: ${referenceText || 'Tổng hợp lâm sàng chuẩn'}. Chỉ trả về JSON.`;

          const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            max_tokens: 2048,
            temperature: 0.6
          });

          let rawText = aiResult.response || '';
          let parsedJson = null;
          try {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsedJson = JSON.parse(jsonMatch[0]);
          } catch {}

          return jsonResponse({
            success: true,
            provider: 'cloudflare_workers_ai',
            data: parsedJson || { content: rawText, title: topic }
          });
        } catch (err) {
          return errorResponse(err.message, 500);
        }
      }

      // /api/push/vapid-public-key
      if (pathname === '/api/push/vapid-public-key') {
        return jsonResponse({
          success: true,
          publicKey: 'BGiqquRV_799dDEJLH1DYpT-k957puxsiEPvORHnVoh2MZc2wRFxwEWtAJ45_CyQDUUWGrZO2em9KqHJNrybPgA'
        });
      }

      // /api/push/subscribe
      if (pathname === '/api/push/subscribe') {
        if (!db) return errorResponse('D1 database not configured', 500);
        try {
          const payload = await request.json();
          if (!payload.endpoint) return errorResponse('Missing push endpoint', 400);

          let subs = await getCollection(db, 'push_subscriptions') || [];
          const existingIdx = subs.findIndex(s => s.endpoint === payload.endpoint);
          const subRecord = {
            id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            endpoint: payload.endpoint,
            keys: payload.keys || {},
            customerId: payload.customerId || null,
            customerName: payload.customerName || null,
            customerPhone: payload.customerPhone || null,
            userAgent: payload.userAgent || '',
            platform: payload.platform || 'web',
            enabled: true,
            updatedAt: new Date().toISOString()
          };

          if (existingIdx >= 0) {
            subs[existingIdx] = { ...subs[existingIdx], ...subRecord, id: subs[existingIdx].id };
          } else {
            subs.unshift(subRecord);
          }

          await setCollection(db, 'push_subscriptions', subs);
          return jsonResponse({ success: true, count: subs.length, subscription: subRecord });
        } catch (err) {
          return errorResponse(err.message, 500);
        }
      }

      // /api/push/unsubscribe
      if (pathname === '/api/push/unsubscribe') {
        if (!db) return errorResponse('D1 database not configured', 500);
        try {
          const { endpoint } = await request.json();
          let subs = await getCollection(db, 'push_subscriptions') || [];
          subs = subs.filter(s => s.endpoint !== endpoint);
          await setCollection(db, 'push_subscriptions', subs);
          return jsonResponse({ success: true, count: subs.length });
        } catch (err) {
          return errorResponse(err.message, 500);
        }
      }

      // /api/push/subscriptions
      if (pathname === '/api/push/subscriptions') {
        if (!db) return errorResponse('D1 database not configured', 500);
        const subs = await getCollection(db, 'push_subscriptions') || [];
        return jsonResponse({ success: true, subscriptions: subs, count: subs.length });
      }

      // /api/push/send
      if (pathname === '/api/push/send') {
        if (!db) return errorResponse('D1 database not configured', 500);
        try {
          const { title, body, icon, image, url, customerId, endpoint } = await request.json();
          let subs = await getCollection(db, 'push_subscriptions') || [];
          
          let targets = subs.filter(s => s.enabled);
          if (endpoint) {
            targets = targets.filter(s => s.endpoint === endpoint);
          } else if (customerId) {
            targets = targets.filter(s => s.customerId === customerId);
          }

          // Gửi thông báo đẩy chuẩn Web Push protocol với VAPID signing & mã hoá aes128gcm
          const notificationPayload = {
            title: title || 'MedXpressCare Thông Báo',
            body: body || '',
            icon: icon || '/pwa-192x192.png',
            image: image || null,
            url: url || '/',
            tag: 'medxpress-' + Date.now(),
            timestamp: Date.now()
          };

          const pushResults = [];
          for (const target of targets) {
            try {
              const res = await sendPushNotification(target, notificationPayload);
              pushResults.push(res);
            } catch (targetErr) {
              pushResults.push({
                success: false,
                endpoint: target.endpoint,
                error: targetErr.message || String(targetErr)
              });
            }
          }

          // Lưu log thông báo đã gửi vào D1
          let logs = await getCollection(db, 'push_notifications_log') || [];
          const notifLog = {
            id: 'notif-' + Date.now(),
            title: title || 'MedXpressCare Thông Báo',
            body: body || '',
            icon: icon || '/pwa-192x192.png',
            image: image || null,
            url: url || '/',
            targetCount: targets.length,
            successCount: pushResults.filter(r => r.success).length,
            results: pushResults,
            sentAt: new Date().toISOString()
          };
          logs.unshift(notifLog);
          await setCollection(db, 'push_notifications_log', logs.slice(0, 100));

          return jsonResponse({
            success: true,
            message: `Đã gửi thông báo đẩy tới ${targets.length} thiết bị qua Web Push protocol chuẩn (VAPID Signed)`,
            notification: notifLog,
            targetCount: targets.length,
            successCount: notifLog.successCount,
            results: pushResults
          });
        } catch (err) {
          return errorResponse(err.message, 500);
        }
      }

      // /api/reminders/medications (Lịch Nhắc Uống Thuốc AI)
      if (pathname === '/api/reminders/medications') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const customerId = searchParams.get('customerId');
          const schedules = await getCollection(db, 'medication_schedules') || [];
          if (customerId) {
            const filtered = schedules.filter(s => s.customerId === customerId);
            return jsonResponse({ success: true, schedules: filtered });
          }
          return jsonResponse({ success: true, schedules });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let schedules = await getCollection(db, 'medication_schedules') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'medication_schedules', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && (payload.id || payload.productId)) {
              const id = payload.id || ('med-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
              const item = { ...payload, id, updatedAt: new Date().toISOString() };
              const idx = schedules.findIndex(s => s.id === id);
              if (idx >= 0) schedules[idx] = item;
              else schedules.unshift(item);
              await setCollection(db, 'medication_schedules', schedules);
              return jsonResponse({ success: true, schedule: item });
            }
            return errorResponse('Invalid medication schedule data', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const id = searchParams.get('id');
          if (!id) return errorResponse('Missing schedule id', 400);
          let schedules = await getCollection(db, 'medication_schedules') || [];
          schedules = schedules.filter(s => s.id !== id);
          await setCollection(db, 'medication_schedules', schedules);
          return jsonResponse({ success: true, deleted: id });
        }
      }

      // /api/reminders/refills (Lịch Nhắc Tái Đặt Hàng Trước 2-3 Ngày)
      if (pathname === '/api/reminders/refills') {
        if (!db) return errorResponse('D1 database not configured', 500);

        if (request.method === 'GET') {
          const customerId = searchParams.get('customerId');
          let refills = await getCollection(db, 'refill_schedules') || [];
          
          // Tính toán lại daysRemaining và isNearRunout chuẩn xác theo thời gian thực
          const now = new Date();
          refills = refills.map(item => {
            if (item.runoutDateStr) {
              const runout = new Date(item.runoutDateStr);
              const diffDays = Math.ceil((runout.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              const daysRemaining = Math.max(0, diffDays);
              return {
                ...item,
                daysRemaining,
                isNearRunout: daysRemaining <= 3 && daysRemaining >= 0
              };
            }
            return item;
          });

          if (customerId) {
            const filtered = refills.filter(r => r.customerId === customerId);
            return jsonResponse({ success: true, refills: filtered });
          }
          return jsonResponse({ success: true, refills });
        }

        if (request.method === 'POST') {
          try {
            const payload = await request.json();
            let refills = await getCollection(db, 'refill_schedules') || [];
            if (Array.isArray(payload)) {
              await setCollection(db, 'refill_schedules', payload);
              return jsonResponse({ success: true, count: payload.length });
            } else if (payload && (payload.id || payload.productId)) {
              const id = payload.id || ('refill-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
              const item = { ...payload, id, updatedAt: new Date().toISOString() };
              const idx = refills.findIndex(r => r.id === id);
              if (idx >= 0) refills[idx] = item;
              else refills.unshift(item);
              await setCollection(db, 'refill_schedules', refills);
              return jsonResponse({ success: true, refill: item });
            }
            return errorResponse('Invalid refill schedule data', 400);
          } catch (err) {
            return errorResponse(err.message, 500);
          }
        }

        if (request.method === 'DELETE') {
          const id = searchParams.get('id');
          if (!id) return errorResponse('Missing refill id', 400);
          let refills = await getCollection(db, 'refill_schedules') || [];
          refills = refills.filter(r => r.id !== id);
          await setCollection(db, 'refill_schedules', refills);
          return jsonResponse({ success: true, deleted: id });
        }
      }

      // /api/cron/check-reminders (Quét tự động các lịch nhắc sắp đến hạn 2-3 ngày hoặc giờ uống thuốc)
      if (pathname === '/api/cron/check-reminders') {
        if (!db) return errorResponse('D1 database not configured', 500);
        try {
          let refills = await getCollection(db, 'refill_schedules') || [];
          const now = new Date();
          const dueRefills = [];

          for (const item of refills) {
            if (item.enabled && item.runoutDateStr && !item.reminderSent) {
              const runout = new Date(item.runoutDateStr);
              const diffDays = Math.ceil((runout.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              if (diffDays <= 3 && diffDays >= 0) {
                dueRefills.push(item);
              }
            }
          }

          return jsonResponse({
            success: true,
            checkedAt: now.toISOString(),
            dueRefillsCount: dueRefills.length,
            dueRefills: dueRefills.map(r => ({
              productName: r.productName,
              daysRemaining: r.daysRemaining || 2,
              customerName: r.customerName || 'Khách hàng',
              customerId: r.customerId
            }))
          });
        } catch (err) {
          return errorResponse(err.message, 500);
        }
      }

      // ==========================================
      // GHN (GIAO HÀNG NHANH) OFFICIAL API PROXY
      // ==========================================

      // /api/shipping/ghn/test-connection
      if (pathname === '/api/shipping/ghn/test-connection') {
        try {
          const { apiKey, shopId, isDev } = await request.json();
          if (!apiKey || !apiKey.trim()) {
            return jsonResponse({ success: false, message: 'Vui lòng cung cấp Token API của GHN.' }, 400);
          }

          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          // Gọi sang GHN để lấy danh sách Shop thuộc Token
          const ghnRes = await fetch(`${baseUrl}/v2/shop/all`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Token': apiKey.trim()
            },
            body: JSON.stringify({ offset: 0, limit: 50 })
          });

          const ghnData = await ghnRes.json().catch(() => ({}));

          if (ghnData.code !== 200) {
            // Thử endpoint dự phòng nếu shop/all từ chối
            const provRes = await fetch(`${baseUrl}/master-data/province`, {
              headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() }
            });
            const provData = await provRes.json().catch(() => ({}));
            if (provData.code !== 200) {
              return jsonResponse({
                success: false,
                message: `Lỗi kết nối GHN: ${ghnData.message || provData.message || 'Token không hợp lệ hoặc đã hết hạn.'}`
              }, 400);
            }
          }

          // Kiểm tra shopId nếu có nhập
          let matchedShop = null;
          const shopsList = ghnData.data?.shops || [];
          if (Array.isArray(shopsList)) {
            if (shopId) {
              matchedShop = shopsList.find(s => String(s._id) === String(shopId).trim());
            } else if (shopsList.length > 0) {
              matchedShop = shopsList[0];
            }
          }

          if (shopId && !matchedShop && shopsList.length > 0) {
            const availableIds = shopsList.map(s => s._id).join(', ');
            return jsonResponse({
              success: false,
              message: `Token hợp lệ nhưng không tìm thấy Shop ID "${shopId}". Danh sách Shop ID khả dụng trên tài khoản GHN của bạn là: [${availableIds}]`
            }, 400);
          }

          return jsonResponse({
            success: true,
            message: matchedShop 
              ? `Kết nối GHN thành công! Cửa hàng: "${matchedShop.name}" (ID: ${matchedShop._id}) - Kho hàng: ${matchedShop.address || 'Hà Nội'}`
              : 'Xác thực Token GHN thành công! Máy chủ GHN sẵn sàng.',
            shop: matchedShop,
            shops: shopsList
          });
        } catch (err) {
          return jsonResponse({ success: false, message: `Lỗi kết nối máy chủ GHN: ${err.message}` }, 500);
        }
      }

      // /api/shipping/ghn/master-data/provinces
      if (pathname === '/api/shipping/ghn/master-data/provinces') {
        try {
          const { apiKey, isDev } = await request.json().catch(() => ({}));
          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          if (apiKey) {
            const ghnRes = await fetch(`${baseUrl}/master-data/province`, {
              headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() }
            });
            const data = await ghnRes.json().catch(() => ({}));
            if (data.code === 200 && Array.isArray(data.data)) {
              return jsonResponse({ success: true, data: data.data });
            }
          }
          return jsonResponse({ success: true, data: GHN_PROVINCES });
        } catch (err) {
          return jsonResponse({ success: true, data: GHN_PROVINCES });
        }
      }

      // /api/shipping/ghn/master-data/districts
      if (pathname === '/api/shipping/ghn/master-data/districts') {
        try {
          const { provinceId, apiKey, isDev } = await request.json().catch(() => ({}));
          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          if (apiKey && provinceId) {
            const ghnRes = await fetch(`${baseUrl}/master-data/district`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() },
              body: JSON.stringify({ province_id: Number(provinceId) })
            });
            const data = await ghnRes.json().catch(() => ({}));
            if (data.code === 200 && Array.isArray(data.data)) {
              return jsonResponse({ success: true, data: data.data });
            }
          }
          const districts = getGhnDistricts(provinceId);
          return jsonResponse({ success: true, data: districts });
        } catch (err) {
          const districts = getGhnDistricts(provinceId);
          return jsonResponse({ success: true, data: districts });
        }
      }

      // /api/shipping/ghn/master-data/wards
      if (pathname === '/api/shipping/ghn/master-data/wards') {
        try {
          const { districtId, apiKey, isDev } = await request.json().catch(() => ({}));
          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          if (apiKey && districtId) {
            const ghnRes = await fetch(`${baseUrl}/master-data/ward?district_id=${districtId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() }
            });
            const data = await ghnRes.json().catch(() => ({}));
            if (data.code === 200 && Array.isArray(data.data)) {
              return jsonResponse({ success: true, data: data.data });
            }
          }
          const wards = getGhnWards(districtId);
          return jsonResponse({ success: true, data: wards });
        } catch (err) {
          const wards = getGhnWards(districtId);
          return jsonResponse({ success: true, data: wards });
        }
      }

      // /api/shipping/ghn/create-order
      if (pathname === '/api/shipping/ghn/create-order') {
        try {
          const { order, apiKey, shopId, isDev, storeConfig } = await request.json();
          if (!order) return errorResponse('Missing order data', 400);
          if (!apiKey || !apiKey.trim()) return errorResponse('Chưa cấu hình Token GHN (apiKey)', 400);

          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          const returnPhone = storeConfig?.hotline?.replace(/[^0-9]/g, '') || '0968686868';
          const returnAddress = storeConfig?.warehouseAddress || storeConfig?.headquartersAddress || 'Tầng 6, Số 168 Cầu Giấy, Quan Hoa, Q. Cầu Giấy, Hà Nội';

          // Tiền thu hộ COD: nếu đã thanh toán chuyển khoản/QR thì COD = 0, nếu thanh toán khi nhận hàng thì bằng tổng tiền
          const codAmount = order.paymentMethod === 'vietqr' ? 0 : Math.round(order.grandTotal || 0);

          // Chuẩn bị danh sách sản phẩm
          const items = (order.items || []).map((it, idx) => ({
            name: it.name || `Sản phẩm #${idx + 1}`,
            code: String(it.id || it.productId || `SP-${idx + 1}`),
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
            weight: 200,
            length: 10,
            width: 10,
            height: 10
          }));

          const customer = order.customer || {};
          const toName = customer.fullName || customer.name || 'Khách hàng';
          const toPhone = (customer.phone || '').replace(/[^0-9]/g, '') || '0900000000';
          const toAddress = customer.address || 'Địa chỉ khách hàng';
          const toDistrict = customer.district || 'Quận Cầu Giấy';
          const toWard = customer.ward || customer.commune || 'Quan Hoa';
          const toProvince = customer.province || customer.city || 'Hà Nội';

          // Tự động giải quyết district_id và ward_code của GHN
          let to_district_id = customer.to_district_id || customer.districtId || null;
          let to_ward_code = customer.to_ward_code || customer.wardCode || null;

          // Nếu chưa có mã (từ đơn hàng cũ hoặc form thuần text), giải quyết chuẩn xác qua resolveGhnCodes
          if (!to_district_id || !to_ward_code) {
            const resolved = resolveGhnCodes(toProvince, toDistrict, toWard);
            if (resolved) {
              if (!to_district_id) to_district_id = resolved.districtId;
              if (!to_ward_code) to_ward_code = resolved.wardCode;
            }
          }

          // Fallback tra cứu qua GHN API trực tiếp nếu vẫn thiếu
          if (!to_district_id || !to_ward_code) {
            try {
              const provRes = await fetch(`${baseUrl}/master-data/province`, {
                headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() }
              });
              const provData = await provRes.json().catch(() => ({}));
              if (provData.code === 200 && Array.isArray(provData.data)) {
                const cleanProv = toProvince.toLowerCase().replace(/tỉnh|thành phố|tp\.?|tp/g, '').trim();
                const matchedProv = provData.data.find(p => {
                  const pName = (p.ProvinceName || '').toLowerCase().replace(/tỉnh|thành phố|tp\.?|tp/g, '').trim();
                  return pName.includes(cleanProv) || cleanProv.includes(pName);
                });

                if (matchedProv) {
                  const distRes = await fetch(`${baseUrl}/master-data/district`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() },
                    body: JSON.stringify({ province_id: matchedProv.ProvinceID })
                  });
                  const distData = await distRes.json().catch(() => ({}));
                  if (distData.code === 200 && Array.isArray(distData.data)) {
                    const cleanDist = toDistrict.toLowerCase().replace(/quận|huyện|thị xã|thành phố/g, '').trim();
                    const matchedDist = distData.data.find(d => {
                      const dName = (d.DistrictName || '').toLowerCase().replace(/quận|huyện|thị xã|thành phố/g, '').trim();
                      return dName.includes(cleanDist) || cleanDist.includes(dName);
                    });

                    if (matchedDist) {
                      to_district_id = matchedDist.DistrictID;

                      const wardRes = await fetch(`${baseUrl}/master-data/ward?district_id=${matchedDist.DistrictID}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json', 'Token': apiKey.trim() }
                      });
                      const wardData = await wardRes.json().catch(() => ({}));
                      if (wardData.code === 200 && Array.isArray(wardData.data)) {
                        const cleanWard = toWard.toLowerCase().replace(/phường|xã|thị trấn/g, '').trim();
                        const matchedWard = wardData.data.find(w => {
                          const wName = (w.WardName || '').toLowerCase().replace(/phường|xã|thị trấn/g, '').trim();
                          return wName.includes(cleanWard) || cleanWard.includes(wName);
                        });
                        if (matchedWard) {
                          to_ward_code = String(matchedWard.WardCode);
                        }
                      }
                    }
                  }
                }
              }
            } catch (e) {
              console.warn('[GHN Location Resolver API Fallback]', e.message);
            }
          }

          // Chuẩn bị payload gửi GHN
          const ghnPayload = {
            payment_type_id: 1, // 1: Bên gửi / Shop trả cước vận chuyển (Người nhận không phải trả cước)
            note: 'Kiện hàng Dược phẩm/TPCN MedXpressCare niêm phong tem GSP. Cho xem hàng không cho thử. Giao thất bại thu 35.000đ.',
            required_note: 'CHOXEMHANGKHONGTHU',
            return_phone: returnPhone,
            return_address: returnAddress,
            client_order_code: String(order.id),
            to_name: toName,
            to_phone: toPhone,
            to_address: `${toAddress}, ${toWard}, ${toDistrict}, ${toProvince}`,
            to_ward_name: toWard,
            to_district_name: toDistrict,
            to_district_id: Number(to_district_id),
            to_ward_code: String(to_ward_code),
            cod_amount: codAmount,
            cod_failed_amount: 35000, // Phí thu hộ nếu giao không thành công (GTB của GHN)
            content: `Đơn hàng MedXpressCare #${order.id} (${items.length} hộp TPCN)`,
            weight: Math.max(250, items.reduce((sum, it) => sum + (it.weight * it.quantity), 0)),
            length: 20,
            width: 15,
            height: 10,
            service_type_id: 2, // Dịch vụ chuẩn E-commerce
            items: items
          };

          if (to_district_id) ghnPayload.to_district_id = Number(to_district_id);
          if (to_ward_code) ghnPayload.to_ward_code = String(to_ward_code);

          // BƯỚC 3: RÀNG BUỘC BIỂU MẪU (VALIDATION)
          // Kiểm tra điều kiện trước khi thực hiện cURL/fetch đẩy sang GHN. Nếu to_ward_code trống, trả về thông báo lỗi yêu cầu người dùng hoàn thiện địa chỉ giao hàng.
          if (!ghnPayload.to_ward_code || !String(ghnPayload.to_ward_code).trim() || !ghnPayload.to_district_id) {
            console.error('[GHN Error] to_ward_code hoặc to_district_id bị thiếu:', {
              to_district_id: ghnPayload.to_district_id,
              to_ward_code: ghnPayload.to_ward_code,
              customer
            });
            return jsonResponse({
              success: false,
              message: 'Lỗi địa chỉ giao hàng: Không thể xác định mã Phường/Xã (to_ward_code) hoặc Quận/Huyện (to_district_id) hợp lệ với GHN. Vui lòng kiểm tra và hoàn thiện lại Phường/Xã giao hàng của đơn.'
            }, 400);
          }

          // BƯỚC 1: RÀ SOÁT KIỂM TRA DỮ LIỆU GỬI ĐI (PAYLOAD REQUEST)
          // Log/print chuỗi JSON mà website của bạn sinh ra ngay trước khi gửi sang endpoint /shipping-order/create của GHN
          console.log('[GHN Payload Request]', JSON.stringify(ghnPayload, null, 2));

          const ghnHeaders = {
            'Content-Type': 'application/json',
            'Token': apiKey.trim()
          };
          if (shopId) {
            ghnHeaders['ShopId'] = String(shopId).trim();
          }

          const ghnRes = await fetch(`${baseUrl}/v2/shipping-order/create`, {
            method: 'POST',
            headers: ghnHeaders,
            body: JSON.stringify(ghnPayload)
          });

          const ghnData = await ghnRes.json().catch(() => ({}));

          if (ghnData.code !== 200) {
            console.error('[GHN Error] Create order failed:', ghnData);
            return jsonResponse({
              success: false,
              message: `GHN từ chối tạo đơn: ${ghnData.message || ghnData.code_message_value || JSON.stringify(ghnData)}`,
              ghnError: ghnData
            }, 400);
          }

          // Thành công! GHN trả về mã vận đơn THẬT
          const ghnResult = ghnData.data || {};
          return jsonResponse({
            success: true,
            orderCode: ghnResult.order_code,
            trackingNumber: ghnResult.order_code,
            totalFee: ghnResult.total_fee,
            expectedDeliveryTime: ghnResult.expected_delivery_time,
            sortCode: ghnResult.sort_code,
            transType: ghnResult.trans_type,
            rawGhn: ghnResult
          });
        } catch (err) {
          return jsonResponse({ success: false, message: `Lỗi kết nối GHN: ${err.message}` }, 500);
        }
      }

      // /api/shipping/ghn/tracking-detail
      if (pathname === '/api/shipping/ghn/tracking-detail') {
        try {
          const { orderCode, apiKey, isDev } = await request.json();
          if (!orderCode) return errorResponse('Missing orderCode', 400);
          if (!apiKey) return errorResponse('Missing apiKey', 400);

          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          const ghnRes = await fetch(`${baseUrl}/v2/shipping-order/detail`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Token': apiKey.trim()
            },
            body: JSON.stringify({ order_code: orderCode })
          });

          const ghnData = await ghnRes.json().catch(() => ({}));
          if (ghnData.code !== 200) {
            return jsonResponse({
              success: false,
              message: `Không tìm thấy vận đơn GHN: ${ghnData.message || 'Mã vận đơn không tồn tại'}`
            }, 400);
          }

          return jsonResponse({
            success: true,
            data: ghnData.data
          });
        } catch (err) {
          return jsonResponse({ success: false, message: err.message }, 500);
        }
      }

      // /api/shipping/ghn/print-order
      if (pathname === '/api/shipping/ghn/print-order') {
        try {
          const { orderCodes, apiKey, isDev } = await request.json();
          const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];
          if (codes.length === 0) return errorResponse('Missing orderCodes', 400);
          if (!apiKey) return errorResponse('Missing apiKey', 400);

          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          const ghnRes = await fetch(`${baseUrl}/v2/a5/gen-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Token': apiKey.trim()
            },
            body: JSON.stringify({ order_codes: codes })
          });

          const ghnData = await ghnRes.json().catch(() => ({}));
          if (ghnData.code !== 200 || !ghnData.data?.token) {
            return jsonResponse({
              success: false,
              message: `Không thể tạo token in GHN: ${ghnData.message || 'Lỗi tạo phiếu in'}`
            }, 400);
          }

          const printUrl = isDev
            ? `https://dev-online-gateway.ghn.vn/a5/public-api/printA5?token=${ghnData.data.token}`
            : `https://online-gateway.ghn.vn/a5/public-api/printA5?token=${ghnData.data.token}`;

          return jsonResponse({
            success: true,
            token: ghnData.data.token,
            printUrl
          });
        } catch (err) {
          return jsonResponse({ success: false, message: err.message }, 500);
        }
      }

      // /api/shipping/ghn/cancel-order
      if (pathname === '/api/shipping/ghn/cancel-order') {
        try {
          const { orderCodes, apiKey, isDev } = await request.json();
          const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];
          if (codes.length === 0) return errorResponse('Missing orderCodes', 400);
          if (!apiKey) return errorResponse('Missing apiKey', 400);

          const baseUrl = isDev 
            ? 'https://dev-online-gateway.ghn.vn/shiip/public-api' 
            : 'https://online-gateway.ghn.vn/shiip/public-api';

          const ghnRes = await fetch(`${baseUrl}/v2/switch-status/cancel`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Token': apiKey.trim()
            },
            body: JSON.stringify({ order_codes: codes })
          });

          const ghnData = await ghnRes.json().catch(() => ({}));
          return jsonResponse({
            success: ghnData.code === 200,
            message: ghnData.message || 'Xử lý yêu cầu hủy đơn trên GHN',
            ghnData
          });
        } catch (err) {
          return jsonResponse({ success: false, message: err.message }, 500);
        }
      }

      return errorResponse('API endpoint not found', 404);
    }

    // 3. Static Assets fallback (Single Page App)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('MedXpress Care is online.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  },

  // 4. Cloudflare Cron Trigger (Chạy tự động 08:00 và 19:00 hàng ngày)
  async scheduled(event, env, ctx) {
    const db = env.DB;
    if (!db) return;
    try {
      console.log('[Cron] Running scheduled reminders check at', new Date().toISOString());
      let refills = await getCollection(db, 'refill_schedules') || [];
      const now = new Date();
      let subs = await getCollection(db, 'push_subscriptions') || [];
      const activeSubs = subs.filter(s => s.enabled);

      // Quét các đơn thuốc sắp hết hàng trước 2 - 3 ngày
      for (const item of refills) {
        if (item.enabled && item.runoutDateStr && !item.reminderSent) {
          const runout = new Date(item.runoutDateStr);
          const diffDays = Math.ceil((runout.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          if (diffDays <= 3 && diffDays >= 0) {
            const targets = item.customerId 
              ? activeSubs.filter(s => s.customerId === item.customerId)
              : activeSubs;

            for (const sub of targets) {
              await sendPushNotification(sub, {
                title: '📦 MedXpressCare - Nhắc Tái Đặt Hàng',
                body: `Sản phẩm "${item.productName}" của bạn chỉ còn đủ dùng trong ${diffDays} ngày nữa. Đặt ngay để kịp nhận trước khi hết nhé!`,
                icon: '/pwa-192x192.png',
                url: '/#tu-thuoc'
              });
            }
            item.reminderSent = true;
          }
        }
      }
      await setCollection(db, 'refill_schedules', refills);
    } catch (e) {
      console.error('[Cron] Error running scheduled task:', e);
    }
  }
};
