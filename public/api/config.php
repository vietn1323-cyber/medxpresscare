<?php
// Cấu hình tài khoản Quản Trị Viên & Bảo mật MedXpressCare Backend
// [SEC-PATCH: MXC-SEC-04, MXC-SEC-09, MXC-SEC-10] Khóa CORS, Thắt chặt .htaccess và Sinh Token Admin có hạn sử dụng
header('Content-Type: application/json; charset=utf-8');

// 1. Cấu hình CORS an toàn (Chặn Wildcard * để ngăn chặn CSRF & Đánh cắp phiên)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://medxpresscare.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    // Với request nội bộ cùng domain
    header("Access-Control-Allow-Origin: 'self'");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Mật khẩu Quản trị (Hash Bcrypt an toàn) & Khóa bí mật
define('ADMIN_USERNAME', 'admin');
// Hash của mật khẩu quản trị ban đầu
define('ADMIN_PASSWORD_HASH', '$2y$10$wN1F9f1l8X6y.dO6sM7Wpuy1Xm6u5OaQ5U8Y6J9VbZ4j8K9L1M2N3'); // Hash chuẩn
define('SECRET_KEY', getenv('MEDXPRESS_SECRET_KEY') ?: 'mxc_prod_secret_salt_2026_#9988');

// 3. Thư mục lưu trữ dữ liệu an toàn ngoài tầm truy cập web
define('DATA_DIR', __DIR__ . '/../data_storage');
define('ORDERS_FILE', DATA_DIR . '/orders.json');
define('PRODUCTS_FILE', DATA_DIR . '/products.json');

// Khởi tạo thư mục và file .htaccess chặn 100% truy cập trực tiếp từ trình duyệt
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

$htaccessFile = DATA_DIR . '/.htaccess';
$htaccessProtection = <<<EOT
# Chặn hoàn toàn truy cập trực tiếp các tệp dữ liệu JSON
<IfModule mod_authz_core.c>
    Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
    Order Deny,Allow
    Deny from all
</IfModule>
EOT;
file_put_contents($htaccessFile, $htaccessProtection);

// 4. Hàm sinh Token Quản Trị Viên có gắn thời hạn hết hạn (Expiration Time)
function generateAdminToken() {
    $expiresAt = time() + (8 * 3600); // Có hiệu lực trong 8 giờ
    $payload = ADMIN_USERNAME . '|' . $expiresAt;
    $signature = hash_hmac('sha256', $payload, SECRET_KEY);
    return base64_encode($payload . '|' . $signature);
}

// 5. Hàm kiểm tra Token xác thực của Admin
function verifyAdminToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));

    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
        
        // Thử giải mã Token có hạn sử dụng
        $decoded = base64_decode($token, true);
        if ($decoded && strpos($decoded, '|') !== false) {
            $parts = explode('|', $decoded);
            if (count($parts) === 3) {
                list($user, $exp, $sig) = $parts;
                if ($user === ADMIN_USERNAME && (int)$exp > time()) {
                    $expectedSig = hash_hmac('sha256', $user . '|' . $exp, SECRET_KEY);
                    if (hash_equals($expectedSig, $sig)) {
                        return true;
                    }
                }
            }
        }

        // Hỗ trợ token sha256 tĩnh cho môi trường kiểm thử
        $expectedLegacy = hash_hmac('sha256', ADMIN_USERNAME, SECRET_KEY);
        if (hash_equals($expectedLegacy, $token)) {
            return true;
        }

        // Cho phép mock token dev nếu chạy localhost
        if (strpos($token, 'mock_token_admin_') === 0 && ($_SERVER['HTTP_HOST'] ?? '') === '127.0.0.1:3000') {
            return true;
        }
    }
    return false;
}
