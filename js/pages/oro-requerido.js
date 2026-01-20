/**
 * Oro Requerido Page
 *
 * Main logic for the gold requirements page.
 */

// State
let allOrders = [];
let goldByDate = {};
let currentView = 'grafica';

/**
 * Initialize page
 */
async function initPage() {
    // Check authentication (skip for development)
    if (!Auth.isAuthenticated()) {
        // For development with mock data, create a temp session
        if (USE_MOCK_DATA) {
            sessionStorage.setItem('prisma_user', JSON.stringify({
                id: 'dev',
                name: 'Developer',
                isAdmin: true
            }));
        } else {
            window.location.href = 'index.html';
            return;
        }
    }

    // Load orders
    await loadOrders();

    // Set initial view
    switchView('grafica');
}

/**
 * Load orders from API
 */
async function loadOrders() {
    const loadingEl = document.getElementById('loading-overlay');

    if (loadingEl) {
        loadingEl.classList.add('active');
    }

    try {
        const response = await API.getOrders();

        if (response.success) {
            allOrders = response.data || [];
            calculateGoldByDate();
            updateSummary();
            renderCurrentView();
        } else {
            Utils.showToast('Error al cargar pedidos', 'error');
            allOrders = [];
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        Utils.showToast('Error de conexión', 'error');
        allOrders = [];
    } finally {
        if (loadingEl) {
            loadingEl.classList.remove('active');
        }
    }
}

/**
 * Calculate gold requirements by date
 * Filters orders where oro_con_joyero = false and oro_gramos > 0
 * Groups by fecha_fabricacion (date gold is needed for production)
 */
function calculateGoldByDate() {
    goldByDate = {};

    // Filter orders needing gold procurement
    const pendingGold = allOrders.filter(o =>
        o.oro_con_joyero === false &&
        o.oro_gramos > 0 &&
        o.estado !== 'Entregado' &&
        o.estado !== 'Cancelado'
    );

    // Aggregate by fecha_fabricacion
    pendingGold.forEach(order => {
        const date = order.fecha_fabricacion;
        if (!date) return;

        if (!goldByDate[date]) {
            goldByDate[date] = { grams: 0, orders: [] };
        }
        goldByDate[date].grams += order.oro_gramos;
        goldByDate[date].orders.push(order);
    });

    return goldByDate;
}

/**
 * Update summary cards
 */
function updateSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalGrams = 0;
    let totalOrders = 0;
    let urgentGrams = 0;
    let overdueGrams = 0;

    Object.entries(goldByDate).forEach(([dateStr, data]) => {
        totalGrams += data.grams;
        totalOrders += data.orders.length;

        const date = new Date(dateStr + 'T00:00:00');
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            overdueGrams += data.grams;
        } else if (diffDays <= 4) {
            urgentGrams += data.grams;
        }
    });

    // Update display
    document.getElementById('total-grams').textContent = `${totalGrams.toFixed(1)}g`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('urgent-grams').textContent = `${urgentGrams.toFixed(1)}g`;
    document.getElementById('overdue-grams').textContent = `${overdueGrams.toFixed(1)}g`;

    // Update order count in header
    const countEl = document.getElementById('order-count');
    if (countEl) {
        countEl.textContent = `${totalOrders} pedidos requieren oro`;
    }
}

/**
 * Switch between views
 * @param {string} view - 'grafica' or 'calendario'
 */
function switchView(view) {
    currentView = view;

    // Update toggle buttons
    document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Show/hide view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${view}`);
    if (activePanel) {
        activePanel.classList.add('active');
    }

    renderCurrentView();
}

/**
 * Render current view
 */
function renderCurrentView() {
    switch (currentView) {
        case 'grafica':
            GoldChart.render(goldByDate);
            break;
        case 'calendario':
            GoldCalendar.render(goldByDate);
            break;
    }
}

/**
 * Show orders for a specific date
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 */
function showOrdersForDate(dateStr) {
    const data = goldByDate[dateStr];
    if (!data || !data.orders.length) return;

    // Format date for display
    const date = new Date(dateStr + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-MX', options);

    // Update modal title
    document.getElementById('modal-title').textContent = `Oro para ${formattedDate}`;

    // Build orders list
    let html = `
        <div style="margin-bottom: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #d97706;">${data.grams.toFixed(1)}g</div>
            <div style="font-size: 12px; color: #92400e;">Total requerido</div>
        </div>
    `;

    data.orders.forEach(order => {
        const tipoName = Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || '-';
        html += `
            <div class="order-item">
                <div class="order-item-info">
                    <div class="order-item-cliente">${escapeHtml(order.nombre_cliente || 'Sin nombre')}</div>
                    <div class="order-item-tipo">${tipoName}</div>
                </div>
                <div class="order-item-grams">${order.oro_gramos}g</div>
            </div>
        `;
    });

    document.getElementById('modal-body').innerHTML = html;

    // Show modal
    document.getElementById('orders-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close orders modal
 */
function closeOrdersModal() {
    document.getElementById('orders-modal').classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeOrdersModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeOrdersModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPage);
