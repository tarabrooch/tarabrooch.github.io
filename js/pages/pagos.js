/**
 * Pagos Page
 *
 * Main logic for the pagos (spending) page.
 */

// State
let allPagos = [];
let filteredPagos = [];
let currentPagoView = 'lista';
let pagoSearchTimeout;
let currentFxRate = CONFIG.DEFAULT_FX_RATE;

/**
 * Initialize pagos page
 */
async function initPagosPage() {
    // Initialize filters
    initPagoFilters();

    // Load FX rate
    loadFxRate();

    // Load pagos
    await loadPagos();

    // Set initial view
    switchPagoView('lista');
}

/**
 * Initialize filter dropdowns
 */
function initPagoFilters() {
    // Estado filter
    const estadoSelect = document.getElementById('filter-estado');
    if (estadoSelect) {
        CONFIG.PAGO_ESTADOS.forEach(status => {
            const option = document.createElement('option');
            option.value = status.id;
            option.textContent = status.name;
            estadoSelect.appendChild(option);
        });
    }

    // Categoria filter
    const categoriaSelect = document.getElementById('filter-categoria');
    if (categoriaSelect) {
        Object.entries(CONFIG.PAGO_CATEGORIES).forEach(([key, category]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = category.name;
            categoriaSelect.appendChild(option);
        });
    }

    // FX rate input
    const fxInput = document.getElementById('fx-rate-input');
    if (fxInput) {
        fxInput.value = currentFxRate;
        fxInput.addEventListener('change', () => {
            const newRate = parseFloat(fxInput.value);
            if (newRate && newRate > 0) {
                setFxRate(newRate);
            }
        });
    }
}

/**
 * Load FX rate from API
 */
async function loadFxRate() {
    try {
        const rate = await API.getFxRate();
        setFxRate(rate);
    } catch (error) {
        console.warn('Could not load FX rate:', error);
    }
}

/**
 * Fetch latest FX rate
 */
async function fetchFxRate() {
    const btn = document.querySelector('#fx-options button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Cargando...';
    btn.disabled = true;

    try {
        const rate = await API.getFxRate();
        setFxRate(rate);
        Utils.showToast(`Tipo de cambio actualizado: ${rate.toFixed(2)}`, 'success');
    } catch (error) {
        Utils.showToast('Error al obtener tipo de cambio', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/**
 * Set FX rate and update components
 * @param {number} rate - USD to MXN rate
 */
function setFxRate(rate) {
    currentFxRate = rate;

    // Update input
    const fxInput = document.getElementById('fx-rate-input');
    if (fxInput) {
        fxInput.value = rate.toFixed(2);
    }

    // Update components
    PagoCalendar.setFxRate(rate);
    PagoGraph.setFxRate(rate);
}

/**
 * Debounced search handler
 */
function debouncePagoSearch() {
    clearTimeout(pagoSearchTimeout);
    pagoSearchTimeout = setTimeout(() => {
        applyPagoFilters();
    }, 300);
}

/**
 * Load pagos from API
 */
async function loadPagos() {
    const loadingEl = document.getElementById('loading-overlay');

    if (loadingEl) {
        loadingEl.classList.add('active');
    }

    try {
        const response = await API.getPagos();

        if (response.success) {
            allPagos = response.data || [];
            updatePagoCount();
            applyPagoFilters();
        } else {
            Utils.showToast('Error al cargar pagos', 'error');
            allPagos = [];
        }
    } catch (error) {
        console.error('Error loading pagos:', error);
        Utils.showToast('Error de conexión', 'error');
        allPagos = [];
    } finally {
        if (loadingEl) {
            loadingEl.classList.remove('active');
        }
    }
}

/**
 * Update pago count display
 */
function updatePagoCount() {
    const countEl = document.getElementById('pago-count');
    if (countEl) {
        const activeCount = allPagos.filter(p =>
            p.estado !== 'pagado' && p.estado !== 'cancelado'
        ).length;
        countEl.textContent = `${activeCount} pagos pendientes`;
    }
}

/**
 * Apply filters to pagos
 */
function applyPagoFilters() {
    const estado = document.getElementById('filter-estado')?.value || '';
    const categoria = document.getElementById('filter-categoria')?.value || '';
    const search = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

    filteredPagos = allPagos.filter(pago => {
        // Estado filter
        if (estado && pago.estado !== estado) {
            return false;
        }

        // Categoria filter
        if (categoria && pago.categoria !== categoria) {
            return false;
        }

        // Search filter
        if (search) {
            const categoryName = CONFIG.PAGO_CATEGORIES[pago.categoria]?.name || '';
            const searchFields = [
                pago.subcategoria,
                pago.descripcion,
                categoryName
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchFields.includes(search)) {
                return false;
            }
        }

        return true;
    });

    // Sort by fecha_vencimiento (nearest first)
    filteredPagos.sort((a, b) => {
        const dateA = a.fecha_vencimiento ? new Date(a.fecha_vencimiento) : new Date('9999-12-31');
        const dateB = b.fecha_vencimiento ? new Date(b.fecha_vencimiento) : new Date('9999-12-31');
        return dateA - dateB;
    });

    renderCurrentPagoView();
}

/**
 * Switch between views
 * @param {string} view - 'lista', 'kanban', 'calendario', or 'grafica'
 */
function switchPagoView(view) {
    currentPagoView = view;

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
    const calendarOptions = document.getElementById('pago-calendar-options');
    if (calendarOptions) {
        calendarOptions.classList.toggle('hidden', view !== 'calendario');
    }

    // Show/hide FX options (for calendar aggregated and graph views)
    const fxOptions = document.getElementById('fx-options');
    if (fxOptions) {
        fxOptions.classList.toggle('hidden', view !== 'calendario' && view !== 'grafica');
    }

    renderCurrentPagoView();
}

/**
 * Render current view
 */
function renderCurrentPagoView() {
    const emptyEl = document.getElementById('empty-state-lista');

    switch (currentPagoView) {
        case 'lista':
            renderPagoListView();
            if (emptyEl) {
                emptyEl.classList.toggle('hidden', filteredPagos.length > 0);
            }
            break;
        case 'kanban':
            renderPagoKanbanView();
            break;
        case 'calendario':
            PagoCalendar.render(filteredPagos);
            break;
        case 'grafica':
            PagoGraph.render(filteredPagos);
            break;
    }
}

/**
 * Render list view
 */
function renderPagoListView() {
    const container = document.getElementById('pagos-grid');
    if (container) {
        if (filteredPagos.length > 0) {
            container.innerHTML = filteredPagos.map(pago => PagoCard.render(pago)).join('');
        } else {
            container.innerHTML = '';
        }
    }
}

/**
 * Render kanban view
 */
function renderPagoKanbanView() {
    const board = document.getElementById('pago-kanban-board');
    if (!board) return;

    // Group pagos by status
    const pagosByStatus = {};
    CONFIG.PAGO_ESTADOS.forEach(status => {
        pagosByStatus[status.id] = [];
    });

    filteredPagos.forEach(pago => {
        const statusId = pago.estado || 'presupuestado';
        if (pagosByStatus[statusId]) {
            pagosByStatus[statusId].push(pago);
        }
    });

    // Build columns HTML
    let html = '';

    CONFIG.PAGO_ESTADOS.forEach(status => {
        const statusPagos = pagosByStatus[status.id] || [];
        const isCollapsed = status.id === 'pagado' || status.id === 'cancelado';

        html += `
            <div class="kanban-column ${isCollapsed ? 'collapsed' : ''}" data-status="${status.id}">
                <div class="kanban-column-header" style="border-color: ${status.color};">
                    <div class="kanban-column-title">
                        <span class="kanban-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${status.color};"></span>
                        ${status.name}
                        <span class="kanban-column-count">${statusPagos.length}</span>
                    </div>
                    <button class="kanban-column-toggle" onclick="togglePagoKanbanColumn('${status.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                </div>
                <div class="kanban-column-cards">
                    ${statusPagos.length > 0
                        ? statusPagos.map(pago => PagoCard.renderCompact(pago)).join('')
                        : '<div class="kanban-empty">Sin pagos</div>'
                    }
                </div>
            </div>
        `;
    });

    board.innerHTML = html;
}

/**
 * Toggle kanban column collapsed state
 * @param {string} statusId - Status ID
 */
function togglePagoKanbanColumn(statusId) {
    const column = document.querySelector(`.kanban-column[data-status="${statusId}"]`);
    if (column) {
        column.classList.toggle('collapsed');
    }
}

/**
 * Open edit modal for a pago
 * @param {string} pagoId - Pago ID
 */
window.handleOpenPagoEditModal = function(pagoId) {
    const pago = allPagos.find(p => p.id === pagoId);
    if (pago) {
        PagoEditModal.open(pago);
    }
};

/**
 * Save pago changes
 */
window.handleSavePago = async function() {
    const pagoId = document.getElementById('edit-pago-id').value;
    const formData = PagoEditModal.getFormData();

    // Get current pago to compare changes
    const currentPago = allPagos.find(p => p.id === pagoId);
    if (!currentPago) {
        Utils.showToast('Pago no encontrado', 'error');
        return;
    }

    // Detect changes for logging
    const changes = detectPagoChanges(currentPago, formData);

    if (changes.length === 0) {
        Utils.showToast('No hay cambios para guardar', 'info');
        PagoEditModal.close();
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('pago-modal-save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Guardando...';
    saveBtn.disabled = true;

    try {
        const user = Auth.getCurrentUser();
        const userName = user ? user.name : 'Usuario';
        const response = await API.updatePago(pagoId, formData, userName, changes);

        if (response.success) {
            Utils.showToast('Pago actualizado', 'success');
            PagoEditModal.close();

            // Update local data
            const index = allPagos.findIndex(p => p.id === pagoId);
            if (index !== -1) {
                allPagos[index] = { ...allPagos[index], ...formData };
            }

            updatePagoCount();
            applyPagoFilters();
        } else {
            Utils.showToast(response.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('Error saving pago:', error);
        Utils.showToast('Error de conexión', 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
};

/**
 * Detect changes between original and new data
 * @param {Object} original - Original pago data
 * @param {Object} updated - Updated form data
 * @returns {Array} Array of change descriptions
 */
function detectPagoChanges(original, updated) {
    const changes = [];
    const fieldLabels = {
        monto: 'Monto',
        moneda: 'Moneda',
        es_fiscal: 'Es fiscal',
        categoria: 'Categoría',
        subcategoria: 'Subcategoría',
        fecha_vencimiento: 'Fecha de vencimiento',
        estado: 'Estado',
        descripcion: 'Descripción'
    };

    for (const [key, label] of Object.entries(fieldLabels)) {
        const oldVal = original[key];
        const newVal = updated[key];

        // Normalize values for comparison
        const normalizedOld = normalizeValue(oldVal);
        const normalizedNew = normalizeValue(newVal);

        if (normalizedOld !== normalizedNew) {
            if (key === 'estado') {
                const statusInfo = CONFIG.PAGO_ESTADOS.find(s => s.id === newVal);
                changes.push(`Estado cambiado a ${statusInfo?.name || newVal}`);
            } else if (key === 'monto') {
                const currency = updated.moneda || original.moneda || 'MXN';
                const symbol = currency === 'USD' ? 'USD $' : '$';
                changes.push(`Monto actualizado a ${symbol}${newVal}`);
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
    if (typeof value === 'boolean') {
        return value.toString();
    }
    if (typeof value === 'number') {
        return value.toString();
    }
    return String(value).trim();
}
