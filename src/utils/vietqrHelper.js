export const VIETQR_BANKS = [
  { bin: '970407', code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', keywords: ['techcombank', 'tcb', 'ky thuong'] },
  { bin: '970422', code: 'MB', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân đội', keywords: ['mbbank', 'mb', 'quan doi'] },
  { bin: '970436', code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', keywords: ['vietcombank', 'vcb', 'ngoai thuong'] },
  { bin: '970415', code: 'ICB', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công thương Việt Nam', keywords: ['vietinbank', 'ctg', 'icb', 'cong thuong'] },
  { bin: '970418', code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', keywords: ['bidv', 'dau tu va phat trien'] },
  { bin: '970405', code: 'VBA', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn VN', keywords: ['agribank', 'vba', 'nong nghiep'] },
  { bin: '970432', code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', keywords: ['vpbank', 'vpb', 'thinh vuong'] },
  { bin: '970416', code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu', keywords: ['acb', 'a chau'] },
  { bin: '970423', code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong', keywords: ['tpbank', 'tpb', 'tien phong'] },
  { bin: '970403', code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', keywords: ['sacombank', 'stb', 'sai gon thuong tin'] },
  { bin: '970437', code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng TMCP Phát triển TP.HCM', keywords: ['hdbank', 'hdb'] },
  { bin: '970441', code: 'VIB', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam', keywords: ['vib', 'quoc te'] },
  { bin: '970443', code: 'SHB', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', keywords: ['shb'] },
  { bin: '970426', code: 'MSB', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải', keywords: ['msb', 'hang hai'] },
  { bin: '970448', code: 'OCB', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông', keywords: ['ocb', 'phuong dong'] },
  { bin: '970449', code: 'LPB', shortName: 'LPBank', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', keywords: ['lpbank', 'lpb', 'lienvietpostbank', 'loc phat'] },
  { bin: '970440', code: 'SEAB', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á', keywords: ['seabank', 'seab', 'dong nam a'] },
  { bin: '970431', code: 'EIB', shortName: 'Eximbank', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', keywords: ['eximbank', 'eib', 'xuat nhap khau'] },
  { bin: '970428', code: 'NAB', shortName: 'NamABank', name: 'Ngân hàng TMCP Nam Á', keywords: ['namabank', 'nab', 'nam a'] },
  { bin: '970409', code: 'BAB', shortName: 'BacABank', name: 'Ngân hàng TMCP Bắc Á', keywords: ['bacabank', 'bab', 'bac a'] },
  { bin: '970454', code: 'VCCB', shortName: 'BVBank', name: 'Ngân hàng TMCP Bản Việt', keywords: ['bvbank', 'ban viet', 'vccb'] },
  { bin: '970400', code: 'SGICB', shortName: 'SaigonBank', name: 'Ngân hàng TMCP Sài Gòn Công Thương', keywords: ['saigonbank', 'sgicb'] },
  { bin: '970412', code: 'PVCB', shortName: 'PVcomBank', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', keywords: ['pvcombank', 'pvcb'] },
  { bin: '546034', code: 'CAKE', shortName: 'CAKE', name: 'Ngân hàng số CAKE by VPBank', keywords: ['cake'] },
  { bin: '963388', code: 'TIMO', shortName: 'Timo', name: 'Ngân hàng số Timo', keywords: ['timo'] }
];

export function removeVietnameseAccents(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function getBankInfo(bankIdentifier = '') {
  if (!bankIdentifier) {
    return VIETQR_BANKS[0]; // Mặc định Techcombank
  }

  const clean = String(bankIdentifier).trim();
  const cleanLower = clean.toLowerCase();
  const cleanNoAccents = removeVietnameseAccents(clean);

  // 1. Khớp theo BIN chính xác (chuỗi 6 số)
  const byBin = VIETQR_BANKS.find(b => b.bin === clean);
  if (byBin) return byBin;

  // 2. Khớp theo Bank Code (TCB, VCB, MB, CTG...)
  const byCode = VIETQR_BANKS.find(b => b.code.toLowerCase() === cleanLower);
  if (byCode) return byCode;

  // 3. Khớp theo ShortName
  const byShortName = VIETQR_BANKS.find(b => b.shortName.toLowerCase() === cleanLower);
  if (byShortName) return byShortName;

  // 4. Fuzzy match qua tên hoặc từ khóa không dấu
  const byKeyword = VIETQR_BANKS.find(b => {
    return b.keywords.some(k => cleanNoAccents.includes(k) || k.includes(cleanNoAccents)) ||
           removeVietnameseAccents(b.name).includes(cleanNoAccents) ||
           removeVietnameseAccents(b.shortName).includes(cleanNoAccents);
  });
  if (byKeyword) return byKeyword;

  // Nếu là số BIN 6 chữ số hợp lệ chưa có trong danh sách
  if (/^\d{6}$/.test(clean)) {
    return { bin: clean, code: 'BANK', shortName: clean, name: `Ngân hàng (${clean})`, keywords: [] };
  }

  return VIETQR_BANKS[0];
}

export function crc16Ccitt(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  let hex = crc.toString(16).toUpperCase();
  while (hex.length < 4) hex = '0' + hex;
  return hex;
}

function tlv(tag, value) {
  const strVal = String(value || '');
  const len = ('0' + strVal.length).slice(-2);
  return tag + len + strVal;
}

/**
 * Tạo chuỗi chuẩn EMVCo NAPAS 247 theo tiêu chuẩn Ngân Hàng Nhà Nước Việt Nam
 */
export function generateVietQREMVCo({ bin, accountNo, amount = 0, description = '' }) {
  const cleanAccountNo = String(accountNo || '').replace(/[^0-9a-zA-Z]/g, '');
  const cleanBin = String(bin || '970407').replace(/[^0-9]/g, '');
  const cleanDesc = String(description || '').trim();
  const numAmount = Math.max(0, Math.round(Number(amount) || 0));

  // Tag 38: Merchant Account Information cho NAPAS
  // Sub-tag 00: GUID NAPAS = A000000727
  const guid = tlv('00', 'A000000727');
  // Sub-tag 01: Acquirer ID (BIN 6 số) + Customer Account ID
  const acquirer = tlv('00', cleanBin);
  const account = tlv('01', cleanAccountNo);
  const beneficiary = tlv('01', acquirer + account);
  // Sub-tag 02: Service Code (QRIBFTTA: Chuyển tiền nhanh 247 tới tài khoản)
  const service = tlv('02', 'QRIBFTTA');
  const tag38Value = guid + beneficiary + service;
  const tag38 = tlv('38', tag38Value);

  // Tag 53: Transaction Currency (704 = VND)
  const tag53 = tlv('53', '704');
  // Tag 54: Transaction Amount (bắt buộc > 0 cho Dynamic QR)
  const tag54 = numAmount > 0 ? tlv('54', String(numAmount)) : '';
  // Tag 58: Country Code (VN)
  const tag58 = tlv('58', 'VN');
  // Tag 62: Additional Data Field (08: Nội dung chuyển khoản / Mã đơn)
  const tag62Value = cleanDesc ? tlv('08', cleanDesc) : '';
  const tag62 = tag62Value ? tlv('62', tag62Value) : '';

  // Tag 00: Payload Format Indicator (01)
  const tag00 = tlv('00', '01');
  // Tag 01: Point of Initiation (12: Dynamic QR có số tiền, 11: Static QR)
  const tag01 = tlv('01', numAmount > 0 ? '12' : '11');

  const raw = tag00 + tag01 + tag38 + tag53 + tag54 + tag58 + tag62 + '6304';
  const checksum = crc16Ccitt(raw);
  return raw + checksum;
}

/**
 * Trả về link ảnh VietQR chính thức từ VietQR.io (hỗ trợ hiển thị logo ngân hàng + logo VietQR)
 */
export function getVietQRImageUrl({ bankNameOrBin, accountNo, accountName = '', amount = 0, description = '', template = 'compact2' }) {
  const bank = getBankInfo(bankNameOrBin);
  const cleanAccountNo = String(accountNo || '').replace(/[^0-9a-zA-Z]/g, '');
  const numAmount = Math.max(0, Math.round(Number(amount) || 0));
  const cleanDesc = String(description || '').trim();
  const cleanName = String(accountName || '').trim();

  const params = new URLSearchParams();
  if (numAmount > 0) params.append('amount', String(numAmount));
  if (cleanDesc) params.append('addInfo', cleanDesc);
  if (cleanName) params.append('accountName', cleanName);

  const query = params.toString() ? `?${params.toString()}` : '';
  return `https://img.vietqr.io/image/${bank.bin}-${cleanAccountNo}-${template}.png${query}`;
}

/**
 * Link ảnh QR dự phòng (Fallback) khi không có mạng ngoài hoặc VietQR.io bảo trì
 * Dùng engine QR Server vẽ trực tiếp chuỗi chuẩn NAPAS EMVCo
 */
export function getVietQRFallbackUrl({ bankNameOrBin, accountNo, amount = 0, description = '' }) {
  const bank = getBankInfo(bankNameOrBin);
  const payload = generateVietQREMVCo({
    bin: bank.bin,
    accountNo,
    amount,
    description
  });
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`;
}
