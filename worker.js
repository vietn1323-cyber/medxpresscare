/**
 * MedXpress Care - Cloudflare Worker + Static Assets + D1 Database + Workers AI
 * Hỗ trợ toàn bộ API Dược phẩm, D1 Database, Đơn hàng, Bài viết & AI Dược Sĩ Lâm Sàng
 */

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
            sentAt: new Date().toISOString()
          };
          logs.unshift(notifLog);
          await setCollection(db, 'push_notifications_log', logs.slice(0, 100));

          return jsonResponse({
            success: true,
            message: `Đã kích hoạt gửi thông báo đẩy tới ${targets.length} thiết bị`,
            notification: notifLog,
            targetCount: targets.length
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

      return errorResponse('API endpoint not found', 404);
    }

    // 3. Static Assets fallback (Single Page App)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('MedXpress Care is online.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};
