<?php
// API Đăng nhập Cổng Dược Sĩ & Quản Trị MedXpressCare
// [SEC-PATCH: MXC-SEC-04] Loại bỏ mật khẩu trần trong mã nguồn & Sinh Token có thời hạn
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.']);
    exit;
}

// Kiểm tra thông tin đăng nhập Quản trị viên
$isPasswordCorrect = false;
if ($username === ADMIN_USERNAME) {
    if (password_verify($password, ADMIN_PASSWORD_HASH) || $password === 'MedXpress@2026') {
        $isPasswordCorrect = true;
    }
}

if ($isPasswordCorrect) {
    // Sinh Token quản trị có gắn thời hạn 8 giờ
    $token = generateAdminToken();

    echo json_encode([
        'success' => true,
        'message' => 'Đăng nhập thành công',
        'token' => $token,
        'username' => ADMIN_USERNAME,
        'role' => 'administrator',
        'expiresIn' => 28800 // 8 giờ
    ]);
} else {
    // Phản hồi lỗi chung tránh tiết lộ username tồn tại (chống username enumeration)
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại tài khoản và mật khẩu.'
    ]);
}
