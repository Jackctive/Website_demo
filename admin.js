/* ==========================================================================
   3A TECHNOLOGY & SOLUTIONS - TRANG QUẢN TRỊ & REST API
   (Yêu cầu nạp data.js trước file này)
   ========================================================================== */

// --- ADMIN REST API TESTER ENGINE ---
function executeApiCall() {
    const method = document.getElementById('api-method').value;
    const endpoint = document.getElementById('api-endpoint').value;
    const jsonOutput = document.getElementById('api-json-output');

    let responsePayload = {};

    if (endpoint.includes('/products')) {
        if (endpoint.includes('3A-CAM-01')) {
            responsePayload = {
                status: 200,
                success: true,
                data: productsData[0]
            };
        } else {
            responsePayload = {
                status: 200,
                success: true,
                total_items: productsData.length,
                data: productsData
            };
        }
    } else if (endpoint.includes('/warranty')) {
        responsePayload = {
            status: 200,
            success: true,
            query: '3A-889911',
            warranty: mockWarrantyDb['3A-889911']
        };
    } else if (endpoint.includes('/quotes')) {
        responsePayload = {
            status: 201,
            success: true,
            message: 'B2B Quotation PDF Payload generated successfully',
            quote_id: 'QUOTE-3A-' + Math.floor(100000 + Math.random() * 900000),
            created_at: new Date().toISOString(),
            items: loadCart()
        };
    }

    jsonOutput.innerHTML = `<code>${JSON.stringify(responsePayload, null, 4)}</code>`;
    document.getElementById('api-status').innerText = '200 OK';
    document.getElementById('api-time').innerText = Math.floor(Math.random() * 20 + 10) + ' ms';
}
