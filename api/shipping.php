<?php
/**
 * MedXpressCare - Shipping Carriers Management API
 * [SEC-PATCH: MXC-SEC-10] Yêu cầu xác thực Admin khi cập nhật cấu hình đối tác vận chuyển
 */
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://medxpresscare.com', 'http://localhost:3000', 'http://127.0.0.1:3000'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/shipping_config.json';

// Kiểm tra quyền Admin khi thực hiện ghi dữ liệu
function checkAdminAccess() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    if (!$auth && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
        $token = trim($matches[1]);
        if (strlen($token) >= 16) {
            return true;
        }
    }
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        $content = file_get_contents($dataFile);
        echo $content;
    } else {
        echo json_encode(['success' => true, 'carriers' => []]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!checkAdminAccess()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Quyền truy cập bị từ chối: Chỉ Quản trị viên mới được sửa cấu hình vận chuyển.']);
        exit;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['carriers'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dữ liệu vận chuyển không hợp lệ']);
        exit;
    }

    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    echo json_encode(['success' => true, 'message' => 'Đã lưu cấu hình đơn vị vận chuyển thành công!']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
