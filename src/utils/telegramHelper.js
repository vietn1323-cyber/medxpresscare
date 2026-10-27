/**
 * Telegram Bot Notification Helper for MedXpressCare
 * Gửi thông báo đơn hàng mới tức thì tới Telegram Bot của Quản trị viên
 */

export const sendTelegramOrderNotification = async (order, telegramConfig) => {
  if (!telegramConfig || !telegramConfig.botToken || !telegramConfig.chatId) {
    return { success: false, message: 'Chưa cấu hình Telegram Bot Token hoặc Chat ID' };
  }

  const { botToken, chatId } = telegramConfig;

  // Định dạng danh sách sản phẩm
  const itemsText = (order.items || []).map((item, idx) => {
    const comboNote = item.comboTitle ? ` <i>(${item.comboTitle})</i>` : '';
    return `  ${idx + 1}. <b>${item.name}</b>${comboNote} x${item.quantity} - ${(item.price * item.quantity).toLocaleString('vi-VN')}₫`;
  }).join('\n');

  // Phương thức thanh toán
  const paymentText = order.paymentMethod === 'vietqr' 
    ? '📲 <b>VietQR</b> (Chuyển khoản ngân hàng)' 
    : '💵 <b>COD</b> (Thu tiền tận nơi)';

  // Phương thức vận chuyển
  const shippingMap = {
    'express': '⚡ Giao Hỏa Tốc (Nội thành Hà Nội)',
    'ghtk': '📦 Giao Hàng Nhanh (GHTK)',
    'ghn': '🚚 Giao Hàng Nhanh (GHN)',
    'viettel': '🏣 Giao Hàng Nhanh (Viettel Post)'
  };
  const shippingText = shippingMap[order.shippingMethod] || '🚚 Giao hàng tiêu chuẩn';

  // Điểm thưởng
  let pointsInfo = '';
  if (order.pointsUsed > 0) {
    pointsInfo += `\n🌟 <b>Dùng điểm:</b> -${order.pointsUsed}đ (-${(order.pointsUsed * 1000).toLocaleString('vi-VN')}₫)`;
  }
  if (order.pointsEarned > 0) {
    pointsInfo += `\n🎁 <b>Tích điểm mới:</b> +${order.pointsEarned} điểm`;
  }

  const message = `
🏥 <b>ĐƠN HÀNG MỚI - MEDXPRESS CARE</b> 🏥
━━━━━━━━━━━━━━━━━━━━
📋 <b>Mã đơn:</b> <code>${order.id}</code>
⏰ <b>Thời gian:</b> ${new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}

👤 <b>Khách hàng:</b> <b>${order.customer?.fullName || 'Khách vãng lai'}</b>
📞 <b>Số điện thoại:</b> <a href="tel:${order.customer?.phone}">${order.customer?.phone}</a>
📍 <b>Địa chỉ giao:</b> ${order.customer?.address || ''}, ${order.customer?.district ? order.customer.district + ', ' : ''}${order.customer?.province || ''}
${order.customer?.note ? `📝 <b>Ghi chú của khách:</b> <i>"${order.customer.note}"</i>\n` : ''}
📦 <b>Danh sách sản phẩm:</b>
${itemsText}

💰 <b>Tạm tính:</b> ${(order.subtotal || 0).toLocaleString('vi-VN')}₫
🚚 <b>Phí vận chuyển:</b> ${(order.shippingFee || 0).toLocaleString('vi-VN')}₫ (${shippingText})
${order.discountAmount > 0 ? `🏷️ <b>Khuyến mãi voucher:</b> -${order.discountAmount.toLocaleString('vi-VN')}₫\n` : ''}${pointsInfo}
💵 <b>TỔNG THANH TOÁN:</b> <b>${(order.grandTotal || 0).toLocaleString('vi-VN')}₫</b>
💳 <b>Thanh toán:</b> ${paymentText}
━━━━━━━━━━━━━━━━━━━━
👉 <i>Dược sĩ vui lòng gọi điện xác nhận đơn cho khách trong vòng 15 phút!</i>
`;

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: message.trim(),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Đã gửi thông báo Telegram thành công' };
    } else {
      console.warn('Telegram API Error:', data);
      return { success: false, message: data.description || 'Lỗi gửi tin nhắn Telegram' };
    }
  } catch (err) {
    console.error('Lỗi kết nối Telegram:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Kiểm tra kết nối Telegram Bot thử nghiệm
 */
export const testTelegramConnection = async (botToken, chatId) => {
  if (!botToken || !chatId) {
    return { success: false, message: 'Vui lòng nhập đầy đủ Bot Token và Chat ID' };
  }

  const testMessage = `
🔔 <b>KIỂM TRA KẾT NỐI TELEGRAM BOT MEDXPRESSCARE</b> 🔔
━━━━━━━━━━━━━━━━━━━━
✅ Kết nối giữa website <b>MedXpressCare</b> và Telegram của bạn đã <b>HOÀN TOÀN THÀNH CÔNG!</b>

⏰ <i>Thời gian kiểm tra: ${new Date().toLocaleString('vi-VN')}</i>
📌 Khi khách đặt hàng, đơn mới sẽ tự động thông báo ngay lập tức vào đây!
`;

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testMessage.trim(),
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Kết nối thành công! Đã gửi tin nhắn mẫu đến Telegram của bạn.' };
    } else {
      return { success: false, message: `Lỗi Telegram: ${data.description}` };
    }
  } catch (err) {
    return { success: false, message: `Lỗi kết nối mạng: ${err.message}` };
  }
};
