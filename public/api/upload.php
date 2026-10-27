<?php
// API Tải ảnh sản phẩm an toàn chuẩn y tế MedXpressCare
// [SEC-PATCH: MXC-SEC-01] Ngăn chặn hoàn toàn lỗ hổng Unrestricted File Upload & RCE
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!verifyAdminToken()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Quyền truy cập bị từ chối: Chỉ quản trị viên mới được tải ảnh lên máy chủ.']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Chưa chọn file ảnh hoặc file bị lỗi khi tải lên.']);
    exit;
}

$file = $_FILES['image'];

// 1. Giới hạn dung lượng tối đa 5MB
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dung lượng ảnh vượt quá giới hạn 5MB.']);
    exit;
}

// 2. Whitelist phần mở rộng tệp nghiêm ngặt
$rawExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
if (!in_array($rawExt, $allowedExtensions, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Định dạng tệp không được phép. Chỉ chấp nhận tệp ảnh: JPG, PNG, WEBP.']);
    exit;
}

// 3. Kiểm tra Magic Bytes / MIME Type thực tế từ nội dung tệp (không tin tưởng HTTP Header client)
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$mimeMap = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!array_key_exists($mimeType, $mimeMap)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nội dung tệp không phải là hình ảnh hợp lệ (Phát hiện MIME: ' . htmlspecialchars($mimeType) . ').']);
    exit;
}

// 4. Kiểm tra cấu trúc ảnh hợp lệ qua getimagesize()
$imageInfo = @getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Tệp ảnh bị hỏng hoặc chứa mã không hợp lệ.']);
    exit;
}

// 5. Chuẩn bị thư mục tải lên an toàn
$uploadDir = __DIR__ . '/../uploads';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Tạo file .htaccess bảo vệ thư mục uploads chống thực thi mã nguồn
$uploadHtaccess = $uploadDir . '/.htaccess';
if (!file_exists($uploadHtaccess)) {
    $htaccessContent = <<<EOT
# Vô hiệu hóa hoàn toàn trình thông dịch PHP và thực thi script
<IfModule mod_php.c>
    php_flag engine off
</IfModule>
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>
<IfModule mod_php8.c>
    php_flag engine off
</IfModule>

# Cấm truy cập trực tiếp các tệp có đuôi script
<FilesMatch "\.(php|phtml|php3|php4|php5|php7|php8|phar|pl|py|cgi|sh|bash|exe|html|htm|js)$">
    Require all denied
    Deny from all
</FilesMatch>

# Chỉ cho phép đọc tệp hình ảnh
<FilesMatch "\.(jpg|jpeg|png|webp|gif|svg)$">
    Require all granted
    Allow from all
</FilesMatch>
EOT;
    file_put_contents($uploadHtaccess, $htaccessContent);
}

// 6. Đặt tên tệp ngẫu nhiên sử dụng đuôi chuẩn hóa từ MIME Type (không dùng tên gốc từ client)
$safeExtension = $mimeMap[$mimeType];
$filename = 'product_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $safeExtension;
$destination = $uploadDir . '/' . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    $imageUrl = '/uploads/' . $filename;

    echo json_encode([
        'success' => true,
        'message' => 'Tải ảnh lên máy chủ an toàn thành công',
        'url' => $imageUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Không thể lưu file trên máy chủ hosting.']);
}
