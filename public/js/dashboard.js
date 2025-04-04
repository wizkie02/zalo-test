// dashboard.js - Client-side functionality for Zalo API Dashboard

// Store the selected account (ownId) in a variable
let selectedAccount = '';

// Document load event
document.addEventListener('DOMContentLoaded', function() {
    // Load the accounts when the page loads
    loadAccounts();
});

// Function to load all accounts
function loadAccounts() {
    fetch('/api/accounts')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.accounts && data.accounts.length > 0) {
                // Display accounts in the account list
                let accountsList = document.getElementById('accountsList');
                let html = '<table class="table table-striped">';
                html += '<thead><tr><th>ID</th><th>Phone Number</th><th>Proxy</th><th colspan="2">Action</th></tr></thead><tbody>';
                
                data.accounts.forEach(account => {
                    html += `<tr>
                        <td>${account.ownId}</td>
                        <td>${account.phoneNumber || 'N/A'}</td>
                        <td>${account.proxy || 'N/A'}</td>
                        <td><button class="btn btn-sm btn-primary" onclick="selectAccount('${account.ownId}')">Select</button></td>
                        <td><button class="btn btn-sm btn-danger" onclick="logoutAccount('${account.ownId}')">Đăng xuất</button></td>
                    </tr>`;
                });
                
                html += '</tbody></table>';
                accountsList.innerHTML = html;
                
                // If no account is selected yet and we have accounts, select the first one
                if (!selectedAccount && data.accounts.length > 0) {
                    selectAccount(data.accounts[0].ownId);
                }
            } else {
                document.getElementById('accountsList').innerHTML = '<div class="alert alert-warning">No accounts available. Please login first.</div>';
                // Redirect to login page if no accounts available
                if (!data.accounts || data.accounts.length === 0) {
                    setTimeout(() => {
                        window.location.href = '/zalo-login';
                    }, 2000);
                }
            }
        })
        .catch(error => {
            console.error('Error loading accounts:', error);
            document.getElementById('accountsList').innerHTML = '<div class="alert alert-danger">Error loading accounts. Please try again.</div>';
        });
}

// Function to logout the currently selected account
function logout() {
    if (!selectedAccount) {
        alert('No account selected to logout');
        return;
    }
    
    logoutAccount(selectedAccount);
}

// Function to logout a specific account
function logoutAccount(ownId) {
    if (confirm(`Are you sure you want to logout account ${ownId}?`)) {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ownId: ownId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Đăng xuất thành công');
                
                // If the logged out account was the selected one, clear the selection
                if (ownId === selectedAccount) {
                    selectedAccount = '';
                    // Clear the current account display
                    document.getElementById('currentAccount').innerHTML = '<div class="alert alert-warning">No account selected</div>';
                    document.getElementById('welcomeMessage').textContent = 'Welcome';
                }
                
                // Reload accounts list after logout
                fetch('/api/accounts')
                    .then(response => response.json())
                    .then(data => {
                        // If no accounts left after logout, redirect to login page
                        if (!data.accounts || data.accounts.length === 0) {
                            alert('Không còn tài khoản nào. Đang chuyển hướng đến trang đăng nhập...');
                            window.location.href = '/zalo-login';
                        } else {
                            // Otherwise just reload the accounts list
                            loadAccounts();
                        }
                    })
                    .catch(error => {
                        console.error('Error checking accounts after logout:', error);
                        loadAccounts(); // Still try to reload accounts list
                    });
            } else {
                alert(`Đăng xuất thất bại: ${data.error || 'Unknown error'}`);
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert(`Lỗi khi đăng xuất: ${error.message}`);
        });
    }
}

// Function to select an account
function selectAccount(ownId) {
    selectedAccount = ownId;
    // Update the current account display
    fetch(`/api/account/${ownId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.account) {
                const account = data.account;
                document.getElementById('currentAccount').innerHTML = `
                    <div class="alert alert-info mb-0">
                        <strong>ID:</strong> ${account.ownId} <br>
                        <strong>Phone:</strong> ${account.phoneNumber || 'N/A'} <br>
                        <strong>Proxy:</strong> ${account.proxy || 'N/A'}
                    </div>`;
                
                // Update the welcome message
                document.getElementById('welcomeMessage').textContent = `Xin chào ${account.phoneNumber || account.ownId}`;
                
                // Update all template JSON bodies with this account ID
                updateAllTemplates(account.ownId);
            }
        })
        .catch(error => {
            console.error('Error fetching account details:', error);
        });
}

// Update all template JSON bodies with the selected account ID
function updateAllTemplates(ownId) {
    const templates = document.querySelectorAll('.endpoint-template');
    templates.forEach(template => {
        let jsonContent = template.textContent;
        jsonContent = jsonContent.replace(/"ownId"\s*:\s*"[^"]*"/, `"ownId": "${ownId}"`);
        template.textContent = jsonContent;
    });
}

// Function to find a user by phone number
function findUser() {
    if (!selectedAccount) {
        alert('Please select an account first');
        return;
    }
    
    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
        alert('Please enter a phone number');
        return;
    }
    
    const requestBody = {
        ownId: selectedAccount,
        phone: phone
    };
    
    document.getElementById('findUserResult').innerHTML = '<div class="text-center">Searching...</div>';
    
    fetch('/findUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const userData = data.data;
            let html = `<div class="alert alert-success">Found user: ${userData.display_name || userData.zalo_name || 'N/A'}</div>`;
            html += `<strong>User ID:</strong> ${userData.uid || 'N/A'}<br>`;
            html += `<strong>Display Name:</strong> ${userData.display_name || 'N/A'}<br>`;
            html += `<strong>Zalo Name:</strong> ${userData.zalo_name || 'N/A'}<br>`;
            
            if (userData.status) {
                html += `<strong>Status:</strong> ${userData.status}<br>`;
            }
            
            if (userData.gender !== undefined) {
                const gender = userData.gender === 1 ? "Nam" : (userData.gender === 2 ? "Nữ" : "Không xác định");
                html += `<strong>Gender:</strong> ${gender}<br>`;
            }
            
            if (userData.sdob) {
                html += `<strong>Birthday:</strong> ${userData.sdob}<br>`;
            }
            
            if (userData.avatar) {
                html += `<strong>Avatar:</strong><br><img src="${userData.avatar}" width="100" height="100" class="rounded"><br>`;
            }
            
            if (userData.cover) {
                html += `<strong>Cover:</strong><br><img src="${userData.cover}" width="200" class="img-fluid"><br>`;
            }
            
            if (userData.globalId) {
                html += `<strong>Global ID:</strong> ${userData.globalId}<br>`;
            }
            
            document.getElementById('findUserResult').innerHTML = html;
        } else {
            document.getElementById('findUserResult').innerHTML = `<div class="alert alert-danger">Error: ${data.error || 'User not found'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('findUserResult').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
}

// Function to send a message
function sendMessage() {
    if (!selectedAccount) {
        alert('Please select an account first');
        return;
    }
    
    const threadId = document.getElementById('messageThreadId').value.trim();
    const message = document.getElementById('messageContent').value.trim();
    
    if (!threadId || !message) {
        alert('Please enter both thread ID and message content');
        return;
    }
    
    const requestBody = {
        ownId: selectedAccount,
        threadId: threadId,
        message: message,
        type: 'User' // Default to user type
    };
    
    document.getElementById('sendMessageResult').innerHTML = '<div class="text-center">Sending message...</div>';
    
    fetch('/sendmessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('sendMessageResult').innerHTML = 
                `<div class="alert alert-success">Message sent successfully!</div>`;
            // Clear the message input field after successful send
            document.getElementById('messageContent').value = '';
        } else {
            document.getElementById('sendMessageResult').innerHTML = 
                `<div class="alert alert-danger">Error: ${data.error || 'Failed to send message'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('sendMessageResult').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
}

// Function to send a message by phone number
function sendMessageByPhone() {
    if (!selectedAccount) {
        alert('Please select an account first');
        return;
    }
    
    const phone = document.getElementById('messagePhone').value.trim();
    const message = document.getElementById('messagePhoneContent').value.trim();
    
    if (!phone || !message) {
        alert('Please enter both phone number and message content');
        return;
    }
    
    const requestBody = {
        ownId: selectedAccount,
        phone: phone,
        message: message
    };
    
    document.getElementById('sendMessageByPhoneResult').innerHTML = '<div class="text-center">Sending message...</div>';
    
    fetch('/sendMessageByPhoneNumber', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let html = `<div class="alert alert-success">Message sent successfully!</div>`;
            
            if (data.user) {
                html += `<div>Sent to: ${data.user.name || data.user.userId} (${data.user.userId})</div>`;
            }
            
            document.getElementById('sendMessageByPhoneResult').innerHTML = html;
            // Clear the message input field after successful send
            document.getElementById('messagePhoneContent').value = '';
        } else {
            document.getElementById('sendMessageByPhoneResult').innerHTML = 
                `<div class="alert alert-danger">Error: ${data.error || 'Failed to send message'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('sendMessageByPhoneResult').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
}

// Function to send an image
function sendImage() {
    if (!selectedAccount) {
        alert('Please select an account first');
        return;
    }
    
    const threadId = document.getElementById('imageThreadId').value.trim();
    const imagePath = document.getElementById('imagePath').value.trim();
    
    if (!threadId || !imagePath) {
        alert('Please enter both thread ID and image URL');
        return;
    }
    
    const requestBody = {
        ownId: selectedAccount,
        threadId: threadId,
        imagePath: imagePath
    };
    
    document.getElementById('sendImageResult').innerHTML = '<div class="text-center">Sending image...</div>';
    
    fetch('/sendImageToUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('sendImageResult').innerHTML = 
                `<div class="alert alert-success">Image sent successfully!</div>`;
            // Clear the image input field after successful send
            document.getElementById('imagePath').value = '';
        } else {
            document.getElementById('sendImageResult').innerHTML = 
                `<div class="alert alert-danger">Error: ${data.error || 'Failed to send image'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('sendImageResult').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
}

// Function to send an image by phone number
function sendImageByPhone() {
    if (!selectedAccount) {
        alert('Please select an account first');
        return;
    }
    
    const phone = document.getElementById('imagePhone').value.trim();
    const imagePath = document.getElementById('imagePhonePath').value.trim();
    
    if (!phone || !imagePath) {
        alert('Please enter both phone number and image URL');
        return;
    }
    
    const requestBody = {
        ownId: selectedAccount,
        phone: phone,
        imagePath: imagePath
    };
    
    document.getElementById('sendImageByPhoneResult').innerHTML = '<div class="text-center">Sending image...</div>';
    
    fetch('/sendImageByPhoneNumber', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let html = `<div class="alert alert-success">Image sent successfully!</div>`;
            
            if (data.user) {
                html += `<div>Sent to: ${data.user.name || data.user.userId} (${data.user.userId})</div>`;
            }
            
            document.getElementById('sendImageByPhoneResult').innerHTML = html;
            // Clear the image input field after successful send
            document.getElementById('imagePhonePath').value = '';
        } else {
            document.getElementById('sendImageByPhoneResult').innerHTML = 
                `<div class="alert alert-danger">Error: ${data.error || 'Failed to send image'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('sendImageByPhoneResult').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
}

// Function to update the request body with a template
function updateRequestBody() {
    const endpoint = document.getElementById('apiEndpoint').value;
    if (!endpoint) return;
    
    const templateId = 'template-' + endpoint.substring(1); // Remove the leading slash
    const template = document.getElementById(templateId);
    
    if (template) {
        let jsonContent = template.textContent;
        if (selectedAccount) {
            jsonContent = jsonContent.replace(/"ownId"\s*:\s*"[^"]*"/, `"ownId": "${selectedAccount}"`);
        }
        document.getElementById('apiBody').value = jsonContent;
    }
}

// Function to test custom API
function testAPI() {
    const method = document.getElementById('apiMethod').value;
    const endpoint = document.getElementById('apiEndpoint').value;
    const bodyEl = document.getElementById('apiBody');
    
    if (!endpoint) {
        alert('Please select an API endpoint');
        return;
    }
    
    let requestOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (method !== 'GET' && bodyEl.value.trim()) {
        try {
            // Parse JSON to validate it
            const bodyObject = JSON.parse(bodyEl.value);
            requestOptions.body = JSON.stringify(bodyObject);
        } catch (e) {
            alert('Invalid JSON in request body');
            return;
        }
    }
    
    document.querySelector('#apiTestResult pre').textContent = 'Processing...';
    
        fetch(endpoint, requestOptions)
            .then(response => response.json())
            .then(data => {
                document.querySelector('#apiTestResult pre').textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error:', error);
                document.querySelector('#apiTestResult pre').textContent = error.message;
            });
}

// Hàm xử lý hiển thị/ẩn các trường input dựa theo lựa chọn phương thức nhận diện
function toggleMessageInputFields() {
    const method = document.getElementById('messageIdentifyMethod').value;
    const threadIdInput = document.getElementById('messageThreadId');
    const phoneInput = document.getElementById('messagePhone');
    
    if (method === 'userId') {
        threadIdInput.style.display = 'block';
        phoneInput.style.display = 'none';
        threadIdInput.required = true;
        phoneInput.required = false;
    } else {
        threadIdInput.style.display = 'none';
        phoneInput.style.display = 'block';
        threadIdInput.required = false;
        phoneInput.required = true;
    }
}

function toggleImageInputFields() {
    const method = document.getElementById('imageIdentifyMethod').value;
    const threadIdInput = document.getElementById('imageThreadId');
    const phoneInput = document.getElementById('imagePhone');
    
    if (method === 'userId') {
        threadIdInput.style.display = 'block';
        phoneInput.style.display = 'none';
        threadIdInput.required = true;
        phoneInput.required = false;
    } else {
        threadIdInput.style.display = 'none';
        phoneInput.style.display = 'block';
        threadIdInput.required = false;
        phoneInput.required = true;
    }
}

// Hàm gửi tin nhắn thống nhất (unified)
function sendMessageUnified() {
    if (!selectedAccount) {
        alert('Vui lòng chọn tài khoản trước');
        return;
    }

    const method = document.getElementById('messageIdentifyMethod').value;
    const message = document.getElementById('messageContent').value.trim();

    if (!message) {
        alert('Vui lòng nhập nội dung tin nhắn');
        return;
    }

    let endpoint, requestBody;
    
    if (method === 'userId') {
        const threadId = document.getElementById('messageThreadId').value.trim();
        if (!threadId) {
            alert('Vui lòng nhập Thread ID người nhận');
            return;
        }
        endpoint = '/sendmessage';
        requestBody = {
            ownId: selectedAccount,
            threadId: threadId,
            message: message,
            type: 'User'
        };
    } else {
        const phone = document.getElementById('messagePhone').value.trim();
        if (!phone) {
            alert('Vui lòng nhập số điện thoại người nhận');
            return;
        }
        endpoint = '/sendMessageByPhoneNumber';
        requestBody = {
            ownId: selectedAccount,
            phone: phone,
            message: message
        };
    }

    document.getElementById('sendMessageResult').innerHTML = '<div class="text-center">Đang gửi tin nhắn...</div>';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('sendMessageResult').innerHTML = 
                `<div class="alert alert-success">Gửi tin nhắn thành công!</div>`;
        } else {
            document.getElementById('sendMessageResult').innerHTML = 
                `<div class="alert alert-danger">Lỗi: ${data.error || 'Không thể gửi tin nhắn'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('sendMessageResult').innerHTML = 
            `<div class="alert alert-danger">Lỗi: ${error.message}</div>`;
    });
}

// Hàm gửi hình ảnh thống nhất (unified)
function sendImageUnified() {
    if (!selectedAccount) {
        alert('Vui lòng chọn tài khoản trước');
        return;
    }

    const method = document.getElementById('imageIdentifyMethod').value;
    const imagePath = document.getElementById('imagePath').value.trim();

    if (!imagePath) {
        alert('Vui lòng nhập URL hình ảnh');
        return;
    }

    let endpoint, requestBody;
    
    if (method === 'userId') {
        const threadId = document.getElementById('imageThreadId').value.trim();
        if (!threadId) {
            alert('Vui lòng nhập Thread ID người nhận');
            return;
        }
        endpoint = '/sendImageToUser';
        requestBody = {
            ownId: selectedAccount,
            threadId: threadId,
            imagePath: imagePath
        };
    } else {
        const phone = document.getElementById('imagePhone').value.trim();
        if (!phone) {
            alert('Vui lòng nhập số điện thoại người nhận');
            return;
        }
        endpoint = '/sendImageByPhoneNumber';
        requestBody = {
            ownId: selectedAccount,
            phone: phone,
            imagePath: imagePath
        };
    }

    document.getElementById('sendImageResult').innerHTML = '<div class="text-center">Đang gửi hình ảnh...</div>';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('sendImageResult').innerHTML = 
                `<div class="alert alert-success">Gửi hình ảnh thành công!</div>`;
        } else {
            document.getElementById('sendImageResult').innerHTML = 
                `<div class="alert alert-danger">Lỗi: ${data.error || 'Không thể gửi hình ảnh'}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('sendImageResult').innerHTML = 
            `<div class="alert alert-danger">Lỗi: ${error.message}</div>`;
    });
}