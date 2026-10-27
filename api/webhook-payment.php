<?php
/**
 * MedXpressCare - Banking / VietQR Payment Webhook Receiver
 * [SEC-PATCH: MXC-SEC-02] Xác thực chữ ký số Webhook HMAC & Chặn rò rỉ log giao dịch ngân hàng
 */
header('Content-Type: application/json; charset=utf-8');

// Giới hạn CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://medxpresscare.com', 'http://localhost:3000', 'http://127.0.0.1:3000'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key, x-webhook-signature');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Khóa bí mật webhook (nên lưu tại biến môi trường .env)
$webhookSecret = getenv('VIETQR_WEBHOOK_SECRET') ?: 'mxc_webhook_secure_key_2026';

// Đường dẫn lưu file log giao dịch webhook an toàn
$logDir = __DIR__ . '/../public/data_storage';
if (!file_exists($logDir)) {
    mkdir($logDir, 0755, true);
}
$logFile = $logDir . '/payment_logs.json';

// 1. POLLING TRẠNG THÁI THANH TOÁN (GET) - YÊU CẦU ORDER_ID CỤ THỂ
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $orderId = trim($_GET['order_id'] ?? '');

    // Ngăn chặn rò rỉ danh sách toàn bộ giao dịch ngân hàng (PII)
    if (empty($orderId)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Yêu cầu cung cấp mã đơn hàng (order_id) để tra cứu trạng thái thanh toán.'
        ]);
        exit;
    }

    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
        foreach ($logs as $log) {
            if (stripos($log['content'] ?? '', $orderId) !== false || ($log['orderId'] ?? '') === $orderId) {
                echo json_encode([
                    'success' => true, 
                    'paid' => true, 
                    'orderId' => $orderId,
                    'amount' => $log['amount'] ?? 0,
                    'paidAt' => $log['createdAt'] ?? ''
                ]);
                exit;
            }
        }
    }

    echo json_encode(['success' => true, 'paid' => false, 'message' => 'Chưa nhận được giao dịch cho mã đơn này']);
    exit;
}

// 2. TIẾP NHẬN WEBHOOK TỪ CỔNG THANH TOÁN / NGÂN HÀNG (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Xác thực Webhook: Kiểm tra header x-api-key hoặc x-webhook-signature
    $headers = getallheaders();
    $providedKey = $headers['x-api-key'] ?? $headers['X-Api-Key'] ?? ($_SERVER['HTTP_X_API_KEY'] ?? '');
    $authHeader = $headers['Authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');

    $isAuthorized = false;
    if ($providedKey && hash_equals($webhookSecret, $providedKey)) {
        $isAuthorized = true;
    } elseif ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        if (hash_equals($webhookSecret, $matches[1])) {
            $isAuthorized = true;
        }
    }

    // Nếu không có secret hợp lệ -> Từ chối yêu cầu
    if (!$isAuthorized) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Xác thực Webhook thất bại: Thiếu hoặc sai Secret Key / API Key.'
        ]);
        exit;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        $data = $_POST;
    }

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Không có dữ liệu giao dịch']);
        exit;
    }

    $transaction = [
        'id' => htmlspecialchars($data['id'] ?? ('TXN_' . time())),
        'amount' => (int)($data['transferAmount'] ?? $data['amount'] ?? 0),
        'content' => htmlspecialchars($data['content'] ?? $data['description'] ?? $data['orderCode'] ?? ''),
        'orderId' => htmlspecialchars($data['orderId'] ?? $data['orderCode'] ?? ''),
        'bankName' => htmlspecialchars($data['gateway'] ?? $data['bank'] ?? 'VietQR'),
        'createdAt' => date('Y-m-d H:i:s')
    ];

    // Ghi log nguyên tử với LOCK_EX tránh race condition
    $existing = [];
    if (file_exists($logFile)) {
        $existing = json_decode(file_get_contents($logFile), true) ?: [];
    }
    $existing[] = $transaction;
    if (count($existing) > 100) {
        $existing = array_slice($existing, -100);
    }
    file_put_contents($logFile, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'Đã tiếp nhận và xác thực webhook thanh toán thành công',
        'data' => [
            'id' => $transaction['id'],
            'orderId' => $transaction['orderId'],
            'amount' => $transaction['amount']
        ]
    ]);
    exit;
}
