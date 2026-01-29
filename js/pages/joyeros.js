/**
 * Joyeros Page
 *
 * Manages gold inventory per joyero (jewelry maker).
 * Displays balance cards and movement history.
 */

// State
let balances = {};
let movements = [];
let filteredMovements = [];
let currentJoyeroFilter = null;
let currentTipoFilter = null;

/**
 * Initialize page
 */
async function initPage() {
    // Check authentication
    if (!Auth.isAuthenticated()) {
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

    // Initialize joyero dropdown in modal
    initJoyeroDropdown();

    // Load data
    await Promise.all([
        loadBalances(),
        loadMovements()
    ]);
}

/**
 * Initialize joyero dropdown options
 * Only includes joyeros (not providers) since providers don't track gold
 */
function initJoyeroDropdown() {
    const select = document.getElementById('mov-joyero');
    if (select) {
        CONFIG.getJoyerosOnly().forEach(j => {
            const option = document.createElement('option');
            option.value = j.name;
            option.textContent = j.name;
            select.appendChild(option);
        });
    }
}

/**
 * Load joyero balances from API
 */
async function loadBalances() {
    try {
        const response = await API.getJoyeroBalances();
        if (response.success) {
            balances = response.data || {};
            renderJoyeroCards();
        } else {
            Utils.showToast('Error al cargar balances', 'error');
        }
    } catch (error) {
        console.error('Error loading balances:', error);
        Utils.showToast('Error de conexion', 'error');
    }
}

/**
 * Load movements from API
 */
async function loadMovements() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
        loadingEl.classList.add('active');
    }

    try {
        const response = await API.getGoldMovements();
        if (response.success) {
            movements = response.data || [];
            filterMovements();
        } else {
            Utils.showToast('Error al cargar movimientos', 'error');
            movements = [];
        }
    } catch (error) {
        console.error('Error loading movements:', error);
        Utils.showToast('Error de conexion', 'error');
        movements = [];
    } finally {
        if (loadingEl) {
            loadingEl.classList.remove('active');
        }
    }
}

/**
 * Render joyero balance cards
 * Only shows joyeros (not providers) since providers don't track gold
 */
function renderJoyeroCards() {
    const container = document.getElementById('joyero-cards');
    if (!container) return;

    // Sort joyeros by balance descending (exclude providers)
    const sortedJoyeros = CONFIG.getJoyerosOnly().map(j => ({
        name: j.name,
        ...balances[j.name] || { balance: 0, total_entrada: 0, total_salida: 0 }
    })).sort((a, b) => b.balance - a.balance);

    const html = sortedJoyeros.map(joyero => {
        const isActive = currentJoyeroFilter === joyero.name;
        const balanceClass = joyero.balance > 0 ? 'positive' : (joyero.balance < 0 ? 'negative' : 'zero');

        return `
            <div class="joyero-card ${isActive ? 'active' : ''}" onclick="filterByJoyero('${joyero.name}')">
                <div class="joyero-card-header">
                    <div class="joyero-name">${joyero.name}</div>
                    <div class="joyero-balance ${balanceClass}">${joyero.balance.toFixed(1)}g</div>
                </div>
                <div class="joyero-card-details">
                    <div class="joyero-detail">
                        <span class="detail-label">Entradas</span>
                        <span class="detail-value entrada">+${joyero.total_entrada.toFixed(1)}g</span>
                    </div>
                    <div class="joyero-detail">
                        <span class="detail-label">Salidas</span>
                        <span class="detail-value salida">-${joyero.total_salida.toFixed(1)}g</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Filter movements by joyero
 * @param {string} joyeroName - Joyero name to filter by
 */
function filterByJoyero(joyeroName) {
    if (currentJoyeroFilter === joyeroName) {
        // Toggle off
        clearJoyeroFilter();
        return;
    }

    currentJoyeroFilter = joyeroName;

    // Update UI
    document.getElementById('filter-info').classList.remove('hidden');
    document.getElementById('filter-joyero-name').textContent = joyeroName;

    // Re-render cards to show active state
    renderJoyeroCards();

    // Filter movements
    filterMovements();
}

/**
 * Clear joyero filter
 */
function clearJoyeroFilter() {
    currentJoyeroFilter = null;
    document.getElementById('filter-info').classList.add('hidden');
    renderJoyeroCards();
    filterMovements();
}

/**
 * Filter movements based on current filters
 */
function filterMovements() {
    const tipoSelect = document.getElementById('filter-tipo');
    currentTipoFilter = tipoSelect ? tipoSelect.value : null;

    filteredMovements = movements.filter(m => {
        if (currentJoyeroFilter && m.joyero !== currentJoyeroFilter) {
            return false;
        }
        if (currentTipoFilter && m.tipo_movimiento !== currentTipoFilter) {
            return false;
        }
        return true;
    });

    renderMovementsTable();
}

/**
 * Render movements table
 */
function renderMovementsTable() {
    const tbody = document.getElementById('movements-tbody');
    const emptyState = document.getElementById('empty-state');
    const table = document.getElementById('movements-table');

    if (!tbody) return;

    if (filteredMovements.length === 0) {
        tbody.innerHTML = '';
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    table.classList.remove('hidden');
    emptyState.classList.add('hidden');

    const html = filteredMovements.map(m => {
        const date = new Date(m.created_at);
        const dateStr = date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const tipoClass = m.tipo_movimiento === 'Entrada' ? 'entrada' : 'salida';
        const gramosPrefix = m.tipo_movimiento === 'Entrada' ? '+' : '-';

        return `
            <tr>
                <td>
                    <div class="movement-date">${dateStr}</div>
                    <div class="movement-time">${timeStr}</div>
                </td>
                <td><strong>${m.joyero}</strong></td>
                <td><span class="movement-type ${tipoClass}">${m.tipo_movimiento}${(m.tipo_movimiento === 'Salida Pedido' && m.numero_orden) ? ` (${m.numero_orden})` : ''}</span></td>
                <td class="text-right"><span class="movement-gramos ${tipoClass}">${gramosPrefix}${m.gramos.toFixed(1)}g</span></td>
                <td class="movement-desc">${m.descripcion || '-'}</td>
                <td>${m.numero_orden ? `<a href="pedidos.html" class="order-link">${m.numero_orden}</a>` : '-'}</td>
                <td class="movement-user">${m.created_by || '-'}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

/**
 * Open movement modal
 */
function openMovementModal() {
    // Reset form
    document.getElementById('mov-joyero').value = currentJoyeroFilter || '';
    document.getElementById('mov-gramos').value = '';
    document.getElementById('mov-descripcion').value = '';
    document.getElementById('mov-password').value = '';

    // Reset tipo to Entrada
    document.querySelector('input[name="mov_tipo"][value="Entrada"]').checked = true;
    updateMovementType();

    // Show modal
    document.getElementById('movement-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close movement modal
 */
function closeMovementModal() {
    document.getElementById('movement-modal').classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Update movement type UI hint
 */
function updateMovementType() {
    const tipo = document.querySelector('input[name="mov_tipo"]:checked').value;
    const hint = document.getElementById('tipo-hint');
    const toggleEntrada = document.getElementById('toggle-entrada');
    const toggleSalida = document.getElementById('toggle-salida');

    if (tipo === 'Entrada') {
        hint.textContent = 'Oro que entra al inventario del joyero';
        toggleEntrada.classList.add('active');
        toggleSalida.classList.remove('active');
    } else {
        hint.textContent = 'Oro que sale del inventario (ajuste manual, merma, etc.)';
        toggleEntrada.classList.remove('active');
        toggleSalida.classList.add('active');
    }
}

/**
 * Submit new movement
 */
async function submitMovement() {
    const joyero = document.getElementById('mov-joyero').value;
    const tipo = document.querySelector('input[name="mov_tipo"]:checked').value;
    const gramos = parseFloat(document.getElementById('mov-gramos').value);
    const descripcion = document.getElementById('mov-descripcion').value.trim();
    const password = document.getElementById('mov-password').value;

    // Validation
    if (!joyero) {
        Utils.showToast('Selecciona un joyero', 'error');
        return;
    }
    if (!gramos || gramos <= 0) {
        Utils.showToast('Ingresa una cantidad valida de gramos', 'error');
        return;
    }
    if (!descripcion) {
        Utils.showToast('Ingresa una descripcion', 'error');
        return;
    }
    if (!password || password !== CONFIG.DASHBOARD_PASSWORD) {
        Utils.showToast('Contraseña incorrecta', 'error');
        document.getElementById('mov-password').value = '';
        document.getElementById('mov-password').focus();
        return;
    }

    // Show loading
    const submitBtn = document.getElementById('modal-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Guardando...';
    submitBtn.disabled = true;

    try {
        const response = await API.createGoldMovement({
            joyero: joyero,
            tipo_movimiento: tipo,
            gramos: gramos,
            descripcion: descripcion,
            order_id: null,
            numero_orden: null
        });

        if (response.success) {
            Utils.showToast('Movimiento registrado', 'success');
            closeMovementModal();

            // Reload data
            await Promise.all([
                loadBalances(),
                loadMovements()
            ]);
        } else {
            Utils.showToast(response.error || 'Error al registrar', 'error');
        }
    } catch (error) {
        console.error('Error creating movement:', error);
        Utils.showToast('Error de conexion', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPage);
