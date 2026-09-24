/* ==========================================================================
   3A TECHNOLOGY & SOLUTIONS - SHARED DATA
   Dùng chung cho index.html (script.js) và admin.html (admin.js)
   ========================================================================== */

// --- PRODUCT DATABASE (API Mock) ---
const productsData = [
    {
        id: '3A-CAM-01',
        name: 'Camera IP Hikvision 4K UltraHD AI',
        category: 'camera',
        brand: 'Hikvision',
        priceB2C: 2450000,
        priceB2B: 1950000,
        resolution: '8MP',
        specs: ['PoE', 'Gigabit'],
        image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&auto=format&fit=crop&q=80',
        badge: 'BÁN CHẠY',
        datasheet: 'Hikvision DS-2CD2183G0-I: 8MP, Hồng ngoại 30m, Chuẩn IP67 chống nước, Nguồn PoE 802.3af.'
    },
    {
        id: '3A-CAM-02',
        name: 'Camera IP Dahua Full-Color 4MP',
        category: 'camera',
        brand: 'Dahua',
        priceB2C: 1350000,
        priceB2B: 1050000,
        resolution: '4MP',
        specs: ['PoE'],
        image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80',
        badge: 'CÓ MÀU ĐÊM',
        datasheet: 'Dahua IPC-HFW2431T-AS-S2: 4MP, Đèn LED trợ sáng 40m, Tích hợp Micro thu âm.'
    },
    {
        id: '3A-NET-01',
        name: 'Bộ Phát Wi-Fi 6 Ruijie Reyee RG-RAP2260(G)',
        category: 'network',
        brand: 'Ruijie',
        priceB2C: 3200000,
        priceB2B: 2650000,
        resolution: 'N/A',
        specs: ['WiFi6', 'Gigabit', 'PoE'],
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=80',
        badge: 'WI-FI 6 DỰ ÁN',
        datasheet: 'Ruijie RG-RAP2260(G): Băng thông 1775Mbps, Chịu tải 100 Users, Roaming mượt mà.'
    },
    {
        id: '3A-NET-02',
        name: 'Switch PoE Omada TP-Link 16 Cổng Gigabit',
        category: 'network',
        brand: 'TP-Link',
        priceB2C: 4100000,
        priceB2B: 3400000,
        resolution: 'N/A',
        specs: ['PoE', 'Gigabit'],
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=80',
        badge: 'QUẢN LÝ CLOUD',
        datasheet: 'TP-Link TL-SG1016PE: 16 Cổng PoE+ tổng công suất 150W, Chuẩn rack 19-inch.'
    },
    {
        id: '3A-SMT-01',
        name: 'Khóa Vân Tay Thông Minh 3A FaceID Pro',
        category: 'smarthome',
        brand: '3A-Smart',
        priceB2C: 5800000,
        priceB2B: 4500000,
        resolution: 'N/A',
        specs: ['WiFi6'],
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&auto=format&fit=crop&q=80',
        badge: 'NHẬN DIỆN KHUÔN MẶT',
        datasheet: '3A Lock Pro: Mở bằng FaceID 3D, Vân tay FPO, Thẻ từ, Mã số & App Điện thoại.'
    },
    {
        id: '3A-PBX-01',
        name: 'Tổng Đài IP Yeastar S20 Cho 20 Máy Nhánh',
        category: 'pbx',
        brand: '3A-Smart',
        priceB2C: 6900000,
        priceB2B: 5800000,
        resolution: 'N/A',
        specs: ['Gigabit'],
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
        badge: 'TỔNG ĐÀI B2B',
        datasheet: 'Yeastar S20: Hỗ trợ 20 Users, 10 Cuộc gọi đồng thời, Ghi âm cuộc gọi, IVR lời chào.'
    }
];

// --- WARRANTY DATABASE (Mock) ---
const mockWarrantyDb = {
    '3A-889911': {
        serial: '3A-889911',
        productName: 'Camera IP Hikvision 4K UltraHD AI',
        customer: 'Công ty TNHH Phần Mềm Á Châu',
        purchaseDate: '15/01/2025',
        expiryDate: '15/01/2028',
        status: 'HOẠT ĐỘNG BÌNH THƯỜNG',
        history: [
            { date: '15/01/2025', note: 'Kích hoạt bảo hành điện tử chính hãng 3A' }
        ]
    },
    '3A-CAM-99': {
        serial: '3A-CAM-99',
        productName: 'Camera IP Dahua Full-Color 4MP',
        customer: 'Anh Nguyễn Văn Hùng (Khách B2C)',
        purchaseDate: '10/06/2025',
        expiryDate: '10/06/2027',
        status: 'ĐANG XỬ LÝ SỬA CHỮA',
        history: [
            { date: '10/06/2025', note: 'Kích hoạt bảo hành' },
            { date: '02/03/2026', note: 'Tiếp nhận thiết bị lỗi nguồn từ khách hàng' },
            { date: '03/03/2026', note: 'Kỹ thuật viên 3A đã thay thế IC nguồn chính hãng, đang chạy test stress 24h' }
        ]
    }
};

// --- CART STORAGE (giữ giỏ báo giá khi chuyển giữa các trang) ---
const CART_STORAGE_KEY = '3a_cart';

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* bỏ qua nếu trình duyệt chặn storage */ }
}
