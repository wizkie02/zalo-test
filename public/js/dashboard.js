let currentOwnId = '';
let currentDisplayName = '';

// Load danh sách tài khoản
async function loadAccounts() {
    try {
        const response = await fetch('/accounts');
        const text = await response.text();
        document.getElementById('accountsList').innerHTML = text;
        
        // Trích xuất ownId từ bảng HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const firstRow = doc.querySelector('tbody tr');
        if (firstRow) {
            currentOwnId = firstRow.cells[0].textContent.trim();
            currentDisplayName = firstRow.cells[1].textContent.trim();
            updateCurrentAccount(firstRow);
            updateWelcomeMessage();
        } else {
            showError('currentAccount', 'Chưa có tài khoản nào đăng nhập');
        }
    } catch (error) {
        showError('accountsList', error);
    }
}

// Cập nhật welcome message
function updateWelcomeMessage() {
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (currentDisplayName) {
        welcomeMsg.textContent = `Xin chào ${currentDisplayName}`;
    } else {
        welcomeMsg.textContent = 'Xin chào';
    }
}

// Xử lý logout
async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ownId: currentOwnId })
        });

        if (response.ok) {
            window.location.href = '/zalo-login';
        } else {
            const error = await response.json();
            alert('Lỗi đăng xuất: ' + (error.message || 'Không thể đăng xuất'));
        }
    } catch (error) {
        alert('Lỗi đăng xuất: ' + error.message);
    }
}

// Cập nhật request body template khi chọn API endpoint
function updateRequestBody() {
    const endpoint = document.getElementById('apiEndpoint').value;
    if (!endpoint) {
        document.getElementById('apiBody').value = '';
        return;
    }

    const templateId = 'template-' + endpoint.substring(1); // Remove leading slash
    const template = document.getElementById(templateId);
    
    if (template) {
        let templateContent = template.textContent;
        // Tự động điền ownId nếu có
        if (currentOwnId) {
            templateContent = templateContent.replace('your_account_id', currentOwnId);
        }
        document.getElementById('apiBody').value = templateContent;
    } else {
        document.getElementById('apiBody').value = '{\n    "ownId": "' + currentOwnId + '"\n}';
    }
}

// Cập nhật thông tin tài khoản đang sử dụng
function updateCurrentAccount(accountRow) {
    const accountInfo = {
        ownId: accountRow.cells[0].textContent.trim(),
        phoneNumber: accountRow.cells[1].textContent.trim(),
        proxy: accountRow.cells[2].textContent.trim()
    };
    
    document.getElementById('currentAccount').innerHTML = `
        <div class="alert alert-info mb-0">
            <strong>ID:</strong> ${accountInfo.ownId}<br>
            <strong>Số điện thoại:</strong> ${accountInfo.phoneNumber}<br>
            <strong>Proxy:</strong> ${accountInfo.proxy || 'Không sử dụng'}
        </div>
    `;
}

// Tìm người dùng qua số điện thoại
async function findUser() {
    const phone = document.getElementById('phoneNumber').value;
    if (!phone || !currentOwnId) {
        showError('findUserResult', 'Vui lòng nhập số điện thoại và đảm bảo đã đăng nhập');
        return;
    }

    try {
        const response = await fetch('/findUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone,
                ownId: currentOwnId 
            })
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('findUserResult').innerHTML = `
                <div class="alert alert-success">
                    <strong>Tìm thấy người dùng:</strong><br>
                    Tên: ${result.data.display_name}<br>
                    ID: ${result.data.uid}<br>
                    ${result.data.avatar ? `<img src="${result.data.avatar}" width="50" class="mt-2">` : ''}
                </div>
            `;
            // Tự động điền ID vào form gửi tin nhắn
            document.getElementById('messageThreadId').value = result.data.uid;
            document.getElementById('imageThreadId').value = result.data.uid;
        } else {
            showError('findUserResult', result.error || 'Không tìm thấy người dùng');
        }
    } catch (error) {
        showError('findUserResult', error);
    }
}

// Gửi tin nhắn văn bản
async function sendMessage() {
    const threadId = document.getElementById('messageThreadId').value;
    const message = document.getElementById('messageContent').value;
    
    if (!threadId || !message || !currentOwnId) {
        showError('sendMessageResult', 'Vui lòng nhập đầy đủ thông tin và đảm bảo đã đăng nhập');
        return;
    }

    try {
        const response = await fetch('/sendmessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                threadId,
                type: 'User',
                ownId: currentOwnId
            })
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('sendMessageResult').innerHTML = 
                '<div class="alert alert-success">Gửi tin nhắn thành công!</div>';
            document.getElementById('messageContent').value = '';
        } else {
            showError('sendMessageResult', result.error || 'Không thể gửi tin nhắn');
        }
    } catch (error) {
        showError('sendMessageResult', error);
    }
}

// Gửi ảnh
async function sendImage() {
    const threadId = document.getElementById('imageThreadId').value;
    const imagePath = document.getElementById('imagePath').value;
    
    if (!threadId || !imagePath || !currentOwnId) {
        showError('sendImageResult', 'Vui lòng nhập đầy đủ thông tin và đảm bảo đã đăng nhập');
        return;
    }

    try {
        const response = await fetch('/sendImageToUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                threadId,
                imagePath,
                ownId: currentOwnId
            })
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('sendImageResult').innerHTML = 
                '<div class="alert alert-success">Gửi ảnh thành công!</div>';
            document.getElementById('imagePath').value = '';
        } else {
            showError('sendImageResult', result.error || 'Không thể gửi ảnh');
        }
    } catch (error) {
        showError('sendImageResult', error);
    }
}

// Test API tùy chỉnh
async function testAPI() {
    const method = document.getElementById('apiMethod').value;
    const endpoint = document.getElementById('apiEndpoint').value;
    const bodyText = document.getElementById('apiBody').value;

    if (!endpoint) {
        showError('apiTestResult', 'Vui lòng nhập endpoint');
        return;
    }

    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (bodyText) {
            options.body = bodyText;
        }

        const response = await fetch(endpoint, options);
        const result = await response.text();
        
        try {
            // Thử parse JSON
            const jsonResult = JSON.parse(result);
            document.querySelector('#apiTestResult pre').textContent = 
                JSON.stringify(jsonResult, null, 2);
        } catch {
            // Nếu không phải JSON thì hiển thị text
            document.querySelector('#apiTestResult pre').textContent = result;
        }
    } catch (error) {
        showError('apiTestResult', error);
    }
}

// Hiển thị lỗi
function showError(elementId, error) {
    document.getElementById(elementId).innerHTML = `
        <div class="alert alert-danger">
            ${error.message || error}
        </div>
    `;
}

// Update WebSocket connection handling
function setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = function(event) {
        if (event.data === 'login_success') {
            showSuccessAndRedirect();
        }
    };
    
    socket.onclose = function() {
        // Try to reconnect after 3 seconds
        setTimeout(setupWebSocket, 3000);
    };
    
    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

// Start the WebSocket connection when the page loads
window.onload = async () => {
    await loadAccounts();
    updateWelcomeMessage();
    setupWebSocket();
};