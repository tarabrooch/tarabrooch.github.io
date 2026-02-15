/**
 * Pedidos Page
 *
 * Main logic for the orders page.
 */

// State
let allOrders = [];
let filteredOrders = [];
let currentView = 'lista';
let searchTimeout;

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

    // Initialize filters
    initFilters();

    // Load orders
    await loadOrders();

    // Set initial view
    switchView('lista');
}

/**
 * Initialize filter dropdowns
 */
function initFilters() {
    // Estado filter
    const estadoSelect = document.getElementById('filter-estado');
    if (estadoSelect) {
        CONFIG.ESTADOS.forEach(status => {
            const option = document.createElement('option');
            option.value = status.name;
            option.textContent = status.name;
            estadoSelect.appendChild(option);
        });
    }

    // Joyero filter (with grouped Joyeros and Proveedores)
    const joyeroSelect = document.getElementById('filter-joyero');
    if (joyeroSelect && CONFIG.JOYEROS.length > 0) {
        // Add Joyeros group
        const joyerosGroup = document.createElement('optgroup');
        joyerosGroup.label = 'Joyeros';
        CONFIG.getJoyerosOnly().forEach(joyero => {
            const option = document.createElement('option');
            option.value = joyero.name;
            option.textContent = joyero.name;
            joyerosGroup.appendChild(option);
        });
        joyeroSelect.appendChild(joyerosGroup);

        // Add Proveedores group
        const proveedoresGroup = document.createElement('optgroup');
        proveedoresGroup.label = 'Proveedores';
        CONFIG.getProveedoresOnly().forEach(proveedor => {
            const option = document.createElement('option');
            option.value = proveedor.name;
            option.textContent = proveedor.name;
            proveedoresGroup.appendChild(option);
        });
        joyeroSelect.appendChild(proveedoresGroup);
    }

    // Vendedora filter
    const vendedoraSelect = document.getElementById('filter-vendedora');
    if (vendedoraSelect && CONFIG.USERS.length > 0) {
        CONFIG.USERS.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            vendedoraSelect.appendChild(option);
        });
    }
}

/**
 * Debounced search handler
 */
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
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
            updateOrderCount();
            applyFilters();
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
 * Update order count display
 */
function updateOrderCount() {
    const countEl = document.getElementById('order-count');
    if (countEl) {
        const activeCount = allOrders.filter(o =>
            o.estado !== 'Entregado' && o.estado !== 'Cancelado'
        ).length;
        countEl.textContent = `${activeCount} pedidos activos`;
    }
}

/**
 * Apply filters to orders
 */
function applyFilters() {
    const estado = document.getElementById('filter-estado')?.value || '';
    const joyero = document.getElementById('filter-joyero')?.value || '';
    const vendedora = document.getElementById('filter-vendedora')?.value || '';
    const search = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

    filteredOrders = allOrders.filter(order => {
        // Estado filter
        if (estado && order.estado !== estado) {
            return false;
        }

        // Joyero filter
        if (joyero && order.joyero !== joyero) {
            return false;
        }

        // Vendedora filter
        if (vendedora && order.vendedora !== vendedora) {
            return false;
        }

        // Search filter (order number, name, phone, description)
        if (search) {
            const searchFields = [
                order.numero_orden,
                order.nombre_cliente,
                order.telefono_cliente,
                order.descripcion,
                order.notas
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchFields.includes(search)) {
                return false;
            }
        }

        return true;
    });

    // Sort by fecha_entrega_cliente (nearest first)
    filteredOrders.sort((a, b) => {
        const dateA = a.fecha_entrega_cliente ? new Date(a.fecha_entrega_cliente) : new Date('9999-12-31');
        const dateB = b.fecha_entrega_cliente ? new Date(b.fecha_entrega_cliente) : new Date('9999-12-31');
        return dateA - dateB;
    });

    renderCurrentView();
}

/**
 * Switch between views
 * @param {string} view - 'lista', 'kanban', or 'calendario'
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

    // Show/hide calendar options
    const calendarOptions = document.getElementById('calendar-options');
    if (calendarOptions) {
        calendarOptions.classList.toggle('hidden', view !== 'calendario');
    }

    renderCurrentView();
}

/**
 * Render current view
 */
function renderCurrentView() {
    const emptyEl = document.getElementById('empty-state-lista');

    switch (currentView) {
        case 'lista':
            renderListView();
            if (emptyEl) {
                emptyEl.classList.toggle('hidden', filteredOrders.length > 0);
            }
            break;
        case 'kanban':
            Kanban.render(filteredOrders);
            break;
        case 'calendario':
            Calendar.render(filteredOrders);
            break;
    }
}

/**
 * Render list view
 */
function renderListView() {
    const container = document.getElementById('orders-grid');
    if (container) {
        if (filteredOrders.length > 0) {
            container.innerHTML = filteredOrders.map(order => OrderCard.render(order)).join('');
        } else {
            container.innerHTML = '';
        }
    }
}

/**
 * Open edit modal for an order
 * @param {string} orderId - Order ID
 */
window.handleOpenEditModal = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        EditModal.open(order);
    }
};

/**
 * Save order changes
 */
window.handleSaveOrder = async function() {
    const orderId = document.getElementById('edit-order-id').value;
    const formData = EditModal.getFormData();

    // Get current order to compare changes
    const currentOrder = allOrders.find(o => o.id === orderId);
    if (!currentOrder) {
        Utils.showToast('Pedido no encontrado', 'error');
        return;
    }

    // Check for pending abono
    const pendingAbono = EditModal.getPendingAbono();

    // Detect changes for logging
    const changes = detectChanges(currentOrder, formData, pendingAbono);

    if (changes.length === 0) {
        Utils.showToast('No hay cambios para guardar', 'info');
        EditModal.close();
        return;
    }

    // Check if we need to auto-deduct gold (status changed to "En Producción")
    // Note: Providers (proveedores) do not track gold movements
    // Note: Fabricacion orders skip oro_con_joyero requirement (gold is internal)
    const statusChangedToProduccion = currentOrder.estado !== 'En Producción' && formData.estado === 'En Producción';
    const isProvider = CONFIG.isProveedor(formData.joyero);
    const isFabricacionOrder = currentOrder.is_fabricacion === true;
    const shouldDeductGold = statusChangedToProduccion &&
        formData.oro_gramos > 0 &&
        formData.joyero &&
        (isFabricacionOrder || formData.oro_con_joyero === true) &&
        !isProvider;

    // Debug logging
    console.log('=== Gold Deduction Debug ===');
    console.log('currentOrder.estado:', currentOrder.estado);
    console.log('formData.estado:', formData.estado);
    console.log('statusChangedToProduccion:', statusChangedToProduccion);
    console.log('formData.oro_gramos:', formData.oro_gramos);
    console.log('formData.joyero:', formData.joyero);
    console.log('formData.oro_con_joyero:', formData.oro_con_joyero);
    console.log('isFabricacionOrder:', isFabricacionOrder);
    console.log('isProvider:', isProvider);
    console.log('shouldDeductGold:', shouldDeductGold);

    // Show loading state
    const saveBtn = document.getElementById('modal-save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Guardando...';
    saveBtn.disabled = true;

    try {
        const user = Auth.getCurrentUser();
        const userName = user ? user.name : 'Usuario';
        const response = await API.updateOrder(orderId, formData, userName, changes);

        if (response.success) {
            // Auto-deduct gold if conditions are met
            if (shouldDeductGold) {
                try {
                    // Use different movement type for fabricacion orders
                    const isFabricacionOrder = currentOrder.is_fabricacion === true;
                    const movementType = isFabricacionOrder ? 'Salida Fabricacion' : 'Salida Pedido';

                    // For fabricacion, extract last 5 chars of page ID for numero_orden
                    let movNumeroOrden = formData.numero_orden || '';
                    if (isFabricacionOrder) {
                        const cleanId = orderId.replace(/-/g, '');
                        movNumeroOrden = cleanId.slice(-5);
                    }

                    const movDescripcion = isFabricacionOrder
                        ? `Fabricacion - ${formData.tipo_pedido || ''}`
                        : `${formData.tipo_pedido || 'Pedido'} - ${formData.nombre_cliente || 'Sin nombre'}`;

                    await API.createGoldMovement({
                        joyero: formData.joyero,
                        tipo_movimiento: movementType,
                        gramos: formData.oro_gramos,
                        order_id: orderId,
                        numero_orden: movNumeroOrden,
                        descripcion: movDescripcion
                    });
                    Utils.showToast(`Pedido actualizado. ${formData.oro_gramos}g descontados de ${formData.joyero}`, 'success');
                } catch (goldError) {
                    console.error('Error creating gold movement:', goldError);
                    Utils.showToast('Pedido guardado, pero error al registrar movimiento de oro', 'warning');
                }
            } else {
                Utils.showToast('Pedido actualizado', 'success');
            }

            EditModal.close();

            // Update local data
            const index = allOrders.findIndex(o => o.id === orderId);
            if (index !== -1) {
                allOrders[index] = { ...allOrders[index], ...formData };
            }

            updateOrderCount();
            applyFilters();
        } else {
            Utils.showToast(response.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        Utils.showToast('Error de conexión', 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
};

/**
 * Detect changes between original and new data
 * @param {Object} original - Original order data
 * @param {Object} updated - Updated form data
 * @param {Object} pendingAbono - Optional abono data with monto and nota
 * @returns {Array} Array of change descriptions
 */
function detectChanges(original, updated, pendingAbono = null) {
    const changes = [];
    const fieldLabels = {
        numero_orden: 'Número de orden',
        estado: 'Estatus',
        nombre_cliente: 'Nombre del cliente',
        telefono_cliente: 'Teléfono',
        tipo_pedido: 'Tipo de pedido',
        descripcion: 'Descripción',
        importe_total: 'Importe total',
        anticipo: 'Anticipo',
        fecha_entrega_cliente: 'Fecha entrega cliente',
        fecha_entrega_tienda: 'Fecha entrega tienda',
        fecha_fabricacion: 'Fecha fabricación',
        oro_gramos: 'Oro (gramos)',
        oro_con_joyero: 'Oro entregado al joyero',
        joyero: 'Joyero',
        gemas_requeridas: 'Gemas requeridas',
        gemas_origen: 'Origen de gemas',
        gemas_listas: 'Gemas listas',
        notas: 'Notas'
    };

    for (const [key, label] of Object.entries(fieldLabels)) {
        const oldVal = original[key];
        const newVal = updated[key];

        // Normalize values for comparison
        const normalizedOld = normalizeValue(oldVal);
        const normalizedNew = normalizeValue(newVal);

        if (normalizedOld !== normalizedNew) {
            if (key === 'estado') {
                changes.push(`Estatus cambiado a ${newVal}`);
            } else if (key === 'anticipo') {
                // Check if this is from an abono
                if (pendingAbono && pendingAbono.monto > 0) {
                    // Use abono-specific change entry
                    changes.push(`Abono de ${Utils.formatCurrency(pendingAbono.monto)} registrado (Nota: #${pendingAbono.nota})`);
                } else {
                    const diff = (newVal || 0) - (oldVal || 0);
                    if (diff > 0) {
                        changes.push(`Anticipo aumentado en ${Utils.formatCurrency(diff)}`);
                    } else {
                        changes.push(`${label} actualizado`);
                    }
                }
            } else {
                changes.push(`${label} actualizado`);
            }
        }
    }

    return changes;
}

/**
 * Normalize value for comparison
 * @param {*} value - Value to normalize
 * @returns {string} Normalized string value
 */
function normalizeValue(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    if (typeof value === 'number') {
        return value.toString();
    }
    return String(value).trim();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPage);
