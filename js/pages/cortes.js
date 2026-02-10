/**
 * Cortes (Daily Sales Closings) Page
 *
 * Each corte is one record per date, with two independent breakdowns:
 *   - By vendedora (how much each salesperson sold)
 *   - By payment method (how much came in via each method)
 * The two totals are validated to match before saving.
 */

// State
let allCortes = [];
let filteredCortes = [];
let currentCorteView = 'registro';

/**
 * Initialize cortes page
 */
async function initCortesPage() {
    const today = Utils.formatDateForInput(new Date());

    const fechaInput = document.getElementById('corte-fecha');
    if (fechaInput) fechaInput.value = today;

    const reportFechaInput = document.getElementById('report-fecha');
    if (reportFechaInput) reportFechaInput.value = today;

    // Build the two input sections
    initVendedoraInputs();
    initMetodoInputs();

    // Set default date range for history (last 30 days)
    const thirtyDaysAgo = Utils.formatDateForInput(Utils.subtractDays(new Date(), 30));
    const filterDesde = document.getElementById('filter-fecha-desde');
    const filterHasta = document.getElementById('filter-fecha-hasta');
    if (filterDesde) filterDesde.value = thirtyDaysAgo;
    if (filterHasta) filterHasta.value = today;

    // Load existing cortes
    await loadCortes();

    // Show any existing corte for today
    updateExistingCortesForDate();
    updateValidation();
}

// ==========================================================================
// Form Rendering
// ==========================================================================

/**
 * Render vendedora amount inputs
 */
function initVendedoraInputs() {
    const container = document.getElementById('corte-vendedora-inputs');
    if (!container) return;

    let html = '';
    CONFIG.VENDEDORAS.forEach(v => {
        html += `
            <div class="corte-input-row">
                <label class="corte-input-name">${escapeHtml(v.name)}</label>
                <input type="number" class="corte-input-field" id="corte-v-${v.id}"
                    min="0" step="0.01" placeholder="$0.00"
                    oninput="onCorteInputChange()">
            </div>
        `;
    });
    container.innerHTML = html;
}

/**
 * Render payment method amount inputs
 */
function initMetodoInputs() {
    const container = document.getElementById('corte-metodo-inputs');
    if (!container) return;

    let html = '';
    CONFIG.CORTE_METODOS_PAGO.forEach(m => {
        html += `
            <div class="corte-input-row">
                <label class="corte-input-name">
                    <span class="corte-payment-icon ${m.id}">${CorteCard.getMethodIcon(m.id)}</span>
                    ${escapeHtml(m.name)}
                </label>
                <input type="number" class="corte-input-field" id="corte-m-${m.id}"
                    min="0" step="0.01" placeholder="$0.00"
                    oninput="onCorteInputChange()">
            </div>
        `;
    });
    container.innerHTML = html;
}

// ==========================================================================
// Totals & Validation
// ==========================================================================

/**
 * Get the sum of all vendedora inputs
 */
function getVendedoraTotal() {
    let total = 0;
    CONFIG.VENDEDORAS.forEach(v => {
        const input = document.getElementById(`corte-v-${v.id}`);
        total += parseFloat(input?.value) || 0;
    });
    return total;
}

/**
 * Get the sum of all payment method inputs
 */
function getMetodoTotal() {
    let total = 0;
    CONFIG.CORTE_METODOS_PAGO.forEach(m => {
        const input = document.getElementById(`corte-m-${m.id}`);
        total += parseFloat(input?.value) || 0;
    });
    return total;
}

/**
 * Called on every input change to refresh totals and validation
 */
function onCorteInputChange() {
    const vTotal = getVendedoraTotal();
    const mTotal = getMetodoTotal();

    document.getElementById('corte-vendedora-total').textContent = CorteCard.formatAmount(vTotal);
    document.getElementById('corte-metodo-total').textContent = CorteCard.formatAmount(mTotal);

    updateValidation();
}

/**
 * Update the validation indicator and save button state
 */
function updateValidation() {
    const vTotal = getVendedoraTotal();
    const mTotal = getMetodoTotal();
    const iconEl = document.getElementById('corte-validation-icon');
    const textEl = document.getElementById('corte-validation-text');
    const wrapEl = document.getElementById('corte-validation');
    const saveBtn = document.getElementById('corte-save-btn');

    const bothEmpty = vTotal === 0 && mTotal === 0;
    // Allow tiny floating-point rounding differences
    const match = Math.abs(vTotal - mTotal) < 0.01;

    wrapEl.classList.remove('valid', 'invalid', 'empty');

    if (bothEmpty) {
        wrapEl.classList.add('valid');
        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
        textEl.textContent = 'Sin ventas para este día ($0.00)';
        saveBtn.disabled = false;
    } else if (match) {
        wrapEl.classList.add('valid');
        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
        textEl.textContent = `Los totales coinciden: ${CorteCard.formatAmount(vTotal)}`;
        saveBtn.disabled = false;
    } else {
        wrapEl.classList.add('invalid');
        const diff = Math.abs(vTotal - mTotal);
        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>';
        textEl.textContent = `Diferencia: ${CorteCard.formatAmount(diff)} — los totales deben coincidir`;
        saveBtn.disabled = true;
    }
}

// ==========================================================================
// Date Change & Pre-fill
// ==========================================================================

function onCorteDateChange() {
    updateExistingCortesForDate();
    prefillFromExisting();
}

/**
 * If a corte already exists for this date, pre-fill the form
 */
function prefillFromExisting() {
    const fecha = document.getElementById('corte-fecha')?.value;
    if (!fecha) return;

    const existing = allCortes.find(c => c.fecha === fecha);
    clearForm();

    if (existing) {
        // Fill vendedora amounts
        const ventas = existing.ventas || {};
        CONFIG.VENDEDORAS.forEach(v => {
            const input = document.getElementById(`corte-v-${v.id}`);
            if (input && ventas[v.id]) input.value = ventas[v.id];
        });

        // Fill payment method amounts
        CONFIG.CORTE_METODOS_PAGO.forEach(m => {
            const input = document.getElementById(`corte-m-${m.id}`);
            if (input && existing[m.id]) input.value = existing[m.id];
        });

        const notasInput = document.getElementById('corte-num-notas');
        if (notasInput && existing.num_notas) notasInput.value = existing.num_notas;
    }

    onCorteInputChange();
}

/**
 * Clear all form inputs
 */
function clearForm() {
    CONFIG.VENDEDORAS.forEach(v => {
        const input = document.getElementById(`corte-v-${v.id}`);
        if (input) input.value = '';
    });
    CONFIG.CORTE_METODOS_PAGO.forEach(m => {
        const input = document.getElementById(`corte-m-${m.id}`);
        if (input) input.value = '';
    });
    const notasInput = document.getElementById('corte-num-notas');
    if (notasInput) notasInput.value = '';
}

/**
 * Show existing corte card for the selected date
 */
function updateExistingCortesForDate() {
    const fecha = document.getElementById('corte-fecha')?.value;
    if (!fecha) return;

    const existing = allCortes.filter(c => c.fecha === fecha);
    const section = document.getElementById('corte-existing-section');
    const list = document.getElementById('corte-existing-list');

    if (existing.length > 0 && section && list) {
        section.style.display = 'block';
        list.innerHTML = existing.map(c =>
            CorteCard.render(c, { showDate: false, showDelete: true })
        ).join('');
    } else if (section) {
        section.style.display = 'none';
    }
}

// ==========================================================================
// Save
// ==========================================================================

async function saveCorte() {
    const fecha = document.getElementById('corte-fecha').value;
    if (!fecha) {
        Utils.showToast('Selecciona una fecha', 'warning');
        return;
    }

    // Gather vendedora amounts
    const ventas = {};
    CONFIG.VENDEDORAS.forEach(v => {
        const val = parseFloat(document.getElementById(`corte-v-${v.id}`)?.value) || 0;
        if (val > 0) { ventas[v.id] = val; }
    });

    // Gather payment method amounts
    const corteData = { fecha, ventas, num_notas: parseInt(document.getElementById('corte-num-notas').value) || 0 };
    CONFIG.CORTE_METODOS_PAGO.forEach(m => {
        const val = parseFloat(document.getElementById(`corte-m-${m.id}`)?.value) || 0;
        corteData[m.id] = val;
    });

    // Validate totals match
    const vTotal = getVendedoraTotal();
    const mTotal = getMetodoTotal();
    if (Math.abs(vTotal - mTotal) >= 0.01) {
        Utils.showToast('Los totales de vendedoras y métodos de pago deben coincidir', 'warning');
        return;
    }

    // Check if updating existing or creating new
    const existingIndex = allCortes.findIndex(c => c.fecha === fecha);

    const saveBtn = document.getElementById('corte-save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = 'Guardando...';
    saveBtn.disabled = true;

    try {
        if (existingIndex !== -1) {
            const existingId = allCortes[existingIndex].id;
            const response = await API.updateCorte(existingId, corteData);
            if (response.success) {
                allCortes[existingIndex] = { ...allCortes[existingIndex], ...corteData };
                Utils.showToast('Corte actualizado', 'success');
            } else {
                Utils.showToast(response.error || 'Error al actualizar', 'error');
            }
        } else {
            const response = await API.createCorte(corteData);
            if (response.success) {
                const newCorte = {
                    id: response.data?.id || Utils.generateId(),
                    ...corteData,
                    created_at: new Date().toISOString()
                };
                allCortes.push(newCorte);
                Utils.showToast('Corte guardado', 'success');
            } else {
                Utils.showToast(response.error || 'Error al guardar', 'error');
            }
        }

        updateExistingCortesForDate();
        applyCorteHistoryFilters();
    } catch (error) {
        console.error('Error saving corte:', error);
        Utils.showToast('Error de conexión', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        updateValidation();
    }
}

// ==========================================================================
// Delete
// ==========================================================================

async function deleteCorte(corteId) {
    if (!confirm('¿Estás seguro de eliminar este corte?')) return;

    try {
        const response = await API.deleteCorte(corteId);
        if (response.success) {
            allCortes = allCortes.filter(c => c.id !== corteId);
            Utils.showToast('Corte eliminado', 'success');
            updateExistingCortesForDate();
            applyCorteHistoryFilters();
            prefillFromExisting();
        } else {
            Utils.showToast(response.error || 'Error al eliminar', 'error');
        }
    } catch (error) {
        console.error('Error deleting corte:', error);
        Utils.showToast('Error de conexión', 'error');
    }
}

// ==========================================================================
// History View
// ==========================================================================

async function loadCortes() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) loadingEl.classList.add('active');

    try {
        const response = await API.getCortes();
        allCortes = (response.success ? response.data : null) || [];
    } catch (error) {
        console.error('Error loading cortes:', error);
        allCortes = [];
    } finally {
        if (loadingEl) loadingEl.classList.remove('active');
    }

    applyCorteHistoryFilters();
}

function applyCorteHistoryFilters() {
    const fechaDesde = document.getElementById('filter-fecha-desde')?.value || '';
    const fechaHasta = document.getElementById('filter-fecha-hasta')?.value || '';

    filteredCortes = allCortes.filter(corte => {
        if (fechaDesde && corte.fecha < fechaDesde) return false;
        if (fechaHasta && corte.fecha > fechaHasta) return false;
        return true;
    });

    filteredCortes.sort((a, b) => b.fecha.localeCompare(a.fecha));
    renderCorteHistory();
}

function renderCorteHistory() {
    const container = document.getElementById('cortes-history-grid');
    const emptyState = document.getElementById('empty-state-historial');
    if (!container) return;

    if (filteredCortes.length > 0) {
        container.innerHTML = filteredCortes.map(c =>
            CorteCard.render(c, { showDate: true, showDelete: true })
        ).join('');
        if (emptyState) emptyState.classList.add('hidden');
    } else {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
    }
}

// ==========================================================================
// Report View
// ==========================================================================

function generateReport() {
    const fecha = document.getElementById('report-fecha')?.value;
    if (!fecha) return;

    const container = document.getElementById('corte-report-container');
    if (!container) return;

    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) printBtn.style.display = 'inline-flex';

    const corte = allCortes.find(c => c.fecha === fecha);

    if (!corte) {
        container.innerHTML = `
            <div class="report-empty">
                <h3>Sin datos</h3>
                <p>No hay cortes registrados para ${Utils.formatDate(fecha)}</p>
            </div>
        `;
        return;
    }

    const ventas = corte.ventas || {};
    const metodos = CONFIG.CORTE_METODOS_PAGO;
    let grandTotal = 0;

    // ── Vendedora table ──
    let ventasRows = '';
    CONFIG.VENDEDORAS.forEach(v => {
        const amount = ventas[v.id] || 0;
        grandTotal += amount;
        if (amount > 0) {
            ventasRows += `<tr><td>${escapeHtml(v.name)}</td><td>${CorteCard.formatAmount(amount)}</td></tr>`;
        }
    });

    // ── Payment method table ──
    let metodosRows = '';
    let metodoTotal = 0;
    metodos.forEach(m => {
        const amount = parseFloat(corte[m.id]) || 0;
        metodoTotal += amount;
        if (amount > 0) {
            metodosRows += `<tr><td>${escapeHtml(m.name)}</td><td>${CorteCard.formatAmount(amount)}</td></tr>`;
        }
    });

    // ── Summary cards ──
    let summaryHtml = `
        <div class="report-summary-card">
            <div class="report-summary-label">Total del Día</div>
            <div class="report-summary-value total">${CorteCard.formatAmount(grandTotal)}</div>
        </div>
        <div class="report-summary-card">
            <div class="report-summary-label">Notas</div>
            <div class="report-summary-value">${corte.num_notas || 0}</div>
        </div>
    `;

    container.innerHTML = `
        <div class="report-header">
            <div class="report-title">Corte de Caja</div>
            <div class="report-subtitle">Prisma · Joyería</div>
            <div class="report-date">${Utils.formatDate(fecha)}</div>
        </div>

        <div class="report-summary">${summaryHtml}</div>

        <div class="report-two-tables">
            <div>
                <h3 class="report-section-title">Ventas por Vendedora</h3>
                <table class="report-table">
                    <thead><tr><th>Vendedora</th><th>Monto</th></tr></thead>
                    <tbody>${ventasRows || '<tr><td colspan="2" style="text-align:center; color: var(--text-muted);">—</td></tr>'}</tbody>
                    <tfoot><tr><td>Total</td><td>${CorteCard.formatAmount(grandTotal)}</td></tr></tfoot>
                </table>
            </div>
            <div>
                <h3 class="report-section-title">Desglose por Método de Pago</h3>
                <table class="report-table">
                    <thead><tr><th>Método</th><th>Monto</th></tr></thead>
                    <tbody>${metodosRows || '<tr><td colspan="2" style="text-align:center; color: var(--text-muted);">—</td></tr>'}</tbody>
                    <tfoot><tr><td>Total</td><td>${CorteCard.formatAmount(metodoTotal)}</td></tr></tfoot>
                </table>
            </div>
        </div>
    `;
}

// ==========================================================================
// View Switching
// ==========================================================================

function switchCorteView(view) {
    currentCorteView = view;

    document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${view}`);
    if (activePanel) activePanel.classList.add('active');

    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) printBtn.style.display = view === 'reporte' ? 'inline-flex' : 'none';

    if (view === 'historial') applyCorteHistoryFilters();
    else if (view === 'reporte') generateReport();
}

function printCorteReport() {
    generateReport();
    if (currentCorteView !== 'reporte') switchCorteView('reporte');
    setTimeout(() => window.print(), 200);
}

// ==========================================================================
// Helpers
// ==========================================================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
