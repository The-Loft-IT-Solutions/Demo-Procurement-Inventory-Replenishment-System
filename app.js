/* ============================================
   PROCUREMENT & INVENTORY SYSTEM
   JSON Data + Pro Mode
   ============================================ */

// ============================================
// GLOBAL STATE
// ============================================

let appData = null;
let currentUser = null;
let currentPage = 'dashboard';
let selectedRole = 'manager';
let tempPOItems = [];
let currentPOForApproval = null;
let currentPOForReceive = null;
let currentItemForAdjust = null;
let currentReceiveRequestForApproval = null;
let currentPOForPayment = null;
let isProEnabled = false;

// CSV Import state
let csvImportState = {
    fileContent: null,
    filename: null,
    headers: [],
    rows: [],
    detectedColumns: [],
    userMappings: {},
    previewData: [],
    summary: null,
    sessionId: null
};

// ============================================
// INITIALIZATION
// ============================================

async function initApp() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to load data');
        appData = await response.json();

        // Load pro mode from localStorage
        isProEnabled = localStorage.getItem('procurement_pro_mode') === 'true';

        // Load any saved mutations from localStorage
        const saved = localStorage.getItem('procurement_data');
        if (saved) {
            try {
                const savedData = JSON.parse(saved);
                Object.keys(savedData).forEach(key => {
                    if (appData[key] !== undefined) appData[key] = savedData[key];
                });
            } catch (e) {
                console.warn('Failed to parse saved data', e);
            }
        }

        // Update pro toggle UI
        const toggleInput = document.getElementById('pro-toggle-input');
        if (toggleInput) toggleInput.checked = isProEnabled;
        updateProUI();

        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-screen').classList.add('active');

        selectRole('manager');
    } catch (err) {
        console.error('Failed to initialize app:', err);
        document.querySelector('.loading-content').innerHTML = `
            <i class="fas fa-exclamation-circle" style="font-size:48px;color:#ef4444;margin-bottom:16px;"></i>
            <h2>Failed to Load</h2>
            <p>Could not load data.json. Please ensure the file is in the same directory.</p>
        `;
    }
}

function saveAppData() {
    if (!appData) return;
    const dataToSave = {};
    ['users','units','categories','suppliers','items','purchase_orders','po_items',
     'stock_logs','daily_counts','notifications','payments','receive_requests',
     'csv_import_sessions','settings'].forEach(key => {
        if (appData[key] !== undefined) dataToSave[key] = appData[key];
    });
    localStorage.setItem('procurement_data', JSON.stringify(dataToSave));
    localStorage.setItem('procurement_pro_mode', isProEnabled);
}

function updateProUI() {
    const badge = document.getElementById('header-pro-badge');
    const navItem = document.querySelector('.nav-item-pro');
    const toggleCard = document.getElementById('pro-toggle-card');

    if (isProEnabled) {
        if (badge) badge.style.display = 'inline-flex';
        if (navItem) navItem.style.display = 'flex';
        if (toggleCard) toggleCard.classList.add('active');
    } else {
        if (badge) badge.style.display = 'none';
        if (navItem) navItem.style.display = 'none';
        if (toggleCard) toggleCard.classList.remove('active');
    }

    if (!isProEnabled && currentPage === 'csv-import') {
        navigateTo('dashboard');
    }
}

function toggleProMode() {
    isProEnabled = document.getElementById('pro-toggle-input').checked;
    saveAppData();
    updateProUI();
    showToast(isProEnabled ? 'Pro Mode Enabled' : 'Pro Mode Disabled', 
              isProEnabled ? 'CSV Import/Export features are now available.' : 'CSV features have been hidden.', 
              isProEnabled ? 'pro' : 'info');

    if (currentPage === 'inventory' || currentPage === 'reports' || currentPage === 'settings') {
        navigateTo(currentPage);
    }
    updateSidebarVisibility();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₱0.00';
    return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return formatDate(dateString);
}

function getItemStatus(item) {
    if (item.current_stock <= 0) return { label: 'Out of Stock', class: 'badge-danger', level: 'low' };
    if (item.current_stock <= item.reorder_point) return { label: 'Low Stock', class: 'badge-warning', level: 'medium' };
    return { label: 'Normal', class: 'badge-success', level: 'high' };
}

function getStockPercentage(item) {
    if (item.max_stock <= 0) return 100;
    return Math.min(100, Math.round((item.current_stock / item.max_stock) * 100));
}

function getCategoryName(categoryId) {
    const cat = appData.categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
}

function getUnitName(unitId) {
    const unit = appData.units.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown';
}

function getUnitAbbreviation(unitId) {
    const unit = appData.units.find(u => u.id === unitId);
    return unit ? unit.abbreviation : '?';
}

function getSupplierName(supplierId) {
    const supplier = appData.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
}

function getUserName(userId) {
    const user = appData.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
}

function getUserById(userId) {
    return appData.users.find(u => u.id === userId);
}

function getPOStatusBadge(status) {
    const statusMap = {
        'draft': { label: 'Draft', class: 'badge-secondary' },
        'pending': { label: 'Pending Approval', class: 'badge-warning' },
        'approved': { label: 'Approved', class: 'badge-info' },
        'rejected': { label: 'Rejected', class: 'badge-danger' },
        'ordered': { label: 'Ordered', class: 'badge-info' },
        'receive_pending': { label: 'Receive Pending Approval', class: 'badge-warning' },
        'partial': { label: 'Partially Received', class: 'badge-warning' },
        'received': { label: 'Received', class: 'badge-success' },
        'cancelled': { label: 'Cancelled', class: 'badge-secondary' }
    };
    return statusMap[status] || { label: status, class: 'badge-secondary' };
}

function generatePONumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const nextId = Math.max(...appData.purchase_orders.map(po => po.id), 0) + 1;
    return `PO-${dateStr}-${String(nextId).padStart(3, '0')}`;
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle',
        'pro': 'fa-star'
    };

    toast.innerHTML = `
        <i class="fas ${iconMap[type] || iconMap.info} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function openModal(modalId) {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// ============================================
// AUTHENTICATION
// ============================================

function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });
    const user = appData.users.find(u => u.role === role);
    if (user) {
        document.getElementById('login-email').value = user.email;
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    currentUser = appData.users.find(u => u.email === email && u.role === selectedRole);

    if (!currentUser) {
        currentUser = appData.users.find(u => u.role === selectedRole);
    }

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').style.display = 'flex';

    updateUserUI();
    updateSidebarVisibility();
    navigateTo('dashboard');

    showToast('Welcome!', `Logged in as ${currentUser.name}`, 'success');
}

function updateUserUI() {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-avatar').textContent = currentUser.avatar;
    document.getElementById('user-avatar-large').textContent = currentUser.avatar;
    document.getElementById('user-menu-name').textContent = currentUser.name;
    document.getElementById('user-menu-role').textContent = currentUser.roleLabel;
}

function updateSidebarVisibility() {
    if (!currentUser) return;
    const role = currentUser.role;

    document.querySelectorAll('.nav-item').forEach(item => {
        const page = item.dataset.page;
        let visible = true;

        if (page === 'purchase-orders' && role === 'stock_personnel') visible = false;
        if (page === 'reports' && role === 'stock_personnel') visible = false;
        if (page === 'suppliers' && role === 'stock_personnel') visible = false;
        if (page === 'settings' && role !== 'owner' && role !== 'admin') visible = false;
        if (page === 'csv-import' && !isProEnabled) visible = false;

        item.style.display = visible ? 'flex' : 'none';
    });
}

function logout() {
    currentUser = null;
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('user-menu').classList.remove('active');
    showToast('Signed Out', 'You have been logged out successfully', 'info');
}

function showProfile() {
    document.getElementById('user-menu').classList.remove('active');
    navigateTo('settings');
    setTimeout(() => switchSettingsTab('profile'), 100);
}

function showSettings() {
    document.getElementById('user-menu').classList.remove('active');
    navigateTo('settings');
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    currentPage = page;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    const mainContent = document.getElementById('main-content');

    switch(page) {
        case 'dashboard': renderDashboard(mainContent); break;
        case 'inventory': renderInventory(mainContent); break;
        case 'purchase-orders': renderPurchaseOrders(mainContent); break;
        case 'daily-count': renderDailyCount(mainContent); break;
        case 'suppliers': renderSuppliers(mainContent); break;
        case 'reports': renderReports(mainContent); break;
        case 'csv-import': renderCSVImport(mainContent); break;
        case 'settings': renderSettings(mainContent); break;
        default: renderDashboard(mainContent);
    }

    window.scrollTo(0, 0);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleNotifications() {
    document.getElementById('notifications-panel').classList.toggle('active');
    renderNotifications();
}

function toggleUserMenu() {
    document.getElementById('user-menu').classList.toggle('active');
}

function markAllRead() {
    appData.notifications.forEach(n => n.is_read = true);
    saveAppData();
    renderNotifications();
    updateNotificationBadge();
    showToast('Notifications', 'All notifications marked as read', 'success');
}

function updateNotificationBadge() {
    if (!currentUser) return;
    const unread = appData.notifications.filter(n => !n.is_read && n.user_id === currentUser.id).length;
    const badge = document.getElementById('notification-badge');
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'block' : 'none';
}

function renderNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list || !currentUser) return;
    const userNotifications = appData.notifications
        .filter(n => n.user_id === currentUser.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (userNotifications.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No notifications</p></div>';
        return;
    }

    list.innerHTML = userNotifications.map(n => `
        <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id})">
            <div class="notification-item-title">${n.title}</div>
            <div class="notification-item-text">${n.message}</div>
            <div class="notification-item-time">${timeAgo(n.created_at)}</div>
        </div>
    `).join('');
}

function handleNotificationClick(id) {
    const notification = appData.notifications.find(n => n.id === id);
    if (notification) {
        notification.is_read = true;
        saveAppData();
        updateNotificationBadge();
        renderNotifications();

        if (notification.reference_type === 'purchase_order') {
            navigateTo('purchase-orders');
        } else if (notification.reference_type === 'item') {
            navigateTo('inventory');
        } else if (notification.reference_type === 'csv_import') {
            if (isProEnabled) navigateTo('csv-import');
        }
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.notifications-dropdown')) {
        const panel = document.getElementById('notifications-panel');
        if (panel) panel.classList.remove('active');
    }
    if (!e.target.closest('.user-dropdown')) {
        const menu = document.getElementById('user-menu');
        if (menu) menu.classList.remove('active');
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ============================================
// DASHBOARD RENDERER
// ============================================

function renderDashboard(container) {
    const role = currentUser.role;
    const lowStockItems = appData.items.filter(item => item.is_active && item.current_stock <= item.reorder_point);
    const outOfStockItems = appData.items.filter(item => item.is_active && item.current_stock <= 0);
    const pendingPOs = appData.purchase_orders.filter(po => po.status === 'pending');
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayDiscrepancies = appData.daily_counts.filter(d => d.count_date === todayStr && d.discrepancy !== 0);
    const pendingReceives = appData.receive_requests.filter(r => r.status === 'pending');
    const pendingCSVImports = isProEnabled ? appData.csv_import_sessions.filter(s => s.status === 'pending_approval') : [];

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-home"></i> Dashboard</h1>
            <div class="page-header-actions">
                ${role !== 'stock_personnel' ? `<button class="btn btn-primary" onclick="openCreatePOModal()">
                    <i class="fas fa-plus"></i> Create PO
                </button>` : ''}
                <button class="btn btn-outline" onclick="navigateTo('daily-count')">
                    <i class="fas fa-clipboard-check"></i> Daily Count
                </button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total Items</div>
                    <div class="stat-card-icon blue"><i class="fas fa-boxes"></i></div>
                </div>
                <div class="stat-card-value">${appData.items.filter(i => i.is_active).length}</div>
                <div class="stat-card-change positive">Active inventory</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Low Stock</div>
                    <div class="stat-card-icon orange"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--warning)">${lowStockItems.length}</div>
                <div class="stat-card-change negative">Below reorder point</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Out of Stock</div>
                    <div class="stat-card-icon red"><i class="fas fa-times-circle"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--danger)">${outOfStockItems.length}</div>
                <div class="stat-card-change negative">Need immediate reorder</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Pending POs</div>
                    <div class="stat-card-icon blue"><i class="fas fa-file-invoice"></i></div>
                </div>
                <div class="stat-card-value">${pendingPOs.length}</div>
                <div class="stat-card-change">Awaiting approval</div>
            </div>
        </div>
    `;

    if (role === 'owner') {
        html += renderOwnerDashboard(pendingPOs, todayDiscrepancies, pendingReceives, pendingCSVImports);
    } else if (role === 'manager') {
        html += renderManagerDashboard(lowStockItems, pendingPOs);
    } else if (role === 'stock_personnel') {
        html += renderStockPersonnelDashboard(todayDiscrepancies);
    }

    html += `
        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
            </div>
            <div class="card-body">
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="navigateTo('inventory')">
                        <i class="fas fa-search"></i>
                        <span>View Inventory</span>
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('daily-count')">
                        <i class="fas fa-clipboard-list"></i>
                        <span>Daily Count</span>
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('purchase-orders')">
                        <i class="fas fa-list-alt"></i>
                        <span>View POs</span>
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('reports')">
                        <i class="fas fa-chart-pie"></i>
                        <span>Reports</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderOwnerDashboard(pendingPOs, discrepancies, pendingReceives, pendingCSVImports) {
    let html = '';

    if (pendingCSVImports.length > 0 && isProEnabled) {
        html += `
            <div class="alert alert-pro">
                <i class="fas fa-file-csv alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-title">${pendingCSVImports.length} CSV Import${pendingCSVImports.length > 1 ? 's' : ''} Awaiting Your Approval</div>
                    <div class="alert-text">Review POS CSV imports before inventory is updated.</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-file-csv"></i> Pending CSV Imports</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>Filename</th><th>Uploaded By</th><th>Items</th><th>Date</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${pendingCSVImports.map(session => `
                                    <tr>
                                        <td><strong>${session.original_filename}</strong></td>
                                        <td>${getUserName(session.created_by)}</td>
                                        <td>${session.preview_data ? session.preview_data.length : 0} rows</td>
                                        <td>${formatDate(session.created_at)}</td>
                                        <td>
                                            <button class="btn btn-primary btn-sm" onclick="openCSVApprovalModal(${session.id})">
                                                <i class="fas fa-check"></i> Review
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    if (pendingReceives.length > 0) {
        html += `
            <div class="alert alert-danger">
                <i class="fas fa-bell alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-title">${pendingReceives.length} Receive Request${pendingReceives.length > 1 ? 's' : ''} Awaiting Your Approval</div>
                    <div class="alert-text">Review received quantities before inventory is updated.</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-box-open"></i> Pending Receive Approvals</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>PO Number</th><th>Received By</th><th>Items</th><th>Date</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${pendingReceives.map(req => {
                                    const po = appData.purchase_orders.find(p => p.id === req.po_id);
                                    return `
                                        <tr>
                                            <td><strong>${po ? po.po_number : 'Unknown'}</strong></td>
                                            <td>${getUserName(req.created_by)}</td>
                                            <td>${req.items.length} items</td>
                                            <td>${formatDate(req.created_at)}</td>
                                            <td>
                                                <button class="btn btn-primary btn-sm" onclick="openReceiveApprovalModal(${req.id})">
                                                    <i class="fas fa-check"></i> Review
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    if (pendingPOs.length > 0) {
        html += `
            <div class="alert alert-warning">
                <i class="fas fa-bell alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-title">${pendingPOs.length} Purchase Order${pendingPOs.length > 1 ? 's' : ''} Awaiting Your Approval</div>
                    <div class="alert-text">Review and approve purchase orders to keep inventory stocked.</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-clipboard-check"></i> Pending Approvals</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>PO Number</th><th>Requester</th><th>Items</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${pendingPOs.map(po => {
                                    const poItems = appData.po_items.filter(pi => pi.po_id === po.id);
                                    return `
                                        <tr>
                                            <td><strong>${po.po_number}</strong></td>
                                            <td>${getUserName(po.requester_id)}</td>
                                            <td>${poItems.length} items</td>
                                            <td>${getPOStatusBadge(po.status).label}</td>
                                            <td>${formatDate(po.created_at)}</td>
                                            <td>
                                                <button class="btn btn-primary btn-sm" onclick="openApproveModal(${po.id})">
                                                    <i class="fas fa-check"></i> Review
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    if (discrepancies.length > 0) {
        html += `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-not-equal"></i> Today's Stock Discrepancies</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>Item</th><th>Expected</th><th>Actual</th><th>Difference</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                ${discrepancies.map(d => {
                                    const item = appData.items.find(i => i.id === d.item_id);
                                    return `
                                        <tr>
                                            <td>${item ? item.name : 'Unknown'}</td>
                                            <td>${d.expected_stock}</td>
                                            <td>${d.actual_count}</td>
                                            <td style="color: ${d.discrepancy < 0 ? 'var(--danger)' : 'var(--success)'}">
                                                ${d.discrepancy > 0 ? '+' : ''}${d.discrepancy}
                                            </td>
                                            <td>
                                                <span class="badge ${d.is_resolved ? 'badge-success' : 'badge-warning'}">
                                                    ${d.is_resolved ? 'Resolved' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

function renderManagerDashboard(lowStockItems, pendingPOs) {
    let html = '';

    if (lowStockItems.length > 0) {
        html += `
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> Low Stock Alerts</h2>
                    <button class="btn btn-primary btn-sm" onclick="openCreatePOModal()">
                        <i class="fas fa-plus"></i> Create PO
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Point</th>
                                    <th>Shortage</th>
                                    <th>Supplier</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lowStockItems.map(item => {
                                    const status = getItemStatus(item);
                                    const shortage = Math.max(0, item.reorder_point - item.current_stock);
                                    return `
                                        <tr>
                                            <td>
                                                <strong>${item.name}</strong>
                                                <div style="font-size: 12px; color: var(--text-muted)">${item.sku}</div>
                                            </td>
                                            <td>
                                                <span class="stock-text ${status.level}">${item.current_stock}</span>
                                            </td>
                                            <td>${item.reorder_point}</td>
                                            <td style="color: var(--danger); font-weight: 600">${shortage}</td>
                                            <td>${getSupplierName(item.supplier_id)}</td>
                                            <td>
                                                <button class="btn btn-outline btn-sm" onclick="addItemToTempPO(${item.id})">
                                                    <i class="fas fa-plus"></i> Add to PO
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    const myPOs = appData.purchase_orders.filter(po => po.requester_id === currentUser.id).slice(0, 5);
    if (myPOs.length > 0) {
        html += `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-file-invoice-dollar"></i> My Purchase Orders</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>PO Number</th><th>Status</th><th>Items</th><th>Total</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                ${myPOs.map(po => {
                                    const poItems = appData.po_items.filter(pi => pi.po_id === po.id);
                                    const status = getPOStatusBadge(po.status);
                                    return `
                                        <tr>
                                            <td><strong>${po.po_number}</strong></td>
                                            <td><span class="badge ${status.class}">${status.label}</span></td>
                                            <td>${poItems.length} items</td>
                                            <td>${formatCurrency(po.total_amount)}</td>
                                            <td>${formatDate(po.created_at)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

function renderStockPersonnelDashboard(discrepancies) {
    let html = `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-clipboard-check"></i> Today's Tasks</h2>
            </div>
            <div class="card-body">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">Daily Stock Count</div>
                        <div class="alert-text">Please complete the daily stock count for all items.</div>
                    </div>
                </div>
                <button class="btn btn-primary btn-lg btn-block" onclick="navigateTo('daily-count')">
                    <i class="fas fa-clipboard-list"></i> Start Daily Stock Count
                </button>
            </div>
        </div>
    `;

    const unresolved = discrepancies.filter(d => !d.is_resolved);
    if (unresolved.length > 0) {
        html += `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-not-equal"></i> Discrepancies to Resolve</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>Item</th><th>Expected</th><th>Actual</th><th>Difference</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${unresolved.map(d => {
                                    const item = appData.items.find(i => i.id === d.item_id);
                                    return `
                                        <tr>
                                            <td>${item ? item.name : 'Unknown'}</td>
                                            <td>${d.expected_stock}</td>
                                            <td>${d.actual_count}</td>
                                            <td style="color: var(--danger); font-weight: 600">${d.discrepancy}</td>
                                            <td>
                                                <button class="btn btn-success btn-sm" onclick="resolveDiscrepancy(${d.id})">
                                                    <i class="fas fa-check"></i> Resolve
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

// ============================================
// INVENTORY RENDERER
// ============================================

function renderInventory(container) {
    const role = currentUser.role;
    const canManage = role === 'owner' || role === 'manager';

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-boxes"></i> Inventory</h1>
            <div class="page-header-actions">
                ${isProEnabled ? `
                    <button class="btn btn-outline" onclick="openCSVImportModal()">
                        <i class="fas fa-file-csv"></i> Import CSV
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="exportInventoryCSV()">
                    <i class="fas fa-download"></i> Export
                </button>
                ${canManage ? `
                    <button class="btn btn-primary" onclick="openItemModal()">
                        <i class="fas fa-plus"></i> Add Item
                    </button>
                ` : ''}
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="inventory-search" placeholder="Search items..." onkeyup="filterInventory()">
            </div>
            <select class="filter-select" id="inventory-category" onchange="filterInventory()">
                <option value="">All Categories</option>
                ${appData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <select class="filter-select" id="inventory-status" onchange="filterInventory()">
                <option value="">All Status</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
                <option value="normal">Normal</option>
            </select>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table" id="inventory-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Stock Level</th>
                                <th>Reorder Point</th>
                                <th>Supplier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    filterInventory();
}

function filterInventory() {
    const search = document.getElementById('inventory-search')?.value.toLowerCase() || '';
    const category = document.getElementById('inventory-category')?.value || '';
    const status = document.getElementById('inventory-status')?.value || '';
    const role = currentUser.role;
    const canManage = role === 'owner' || role === 'manager';

    let filtered = appData.items.filter(item => item.is_active);

    if (search) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(search) || 
            item.sku.toLowerCase().includes(search) ||
            (item.barcode && item.barcode.includes(search))
        );
    }

    if (category) {
        filtered = filtered.filter(item => item.category_id === parseInt(category));
    }

    if (status) {
        if (status === 'low') {
            filtered = filtered.filter(item => item.current_stock > 0 && item.current_stock <= item.reorder_point);
        } else if (status === 'out') {
            filtered = filtered.filter(item => item.current_stock <= 0);
        } else if (status === 'normal') {
            filtered = filtered.filter(item => item.current_stock > item.reorder_point);
        }
    }

    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No items found</p></td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const status = getItemStatus(item);
        const stockPct = getStockPercentage(item);
        return `
            <tr>
                <td><code>${item.sku}</code></td>
                <td>
                    <strong>${item.name}</strong>
                    <div style="font-size: 12px; color: var(--text-muted)">${item.description || ''}</div>
                </td>
                <td>${getCategoryName(item.category_id)}</td>
                <td>
                    <div class="stock-level">
                        <div class="stock-bar">
                            <div class="stock-bar-fill ${status.level}" style="width: ${stockPct}%"></div>
                        </div>
                        <span class="stock-text ${status.level}">${item.current_stock} ${getUnitAbbreviation(item.unit_id)}</span>
                    </div>
                </td>
                <td>${item.reorder_point} ${getUnitAbbreviation(item.unit_id)}</td>
                <td>${getSupplierName(item.supplier_id)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewItemDetail(${item.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${canManage ? `
                        <button class="btn btn-sm btn-outline" onclick="openItemModal(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="openStockAdjustModal(${item.id})">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function viewItemDetail(itemId) {
    const item = appData.items.find(i => i.id === itemId);
    if (!item) return;

    const stockLogs = appData.stock_logs.filter(l => l.item_id === itemId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const poItems = appData.po_items.filter(pi => pi.item_id === itemId);
    const status = getItemStatus(item);

    document.getElementById('item-detail-title').innerHTML = `
        <i class="fas fa-box"></i> ${item.name}
        <span class="badge ${status.class}" style="margin-left: 12px; font-size: 12px;">${status.label}</span>
    `;

    document.getElementById('item-detail-content').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Item Information</h4>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>SKU:</strong> ${item.sku}</div>
                    <div style="margin-bottom: 8px;"><strong>Barcode:</strong> ${item.barcode || 'N/A'}</div>
                    <div style="margin-bottom: 8px;"><strong>Category:</strong> ${getCategoryName(item.category_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Unit:</strong> ${getUnitName(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Supplier:</strong> ${getSupplierName(item.supplier_id)}</div>
                    <div><strong>Description:</strong> ${item.description || 'N/A'}</div>
                </div>
            </div>
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Stock Configuration</h4>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>Current Stock:</strong> <span class="stock-text ${status.level}">${item.current_stock} ${getUnitAbbreviation(item.unit_id)}</span></div>
                    <div style="margin-bottom: 8px;"><strong>Reorder Point:</strong> ${item.reorder_point} ${getUnitAbbreviation(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Reorder Qty:</strong> ${item.reorder_qty} ${getUnitAbbreviation(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Max Stock:</strong> ${item.max_stock} ${getUnitAbbreviation(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Last Purchase Price:</strong> ${formatCurrency(item.last_purchase_price)}</div>
                    <div><strong>Avg Purchase Price:</strong> ${formatCurrency(item.avg_purchase_price)}</div>
                </div>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Stock History</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>Date</th><th>Type</th><th>Quantity</th><th>Old Stock</th><th>New Stock</th><th>Reason</th><th>By</th></tr>
                </thead>
                <tbody>
                    ${stockLogs.length > 0 ? stockLogs.slice(0, 10).map(log => `
                        <tr>
                            <td>${formatDateTime(log.created_at)}</td>
                            <td><span class="badge ${log.type === 'purchase' ? 'badge-success' : log.type === 'sale' ? 'badge-danger' : log.type === 'csv_import' ? 'badge-pro' : 'badge-secondary'}">${log.type.replace(/_/g, ' ')}</span></td>
                            <td style="color: ${log.quantity > 0 ? 'var(--success)' : log.quantity < 0 ? 'var(--danger)' : 'var(--text-secondary)'}">${log.quantity > 0 ? '+' : ''}${log.quantity}</td>
                            <td>${log.old_stock}</td>
                            <td>${log.new_stock}</td>
                            <td>${log.reason || '-'}</td>
                            <td>${getUserName(log.user_id)}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="7" class="empty-state"><p>No stock history</p></td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    openModal('item-detail-modal');
}

function openItemModal(itemId) {
    const isEdit = !!itemId;
    const item = isEdit ? appData.items.find(i => i.id === itemId) : null;

    document.getElementById('item-modal-title').innerHTML = isEdit ? 
        `<i class="fas fa-edit"></i> Edit Item` : `<i class="fas fa-plus"></i> Add Item`;
    document.getElementById('item-modal-id').value = isEdit ? item.id : '';
    document.getElementById('item-sku').value = isEdit ? item.sku : '';
    document.getElementById('item-barcode').value = isEdit ? item.barcode : '';
    document.getElementById('item-name').value = isEdit ? item.name : '';
    document.getElementById('item-description').value = isEdit ? item.description : '';
    document.getElementById('item-current-stock').value = isEdit ? item.current_stock : 0;
    document.getElementById('item-reorder-point').value = isEdit ? item.reorder_point : 10;
    document.getElementById('item-reorder-qty').value = isEdit ? item.reorder_qty : 20;
    document.getElementById('item-max-stock').value = isEdit ? item.max_stock : 50;
    document.getElementById('item-last-price').value = isEdit ? item.last_purchase_price : 0;
    document.getElementById('item-avg-price').value = isEdit ? item.avg_purchase_price : 0;

    document.getElementById('item-category').innerHTML = appData.categories.map(c => 
        `<option value="${c.id}" ${isEdit && item.category_id === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    document.getElementById('item-unit').innerHTML = appData.units.map(u => 
        `<option value="${u.id}" ${isEdit && item.unit_id === u.id ? 'selected' : ''}>${u.name}</option>`
    ).join('');

    document.getElementById('item-supplier').innerHTML = '<option value="">None</option>' + appData.suppliers.filter(s => s.is_active).map(s => 
        `<option value="${s.id}" ${isEdit && item.supplier_id === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');

    openModal('item-modal');
}

function saveItem() {
    const id = document.getElementById('item-modal-id').value;
    const isEdit = !!id;

    const itemData = {
        sku: document.getElementById('item-sku').value.trim(),
        name: document.getElementById('item-name').value.trim(),
        barcode: document.getElementById('item-barcode').value.trim(),
        description: document.getElementById('item-description').value.trim(),
        category_id: parseInt(document.getElementById('item-category').value),
        unit_id: parseInt(document.getElementById('item-unit').value),
        supplier_id: document.getElementById('item-supplier').value ? parseInt(document.getElementById('item-supplier').value) : null,
        current_stock: parseFloat(document.getElementById('item-current-stock').value) || 0,
        reorder_point: parseFloat(document.getElementById('item-reorder-point').value) || 0,
        reorder_qty: parseFloat(document.getElementById('item-reorder-qty').value) || 0,
        max_stock: parseFloat(document.getElementById('item-max-stock').value) || 0,
        last_purchase_price: parseFloat(document.getElementById('item-last-price').value) || 0,
        avg_purchase_price: parseFloat(document.getElementById('item-avg-price').value) || 0,
        has_expiration: false,
        is_active: true
    };

    if (!itemData.sku || !itemData.name) {
        showToast('Error', 'SKU and Name are required', 'error');
        return;
    }

    if (isEdit) {
        const item = appData.items.find(i => i.id === parseInt(id));
        if (item) {
            Object.assign(item, itemData);
            showToast('Success', `Item ${itemData.name} updated`, 'success');
        }
    } else {
        const newId = Math.max(...appData.items.map(i => i.id), 0) + 1;
        appData.items.push({ id: newId, ...itemData });
        showToast('Success', `Item ${itemData.name} created`, 'success');
    }

    saveAppData();
    closeModal();
    filterInventory();
}

function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const item = appData.items.find(i => i.id === itemId);
    if (item) {
        item.is_active = false;
        saveAppData();
        showToast('Deleted', `${item.name} has been deleted`, 'warning');
        filterInventory();
    }
}

function openStockAdjustModal(itemId) {
    const item = appData.items.find(i => i.id === itemId);
    if (!item) return;

    currentItemForAdjust = item;
    document.getElementById('adjust-current').value = item.current_stock;
    document.getElementById('adjust-quantity').value = '';
    document.getElementById('adjust-new').value = item.current_stock;
    document.getElementById('adjust-reason').value = '';

    openModal('stock-adjust-modal');
}

function submitStockAdjustment() {
    if (!currentItemForAdjust) return;

    const quantity = parseFloat(document.getElementById('adjust-quantity').value) || 0;
    const type = document.getElementById('adjust-type').value;
    const reason = document.getElementById('adjust-reason').value;

    if (quantity === 0) {
        showToast('Error', 'Please enter a quantity', 'error');
        return;
    }

    const oldStock = currentItemForAdjust.current_stock;
    const newStock = oldStock + quantity;

    if (newStock < 0) {
        showToast('Error', 'Cannot reduce stock below zero', 'error');
        return;
    }

    currentItemForAdjust.current_stock = newStock;

    appData.stock_logs.push({
        id: Math.max(...appData.stock_logs.map(l => l.id), 0) + 1,
        item_id: currentItemForAdjust.id,
        user_id: currentUser.id,
        type: type,
        quantity: quantity,
        old_stock: oldStock,
        new_stock: newStock,
        reason: reason,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Success', `Stock adjusted from ${oldStock} to ${newStock}`, 'success');
    filterInventory();
}

// Update new stock when quantity changes
document.addEventListener('input', function(e) {
    if (e.target.id === 'adjust-quantity') {
        const current = parseFloat(document.getElementById('adjust-current').value) || 0;
        const qty = parseFloat(e.target.value) || 0;
        document.getElementById('adjust-new').value = current + qty;
    }
});

function exportInventoryCSV() {
    const headers = ['SKU', 'Name', 'Category', 'Unit', 'Current Stock', 'Reorder Point', 'Reorder Qty', 'Last Purchase Price', 'Supplier'];
    const rows = appData.items.filter(i => i.is_active).map(item => [
        item.sku,
        `"${item.name}"`,
        `"${getCategoryName(item.category_id)}"`,
        `"${getUnitName(item.unit_id)}"`,
        item.current_stock,
        item.reorder_point,
        item.reorder_qty,
        item.last_purchase_price || 0,
        `"${getSupplierName(item.supplier_id)}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV('inventory_export.csv', csvContent);
    showToast('Export Complete', 'Inventory exported to CSV', 'success');
}

function downloadCSV(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// PURCHASE ORDERS RENDERER
// ============================================

function renderPurchaseOrders(container) {
    const role = currentUser.role;

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-file-invoice-dollar"></i> Purchase Orders</h1>
            <div class="page-header-actions">
                ${role !== 'stock_personnel' ? `
                    <button class="btn btn-primary" onclick="openCreatePOModal()">
                        <i class="fas fa-plus"></i> Create PO
                    </button>
                ` : ''}
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" data-tab="all" onclick="switchPOTab('all')">All</div>
            <div class="tab" data-tab="pending" onclick="switchPOTab('pending')">Pending</div>
            <div class="tab" data-tab="approved" onclick="switchPOTab('approved')">Approved</div>
            <div class="tab" data-tab="ordered" onclick="switchPOTab('ordered')">Ordered</div>
            <div class="tab" data-tab="receive_pending" onclick="switchPOTab('receive_pending')">Receive Pending</div>
            <div class="tab" data-tab="received" onclick="switchPOTab('received')">Received</div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table" id="po-table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Requester</th>
                                <th>Supplier</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="po-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    filterPOs('all');
}

function switchPOTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`)?.classList.add('active');
    filterPOs(tab);
}

function filterPOs(status) {
    let filtered = [...appData.purchase_orders];

    if (status !== 'all') {
        filtered = filtered.filter(po => po.status === status);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const tbody = document.getElementById('po-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><p>No purchase orders found</p></td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(po => {
        const poItems = appData.po_items.filter(pi => pi.po_id === po.id);
        const status = getPOStatusBadge(po.status);
        const canApprove = currentUser.role === 'owner' && po.status === 'pending';
        const canReceive = (currentUser.role === 'owner' || currentUser.role === 'manager' || currentUser.role === 'stock_personnel') && 
                           (po.status === 'approved' || po.status === 'ordered' || po.status === 'partial');
        const canRecordPayment = (currentUser.role === 'owner' || currentUser.role === 'manager') && 
                                 (po.status === 'approved' || po.status === 'ordered' || po.status === 'partial' || po.status === 'received');

        return `
            <tr>
                <td><strong>${po.po_number}</strong></td>
                <td>${getUserName(po.requester_id)}</td>
                <td>${getSupplierName(po.supplier_id)}</td>
                <td>${poItems.length} items</td>
                <td>${formatCurrency(po.total_amount)}</td>
                <td><span class="badge ${status.class}"><span class="badge-dot"></span>${status.label}</span></td>
                <td>${formatDate(po.created_at)}</td>
                <td>
                    ${canApprove ? `
                        <button class="btn btn-sm btn-primary" onclick="openApproveModal(${po.id})">
                            <i class="fas fa-check"></i> Review
                        </button>
                    ` : ''}
                    ${canReceive ? `
                        <button class="btn btn-sm btn-success" onclick="openReceiveModal(${po.id})">
                            <i class="fas fa-box-open"></i> Receive
                        </button>
                    ` : ''}
                    ${canRecordPayment ? `
                        <button class="btn btn-sm btn-outline" onclick="openRecordPaymentModal(${po.id})">
                            <i class="fas fa-money-bill-wave"></i> Payment
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline" onclick="viewPODetail(${po.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewPODetail(poId) {
    const po = appData.purchase_orders.find(p => p.id === poId);
    if (!po) return;

    const poItems = appData.po_items.filter(pi => pi.po_id === poId);
    const status = getPOStatusBadge(po.status);
    const payments = appData.payments.filter(p => p.po_id === poId);
    const receiveRequests = appData.receive_requests.filter(r => r.po_id === poId);

    document.getElementById('item-detail-title').innerHTML = `
        <i class="fas fa-file-invoice-dollar"></i> ${po.po_number}
        <span class="badge ${status.class}" style="margin-left: 12px; font-size: 12px;">${status.label}</span>
    `;

    let content = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Order Information</h4>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>Requester:</strong> ${getUserName(po.requester_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Approver:</strong> ${po.approver_id ? getUserName(po.approver_id) : 'Not yet approved'}</div>
                    <div style="margin-bottom: 8px;"><strong>Supplier:</strong> ${getSupplierName(po.supplier_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Created:</strong> ${formatDateTime(po.created_at)}</div>
                    <div><strong>Notes:</strong> ${po.requester_notes || 'No notes'}</div>
                </div>
            </div>
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Timeline</h4>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-dot completed"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Created</div>
                            <div class="timeline-meta">${formatDateTime(po.created_at)} by ${getUserName(po.requester_id)}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.submitted_at ? 'completed' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Submitted</div>
                            <div class="timeline-meta">${po.submitted_at ? formatDateTime(po.submitted_at) : 'Pending'}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.approved_at ? 'completed' : po.rejected_at ? 'completed' : po.status === 'pending' ? 'current' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">${po.rejected_at ? 'Rejected' : 'Approved'}</div>
                            <div class="timeline-meta">${po.approved_at ? formatDateTime(po.approved_at) + ' by ' + getUserName(po.approver_id) : po.rejected_at ? formatDateTime(po.rejected_at) : 'Pending'}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.ordered_at ? 'completed' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Ordered from Supplier</div>
                            <div class="timeline-meta">${po.ordered_at ? formatDateTime(po.ordered_at) : 'Pending'}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.received_at ? 'completed' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Received</div>
                            <div class="timeline-meta">${po.received_at ? formatDateTime(po.received_at) : 'Pending'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Items</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Requested</th>
                        <th>Approved</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Received</th>
                        <th>Stock Evidence</th>
                    </tr>
                </thead>
                <tbody>
                    ${poItems.map(pi => {
                        const item = appData.items.find(i => i.id === pi.item_id);
                        const hasAttachment = pi.remaining_stock_attachment;
                        return `
                            <tr>
                                <td>
                                    <strong>${item ? item.name : 'Unknown'}</strong>
                                    <div style="font-size: 12px; color: var(--text-muted)">${item ? item.sku : ''}</div>
                                </td>
                                <td>${pi.requested_qty} ${item ? getUnitAbbreviation(item.unit_id) : ''}</td>
                                <td>${pi.approved_qty || '-'} ${pi.approved_qty ? getUnitAbbreviation(item.unit_id) : ''}</td>
                                <td>${pi.unit_price ? formatCurrency(pi.unit_price) : '-'}</td>
                                <td>${pi.total_price ? formatCurrency(pi.total_price) : '-'}</td>
                                <td>${pi.received_qty} ${item ? getUnitAbbreviation(item.unit_id) : ''}</td>
                                <td>
                                    ${hasAttachment ? `
                                        <span class="attachment-badge"><i class="fas fa-paperclip"></i> ${hasAttachment}</span>
                                    ` : '<span style="color: var(--text-muted); font-size: 12px;">None</span>'}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        ${po.total_amount > 0 ? `
            <div style="margin-top: 20px; text-align: right; font-size: 16px;">
                <strong>Total Amount: ${formatCurrency(po.total_amount)}</strong>
            </div>
        ` : ''}
    `;

    if (payments.length > 0) {
        content += `
            <div style="margin-top: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">
                    <i class="fas fa-money-bill-wave"></i> Payment History
                </h4>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Date</th><th>Amount</th><th>Method</th><th>Notes</th><th>Attachment</th><th>By</th></tr>
                        </thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr>
                                    <td>${formatDate(p.payment_date)}</td>
                                    <td style="font-weight: 600;">${formatCurrency(p.amount)}</td>
                                    <td>${p.payment_method}</td>
                                    <td>${p.notes || '-'}</td>
                                    <td>
                                        ${p.attachment ? `<span class="attachment-badge"><i class="fas fa-paperclip"></i> ${p.attachment}</span>` : '-'}
                                    </td>
                                    <td>${getUserName(p.created_by)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    if (receiveRequests.length > 0) {
        content += `
            <div style="margin-top: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">
                    <i class="fas fa-box-open"></i> Receive Requests
                </h4>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Date</th><th>Status</th><th>Items</th><th>Attachment</th><th>By</th><th>Approved By</th></tr>
                        </thead>
                        <tbody>
                            ${receiveRequests.map(r => `
                                <tr>
                                    <td>${formatDateTime(r.created_at)}</td>
                                    <td><span class="badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'approved' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
                                    <td>${r.items.length} items</td>
                                    <td>
                                        ${r.attachment ? `<span class="attachment-badge"><i class="fas fa-paperclip"></i> ${r.attachment}</span>` : '-'}
                                    </td>
                                    <td>${getUserName(r.created_by)}</td>
                                    <td>${r.approved_by ? getUserName(r.approved_by) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    document.getElementById('item-detail-content').innerHTML = content;
    openModal('item-detail-modal');
}

// ============================================
// CREATE PO MODAL
// ============================================

function openCreatePOModal() {
    tempPOItems = [];

    const supplierSelect = document.getElementById('po-supplier');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
        appData.suppliers.filter(s => s.is_active).map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    const date = new Date();
    date.setDate(date.getDate() + 3);
    document.getElementById('po-delivery-date').value = date.toISOString().split('T')[0];
    document.getElementById('po-notes').value = '';
    updatePOItemsList();

    openModal('create-po-modal');
}

function updatePOItemsList() {
    const list = document.getElementById('po-items-list');
    if (tempPOItems.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No items added yet. Click "Add Item" to add items to this order.</p>';
        return;
    }

    list.innerHTML = tempPOItems.map((item, index) => {
        const dbItem = appData.items.find(i => i.id === item.item_id);
        const hasAttachment = item.remaining_stock_attachment;
        return `
            <div class="po-item-row">
                <div class="po-item-row-name">
                    <strong>${dbItem.name}</strong>
                    <div style="font-size: 11px; color: var(--text-muted)">${dbItem.sku}</div>
                </div>
                <div class="po-item-row-qty">
                    <input type="number" class="form-control" value="${item.qty}" min="1" 
                        onchange="updatePOItemQty(${index}, this.value)" style="width: 80px; text-align: center;">
                    <span style="font-size: 12px; color: var(--text-muted)">${getUnitAbbreviation(dbItem.unit_id)}</span>
                </div>
                <div class="po-item-row-price">
                    <input type="text" class="form-control" value="${item.notes}" placeholder="Notes"
                        onchange="updatePOItemNotes(${index}, this.value)" style="font-size: 12px;">
                </div>
                <div class="po-item-row-attach">
                    <button type="button" class="btn-attach" onclick="triggerPOItemAttachment(${index})" title="Attach Remaining Stock Photo">
                        <i class="fas fa-paperclip"></i>
                        ${hasAttachment ? `<span class="attach-filename">${hasAttachment}</span>` : ''}
                    </button>
                    <input type="file" id="po-item-attach-${index}" style="display:none" accept="image/*,.pdf" onchange="handlePOItemAttachment(${index}, this)">
                </div>
                <div class="po-item-row-remove" onclick="removePOItem(${index})">
                    <i class="fas fa-trash-alt"></i>
                </div>
            </div>
        `;
    }).join('');
}

function triggerPOItemAttachment(index) {
    const input = document.getElementById(`po-item-attach-${index}`);
    if (input) input.click();
}

function handlePOItemAttachment(index, input) {
    if (input.files && input.files[0]) {
        tempPOItems[index].remaining_stock_attachment = input.files[0].name;
        updatePOItemsList();
        showToast('Attachment', `File "${input.files[0].name}" attached to item`, 'success');
    }
}

function updatePOItemQty(index, qty) {
    tempPOItems[index].qty = parseFloat(qty) || 1;
}

function updatePOItemNotes(index, notes) {
    tempPOItems[index].notes = notes;
}

function removePOItem(index) {
    tempPOItems.splice(index, 1);
    updatePOItemsList();
}

function showAddItemToPO() {
    document.getElementById('po-item-search').value = '';
    document.getElementById('po-item-search-results').innerHTML = '';
    openModal('add-item-po-modal');
}

function closeAddItemModal() {
    document.getElementById('add-item-po-modal').classList.remove('active');
}

function searchItemsForPO() {
    const search = document.getElementById('po-item-search').value.toLowerCase();
    const results = document.getElementById('po-item-search-results');

    if (search.length < 1) {
        results.innerHTML = '';
        return;
    }

    const filtered = appData.items.filter(item => 
        item.is_active && 
        !tempPOItems.some(ti => ti.item_id === item.id) &&
        (item.name.toLowerCase().includes(search) || item.sku.toLowerCase().includes(search))
    ).slice(0, 10);

    if (filtered.length === 0) {
        results.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);">No items found</div>';
        return;
    }

    results.innerHTML = filtered.map(item => {
        const status = getItemStatus(item);
        return `
            <div class="po-search-result-item" onclick="addItemToTempPO(${item.id})">
                <div class="po-search-result-info">
                    <h4>${item.name}</h4>
                    <p>${item.sku} - ${getCategoryName(item.category_id)}</p>
                </div>
                <div class="po-search-result-stock">
                    <div class="stock-label">Stock</div>
                    <div class="stock-value ${status.level}">${item.current_stock}</div>
                </div>
            </div>
        `;
    }).join('');
}

function addItemToTempPO(itemId) {
    const item = appData.items.find(i => i.id === itemId);
    if (!item) return;

    tempPOItems.push({
        item_id: itemId,
        qty: item.reorder_qty || 10,
        notes: '',
        remaining_stock_attachment: null
    });

    closeAddItemModal();
    updatePOItemsList();
    showToast('Item Added', `${item.name} added to purchase order`, 'success');
}

function submitPO() {
    const supplierId = document.getElementById('po-supplier').value;
    const deliveryDate = document.getElementById('po-delivery-date').value;
    const notes = document.getElementById('po-notes').value;

    if (!supplierId) {
        showToast('Error', 'Please select a supplier', 'error');
        return;
    }

    if (tempPOItems.length === 0) {
        showToast('Error', 'Please add at least one item', 'error');
        return;
    }

    const newPO = {
        id: Math.max(...appData.purchase_orders.map(po => po.id), 0) + 1,
        po_number: generatePONumber(),
        requester_id: currentUser.id,
        requester_notes: notes,
        approver_id: null,
        approval_notes: null,
        supplier_id: parseInt(supplierId),
        status: 'pending',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        created_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        approved_at: null,
        rejected_at: null,
        ordered_at: null,
        expected_delivery: deliveryDate,
        received_at: null
    };

    appData.purchase_orders.push(newPO);

    tempPOItems.forEach((ti, index) => {
        appData.po_items.push({
            id: Math.max(...appData.po_items.map(pi => pi.id), 0) + 1 + index,
            po_id: newPO.id,
            item_id: ti.item_id,
            requested_qty: ti.qty,
            approved_qty: null,
            unit_price: null,
            total_price: null,
            received_qty: 0,
            notes: ti.notes,
            remaining_stock_attachment: ti.remaining_stock_attachment
        });
    });

    // Add notification for owner
    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: 1,
        type: 'po_pending',
        title: 'New PO Request',
        message: `${currentUser.name} submitted ${newPO.po_number} for approval`,
        reference_id: newPO.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Success', `Purchase Order ${newPO.po_number} created and submitted for approval`, 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    updateNotificationBadge();
}

// ============================================
// APPROVE PO MODAL
// ============================================

function openApproveModal(poId) {
    const po = appData.purchase_orders.find(p => p.id === poId);
    if (!po) return;

    currentPOForApproval = po;
    const poItems = appData.po_items.filter(pi => pi.po_id === poId);

    const content = document.getElementById('approve-po-content');
    content.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">Review Stock Before Approving</div>
                <div class="alert-text">Check current stock levels for each item and adjust quantities if needed.</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <strong>Requester:</strong> ${getUserName(po.requester_id)}<br>
            <strong>Supplier:</strong> ${getSupplierName(po.supplier_id)}<br>
            <strong>Notes:</strong> ${po.requester_notes || 'No notes'}
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Approval Notes</label>
            <textarea id="approval-notes" class="form-control" rows="2" placeholder="Add your notes here..."></textarea>
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Expected Delivery Date</label>
            <input type="date" id="approval-delivery-date" class="form-control" value="${po.expected_delivery || ''}">
        </div>

        <h4 style="margin-bottom: 12px;">Items to Approve</h4>
        ${poItems.map(pi => {
            const item = appData.items.find(i => i.id === pi.item_id);
            const status = getItemStatus(item);
            const hasAttachment = pi.remaining_stock_attachment;
            return `
                <div class="approval-item-row" data-item-id="${pi.item_id}">
                    <div class="approval-item-info">
                        <h4>${item.name}</h4>
                        <div class="stock-info">
                            Current: <span class="stock-text ${status.level}">${item.current_stock}</span> | 
                            Reorder Point: ${item.reorder_point} | 
                            Max: ${item.max_stock}
                        </div>
                        ${hasAttachment ? `<div class="attachment-badge-small"><i class="fas fa-paperclip"></i> ${hasAttachment}</div>` : ''}
                    </div>
                    <div class="approval-item-input">
                        <label>Requested</label>
                        <div style="font-weight: 600;">${pi.requested_qty}</div>
                    </div>
                    <div class="approval-item-input">
                        <label>Approve Qty</label>
                        <input type="number" class="approve-qty" value="${pi.requested_qty}" min="0" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Unit Price (₱)</label>
                        <input type="number" class="approve-price" value="${item.last_purchase_price || ''}" min="0" step="0.01" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Total</label>
                        <div class="approve-total" style="font-weight: 600;" data-item="${pi.item_id}">
                            ${formatCurrency((pi.requested_qty * (item.last_purchase_price || 0)))}
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;

    setTimeout(() => {
        document.querySelectorAll('.approve-qty, .approve-price').forEach(input => {
            input.addEventListener('input', updateApprovalTotals);
        });
    }, 100);

    openModal('approve-po-modal');
}

function updateApprovalTotals() {
    document.querySelectorAll('.approval-item-row').forEach(row => {
        const itemId = row.dataset.itemId;
        const qty = parseFloat(row.querySelector('.approve-qty').value) || 0;
        const price = parseFloat(row.querySelector('.approve-price').value) || 0;
        const total = qty * price;
        row.querySelector('.approve-total').textContent = formatCurrency(total);
    });
}

function approvePO() {
    if (!currentPOForApproval) return;

    const notes = document.getElementById('approval-notes').value;
    const deliveryDate = document.getElementById('approval-delivery-date').value;

    let totalAmount = 0;

    document.querySelectorAll('.approval-item-row').forEach(row => {
        const itemId = parseInt(row.dataset.itemId);
        const qty = parseFloat(row.querySelector('.approve-qty').value) || 0;
        const price = parseFloat(row.querySelector('.approve-price').value) || 0;
        const total = qty * price;

        const poItem = appData.po_items.find(pi => pi.po_id === currentPOForApproval.id && pi.item_id === itemId);
        if (poItem) {
            poItem.approved_qty = qty;
            poItem.unit_price = price;
            poItem.total_price = total;
        }

        totalAmount += total;
    });

    currentPOForApproval.status = 'approved';
    currentPOForApproval.approver_id = currentUser.id;
    currentPOForApproval.approval_notes = notes;
    currentPOForApproval.approved_at = new Date().toISOString();
    currentPOForApproval.total_amount = totalAmount;
    currentPOForApproval.expected_delivery = deliveryDate;

    // Add notification for requester
    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: currentPOForApproval.requester_id,
        type: 'po_approved',
        title: 'PO Approved',
        message: `Your ${currentPOForApproval.po_number} has been approved by ${currentUser.name}`,
        reference_id: currentPOForApproval.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Approved', `Purchase Order ${currentPOForApproval.po_number} has been approved`, 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    currentPOForApproval = null;
}

function rejectPO() {
    if (!currentPOForApproval) return;

    const notes = document.getElementById('approval-notes').value;

    currentPOForApproval.status = 'rejected';
    currentPOForApproval.approver_id = currentUser.id;
    currentPOForApproval.approval_notes = notes;
    currentPOForApproval.rejected_at = new Date().toISOString();

    // Add notification for requester
    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: currentPOForApproval.requester_id,
        type: 'po_rejected',
        title: 'PO Rejected',
        message: `Your ${currentPOForApproval.po_number} has been rejected by ${currentUser.name}`,
        reference_id: currentPOForApproval.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Rejected', `Purchase Order ${currentPOForApproval.po_number} has been rejected`, 'warning');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    currentPOForApproval = null;
}

// ============================================
// RECEIVE PO MODAL (Submit for Approval)
// ============================================

function openReceiveModal(poId) {
    const po = appData.purchase_orders.find(p => p.id === poId);
    if (!po) return;

    currentPOForReceive = po;
    const poItems = appData.po_items.filter(pi => pi.po_id === poId);

    const content = document.getElementById('receive-po-content');
    content.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-info-circle alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">Enter Actual Received Quantities</div>
                <div class="alert-text">Your entry will be submitted to the Owner for approval before inventory is updated.</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <strong>PO Number:</strong> ${po.po_number}<br>
            <strong>Supplier:</strong> ${getSupplierName(po.supplier_id)}<br>
            <strong>Expected Delivery:</strong> ${po.expected_delivery || 'Not specified'}
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Receipt Notes</label>
            <textarea id="receive-notes" class="form-control" rows="2" placeholder="Condition of items, any issues..."></textarea>
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Attachment (Delivery Receipt / Photo)</label>
            <div class="file-upload-area" onclick="document.getElementById('receive-attachment').click()">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Click to upload delivery receipt or photo</span>
                <input type="file" id="receive-attachment" style="display:none" accept="image/*,.pdf" onchange="handleReceiveAttachment(this)">
            </div>
            <div id="receive-attachment-name" style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);"></div>
        </div>

        <h4 style="margin-bottom: 12px;">Items Received</h4>
        ${poItems.map(pi => {
            const item = appData.items.find(i => i.id === pi.item_id);
            return `
                <div class="receive-item-row" data-item-id="${pi.item_id}">
                    <div class="approval-item-info">
                        <h4>${item.name}</h4>
                        <div class="stock-info">
                            Approved: ${pi.approved_qty || pi.requested_qty} ${getUnitAbbreviation(item.unit_id)} | 
                            Current Stock: ${item.current_stock}
                        </div>
                    </div>
                    <div class="approval-item-input">
                        <label>Qty Received</label>
                        <input type="number" class="receive-qty" value="${pi.approved_qty || pi.requested_qty}" min="0" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Unit Price</label>
                        <input type="number" class="receive-price" value="${pi.unit_price || item.last_purchase_price || 0}" min="0" step="0.01" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Batch No</label>
                        <input type="text" class="receive-batch" placeholder="Optional" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Expiry Date</label>
                        <input type="date" class="receive-expiry" data-item="${pi.item_id}">
                    </div>
                </div>
            `;
        }).join('')}
    `;

    openModal('receive-po-modal');
}

let receiveAttachmentFilename = null;

function handleReceiveAttachment(input) {
    if (input.files && input.files[0]) {
        receiveAttachmentFilename = input.files[0].name;
        document.getElementById('receive-attachment-name').innerHTML = `<i class="fas fa-paperclip"></i> ${input.files[0].name}`;
    }
}

function confirmReceivePO() {
    if (!currentPOForReceive) return;

    const notes = document.getElementById('receive-notes').value;
    let anyReceived = false;
    const receiveItems = [];

    document.querySelectorAll('.receive-item-row').forEach(row => {
        const itemId = parseInt(row.dataset.itemId);
        const receivedQty = parseFloat(row.querySelector('.receive-qty').value) || 0;
        const price = parseFloat(row.querySelector('.receive-price').value) || 0;
        const batchNo = row.querySelector('.receive-batch').value;
        const expiryDate = row.querySelector('.receive-expiry').value;

        if (receivedQty > 0) anyReceived = true;

        receiveItems.push({
            item_id: itemId,
            received_qty: receivedQty,
            unit_price: price,
            batch_no: batchNo,
            expiry_date: expiryDate
        });
    });

    if (!anyReceived) {
        showToast('Error', 'Please enter at least one received quantity', 'error');
        return;
    }

    const receiveRequest = {
        id: Math.max(...appData.receive_requests.map(r => r.id), 0) + 1,
        po_id: currentPOForReceive.id,
        items: receiveItems,
        notes: notes,
        attachment: receiveAttachmentFilename,
        status: 'pending',
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        approved_by: null,
        approved_at: null
    };

    appData.receive_requests.push(receiveRequest);

    // Update PO status
    currentPOForReceive.status = 'receive_pending';

    // Add notification for owner
    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: 1,
        type: 'receive_pending',
        title: 'Receive Request Pending',
        message: `${currentUser.name} submitted a receive request for ${currentPOForReceive.po_number} awaiting your approval`,
        reference_id: currentPOForReceive.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    receiveAttachmentFilename = null;
    saveAppData();
    closeModal();
    showToast('Submitted', `Receive request for ${currentPOForReceive.po_number} submitted for owner approval`, 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    currentPOForReceive = null;
    updateNotificationBadge();
}

// ============================================
// RECEIVE APPROVAL MODAL (Owner)
// ============================================

function openReceiveApprovalModal(requestId) {
    const req = appData.receive_requests.find(r => r.id === requestId);
    if (!req) return;

    currentReceiveRequestForApproval = req;
    const po = appData.purchase_orders.find(p => p.id === req.po_id);

    const content = document.getElementById('receive-approval-content');
    content.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">Review Received Quantities</div>
                <div class="alert-text">Verify the actual quantities received before updating inventory.</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <strong>PO Number:</strong> ${po ? po.po_number : 'Unknown'}<br>
            <strong>Received By:</strong> ${getUserName(req.created_by)}<br>
            <strong>Date:</strong> ${formatDateTime(req.created_at)}<br>
            <strong>Notes:</strong> ${req.notes || 'No notes'}
        </div>

        ${req.attachment ? `
            <div style="margin-bottom: 16px;">
                <strong>Attachment:</strong> <span class="attachment-badge"><i class="fas fa-paperclip"></i> ${req.attachment}</span>
            </div>
        ` : ''}

        <h4 style="margin-bottom: 12px;">Items Received</h4>
        ${req.items.map(item => {
            const dbItem = appData.items.find(i => i.id === item.item_id);
            const poItem = appData.po_items.find(pi => pi.po_id === req.po_id && pi.item_id === item.item_id);
            const approvedQty = poItem ? (poItem.approved_qty || poItem.requested_qty) : 0;
            return `
                <div class="approval-item-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                    <div class="approval-item-info">
                        <h4>${dbItem ? dbItem.name : 'Unknown'}</h4>
                        <div class="stock-info">
                            Approved Qty: ${approvedQty} | Current Stock: ${dbItem ? dbItem.current_stock : 0}
                        </div>
                    </div>
                    <div class="approval-item-input">
                        <label>Reported Received</label>
                        <div style="font-weight: 600;">${item.received_qty}</div>
                    </div>
                    <div class="approval-item-input">
                        <label>Approve Qty</label>
                        <input type="number" class="approve-receive-qty" value="${item.received_qty}" min="0" data-item="${item.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Unit Price</label>
                        <div>${formatCurrency(item.unit_price)}</div>
                    </div>
                    <div class="approval-item-input">
                        <label>Total</label>
                        <div class="approve-receive-total" style="font-weight: 600;" data-item="${item.item_id}">
                            ${formatCurrency(item.received_qty * item.unit_price)}
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;

    setTimeout(() => {
        document.querySelectorAll('.approve-receive-qty').forEach(input => {
            input.addEventListener('input', function() {
                const itemId = this.dataset.item;
                const qty = parseFloat(this.value) || 0;
                const item = req.items.find(i => i.item_id == itemId);
                if (item) {
                    const totalEl = document.querySelector(`.approve-receive-total[data-item="${itemId}"]`);
                    if (totalEl) totalEl.textContent = formatCurrency(qty * item.unit_price);
                }
            });
        });
    }, 100);

    openModal('receive-approval-modal');
}

function approveReceiveRequest() {
    if (!currentReceiveRequestForApproval) return;

    const req = currentReceiveRequestForApproval;
    const po = appData.purchase_orders.find(p => p.id === req.po_id);

    let allReceived = true;
    let anyReceived = false;
    let totalAmount = 0;

    document.querySelectorAll('.approve-receive-qty').forEach(input => {
        const itemId = parseInt(input.dataset.item);
        const approvedQty = parseFloat(input.value) || 0;

        const reqItem = req.items.find(i => i.item_id === itemId);
        const poItem = appData.po_items.find(pi => pi.po_id === req.po_id && pi.item_id === itemId);

        if (approvedQty > 0) {
            anyReceived = true;
            if (poItem) {
                poItem.received_qty = (poItem.received_qty || 0) + approvedQty;
                poItem.unit_price = reqItem.unit_price;
                poItem.total_price = approvedQty * reqItem.unit_price;

                const dbItem = appData.items.find(i => i.id === itemId);
                if (dbItem) {
                    const oldStock = dbItem.current_stock;
                    dbItem.current_stock = oldStock + approvedQty;
                    dbItem.last_purchase_price = reqItem.unit_price;

                    appData.stock_logs.push({
                        id: Math.max(...appData.stock_logs.map(l => l.id), 0) + 1,
                        item_id: itemId,
                        user_id: currentUser.id,
                        type: 'purchase',
                        quantity: approvedQty,
                        old_stock: oldStock,
                        new_stock: dbItem.current_stock,
                        reason: `PO ${po.po_number} received (approved)`,
                        po_id: req.po_id,
                        reference_no: po.po_number,
                        created_at: new Date().toISOString()
                    });
                }
            }
        }

        if (poItem && approvedQty < (poItem.approved_qty || poItem.requested_qty)) {
            allReceived = false;
        }

        totalAmount += approvedQty * reqItem.unit_price;
    });

    if (!anyReceived) {
        showToast('Error', 'Please approve at least one quantity', 'error');
        return;
    }

    req.status = 'approved';
    req.approved_by = currentUser.id;
    req.approved_at = new Date().toISOString();

    if (po) {
        const poItems = appData.po_items.filter(pi => pi.po_id === po.id);
        const totalApproved = poItems.reduce((sum, pi) => sum + (pi.approved_qty || pi.requested_qty || 0), 0);
        const totalReceived = poItems.reduce((sum, pi) => sum + (pi.received_qty || 0), 0);

        po.status = totalReceived >= totalApproved ? 'received' : 'partial';
        po.received_at = new Date().toISOString();
        po.total_amount = poItems.reduce((sum, pi) => sum + (pi.total_price || 0), 0);

        // Add notification for requester
        appData.notifications.push({
            id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
            user_id: req.created_by,
            type: 'po_received',
            title: 'Receive Request Approved',
            message: `Your receive request for ${po.po_number} has been approved by ${currentUser.name}. Inventory updated.`,
            reference_id: po.id,
            reference_type: 'purchase_order',
            is_read: false,
            created_at: new Date().toISOString()
        });
    }

    saveAppData();
    closeModal();
    showToast('Approved', 'Receive request approved and inventory updated', 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    } else if (currentPage === 'inventory') {
        filterInventory();
    }

    currentReceiveRequestForApproval = null;
    updateNotificationBadge();
}

function rejectReceiveRequest() {
    if (!currentReceiveRequestForApproval) return;

    const req = currentReceiveRequestForApproval;
    const po = appData.purchase_orders.find(p => p.id === req.po_id);

    req.status = 'rejected';
    req.approved_by = currentUser.id;
    req.approved_at = new Date().toISOString();

    if (po) {
        po.status = 'ordered';

        appData.notifications.push({
            id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
            user_id: req.created_by,
            type: 'receive_rejected',
            title: 'Receive Request Rejected',
            message: `Your receive request for ${po.po_number} has been rejected by ${currentUser.name}`,
            reference_id: po.id,
            reference_type: 'purchase_order',
            is_read: false,
            created_at: new Date().toISOString()
        });
    }

    saveAppData();
    closeModal();
    showToast('Rejected', 'Receive request has been rejected', 'warning');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    currentReceiveRequestForApproval = null;
    updateNotificationBadge();
}

// ============================================
// RECORD PAYMENT MODAL
// ============================================

function openRecordPaymentModal(poId) {
    const po = appData.purchase_orders.find(p => p.id === poId);
    if (!po) return;

    currentPOForPayment = po;
    document.getElementById('payment-amount').value = po.total_amount > 0 ? po.total_amount : '';
    document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('payment-method').value = 'Cash';
    document.getElementById('payment-notes').value = '';
    document.getElementById('payment-attachment-name').innerHTML = '';

    openModal('record-payment-modal');
}

let paymentAttachmentFilename = null;

function handlePaymentAttachment(input) {
    if (input.files && input.files[0]) {
        paymentAttachmentFilename = input.files[0].name;
        document.getElementById('payment-attachment-name').innerHTML = `<i class="fas fa-paperclip"></i> ${input.files[0].name}`;
    }
}

function submitPayment() {
    if (!currentPOForPayment) return;

    const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
    const paymentDate = document.getElementById('payment-date').value;
    const method = document.getElementById('payment-method').value;
    const notes = document.getElementById('payment-notes').value;

    if (amount <= 0) {
        showToast('Error', 'Please enter a valid amount', 'error');
        return;
    }

    const payment = {
        id: Math.max(...appData.payments.map(p => p.id), 0) + 1,
        po_id: currentPOForPayment.id,
        amount: amount,
        payment_date: paymentDate,
        payment_method: method,
        notes: notes,
        attachment: paymentAttachmentFilename,
        created_by: currentUser.id,
        created_at: new Date().toISOString()
    };

    appData.payments.push(payment);

    paymentAttachmentFilename = null;
    saveAppData();
    closeModal();
    showToast('Success', `Payment of ${formatCurrency(amount)} recorded for ${currentPOForPayment.po_number}`, 'success');

    currentPOForPayment = null;
}

// ============================================
// DAILY STOCK COUNT RENDERER
// ============================================

function renderDailyCount(container) {
    const today = new Date().toISOString().slice(0, 10);
    const countedItems = appData.daily_counts.filter(d => d.count_date === today).map(d => d.item_id);
    const totalItems = appData.items.filter(i => i.is_active).length;
    const countedCount = countedItems.length;

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-clipboard-check"></i> Daily Stock Count</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="submitDailyCount()">
                    <i class="fas fa-save"></i> Submit Counts
                </button>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: 500;">Progress: ${countedCount}/${totalItems} items counted</span>
                    <span style="font-weight: 600; color: var(--primary);">${totalItems > 0 ? Math.round((countedCount/totalItems)*100) : 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${totalItems > 0 ? (countedCount/totalItems)*100 : 0}%"></div>
                </div>
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="count-search" placeholder="Search items..." onkeyup="filterDailyCount()">
            </div>
            <select class="filter-select" id="count-category" onchange="filterDailyCount()">
                <option value="">All Categories</option>
                ${appData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
        </div>

        <div class="card">
            <div class="card-body">
                <div id="daily-count-list"></div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    renderDailyCountItems();
}

function renderDailyCountItems() {
    const list = document.getElementById('daily-count-list');
    if (!list) return;

    const search = document.getElementById('count-search')?.value.toLowerCase() || '';
    const category = document.getElementById('count-category')?.value || '';
    const today = new Date().toISOString().slice(0, 10);

    let items = appData.items.filter(i => i.is_active);

    if (search) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(search) || 
            item.sku.toLowerCase().includes(search)
        );
    }

    if (category) {
        items = items.filter(item => item.category_id === parseInt(category));
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No items found</p></div>';
        return;
    }

    list.innerHTML = `
        <div class="daily-count-item" style="font-weight: 600; background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: 8px;">
            <div>Item</div>
            <div style="text-align: center;">System Stock</div>
            <div style="text-align: center;">Actual Count</div>
            <div style="text-align: center;">Difference</div>
            <div style="text-align: center;">Status</div>
            <div></div>
        </div>
        ${items.map(item => {
            const existingCount = appData.daily_counts.find(d => d.item_id === item.id && d.count_date === today);
            const actualCount = existingCount ? existingCount.actual_count : '';
            const discrepancy = existingCount ? existingCount.discrepancy : 0;
            const hasDiscrepancy = discrepancy !== 0;
            const isCounted = existingCount !== undefined;

            return `
                <div class="daily-count-item" data-item-id="${item.id}">
                    <div>
                        <div class="daily-count-item-name">${item.name}</div>
                        <div class="daily-count-item-sku">${item.sku}</div>
                    </div>
                    <div style="text-align: center; font-weight: 500;">
                        ${item.current_stock}
                    </div>
                    <div>
                        <input type="number" 
                            class="daily-count-input" 
                            value="${actualCount}" 
                            placeholder="Enter count"
                            onchange="updateDailyCount(${item.id}, this.value)"
                            style="width: 100%; text-align: center;">
                    </div>
                    <div style="text-align: center; font-weight: 600; color: ${hasDiscrepancy ? (discrepancy < 0 ? 'var(--danger)' : 'var(--success)') : 'var(--text-secondary)'}">
                        ${isCounted ? (discrepancy > 0 ? '+' : '') + discrepancy : '-'}
                    </div>
                    <div style="text-align: center;">
                        ${isCounted ? 
                            (hasDiscrepancy ? 
                                '<span style="color: var(--warning);"><i class="fas fa-exclamation-triangle"></i></span>' : 
                                '<span style="color: var(--success);"><i class="fas fa-check-circle"></i></span>') 
                            : '<span style="color: var(--text-muted);"><i class="fas fa-minus-circle"></i></span>'}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline" onclick="viewItemDetail(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function filterDailyCount() {
    renderDailyCountItems();
}

function updateDailyCount(itemId, value) {
    const item = appData.items.find(i => i.id === itemId);
    if (!item) return;

    const actualCount = parseFloat(value);
    if (isNaN(actualCount)) return;

    const today = new Date().toISOString().slice(0, 10);
    const expectedStock = item.current_stock;
    const discrepancy = actualCount - expectedStock;

    const existingIndex = appData.daily_counts.findIndex(d => d.item_id === itemId && d.count_date === today);

    if (existingIndex >= 0) {
        appData.daily_counts[existingIndex].actual_count = actualCount;
        appData.daily_counts[existingIndex].discrepancy = discrepancy;
        appData.daily_counts[existingIndex].expected_stock = expectedStock;
    } else {
        appData.daily_counts.push({
            id: Math.max(...appData.daily_counts.map(d => d.id), 0) + 1,
            item_id: itemId,
            user_id: currentUser.id,
            count_date: today,
            expected_stock: expectedStock,
            actual_count: actualCount,
            discrepancy: discrepancy,
            notes: '',
            is_resolved: false,
            resolution_note: '',
            created_at: new Date().toISOString()
        });
    }

    // If there's a discrepancy, update actual stock
    if (discrepancy !== 0) {
        const oldStock = item.current_stock;
        item.current_stock = actualCount;

        appData.stock_logs.push({
            id: Math.max(...appData.stock_logs.map(l => l.id), 0) + 1,
            item_id: itemId,
            user_id: currentUser.id,
            type: 'daily_count',
            quantity: discrepancy,
            old_stock: oldStock,
            new_stock: actualCount,
            reason: 'Daily stock count adjustment',
            created_at: new Date().toISOString()
        });

        // Add notification for discrepancy
        if (Math.abs(discrepancy) >= 2) {
            appData.notifications.push({
                id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
                user_id: 1,
                type: 'stock_discrepancy',
                title: 'Stock Discrepancy Alert',
                message: `${item.name} count shows ${Math.abs(discrepancy)} unit${Math.abs(discrepancy) > 1 ? 's' : ''} ${discrepancy > 0 ? 'more' : 'less'} than expected`,
                reference_id: itemId,
                reference_type: 'item',
                is_read: false,
                created_at: new Date().toISOString()
            });
            updateNotificationBadge();
        }
    }

    saveAppData();
    renderDailyCountItems();

    if (discrepancy !== 0) {
        showToast('Discrepancy Found', `${item.name}: ${discrepancy > 0 ? '+' : ''}${discrepancy} units difference`, 'warning');
    }
}

function submitDailyCount() {
    const today = new Date().toISOString().slice(0, 10);
    const countedItems = appData.daily_counts.filter(d => d.count_date === today);
    const discrepancies = countedItems.filter(d => d.discrepancy !== 0);

    showToast('Daily Count Submitted', `${countedItems.length} items counted, ${discrepancies.length} discrepancies found`, 'success');
    navigateTo('dashboard');
}

function resolveDiscrepancy(countId) {
    const count = appData.daily_counts.find(d => d.id === countId);
    if (!count) return;

    count.is_resolved = true;
    count.resolution_note = 'Resolved by stock personnel';
    saveAppData();

    showToast('Resolved', 'Discrepancy marked as resolved', 'success');
    navigateTo('dashboard');
}

// ============================================
// SUPPLIERS RENDERER
// ============================================

function renderSuppliers(container) {
    const role = currentUser.role;
    const canManage = role === 'owner' || role === 'manager';

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-truck"></i> Suppliers</h1>
            <div class="page-header-actions">
                ${canManage ? `
                    <button class="btn btn-primary" onclick="openSupplierModal()">
                        <i class="fas fa-plus"></i> Add Supplier
                    </button>
                ` : ''}
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="supplier-search" placeholder="Search suppliers..." onkeyup="filterSuppliers()">
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table" id="supplier-table">
                        <thead>
                            <tr>
                                <th>Supplier Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="supplier-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    filterSuppliers();
}

function filterSuppliers() {
    const search = document.getElementById('supplier-search')?.value.toLowerCase() || '';
    const role = currentUser.role;
    const canManage = role === 'owner' || role === 'manager';

    let filtered = appData.suppliers.filter(s => s.is_active);

    if (search) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(search) || 
            s.contact_person.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search)
        );
    }

    const tbody = document.getElementById('supplier-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No suppliers found</p></td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(supplier => {
        const poCount = appData.purchase_orders.filter(po => po.supplier_id === supplier.id).length;
        return `
            <tr>
                <td>
                    <strong>${supplier.name}</strong>
                    <div style="font-size: 12px; color: var(--text-muted)">${poCount} purchase orders</div>
                </td>
                <td>${supplier.contact_person}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.address}</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewSupplierItems(${supplier.id})">
                        <i class="fas fa-boxes"></i> Items
                    </button>
                    ${canManage ? `
                        <button class="btn btn-sm btn-outline" onclick="openSupplierModal(${supplier.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function viewSupplierItems(supplierId) {
    const supplier = appData.suppliers.find(s => s.id === supplierId);
    const items = appData.items.filter(i => i.supplier_id === supplierId && i.is_active);
    const pos = appData.purchase_orders.filter(po => po.supplier_id === supplierId);

    document.getElementById('item-detail-title').innerHTML = `
        <i class="fas fa-truck"></i> ${supplier.name}
    `;

    document.getElementById('item-detail-content').innerHTML = `
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Supplier Information</h4>
            <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                <div style="margin-bottom: 8px;"><strong>Contact:</strong> ${supplier.contact_person}</div>
                <div style="margin-bottom: 8px;"><strong>Email:</strong> ${supplier.email}</div>
                <div style="margin-bottom: 8px;"><strong>Phone:</strong> ${supplier.phone}</div>
                <div><strong>Address:</strong> ${supplier.address}</div>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Supplied Items (${items.length})</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>Item</th><th>SKU</th><th>Current Stock</th><th>Reorder Point</th><th>Last Price</th></tr>
                </thead>
                <tbody>
                    ${items.map(item => {
                        const status = getItemStatus(item);
                        return `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.sku}</td>
                                <td><span class="stock-text ${status.level}">${item.current_stock}</span></td>
                                <td>${item.reorder_point}</td>
                                <td>${formatCurrency(item.last_purchase_price)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <h4 style="margin: 24px 0 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Purchase History (${pos.length} orders)</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>PO Number</th><th>Status</th><th>Total</th><th>Date</th></tr>
                </thead>
                <tbody>
                    ${pos.map(po => {
                        const status = getPOStatusBadge(po.status);
                        return `
                            <tr>
                                <td>${po.po_number}</td>
                                <td><span class="badge ${status.class}">${status.label}</span></td>
                                <td>${formatCurrency(po.total_amount)}</td>
                                <td>${formatDate(po.created_at)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    openModal('item-detail-modal');
}

function openSupplierModal(supplierId) {
    const isEdit = !!supplierId;
    const supplier = isEdit ? appData.suppliers.find(s => s.id === supplierId) : null;

    document.getElementById('supplier-modal-title').innerHTML = isEdit ? 
        `<i class="fas fa-edit"></i> Edit Supplier` : `<i class="fas fa-plus"></i> Add Supplier`;
    document.getElementById('supplier-modal-id').value = isEdit ? supplier.id : '';
    document.getElementById('supplier-name').value = isEdit ? supplier.name : '';
    document.getElementById('supplier-contact').value = isEdit ? supplier.contact_person : '';
    document.getElementById('supplier-email').value = isEdit ? supplier.email : '';
    document.getElementById('supplier-phone').value = isEdit ? supplier.phone : '';
    document.getElementById('supplier-address').value = isEdit ? supplier.address : '';

    openModal('supplier-modal');
}

function saveSupplierFromModal() {
    const id = document.getElementById('supplier-modal-id').value;
    const isEdit = !!id;

    const supplierData = {
        name: document.getElementById('supplier-name').value.trim(),
        contact_person: document.getElementById('supplier-contact').value.trim(),
        email: document.getElementById('supplier-email').value.trim(),
        phone: document.getElementById('supplier-phone').value.trim(),
        address: document.getElementById('supplier-address').value.trim(),
        is_active: true
    };

    if (!supplierData.name) {
        showToast('Error', 'Supplier name is required', 'error');
        return;
    }

    if (isEdit) {
        const supplier = appData.suppliers.find(s => s.id === parseInt(id));
        if (supplier) {
            Object.assign(supplier, supplierData);
            showToast('Success', `Supplier ${supplierData.name} updated`, 'success');
        }
    } else {
        const newId = Math.max(...appData.suppliers.map(s => s.id), 0) + 1;
        appData.suppliers.push({ id: newId, ...supplierData });
        showToast('Success', `Supplier ${supplierData.name} created`, 'success');
    }

    saveAppData();
    closeModal();
    filterSuppliers();
}

function deleteSupplier(supplierId) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    const supplier = appData.suppliers.find(s => s.id === supplierId);
    if (supplier) {
        supplier.is_active = false;
        saveAppData();
        showToast('Deleted', `${supplier.name} has been deleted`, 'warning');
        filterSuppliers();
    }
}

// ============================================
// REPORTS RENDERER
// ============================================

function renderReports(container) {
    let html = `
        <div class="page-header">
            <h1><i class="fas fa-chart-bar"></i> Reports</h1>
            <div class="page-header-actions">
                <button class="btn btn-outline" onclick="showToast('Export', 'Report exported to PDF', 'success')">
                    <i class="fas fa-download"></i> Export All
                </button>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" data-report="low-stock" onclick="switchReportTab('low-stock')">Low Stock</div>
            <div class="tab" data-report="po-summary" onclick="switchReportTab('po-summary')">PO Summary</div>
            <div class="tab" data-report="stock-movement" onclick="switchReportTab('stock-movement')">Stock Movement</div>
            <div class="tab" data-report="discrepancies" onclick="switchReportTab('discrepancies')">Discrepancies</div>
            <div class="tab" data-report="daily-inventory" onclick="switchReportTab('daily-inventory')">Daily Inventory</div>
            ${isProEnabled ? `
                <div class="tab" data-report="csv-history" onclick="switchReportTab('csv-history')">
                    <i class="fas fa-file-csv"></i> CSV History
                </div>
            ` : ''}
        </div>

        <div id="report-content"></div>
    `;

    container.innerHTML = html;
    renderReport('low-stock');
}

function switchReportTab(report) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-report="${report}"]`)?.classList.add('active');
    renderReport(report);
}

function renderReport(reportType) {
    const content = document.getElementById('report-content');
    if (!content) return;

    switch(reportType) {
        case 'low-stock': content.innerHTML = renderLowStockReport(); break;
        case 'po-summary': content.innerHTML = renderPOSummaryReport(); break;
        case 'stock-movement': content.innerHTML = renderStockMovementReport(); break;
        case 'discrepancies': content.innerHTML = renderDiscrepanciesReport(); break;
        case 'daily-inventory': content.innerHTML = renderDailyInventoryReport(); break;
        case 'csv-history': content.innerHTML = renderCSVHistoryReport(); break;
    }
}

function renderLowStockReport() {
    const lowStockItems = appData.items.filter(item => item.is_active && item.current_stock <= item.reorder_point);
    const totalCost = lowStockItems.reduce((sum, item) => sum + (item.reorder_qty * item.avg_purchase_price), 0);

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-exclamation-triangle"></i> Low Stock Report</h2>
                <div>
                    <span style="font-weight: 600; color: var(--danger);">${lowStockItems.length} items</span> below reorder point
                </div>
            </div>
            <div class="card-body">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">Estimated Cost to Replenish: ${formatCurrency(totalCost)}</div>
                        <div class="alert-text">Create purchase orders for these items to maintain optimal stock levels.</div>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Current Stock</th>
                                <th>Reorder Point</th>
                                <th>Shortage</th>
                                <th>Suggested Order</th>
                                <th>Est. Cost</th>
                                <th>Supplier</th>
                                <th>Last Purchase</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lowStockItems.map(item => {
                                const shortage = Math.max(0, item.reorder_point - item.current_stock);
                                const estCost = item.reorder_qty * item.avg_purchase_price;
                                return `
                                    <tr>
                                        <td>
                                            <strong>${item.name}</strong>
                                            <div style="font-size: 12px; color: var(--text-muted)">${item.sku}</div>
                                        </td>
                                        <td style="color: var(--danger); font-weight: 600;">${item.current_stock}</td>
                                        <td>${item.reorder_point}</td>
                                        <td style="color: var(--danger);">${shortage}</td>
                                        <td>${item.reorder_qty} ${getUnitAbbreviation(item.unit_id)}</td>
                                        <td>${formatCurrency(estCost)}</td>
                                        <td>${getSupplierName(item.supplier_id)}</td>
                                        <td>${item.last_purchase_price ? formatCurrency(item.last_purchase_price) : '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderPOSummaryReport() {
    const pos = appData.purchase_orders;
    const totalSpent = pos.filter(po => po.status === 'received').reduce((sum, po) => sum + po.total_amount, 0);
    const pendingValue = pos.filter(po => po.status === 'pending').reduce((sum, po) => sum + po.total_amount, 0);

    const statusCounts = {};
    pos.forEach(po => {
        statusCounts[po.status] = (statusCounts[po.status] || 0) + 1;
    });

    return `
        <div class="stats-grid" style="margin-bottom: 24px;">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total POs</div>
                    <div class="stat-card-icon blue"><i class="fas fa-file-invoice"></i></div>
                </div>
                <div class="stat-card-value">${pos.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total Spent</div>
                    <div class="stat-card-icon green"><i class="fas fa-money-bill-wave"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--success)">${formatCurrency(totalSpent)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Pending Value</div>
                    <div class="stat-card-icon orange"><i class="fas fa-clock"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--warning)">${formatCurrency(pendingValue)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Received</div>
                    <div class="stat-card-icon blue"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="stat-card-value">${statusCounts['received'] || 0}</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-list-alt"></i> Purchase Order Summary</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>PO Number</th><th>Requester</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th>Received</th></tr>
                        </thead>
                        <tbody>
                            ${pos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(po => {
                                const poItems = appData.po_items.filter(pi => pi.po_id === po.id);
                                const status = getPOStatusBadge(po.status);
                                return `
                                    <tr>
                                        <td><strong>${po.po_number}</strong></td>
                                        <td>${getUserName(po.requester_id)}</td>
                                        <td>${getSupplierName(po.supplier_id)}</td>
                                        <td>${poItems.length}</td>
                                        <td>${formatCurrency(po.total_amount)}</td>
                                        <td><span class="badge ${status.class}">${status.label}</span></td>
                                        <td>${formatDate(po.created_at)}</td>
                                        <td>${po.received_at ? formatDate(po.received_at) : '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderStockMovementReport() {
    const logs = appData.stock_logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-exchange-alt"></i> Stock Movement Report</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Date</th><th>Item</th><th>Type</th><th>Quantity</th><th>Old Stock</th><th>New Stock</th><th>Reason</th><th>By</th></tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => {
                                const item = appData.items.find(i => i.id === log.item_id);
                                return `
                                    <tr>
                                        <td>${formatDateTime(log.created_at)}</td>
                                        <td>${item ? item.name : 'Unknown'}</td>
                                        <td>
                                            <span class="badge ${log.type === 'purchase' ? 'badge-success' : log.type === 'sale' ? 'badge-danger' : log.type === 'daily_count' ? 'badge-warning' : log.type === 'csv_import' ? 'badge-pro' : 'badge-secondary'}">
                                                ${log.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td style="color: ${log.quantity > 0 ? 'var(--success)' : log.quantity < 0 ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: 600;">
                                            ${log.quantity > 0 ? '+' : ''}${log.quantity}
                                        </td>
                                        <td>${log.old_stock}</td>
                                        <td>${log.new_stock}</td>
                                        <td>${log.reason || '-'}</td>
                                        <td>${getUserName(log.user_id)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderDiscrepanciesReport() {
    const discrepancies = appData.daily_counts.filter(d => d.discrepancy !== 0).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-not-equal"></i> Stock Discrepancies Report</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Date</th><th>Item</th><th>Expected</th><th>Actual</th><th>Difference</th><th>Status</th><th>Notes</th><th>By</th></tr>
                        </thead>
                        <tbody>
                            ${discrepancies.map(d => {
                                const item = appData.items.find(i => i.id === d.item_id);
                                return `
                                    <tr>
                                        <td>${d.count_date}</td>
                                        <td>${item ? item.name : 'Unknown'}</td>
                                        <td>${d.expected_stock}</td>
                                        <td>${d.actual_count}</td>
                                        <td style="color: ${d.discrepancy < 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">
                                            ${d.discrepancy > 0 ? '+' : ''}${d.discrepancy}
                                        </td>
                                        <td>
                                            <span class="badge ${d.is_resolved ? 'badge-success' : 'badge-warning'}">
                                                ${d.is_resolved ? 'Resolved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>${d.notes || '-'}</td>
                                        <td>${getUserName(d.user_id)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderDailyInventoryReport() {
    const allDates = [...new Set(appData.daily_counts.map(d => d.count_date))].sort().reverse();
    const selectedDate = allDates[0] || new Date().toISOString().slice(0, 10);

    const countsForDate = appData.daily_counts.filter(d => d.count_date === selectedDate);
    const allItems = appData.items.filter(i => i.is_active);

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-clipboard-list"></i> Daily Inventory Records</h2>
                <div>
                    <span style="font-weight: 600; color: var(--primary);">${selectedDate}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">Daily Inventory Snapshot</div>
                        <div class="alert-text">Complete record of all items, their system stock, actual counts, and discrepancies for the selected date.</div>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>System Stock</th>
                                <th>Actual Count</th>
                                <th>Difference</th>
                                <th>Unit Price</th>
                                <th>Stock Value</th>
                                <th>Status</th>
                                <th>Counted By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allItems.map(item => {
                                const count = countsForDate.find(c => c.item_id === item.id);
                                const actualCount = count ? count.actual_count : item.current_stock;
                                const discrepancy = count ? count.discrepancy : 0;
                                const hasDiscrepancy = discrepancy !== 0;
                                const isCounted = count !== undefined;
                                const stockValue = actualCount * item.avg_purchase_price;
                                const status = getItemStatus(item);

                                return `
                                    <tr>
                                        <td>
                                            <strong>${item.name}</strong>
                                        </td>
                                        <td>${item.sku}</td>
                                        <td>${getCategoryName(item.category_id)}</td>
                                        <td>${item.current_stock}</td>
                                        <td style="font-weight: 600; ${!isCounted ? 'color: var(--text-muted);' : ''}">
                                            ${actualCount}
                                            ${!isCounted ? '<span style="font-size: 11px; font-weight: 400;"> (not counted)</span>' : ''}
                                        </td>
                                        <td style="color: ${hasDiscrepancy ? (discrepancy < 0 ? 'var(--danger)' : 'var(--success)') : 'var(--text-secondary)'}; font-weight: 600;">
                                            ${isCounted ? (discrepancy > 0 ? '+' : '') + discrepancy : '-'}
                                        </td>
                                        <td>${formatCurrency(item.avg_purchase_price)}</td>
                                        <td>${formatCurrency(stockValue)}</td>
                                        <td>
                                            <span class="badge ${status.class}">${status.label}</span>
                                        </td>
                                        <td>${count ? getUserName(count.user_id) : '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 16px; text-align: right; font-size: 14px; color: var(--text-secondary);">
                    <strong>Total Inventory Value: ${formatCurrency(allItems.reduce((sum, item) => {
                        const count = countsForDate.find(c => c.item_id === item.id);
                        const actualCount = count ? count.actual_count : item.current_stock;
                        return sum + (actualCount * item.avg_purchase_price);
                    }, 0))}</strong>
                </div>
            </div>
        </div>
    `;
}

function renderCSVHistoryReport() {
    const sessions = appData.csv_import_sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-file-csv"></i> CSV Import History</h2>
            </div>
            <div class="card-body">
                ${sessions.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-file-csv empty-state-icon" style="color: var(--pro);"></i>
                        <h3>No CSV Imports Yet</h3>
                        <p>Import your first POS CSV file from the Inventory page or CSV Import section.</p>
                    </div>
                ` : `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Filename</th>
                                    <th>Uploaded By</th>
                                    <th>Rows</th>
                                    <th>Changes</th>
                                    <th>Status</th>
                                    <th>Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sessions.map(session => {
                                    const statusClass = session.status === 'approved' ? 'badge-success' : session.status === 'rejected' ? 'badge-danger' : 'badge-warning';
                                    const summary = session.changes_summary || {};
                                    return `
                                        <tr>
                                            <td>${formatDateTime(session.created_at)}</td>
                                            <td><strong>${session.original_filename}</strong></td>
                                            <td>${getUserName(session.created_by)}</td>
                                            <td>${session.parsed_data ? session.parsed_data.length : 0}</td>
                                            <td>${summary.itemsWithChanges || 0} items changed</td>
                                            <td><span class="badge ${statusClass}">${session.status.replace(/_/g, ' ')}</span></td>
                                            <td>${session.approved_by ? getUserName(session.approved_by) : '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ============================================
// SETTINGS RENDERER
// ============================================

function renderSettings(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-cog"></i> Settings</h1>
        </div>

        <div class="settings-tabs">
            <div class="settings-tab active" data-settings-tab="profile" onclick="switchSettingsTab('profile')">
                <i class="fas fa-user"></i> Profile
            </div>
            <div class="settings-tab" data-settings-tab="categories" onclick="switchSettingsTab('categories')">
                <i class="fas fa-tags"></i> Categories
            </div>
            <div class="settings-tab" data-settings-tab="units" onclick="switchSettingsTab('units')">
                <i class="fas fa-ruler"></i> Units
            </div>
            <div class="settings-tab" data-settings-tab="suppliers" onclick="switchSettingsTab('suppliers')">
                <i class="fas fa-truck"></i> Suppliers
            </div>
            <div class="settings-tab" data-settings-tab="pro" onclick="switchSettingsTab('pro')">
                <i class="fas fa-star"></i> Pro Features
            </div>
        </div>

        <div id="settings-content"></div>
    `;

    renderProfileSettings();
}

function switchSettingsTab(tab) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.settings-tab[data-settings-tab="${tab}"]`)?.classList.add('active');

    switch(tab) {
        case 'profile': renderProfileSettings(); break;
        case 'categories': renderCategoriesSettings(); break;
        case 'units': renderUnitsSettings(); break;
        case 'suppliers': renderSuppliersSettings(); break;
        case 'pro': renderProSettings(); break;
    }
}

function renderProfileSettings() {
    const content = document.getElementById('settings-content');
    content.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-user"></i> My Profile</h2>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" class="form-control" value="${currentUser.name}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" value="${currentUser.email}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <input type="text" class="form-control" value="${currentUser.roleLabel}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" class="form-control" value="09123456789" readonly>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-bell"></i> Notification Settings</h2>
            </div>
            <div class="card-body">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">Email Notifications</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Receive email alerts for important events</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">Low Stock Alerts</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Get notified when items are below reorder point</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">PO Status Updates</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Notifications for purchase order changes</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">Receive Request Alerts</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Get notified when receive requests need approval</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-shield-alt"></i> Security</h2>
            </div>
            <div class="card-body">
                <button class="btn btn-outline" onclick="showToast('Coming Soon', 'Password change will be available soon', 'info')">
                    <i class="fas fa-key"></i> Change Password
                </button>
            </div>
        </div>
    `;
}

function renderCategoriesSettings() {
    const content = document.getElementById('settings-content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-tags"></i> Categories</h2>
                <button class="btn btn-primary btn-sm" onclick="openCategoryModal()">
                    <i class="fas fa-plus"></i> Add Category
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Name</th><th>Description</th><th>Items</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${appData.categories.map(c => {
                                const itemCount = appData.items.filter(i => i.category_id === c.id && i.is_active).length;
                                return `
                                    <tr>
                                        <td><strong>${c.name}</strong></td>
                                        <td>${c.description || '-'}</td>
                                        <td>${itemCount} items</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="openCategoryModal(${c.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline" onclick="deleteCategory(${c.id})" style="color: var(--danger);">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function openCategoryModal(categoryId) {
    const isEdit = !!categoryId;
    const category = isEdit ? appData.categories.find(c => c.id === categoryId) : null;

    document.getElementById('category-modal-title').innerHTML = isEdit ? 
        `<i class="fas fa-edit"></i> Edit Category` : `<i class="fas fa-plus"></i> Add Category`;
    document.getElementById('category-modal-id').value = isEdit ? category.id : '';
    document.getElementById('category-name').value = isEdit ? category.name : '';
    document.getElementById('category-description').value = isEdit ? category.description : '';

    openModal('category-modal');
}

function saveCategory() {
    const id = document.getElementById('category-modal-id').value;
    const isEdit = !!id;

    const name = document.getElementById('category-name').value.trim();
    const description = document.getElementById('category-description').value.trim();

    if (!name) {
        showToast('Error', 'Category name is required', 'error');
        return;
    }

    if (isEdit) {
        const category = appData.categories.find(c => c.id === parseInt(id));
        if (category) {
            category.name = name;
            category.description = description;
            showToast('Success', `Category ${name} updated`, 'success');
        }
    } else {
        const newId = Math.max(...appData.categories.map(c => c.id), 0) + 1;
        appData.categories.push({ id: newId, name, description });
        showToast('Success', `Category ${name} created`, 'success');
    }

    saveAppData();
    closeModal();
    renderCategoriesSettings();
}

function deleteCategory(categoryId) {
    if (!confirm('Are you sure? This may affect items using this category.')) return;
    const category = appData.categories.find(c => c.id === categoryId);
    if (category) {
        const index = appData.categories.indexOf(category);
        appData.categories.splice(index, 1);
        saveAppData();
        showToast('Deleted', `${category.name} removed`, 'warning');
        renderCategoriesSettings();
    }
}

function renderUnitsSettings() {
    const content = document.getElementById('settings-content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-ruler"></i> Units of Measure</h2>
                <button class="btn btn-primary btn-sm" onclick="openUnitModal()">
                    <i class="fas fa-plus"></i> Add Unit
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Name</th><th>Abbreviation</th><th>Items</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${appData.units.map(u => {
                                const itemCount = appData.items.filter(i => i.unit_id === u.id && i.is_active).length;
                                return `
                                    <tr>
                                        <td><strong>${u.name}</strong></td>
                                        <td><code>${u.abbreviation}</code></td>
                                        <td>${itemCount} items</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="openUnitModal(${u.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline" onclick="deleteUnit(${u.id})" style="color: var(--danger);">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function openUnitModal(unitId) {
    const isEdit = !!unitId;
    const unit = isEdit ? appData.units.find(u => u.id === unitId) : null;

    document.getElementById('unit-modal-title').innerHTML = isEdit ? 
        `<i class="fas fa-edit"></i> Edit Unit` : `<i class="fas fa-plus"></i> Add Unit`;
    document.getElementById('unit-modal-id').value = isEdit ? unit.id : '';
    document.getElementById('unit-name').value = isEdit ? unit.name : '';
    document.getElementById('unit-abbreviation').value = isEdit ? unit.abbreviation : '';

    openModal('unit-modal');
}

function saveUnit() {
    const id = document.getElementById('unit-modal-id').value;
    const isEdit = !!id;

    const name = document.getElementById('unit-name').value.trim();
    const abbreviation = document.getElementById('unit-abbreviation').value.trim();

    if (!name || !abbreviation) {
        showToast('Error', 'Name and abbreviation are required', 'error');
        return;
    }

    if (isEdit) {
        const unit = appData.units.find(u => u.id === parseInt(id));
        if (unit) {
            unit.name = name;
            unit.abbreviation = abbreviation;
            showToast('Success', `Unit ${name} updated`, 'success');
        }
    } else {
        const newId = Math.max(...appData.units.map(u => u.id), 0) + 1;
        appData.units.push({ id: newId, name, abbreviation });
        showToast('Success', `Unit ${name} created`, 'success');
    }

    saveAppData();
    closeModal();
    renderUnitsSettings();
}

function deleteUnit(unitId) {
    if (!confirm('Are you sure? This may affect items using this unit.')) return;
    const unit = appData.units.find(u => u.id === unitId);
    if (unit) {
        const index = appData.units.indexOf(unit);
        appData.units.splice(index, 1);
        saveAppData();
        showToast('Deleted', `${unit.name} removed`, 'warning');
        renderUnitsSettings();
    }
}

function renderSuppliersSettings() {
    const content = document.getElementById('settings-content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-truck"></i> Suppliers</h2>
                <button class="btn btn-primary btn-sm" onclick="openSupplierModal()">
                    <i class="fas fa-plus"></i> Add Supplier
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${appData.suppliers.map(s => `
                                <tr>
                                    <td><strong>${s.name}</strong></td>
                                    <td>${s.contact_person || '-'}</td>
                                    <td>${s.email || '-'}</td>
                                    <td>${s.phone || '-'}</td>
                                    <td><span class="badge ${s.is_active ? 'badge-success' : 'badge-secondary'}">${s.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="openSupplierModal(${s.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline" onclick="deleteSupplier(${s.id})" style="color: var(--danger);">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderProSettings() {
    const content = document.getElementById('settings-content');
    content.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-star"></i> Pro Mode</h2>
            </div>
            <div class="card-body">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">Enable Pro Features</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Unlock CSV Import/Export functionality for POS integration</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${isProEnabled ? 'checked' : ''} onchange="toggleProModeFromSettings(this)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="alert ${isProEnabled ? 'alert-pro' : 'alert-info'}">
                    <i class="fas ${isProEnabled ? 'fa-star' : 'fa-info-circle'} alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">${isProEnabled ? 'Pro Mode is Active' : 'Pro Mode is Disabled'}</div>
                        <div class="alert-text">
                            ${isProEnabled ? 
                                'You now have access to: POS CSV Import with adaptive column detection, manual column mapping, import preview with before/after comparison, owner approval workflow for imports, and CSV export of current inventory.' : 
                                'Enable Pro Mode to access advanced CSV Import/Export features for POS system integration.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${isProEnabled ? `
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-file-csv"></i> CSV Import Features</h2>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <i class="fas fa-upload" style="font-size: 24px; color: var(--pro); margin-bottom: 8px;"></i>
                            <div style="font-weight: 600; margin-bottom: 4px;">Adaptive Column Detection</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">System auto-detects SKU, Name, Qty, and Price columns from any CSV format.</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <i class="fas fa-columns" style="font-size: 24px; color: var(--pro); margin-bottom: 8px;"></i>
                            <div style="font-weight: 600; margin-bottom: 4px;">Manual Column Mapping</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Review and adjust auto-detected mappings before importing.</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <i class="fas fa-eye" style="font-size: 24px; color: var(--pro); margin-bottom: 8px;"></i>
                            <div style="font-weight: 600; margin-bottom: 4px;">Import Preview</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">See current vs imported stock with highlighted changes before approval.</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <i class="fas fa-check-double" style="font-size: 24px; color: var(--pro); margin-bottom: 8px;"></i>
                            <div style="font-weight: 600; margin-bottom: 4px;">Owner Approval</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">All CSV imports require owner approval before inventory is updated.</div>
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

function toggleProModeFromSettings(checkbox) {
    isProEnabled = checkbox.checked;
    document.getElementById('pro-toggle-input').checked = isProEnabled;
    saveAppData();
    updateProUI();
    showToast(isProEnabled ? 'Pro Mode Enabled' : 'Pro Mode Disabled', 
              isProEnabled ? 'CSV Import/Export features are now available.' : 'CSV features have been hidden.', 
              isProEnabled ? 'pro' : 'info');
    renderProSettings();
    updateSidebarVisibility();
}

// ============================================
// CSV IMPORT (PRO FEATURES)
// ============================================

function renderCSVImport(container) {
    if (!isProEnabled) {
        container.innerHTML = `
            <div class="pro-feature-card">
                <i class="fas fa-lock"></i>
                <h3>Pro Feature Locked</h3>
                <p>CSV Import/Export is a Pro feature. Enable it in Settings to unlock POS integration.</p>
                <button class="btn btn-primary" onclick="navigateTo('settings'); setTimeout(() => switchSettingsTab('pro'), 100);">
                    <i class="fas fa-cog"></i> Go to Settings
                </button>
            </div>
        `;
        return;
    }

    const pendingImports = appData.csv_import_sessions.filter(s => s.status === 'pending_approval');
    const history = appData.csv_import_sessions.filter(s => s.status !== 'pending_approval').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-file-csv"></i> CSV Import</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openCSVImportModal()">
                    <i class="fas fa-upload"></i> Import CSV
                </button>
            </div>
        </div>

        <div class="stats-grid" style="margin-bottom: 24px;">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total Imports</div>
                    <div class="stat-card-icon purple"><i class="fas fa-file-csv"></i></div>
                </div>
                <div class="stat-card-value">${appData.csv_import_sessions.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Pending Approval</div>
                    <div class="stat-card-icon orange"><i class="fas fa-clock"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--warning)">${pendingImports.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Approved</div>
                    <div class="stat-card-icon green"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--success)">${appData.csv_import_sessions.filter(s => s.status === 'approved').length}</div>
            </div>
        </div>
    `;

    if (currentUser.role === 'owner' && pendingImports.length > 0) {
        html += `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-clipboard-check"></i> Pending CSV Import Approvals</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>Filename</th><th>Uploaded By</th><th>Rows</th><th>Changes</th><th>Date</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${pendingImports.map(session => {
                                    const summary = session.changes_summary || {};
                                    return `
                                        <tr>
                                            <td><strong>${session.original_filename}</strong></td>
                                            <td>${getUserName(session.created_by)}</td>
                                            <td>${session.parsed_data ? session.parsed_data.length : 0} rows</td>
                                            <td>${summary.itemsWithChanges || 0} items changed</td>
                                            <td>${formatDate(session.created_at)}</td>
                                            <td>
                                                <button class="btn btn-primary btn-sm" onclick="openCSVApprovalModal(${session.id})">
                                                    <i class="fas fa-check"></i> Review
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    html += `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-history"></i> Import History</h2>
            </div>
            <div class="card-body">
                ${history.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-file-csv empty-state-icon" style="color: var(--pro);"></i>
                        <h3>No Import History</h3>
                        <p>Your CSV import history will appear here.</p>
                    </div>
                ` : `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr><th>Date</th><th>Filename</th><th>Uploaded By</th><th>Rows</th><th>Status</th><th>Approved By</th></tr>
                            </thead>
                            <tbody>
                                ${history.map(session => {
                                    const statusClass = session.status === 'approved' ? 'badge-success' : session.status === 'rejected' ? 'badge-danger' : 'badge-secondary';
                                    return `
                                        <tr>
                                            <td>${formatDateTime(session.created_at)}</td>
                                            <td><strong>${session.original_filename}</strong></td>
                                            <td>${getUserName(session.created_by)}</td>
                                            <td>${session.parsed_data ? session.parsed_data.length : 0}</td>
                                            <td><span class="badge ${statusClass}">${session.status.replace(/_/g, ' ')}</span></td>
                                            <td>${session.approved_by ? getUserName(session.approved_by) : '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// CSV Parser
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    result.push(current);
    return result;
}

function parseCSVText(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] !== undefined ? values[idx].trim() : '';
            });
            rows.push(row);
        }
    }

    return { headers, rows };
}

function suggestColumnMapping(header) {
    const h = header.toLowerCase().replace(/[_\-\s]/g, '');

    if (/^(sku|itemcode|productcode|code|barcode|upc|itemno|item#|prodcode)$/.test(h)) return 'sku';
    if (/^(name|productname|itemname|description|product|itemdesc|prodname)$/.test(h)) return 'name';
    if (/^(qty|quantity|stock|onhand|inventory|count|currentstock|available|qtyonhand|instock)$/.test(h)) return 'current_stock';
    if (/^(price|cost|unitprice|purchaseprice|buyingprice|sellprice|retailprice|wholesale)$/.test(h)) return 'last_purchase_price';
    if (/^(category|type|group|department|producttype)$/.test(h)) return 'category';
    if (/^(unit|uom|measurement|packaging|unitofmeasure)$/.test(h)) return 'unit';
    if (/^(supplier|vendor|source|distributor|manufacturer)$/.test(h)) return 'supplier';
    if (/^(reorder|minstock|minimum|threshold|reorderpoint|safetystock)$/.test(h)) return 'reorder_point';

    return null;
}

function detectColumns(headers, rows) {
    return headers.map(header => {
        const suggested = suggestColumnMapping(header);
        let confidence = 0;

        if (suggested) {
            confidence = 0.85;
            const samples = rows.slice(0, 5).map(r => r[header]).filter(v => v !== '');
            if (samples.length > 0) {
                if (suggested === 'current_stock' || suggested === 'last_purchase_price' || suggested === 'reorder_point') {
                    const allNumeric = samples.every(v => !isNaN(parseFloat(v)) && isFinite(v));
                    if (allNumeric) confidence = 0.95;
                    else confidence = 0.6;
                } else if (suggested === 'sku') {
                    const hasCodes = samples.every(v => v.length > 0);
                    if (hasCodes) confidence = 0.92;
                } else {
                    confidence = 0.88;
                }
            }
        } else {
            confidence = 0.2;
        }

        return {
            header,
            sample: rows[0] ? rows[0][header] : '',
            confidence,
            suggestedMapping: suggested
        };
    });
}

function openCSVImportModal() {
    csvImportState = {
        fileContent: null,
        filename: null,
        headers: [],
        rows: [],
        detectedColumns: [],
        userMappings: {},
        previewData: [],
        summary: null,
        sessionId: null
    };

    document.getElementById('csv-file-name').innerHTML = '';
    document.getElementById('csv-upload-btn').disabled = true;
    openModal('csv-import-modal');
}

function handleCSVUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        csvImportState.filename = file.name;
        document.getElementById('csv-file-name').innerHTML = `<i class="fas fa-file-csv"></i> ${file.name}`;
        document.getElementById('csv-upload-btn').disabled = false;

        const reader = new FileReader();
        reader.onload = function(e) {
            csvImportState.fileContent = e.target.result;
        };
        reader.readAsText(file);
    }
}

function processCSVUpload() {
    if (!csvImportState.fileContent) {
        showToast('Error', 'Please select a CSV file first', 'error');
        return;
    }

    const parsed = parseCSVText(csvImportState.fileContent);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        showToast('Error', 'Invalid or empty CSV file', 'error');
        return;
    }

    csvImportState.headers = parsed.headers;
    csvImportState.rows = parsed.rows;
    csvImportState.detectedColumns = detectColumns(parsed.headers, parsed.rows);

    // Pre-populate mappings with detected suggestions
    csvImportState.userMappings = {};
    csvImportState.detectedColumns.forEach(col => {
        if (col.suggestedMapping) {
            csvImportState.userMappings[col.suggestedMapping] = col.header;
        }
    });

    showCSVMapping();
}

function showCSVMapping() {
    const content = document.getElementById('csv-mapping-content');
    const mappingOptions = [
        { value: '', label: '-- Not Mapped --' },
        { value: 'sku', label: 'SKU / Item Code' },
        { value: 'name', label: 'Product Name' },
        { value: 'current_stock', label: 'Stock Quantity' },
        { value: 'last_purchase_price', label: 'Unit Price / Cost' },
        { value: 'category', label: 'Category' },
        { value: 'unit', label: 'Unit of Measure' },
        { value: 'supplier', label: 'Supplier' },
        { value: 'reorder_point', label: 'Reorder Point' }
    ];

    content.innerHTML = `
        <div class="csv-mapping-header">
            <div>CSV Header</div>
            <div>Sample Data</div>
            <div>Map To</div>
            <div>Confidence</div>
        </div>
        ${csvImportState.detectedColumns.map(col => {
            const confidenceClass = col.confidence >= 0.85 ? 'high' : col.confidence >= 0.5 ? 'medium' : 'low';
            return `
                <div class="csv-mapping-row">
                    <div><strong>${col.header}</strong></div>
                    <div class="csv-mapping-sample">${col.sample || '<span style="color:var(--text-muted)">empty</span>'}</div>
                    <div>
                        <select class="form-control csv-mapping-select" data-header="${col.header}" onchange="updateCSVMapping('${col.header}', this.value)">
                            ${mappingOptions.map(opt => `
                                <option value="${opt.value}" ${csvImportState.userMappings[opt.value] === col.header ? 'selected' : ''}>${opt.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="csv-mapping-confidence ${confidenceClass}">
                        ${col.confidence >= 0.85 ? '<i class="fas fa-check-circle"></i> ' : ''}
                        ${Math.round(col.confidence * 100)}%
                    </div>
                </div>
            `;
        }).join('')}
    `;

    closeModal();
    openModal('csv-mapping-modal');
}

function updateCSVMapping(header, value) {
    // Remove any existing mapping for this value
    Object.keys(csvImportState.userMappings).forEach(key => {
        if (csvImportState.userMappings[key] === header && key !== value) {
            delete csvImportState.userMappings[key];
        }
    });

    if (value) {
        csvImportState.userMappings[value] = header;
    } else {
        Object.keys(csvImportState.userMappings).forEach(key => {
            if (csvImportState.userMappings[key] === header) {
                delete csvImportState.userMappings[key];
            }
        });
    }
}

function applyColumnMapping() {
    // Validate required mappings
    if (!csvImportState.userMappings.sku && !csvImportState.userMappings.name) {
        showToast('Error', 'Please map at least SKU or Name column', 'error');
        return;
    }
    if (!csvImportState.userMappings.current_stock) {
        showToast('Error', 'Please map Stock Quantity column', 'error');
        return;
    }

    generateCSVPreview();
}

function generateCSVPreview() {
    const mappings = csvImportState.userMappings;
    const preview = [];
    let matchedItems = 0;
    let newItems = 0;
    let itemsWithChanges = 0;
    let totalValueChange = 0;

    csvImportState.rows.forEach((row, idx) => {
        const sku = mappings.sku ? row[mappings.sku] : '';
        const name = mappings.name ? row[mappings.name] : '';
        const stockStr = mappings.current_stock ? row[mappings.current_stock] : '';
        const priceStr = mappings.last_purchase_price ? row[mappings.last_purchase_price] : '';

        const newStock = parseFloat(stockStr) || 0;
        const unitPrice = parseFloat(priceStr) || 0;

        // Try to match by SKU first, then by name
        let matchedItem = null;
        if (sku) {
            matchedItem = appData.items.find(i => i.sku.toLowerCase() === sku.toLowerCase());
        }
        if (!matchedItem && name) {
            matchedItem = appData.items.find(i => i.name.toLowerCase() === name.toLowerCase());
        }

        const currentStock = matchedItem ? matchedItem.current_stock : 0;
        const difference = newStock - currentStock;

        if (matchedItem) {
            matchedItems++;
            if (difference !== 0) itemsWithChanges++;
        } else {
            newItems++;
        }

        totalValueChange += difference * unitPrice;

        preview.push({
            rowIndex: idx,
            sku: sku || '',
            name: name || '',
            currentStock,
            newStock,
            difference,
            unitPrice,
            matchedItemId: matchedItem ? matchedItem.id : null,
            matchType: matchedItem ? (sku && matchedItem.sku.toLowerCase() === sku.toLowerCase() ? 'sku_exact' : 'name_match') : 'new_item'
        });
    });

    csvImportState.previewData = preview;
    csvImportState.summary = {
        totalRows: csvImportState.rows.length,
        matchedItems,
        newItems,
        itemsWithChanges,
        totalValueChange
    };

    showCSVPreview();
}

function showCSVPreview() {
    const summary = csvImportState.summary;
    const preview = csvImportState.previewData;

    document.getElementById('csv-preview-summary').innerHTML = `
        <div class="csv-preview-stat neutral">
            <div class="csv-preview-stat-value">${summary.totalRows}</div>
            <div class="csv-preview-stat-label">Total Rows</div>
        </div>
        <div class="csv-preview-stat neutral">
            <div class="csv-preview-stat-value">${summary.matchedItems}</div>
            <div class="csv-preview-stat-label">Matched Items</div>
        </div>
        <div class="csv-preview-stat ${summary.newItems > 0 ? 'positive' : 'neutral'}">
            <div class="csv-preview-stat-value">${summary.newItems}</div>
            <div class="csv-preview-stat-label">New Items</div>
        </div>
        <div class="csv-preview-stat ${summary.itemsWithChanges > 0 ? 'negative' : 'neutral'}">
            <div class="csv-preview-stat-value">${summary.itemsWithChanges}</div>
            <div class="csv-preview-stat-label">Items Changed</div>
        </div>
        <div class="csv-preview-stat ${summary.totalValueChange > 0 ? 'positive' : summary.totalValueChange < 0 ? 'negative' : 'neutral'}">
            <div class="csv-preview-stat-value">${formatCurrency(Math.abs(summary.totalValueChange))}</div>
            <div class="csv-preview-stat-label">Value Impact</div>
        </div>
    `;

    const table = document.getElementById('csv-preview-table');
    table.querySelector('thead').innerHTML = `
        <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Current Stock</th>
            <th>New Stock</th>
            <th>Difference</th>
            <th>Unit Price</th>
            <th>Match Type</th>
        </tr>
    `;

    table.querySelector('tbody').innerHTML = preview.map(p => {
        const isNew = p.matchType === 'new_item';
        const hasChange = p.difference !== 0;
        const rowClass = isNew ? 'csv-row-new' : hasChange ? 'csv-row-highlight' : '';

        return `
            <tr class="${rowClass}">
                <td>${p.sku || '<span style="color:var(--text-muted)">-</span>'}</td>
                <td>${p.name || '<span style="color:var(--text-muted)">-</span>'}</td>
                <td>${p.currentStock}</td>
                <td style="font-weight: 600;">${p.newStock}</td>
                <td style="color: ${p.difference > 0 ? 'var(--success)' : p.difference < 0 ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: 600;">
                    ${p.difference > 0 ? '+' : ''}${p.difference}
                </td>
                <td>${formatCurrency(p.unitPrice)}</td>
                <td>
                    <span class="badge ${isNew ? 'badge-success' : p.matchType === 'sku_exact' ? 'badge-info' : 'badge-warning'}">
                        ${isNew ? 'New Item' : p.matchType === 'sku_exact' ? 'SKU Match' : 'Name Match'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    closeModal();
    openModal('csv-preview-modal');
}

function submitCSVForApproval() {
    // Create import session
    const sessionId = Math.max(...appData.csv_import_sessions.map(s => s.id), 0) + 1;

    const session = {
        id: sessionId,
        filename: csvImportState.filename,
        original_filename: csvImportState.filename,
        detected_columns: csvImportState.detectedColumns,
        user_mappings: csvImportState.userMappings,
        parsed_data: csvImportState.rows,
        preview_data: csvImportState.previewData,
        changes_summary: csvImportState.summary,
        status: 'pending_approval',
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        approved_by: null,
        approved_at: null,
        notes: ''
    };

    appData.csv_import_sessions.push(session);
    csvImportState.sessionId = sessionId;

    // Notify owner
    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: 1, // Owner
        type: 'csv_import_pending',
        title: 'CSV Import Pending Approval',
        message: `${currentUser.name} submitted CSV import "${csvImportState.filename}" with ${csvImportState.summary.totalRows} rows for approval`,
        reference_id: sessionId,
        reference_type: 'csv_import',
        is_read: false,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Submitted', `CSV import "${csvImportState.filename}" submitted for owner approval`, 'success');
    updateNotificationBadge();

    if (currentPage === 'csv-import') {
        renderCSVImport(document.getElementById('main-content'));
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }
}

function openCSVApprovalModal(sessionId) {
    const session = appData.csv_import_sessions.find(s => s.id === sessionId);
    if (!session) return;

    csvImportState.sessionId = sessionId;
    const preview = session.preview_data || [];
    const summary = session.changes_summary || {};

    const content = document.getElementById('csv-approval-content');
    content.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">Review CSV Import Before Approving</div>
                <div class="alert-text">Verify the changes below. This will update inventory and create stock logs.</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <strong>Filename:</strong> ${session.original_filename}<br>
            <strong>Uploaded By:</strong> ${getUserName(session.created_by)}<br>
            <strong>Date:</strong> ${formatDateTime(session.created_at)}<br>
            <strong>Total Rows:</strong> ${summary.totalRows || 0}
        </div>

        <div class="csv-preview-summary" style="margin-bottom: 20px;">
            <div class="csv-preview-stat neutral">
                <div class="csv-preview-stat-value">${summary.matchedItems || 0}</div>
                <div class="csv-preview-stat-label">Matched Items</div>
            </div>
            <div class="csv-preview-stat ${summary.newItems > 0 ? 'positive' : 'neutral'}">
                <div class="csv-preview-stat-value">${summary.newItems || 0}</div>
                <div class="csv-preview-stat-label">New Items</div>
            </div>
            <div class="csv-preview-stat ${summary.itemsWithChanges > 0 ? 'negative' : 'neutral'}">
                <div class="csv-preview-stat-value">${summary.itemsWithChanges || 0}</div>
                <div class="csv-preview-stat-label">Items Changed</div>
            </div>
        </div>

        <div class="table-container" style="max-height: 400px; overflow-y: auto;">
            <table class="data-table">
                <thead>
                    <tr><th>SKU</th><th>Name</th><th>Current</th><th>New</th><th>Difference</th><th>Price</th><th>Type</th></tr>
                </thead>
                <tbody>
                    ${preview.map(p => {
                        const isNew = p.matchType === 'new_item';
                        const hasChange = p.difference !== 0;
                        return `
                            <tr style="${isNew ? 'background: var(--success-light);' : hasChange ? 'background: var(--warning-light);' : ''}">
                                <td>${p.sku || '-'}</td>
                                <td>${p.name || '-'}</td>
                                <td>${p.currentStock}</td>
                                <td style="font-weight: 600;">${p.newStock}</td>
                                <td style="color: ${p.difference > 0 ? 'var(--success)' : p.difference < 0 ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: 600;">
                                    ${p.difference > 0 ? '+' : ''}${p.difference}
                                </td>
                                <td>${formatCurrency(p.unitPrice)}</td>
                                <td>
                                    <span class="badge ${isNew ? 'badge-success' : 'badge-secondary'}">
                                        ${isNew ? 'New' : 'Update'}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    openModal('csv-approval-modal');
}

function approveCSVImport() {
    const session = appData.csv_import_sessions.find(s => s.id === csvImportState.sessionId);
    if (!session) return;

    const preview = session.preview_data || [];

    preview.forEach(row => {
        if (row.matchedItemId) {
            const item = appData.items.find(i => i.id === row.matchedItemId);
            if (item) {
                const oldStock = item.current_stock;
                item.current_stock = row.newStock;
                if (row.unitPrice > 0) {
                    item.last_purchase_price = row.unitPrice;
                }

                if (row.difference !== 0) {
                    appData.stock_logs.push({
                        id: Math.max(...appData.stock_logs.map(l => l.id), 0) + 1,
                        item_id: item.id,
                        user_id: currentUser.id,
                        type: 'csv_import',
                        quantity: row.difference,
                        old_stock: oldStock,
                        new_stock: row.newStock,
                        reason: `CSV import approved (session ${session.id})`,
                        reference_no: `CSV-${session.id}`,
                        created_at: new Date().toISOString()
                    });
                }
            }
        } else {
            // Create new item
            const newId = Math.max(...appData.items.map(i => i.id), 0) + 1;
            const newItem = {
                id: newId,
                sku: row.sku || `NEW-${newId}`,
                barcode: '',
                name: row.name || 'Unknown Item',
                description: '',
                category_id: 1,
                unit_id: 1,
                supplier_id: null,
                current_stock: row.newStock,
                reorder_point: 10,
                reorder_qty: 20,
                max_stock: 50,
                last_purchase_price: row.unitPrice || 0,
                avg_purchase_price: row.unitPrice || 0,
                has_expiration: false,
                is_active: true
            };
            appData.items.push(newItem);

            appData.stock_logs.push({
                id: Math.max(...appData.stock_logs.map(l => l.id), 0) + 1,
                item_id: newId,
                user_id: currentUser.id,
                type: 'csv_import',
                quantity: row.newStock,
                old_stock: 0,
                new_stock: row.newStock,
                reason: `CSV import created new item (session ${session.id})`,
                reference_no: `CSV-${session.id}`,
                created_at: new Date().toISOString()
            });
        }
    });

    session.status = 'approved';
    session.approved_by = currentUser.id;
    session.approved_at = new Date().toISOString();

    // Notify requester
    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: session.created_by,
        type: 'csv_import_approved',
        title: 'CSV Import Approved',
        message: `Your CSV import "${session.original_filename}" has been approved by ${currentUser.name}. Inventory updated.`,
        reference_id: session.id,
        reference_type: 'csv_import',
        is_read: false,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Approved', `CSV import "${session.original_filename}" approved. Inventory updated.`, 'success');

    if (currentPage === 'csv-import') {
        renderCSVImport(document.getElementById('main-content'));
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    } else if (currentPage === 'inventory') {
        filterInventory();
    }

    csvImportState.sessionId = null;
    updateNotificationBadge();
}

function rejectCSVImport() {
    const session = appData.csv_import_sessions.find(s => s.id === csvImportState.sessionId);
    if (!session) return;

    session.status = 'rejected';
    session.approved_by = currentUser.id;
    session.approved_at = new Date().toISOString();

    appData.notifications.push({
        id: Math.max(...appData.notifications.map(n => n.id), 0) + 1,
        user_id: session.created_by,
        type: 'csv_import_rejected',
        title: 'CSV Import Rejected',
        message: `Your CSV import "${session.original_filename}" has been rejected by ${currentUser.name}`,
        reference_id: session.id,
        reference_type: 'csv_import',
        is_read: false,
        created_at: new Date().toISOString()
    });

    saveAppData();
    closeModal();
    showToast('Rejected', `CSV import "${session.original_filename}" has been rejected`, 'warning');

    if (currentPage === 'csv-import') {
        renderCSVImport(document.getElementById('main-content'));
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    csvImportState.sessionId = null;
    updateNotificationBadge();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', initApp);
