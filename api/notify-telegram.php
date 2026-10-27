<?php
/**
 * MedXpressCare - Telegram Order Notification Endpoint
 * [SEC-PATCH: MXC-SEC-10] Ngăn chặn SSRF & Open Relay bằng việc kiểm duyệt chặt chẽ định dạng Bot Token và Chat ID
 */
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://medxpresscare.com', 'http://localhost:3000', 'http://127.0.0.1:3000'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
    exit;
}

$botToken = trim($data['botToken'] ?? '');
$chatId = trim($data['chatId'] ?? '');
$message = $data['message'] ?? '';

// Kiểm tra định dạng an toàn của Telegram Bot Token: ví dụ "123456789:ABCDefgh-1234..."
if (!preg_match('/^[0-9]{8,12}:[a-zA-Z0-9_-]{30,50}$/', $botToken)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Định dạng Telegram Bot Token không hợp lệ.']);
    exit;
}

// Kiểm tra chatId chỉ chứa số hoặc ký tự dấu âm (group/channel ID)
if (!preg_match('/^-?[0-9]{5,20}$/', $chatId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Định dạng Chat ID không hợp lệ.']);
    exit;
}

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nội dung tin nhắn không được để trống']);
    exit;
}

// Giới hạn độ dài tin nhắn
if (mb_strlen($message) > 4000) {
    $message = mb_substr($message, 0, 4000) . '... [Đã cắt ngắn]';
}

$url = "https://api.telegram.org/bot{$botToken}/sendMessage";
$payload = json_encode([
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi kết nối Telegram API: ' . htmlspecialchars($curlErr)]);
    exit;
}

$response = json_decode($result, true);
if ($httpCode === 200 && ($response['ok'] ?? false)) {
    echo json_encode(['success' => true, 'message' => 'Đã gửi thông báo Telegram thành công!']);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $response['description'] ?? 'Lỗi gửi tin nhắn Telegram']);
}
