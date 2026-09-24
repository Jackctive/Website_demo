/* ==========================================================================
   3A TECHNOLOGY & SOLUTIONS - INTERACTIVE APPLICATION SCRIPT
   (Yêu cầu nạp data.js trước file này)
   ========================================================================== */

// --- GLOBAL APPLICATION STATE ---
const appState = {
    customerMode: 'b2c', // 'b2c' or 'b2b'
    cart: loadCart(),
    estimator: {
        area: 120,
        camCount: 4,
        wifiCount: 2,
        lockCount: 1,
        package: 'standard'
    },
    filter: {
        category: 'all',
        resolutions: [],
        specs: [],
        brand: 'all',
        maxPrice: 20000000,
        sort: 'default'
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedProducts();
    renderProductsGrid();
    calculateEstimate();
    updateCartCount();

    const hashPage = window.location.hash.replace('#', '');
    if (hashPage && document.getElementById(hashPage)) navigateTo(hashPage);
});

// --- NAVIGATION & PAGE SWITCHING ---
function navigateTo(pageId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const activeNavItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

// --- CUSTOMER MODE TOGGLE (B2C / B2B) ---
function switchCustomerMode(mode) {
    appState.customerMode = mode;
    
    document.getElementById('mode-b2c-btn').classList.toggle('active', mode === 'b2c');
    document.getElementById('mode-b2b-btn').classList.toggle('active', mode === 'b2b');

    const indicator = document.getElementById('current-mode-indicator');
    if (mode === 'b2b') {
        indicator.innerHTML = '<i class="fa-solid fa-building"></i> Đang chọn: B2B Doanh Nghiệp (Giá Chiết Khấu)';
        indicator.style.background = '#ff6600';
    } else {
        indicator.innerHTML = '<i class="fa-solid fa-user"></i> Đang chọn: B2C Khách Lẻ';
        indicator.style.background = 'rgba(255,255,255,0.15)';
    }

    renderFeaturedProducts();
    renderProductsGrid();
    renderCartTable();
}

// --- CURRENCY FORMATTER ---
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
}

// --- RENDER PRODUCTS ---
function renderProductCard(p) {
    const price = appState.customerMode === 'b2b' ? p.priceB2B : p.priceB2C;
    const oppositePrice = appState.customerMode === 'b2b' ? p.priceB2C : p.priceB2B;

    return `
        <div class="product-card">
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            <div class="product-img">
                <img src="${p.image}" alt="${p.name}">
            </div>
            <div class="product-details">
                <span class="product-brand">${p.brand}</span>
                <h4 class="product-title">${p.name}</h4>
                <div class="product-specs">
                    <i class="fa-solid fa-microchip"></i> ${p.specs.join(' | ')} ${p.resolution !== 'N/A' ? '| ' + p.resolution : ''}
                </div>
                <div class="product-price-box">
                    <div class="price-main">${formatVND(price)}</div>
                    <span class="price-b2b-tag">
                        ${appState.customerMode === 'b2b' ? `[Giá B2C gốc: ${formatVND(oppositePrice)}]` : `[Giá B2B chiết khấu: ${formatVND(p.priceB2B)}]`}
                    </span>
                </div>
                <div class="product-card-actions">
                    <button class="btn btn-sm btn-outline" style="flex:1" onclick="openDatasheetModal('${p.id}')"><i class="fa-solid fa-file-lines"></i> Datasheet</button>
                    <button class="btn btn-sm btn-primary" onclick="addToCart('${p.id}')"><i class="fa-solid fa-plus"></i> Chọn mua</button>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedProducts() {
    const container = document.getElementById('home-featured-products');
    if (!container) return;
    container.innerHTML = productsData.slice(0, 4).map(p => renderProductCard(p)).join('');
}

function renderProductsGrid() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    let filtered = productsData.filter(p => {
        if (appState.filter.category !== 'all' && p.category !== appState.filter.category) return false;
        if (appState.filter.brand !== 'all' && p.brand !== appState.filter.brand) return false;
        
        const price = appState.customerMode === 'b2b' ? p.priceB2B : p.priceB2C;
        if (price > appState.filter.maxPrice) return false;

        if (appState.filter.resolutions.length > 0 && !appState.filter.resolutions.includes(p.resolution)) return false;
        
        if (appState.filter.specs.length > 0) {
            const hasSpec = appState.filter.specs.some(s => p.specs.includes(s));
            if (!hasSpec) return false;
        }

        return true;
    });

    // Sorting
    if (appState.filter.sort === 'price-asc') {
        filtered.sort((a,b) => (appState.customerMode==='b2b'?a.priceB2B:a.priceB2C) - (appState.customerMode==='b2b'?b.priceB2B:b.priceB2C));
    } else if (appState.filter.sort === 'price-desc') {
        filtered.sort((a,b) => (appState.customerMode==='b2b'?b.priceB2B:b.priceB2C) - (appState.customerMode==='b2b'?a.priceB2B:a.priceB2C));
    }

    document.getElementById('product-count-text').innerText = `Hiển thị ${filtered.length} sản phẩm phù hợp`;
    container.innerHTML = filtered.length > 0 
        ? filtered.map(p => renderProductCard(p)).join('')
        : '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Không tìm thấy thiết bị phù hợp với bộ lọc.</p>';
}

// --- FILTER CONTROLS ---
function updatePriceLabel(val) {
    document.getElementById('price-limit-text').innerText = formatVND(parseInt(val));
}

function applyFilters() {
    appState.filter.category = document.getElementById('filter-category').value;
    appState.filter.brand = document.getElementById('filter-brand').value;
    appState.filter.maxPrice = parseInt(document.getElementById('filter-price').value);
    appState.filter.sort = document.getElementById('sort-select').value;

    appState.filter.resolutions = Array.from(document.querySelectorAll('.filter-res:checked')).map(cb => cb.value);
    appState.filter.specs = Array.from(document.querySelectorAll('.filter-spec:checked')).map(cb => cb.value);

    renderProductsGrid();
}

function resetFilters() {
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-brand').value = 'all';
    document.getElementById('filter-price').value = 20000000;
    document.getElementById('sort-select').value = 'default';
    document.querySelectorAll('.filter-res, .filter-spec').forEach(cb => cb.checked = false);
    updatePriceLabel(20000000);
    applyFilters();
}

function filterCategoryAndNavigate(cat) {
    navigateTo('page-products');
    document.getElementById('filter-category').value = cat;
    applyFilters();
}

// --- SEARCH AUTOCOMPLETE ---
function handleQuickSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('search-results-dropdown');

    if (query.length < 2) {
        dropdown.style.display = 'none';
        return;
    }

    const matches = productsData.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
    if (matches.length > 0) {
        dropdown.innerHTML = matches.map(p => `
            <div class="search-item" onclick="selectSearchItem('${p.id}')">
                <img src="${p.image}" alt="">
                <div>
                    <strong>${p.name}</strong>
                    <div style="font-size:0.8rem; color:var(--primary);">${formatVND(appState.customerMode==='b2b'?p.priceB2B:p.priceB2C)}</div>
                </div>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    } else {
        dropdown.innerHTML = '<div class="search-item">Không có kết quả khớp</div>';
        dropdown.style.display = 'block';
    }
}

function selectSearchItem(id) {
    document.getElementById('search-results-dropdown').style.display = 'none';
    navigateTo('page-products');
    addToCart(id);
}

// --- B2B / B2C ESTIMATOR CALCULATOR ---
function changeCounter(type, delta) {
    if (type === 'cam') appState.estimator.camCount = Math.max(0, appState.estimator.camCount + delta);
    if (type === 'wifi') appState.estimator.wifiCount = Math.max(0, appState.estimator.wifiCount + delta);
    if (type === 'lock') appState.estimator.lockCount = Math.max(0, appState.estimator.lockCount + delta);

    document.getElementById('counter-cam').innerText = appState.estimator.camCount;
    document.getElementById('counter-wifi').innerText = appState.estimator.wifiCount;
    document.getElementById('counter-lock').innerText = appState.estimator.lockCount;

    calculateEstimate();
}

function calculateEstimate() {
    const area = parseInt(document.getElementById('estimator-area').value);
    appState.estimator.area = area;
    document.getElementById('area-val').innerText = area + ' m²';

    const pkg = document.getElementById('estimator-package').value;
    appState.estimator.package = pkg;

    const priceCam = appState.estimator.camCount * 1850000;
    const priceWifi = appState.estimator.wifiCount * 2600000;
    const priceLock = appState.estimator.lockCount * 4500000;
    
    // Wire & Installation Labor estimation based on area
    const laborAndCable = area * 15000 + (appState.estimator.camCount + appState.estimator.wifiCount) * 250000;
    const vipServiceFee = pkg === 'vip' ? 2000000 : 0;

    const total = priceCam + priceWifi + priceLock + laborAndCable + vipServiceFee;

    const breakdownContainer = document.getElementById('estimate-breakdown');
    breakdownContainer.innerHTML = `
        <div class="breakdown-item"><span>Camera An Ninh IP (${appState.estimator.camCount} mắt):</span> <strong>${formatVND(priceCam)}</strong></div>
        <div class="breakdown-item"><span>Wi-Fi Access Point (${appState.estimator.wifiCount} bộ):</span> <strong>${formatVND(priceWifi)}</strong></div>
        <div class="breakdown-item"><span>Khóa cửa Vân Tay (${appState.estimator.lockCount} bộ):</span> <strong>${formatVND(priceLock)}</strong></div>
        <div class="breakdown-item"><span>Dây cáp mạng & Nhân công thi công (${area}m²):</span> <strong>${formatVND(laborAndCable)}</strong></div>
        ${pkg === 'vip' ? `<div class="breakdown-item"><span>Gói Bảo Trì B2B Chuyên Nghiệp Tận Nơi:</span> <strong>${formatVND(vipServiceFee)}</strong></div>` : ''}
    `;

    document.getElementById('estimate-total-price').innerText = formatVND(total);
}

function addEstimateToQuote() {
    const area = appState.estimator.area;
    const customEstimateItem = {
        id: '3A-ESTIMATED-PKG',
        name: `Gói Vật Tư & Thi Công ELV Trọn Gói (${area}m²)`,
        priceB2C: parseInt(document.getElementById('estimate-total-price').innerText.replace(/\D/g,'')),
        priceB2B: parseInt(document.getElementById('estimate-total-price').innerText.replace(/\D/g,'')),
        quantity: 1
    };

    const existing = appState.cart.find(i => i.id === customEstimateItem.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        appState.cart.push(customEstimateItem);
    }

    updateCartCount();
    openQuoteModal();
}

function requestSurveyCall() {
    alert('Cảm ơn bạn! Đội ngũ Kỹ thuật viên 3A sẽ gọi lại trong 15 phút để hẹn lịch khảo sát công trình tận nơi.');
}

// --- WARRANTY LOOKUP SYSTEM ---
// (dữ liệu mockWarrantyDb nằm trong data.js)
function setWarrantySearch(val) {
    document.getElementById('warranty-input').value = val;
    searchWarranty();
}

function searchWarranty() {
    const input = document.getElementById('warranty-input').value.trim();
    const resultBox = document.getElementById('warranty-result-container');

    if (!input) {
        alert('Vui lòng nhập số Seri/IMEI hoặc Số điện thoại!');
        return;
    }

    const data = mockWarrantyDb[input];
    resultBox.style.display = 'block';

    if (data) {
        resultBox.innerHTML = `
            <h3><i class="fa-solid fa-circle-check" style="color:var(--accent);"></i> Thống Kê Bảo Hành Cho: ${data.serial}</h3>
            <div class="grid grid-2" style="margin:15px 0;">
                <div><strong>Thiết bị:</strong> ${data.productName}</div>
                <div><strong>Khách hàng:</strong> ${data.customer}</div>
                <div><strong>Ngày mua:</strong> ${data.purchaseDate}</div>
                <div><strong>Hạn bảo hành:</strong> <span style="color:var(--primary); font-weight:700;">${data.expiryDate}</span></div>
            </div>
            <div style="margin-bottom:15px;">
                <strong>Trạng thái bảo hành:</strong> 
                <span class="badge ${data.status.includes('SỬA') ? '' : 'badge-accent'}">${data.status}</span>
            </div>
            <h4>Nhật ký xử lý kỹ thuật:</h4>
            <div class="timeline">
                ${data.history.map(h => `
                    <div class="timeline-step">
                        <strong>[${h.date}]</strong>:${h.note}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        resultBox.innerHTML = `
            <div style="text-align:center; padding:20px; color:#ef4444;">
                <i class="fa-solid fa-circle-xmark" style="font-size:2rem;"></i>
                <p style="margin-top:10px;">Không tìm thấy dữ liệu bảo hành cho mã <strong>"${input}"</strong>. Vui lòng kiểm tra lại tem bảo hành hoặc gọi Hotline 1900 3A3A.</p>
            </div>
        `;
    }
}

// --- CART & B2B QUOTATION PDF GENERATOR ---
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const existing = appState.cart.find(i => i.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        appState.cart.push({
            id: product.id,
            name: product.name,
            priceB2C: product.priceB2C,
            priceB2B: product.priceB2B,
            quantity: 1
        });
    }

    updateCartCount();
    alert(`Đã thêm "${product.name}" vào giỏ báo giá B2B/B2C!`);
}

function updateCartCount() {
    saveCart(appState.cart);
    const count = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count-badge').innerText = count;
    document.getElementById('quote-count-badge').innerText = count;
}

function openCartModal() {
    renderCartTable();
    document.getElementById('cart-modal').classList.add('active');
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('active');
}

function openQuoteModal() {
    openCartModal();
}

function renderCartTable() {
    const container = document.getElementById('cart-items-container');
    if (appState.cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted);">Giỏ báo giá đang trống.</p>';
        document.getElementById('cart-subtotal').innerText = '0 VNĐ';
        document.getElementById('cart-vat').innerText = '0 VNĐ';
        document.getElementById('cart-grand-total').innerText = '0 VNĐ';
        return;
    }

    let subtotal = 0;
    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên Thiết Bị / Dịch Vụ</th>
                    <th>Đơn Giá (${appState.customerMode.toUpperCase()})</th>
                    <th>Số Lượng</th>
                    <th>Thành Tiền</th>
                    <th class="no-print">Thao tác</th>
                </tr>
            </thead>
            <tbody>
    `;

    appState.cart.forEach((item, idx) => {
        const price = appState.customerMode === 'b2b' ? item.priceB2B : item.priceB2C;
        const lineTotal = price * item.quantity;
        subtotal += lineTotal;

        html += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.name}</strong> (${item.id})</td>
                <td>${formatVND(price)}</td>
                <td>
                    <span class="no-print">
                        <button onclick="updateCartQty('${item.id}', -1)">-</button>
                    </span>
                    <strong>${item.quantity}</strong>
                    <span class="no-print">
                        <button onclick="updateCartQty('${item.id}', 1)">+</button>
                    </span>
                </td>
                <td><strong>${formatVND(lineTotal)}</strong></td>
                <td class="no-print">
                    <button class="btn btn-sm" style="background:#ef4444; color:#fff;" onclick="removeFromCart('${item.id}')">&times;</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    const vat = appState.customerMode === 'b2b' ? subtotal * 0.1 : 0;
    const grandTotal = subtotal + vat;

    document.getElementById('cart-subtotal').innerText = formatVND(subtotal);
    document.getElementById('cart-vat').innerText = formatVND(vat) + (appState.customerMode === 'b2b' ? ' (10% VAT)' : ' (0%)');
    document.getElementById('cart-grand-total').innerText = formatVND(grandTotal);
}

function updateCartQty(id, delta) {
    const item = appState.cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            appState.cart = appState.cart.filter(i => i.id !== id);
        }
    }
    updateCartCount();
    renderCartTable();
}

function removeFromCart(id) {
    appState.cart = appState.cart.filter(i => i.id !== id);
    updateCartCount();
    renderCartTable();
}

function exportB2BPdf() {
    if (appState.cart.length === 0) {
        alert('Vui lòng thêm sản phẩm vào bảng báo giá trước!');
        return;
    }
    window.print();
}

function submitOrder() {
    if (appState.cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }
    alert('Yêu cầu báo giá / Đơn hàng của bạn đã được gửi thành công đến Phòng Kinh Doanh B2B 3A! Chuyên viên sẽ liên hệ lại ngay.');
    appState.cart = [];
    updateCartCount();
    closeCartModal();
}

// --- DATASHEET MODAL ---
function openDatasheetModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const content = document.getElementById('datasheet-content');
    content.innerHTML = `
        <i class="fa-solid fa-file-pdf" style="font-size:3rem; color:#ef4444; margin-bottom:15px;"></i>
        <h3>${product.name}</h3>
        <p style="color:var(--text-muted); margin-bottom:15px;">Mã thiết bị: ${product.id} | Thương hiệu: ${product.brand}</p>
        <div style="background:#f1f5f9; padding:15px; border-radius:6px; text-align:left; font-size:0.9rem;">
            <strong>Thông số kỹ thuật Datasheet:</strong>
            <p style="margin-top:8px;">${product.datasheet}</p>
        </div>
    `;

    document.getElementById('datasheet-modal').classList.add('active');
}

function closeDatasheetModal() {
    document.getElementById('datasheet-modal').classList.remove('active');
}

// --- AI CHATBOT ENGINE ---
function toggleChatbot() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    const msgContainer = document.getElementById('chatbot-messages');

    // Add user message
    msgContainer.innerHTML += `<div class="chat-msg user">${msg}</div>`;
    input.value = '';

    // Scroll to bottom
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Simulate AI thinking and reply
    setTimeout(() => {
        let reply = "Cảm ơn bạn đã nhắn! Bộ phận kỹ thuật 3A sẽ giải đáp chi tiết cho câu hỏi của bạn. Bạn cũng có thể dùng nút 'Dự Toán Chi Phí' trên thanh menu để nhận báo giá tự động.";
        
        const lower = msg.toLowerCase();
        if (lower.includes('camera') || lower.includes('4k')) {
            reply = "3A cung cấp Camera 4K Hikvision & Dahua chính hãng, tích hợp AI công nghệ ColorVu ban đêm có màu sắc nét. Giá ưu đãi B2B chỉ từ 1.050.000 VNĐ!";
        } else if (lower.includes('wifi') || lower.includes('mạng')) {
            reply = "Để lắp mạng cho công ty hoặc quán cafe, 3A khuyên dùng thiết bị Wi-Fi 6 Ruijie Reyee RG-RAP2260(G) chịu tải 100 người dùng đồng thời.";
        } else if (lower.includes('bảo hành')) {
            reply = "Bạn có thể vào trang 'Tra Cứu Bảo Hành' trên Menu và nhập mã Seri (ví dụ: 3A-889911) để xem tiến độ sửa chữa trực tuyến!";
        }

        msgContainer.innerHTML += `<div class="chat-msg bot">${reply}</div>`;
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 600);
}