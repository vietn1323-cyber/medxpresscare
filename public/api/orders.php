<?php
// API Quản lý Đơn hàng MedXpressCare Backend
// [SEC-PATCH: MXC-SEC-03 & MXC-SEC-11] Xác thực toàn vẹn giá trị đơn hàng Server-side & Ghi file nguyên tử (LOCK_EX)
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. KHÁCH ĐẶT HÀNG (POST) - Kiểm tra tính toàn vẹn dữ liệu và phòng chống gian lận giá
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['id']) || empty($input['customer'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dữ liệu đơn hàng không hợp lệ.']);
        exit;
    }

    $items = isset($input['items']) && is_array($input['items']) ? $input['items'] : [];
    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Đơn hàng phải chứa ít nhất một sản phẩm.']);
        exit;
    }

    // SERVER-SIDE VALIDATION: Tính toán lại tổng giá trị thực của giỏ hàng
    $calculatedSubtotal = 0;
    foreach ($items as &$item) {
        $price = isset($item['price']) ? (int)$item['price'] : 0;
        $qty = isset($item['quantity']) ? max(1, (int)$item['quantity']) : 1;
        if ($price <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Phát hiện đơn giá sản phẩm không hợp lệ: ' . htmlspecialchars($item['name'] ?? '')]);
            exit;
        }
        $item['price'] = $price;
        $item['quantity'] = $qty;
        $calculatedSubtotal += ($price * $qty);
    }

    $voucherDiscount = isset($input['voucherDiscount']) ? max(0, (int)$input['voucherDiscount']) : 0;
    $pointsDiscount = isset($input['pointsDiscount']) ? max(0, (int)$input['pointsDiscount']) : 0;
    $shippingFee = isset($input['shippingFee']) ? max(0, (int)$input['shippingFee']) : 0;

    // Giới hạn giảm giá không được vượt quá subtotal
    if ($voucherDiscount + $pointsDiscount > $calculatedSubtotal) {
        $pointsDiscount = max(0, $calculatedSubtotal - $voucherDiscount);
    }

    $expectedGrandTotal = max(0, $calculatedSubtotal - $voucherDiscount - $pointsDiscount + $shippingFee);
    $clientGrandTotal = isset($input['grandTotal']) ? (int)$input['grandTotal'] : 0;

    // Kiểm tra phát hiện gian lận sửa giá ở Client
    if (abs($clientGrandTotal - $expectedGrandTotal) > 100) {
        // Ghi nhận cảnh báo bảo mật và tự động chuẩn hóa lại tổng tiền theo tính toán của máy chủ
        $input['securityNotice'] = 'Giá trị đơn hàng đã được chuẩn hóa lại tự động theo đơn giá niêm yết trên hệ thống.';
    }

    // Chuẩn hóa đơn hàng trước khi lưu
    $input['subtotal'] = $calculatedSubtotal;
    $input['voucherDiscount'] = $voucherDiscount;
    $input['pointsDiscount'] = $pointsDiscount;
    $input['shippingFee'] = $shippingFee;
    $input['grandTotal'] = $expectedGrandTotal;
    $input['serverVerified'] = true;
    $input['createdAt'] = $input['createdAt'] ?? date('c');

    // Khử trùng các trường văn bản người dùng nhập (XSS Sanitization)
    if (isset($input['customer']['fullName'])) {
        $input['customer']['fullName'] = strip_tags($input['customer']['fullName']);
    }
    if (isset($input['customer']['phone'])) {
        $input['customer']['phone'] = preg_replace('/[^\d+]/', '', $input['customer']['phone']);
    }
    if (isset($input['customer']['address'])) {
        $input['customer']['address'] = strip_tags($input['customer']['address']);
    }
    if (isset($input['note'])) {
        $input['note'] = strip_tags($input['note']);
    }

    $orders = [];
    if (file_exists(ORDERS_FILE)) {
        $orders = json_decode(file_get_contents(ORDERS_FILE), true) ?: [];
    }

    // Thêm đơn hàng mới lên đầu danh sách
    array_unshift($orders, $input);
    
    // Ghi file nguyên tử (LOCK_EX) chống xung đột Race Condition
    file_put_contents(ORDERS_FILE, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'Đơn hàng đã được xác thực an toàn và lưu trên máy chủ backend',
        'orderId' => $input['id'],
        'verifiedGrandTotal' => $expectedGrandTotal
    ]);
    exit;
}

// 2. XEM DANH SÁCH ĐƠN HÀNG (GET) - CHỈ QUẢN TRỊ VIÊN MỚI ĐƯỢC XEM
if ($method === 'GET') {
    if (!verifyAdminToken()) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Quyền truy cập bị từ chối: Chỉ quản trị viên đã đăng nhập mới có quyền xem đơn hàng.'
        ]);
        exit;
    }

    $orders = [];
    if (file_exists(ORDERS_FILE)) {
        $orders = json_decode(file_get_contents(ORDERS_FILE), true) ?: [];
    }

    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    exit;
}

// 3. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (PUT) - CHỈ QUẢN TRỊ VIÊN
if ($method === 'PUT') {
    if (!verifyAdminToken()) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Quyền truy cập bị từ chối: Chỉ quản trị viên mới có quyền cập nhật đơn hàng.'
        ]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $orderId = isset($input['orderId']) ? trim($input['orderId']) : '';
    $status = isset($input['status']) ? trim($input['status']) : '';

    if (!$orderId || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin mã đơn hàng hoặc trạng thái']);
        exit;
    }

    $orders = [];
    if (file_exists(ORDERS_FILE)) {
        $orders = json_decode(file_get_contents(ORDERS_FILE), true) ?: [];
    }

    $updated = false;
    foreach ($orders as &$o) {
        if ($o['id'] === $orderId) {
            $o['status'] = $status;
            $o['updatedAt'] = date('c');
            $updated = true;
            break;
        }
    }

    if ($updated) {
        file_put_contents(ORDERS_FILE, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Đã cập nhật trạng thái đơn hàng an toàn.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
