/**
 * Cortes (Daily Sales Closings) Page
 *
 * Main logic for logging and viewing daily sales closings by vendedora and payment method.
 */

// State
let allCortes = [];
let filteredCortes = [];
let currentCorteView = 'registro';
let selectedVendedora = null;

/**
 * Initialize cortes page
 */
async function initCortesPage() {
    // Set today's date as default
    const today = Utils.formatDateForInput(new Date());
    const fechaInput = document.getElementById('corte-fecha');
    if (fechaInput) {
        fechaInput.value = today;
    }

    const reportFechaInput = document.getElementById('report-fecha');
    if (reportFechaInput) {
        reportFechaInput.value = today;
    }

    // Initialize vendedora chips
    initVendedoraChips();

    // Initialize payment method form
    initPaymentForm();

    // Initialize history filters
    initHistoryFilters();

    // Set default date range for history (last 30 days)
    const thirtyDaysAgo = Utils.formatDateForInput(Utils.subtractDays(new Date(), 30));
    const filterDesde = document.getElementById('filter-fecha-desde');
    const filterHasta = document.getElementById('filter-fecha-hasta');
    if (filterDesde) filterDesde.value = thirtyDaysAgo;
    if (filterHasta) filterHasta.value = today;

    // Load existing cortes
    await loadCortes();

    // Show cortes for today
    updateExistingCortesForDate();
}

/**
 * Initialize vendedora selector chips
 */
function initVendedoraChips() {
    const container = document.getElementById('corte-vendedora-chips');
    if (!container) return;

    let html = '';
    CONFIG.VENDEDORAS.forEach(vendedora => {
        html += `<button class="user-chip" data-vendedora="${vendedora.id}" onclick="selectVendedora('${vendedora.id}')">${vendedora.name}</button>`;
    });

    container.innerHTML = html;
}

/**
 * Select a vendedora for the corte entry
 * @param {string} vendedoraId - Vendedora ID
 */
function selectVendedora(vendedoraId) {
    selectedVendedora = vendedoraId;

    // Update chip styles
    document.querySelectorAll('#corte-vendedora-chips .user-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.vendedora === vendedoraId);
    });

    // Show payment form
    const paymentForm = document.getElementById('corte-payment-form');
    if (paymentForm) {
        paymentForm.style.display = 'block';
    }

    // Clear the form
    clearPaymentForm();

    // Check if there's already a corte for this vendedora on the selected date
    const fecha = document.getElementById('corte-fecha').value;
    const existing = allCortes.find(c =>
        c.vendedora === vendedoraId && c.fecha === fecha
    );

    if (existing) {
        // Pre-fill with existing data
        CONFIG.CORTE_METODOS_PAGO.forEach(metodo => {
            const input = document.getElementById(`corte-${metodo.id}`);
            if (input && existing[metodo.id]) {
                input.value = existing[metodo.id];
            }
        });

        const notasInput = document.getElementById('corte-num-notas');
        if (notasInput && existing.num_notas) {
            notasInput.value = existing.num_notas;
        }

        updateCorteTotal();
    }
}

/**
 * Initialize payment method input fields
 */
function initPaymentForm() {
    const grid = document.getElementById('corte-payment-grid');
    if (!grid) return;

    let html = '';
    CONFIG.CORTE_METODOS_PAGO.forEach(metodo => {
        html += `
            <div class="corte-payment-item">
                <div class="corte-payment-label">
                    <span class="corte-payment-icon ${metodo.id}">
                        ${CorteCard.getMethodIcon(metodo.id)}
                    </span>
                    ${metodo.name}
                </div>
                <input
                    type="number"
                    class="corte-payment-input"
                    id="corte-${metodo.id}"
                    min="0"
                    step="0.01"
                    placeholder="$0.00"
                    oninput="updateCorteTotal()">
            </div>
        `;
    });

    grid.innerHTML = html;
}

/**
 * Clear the payment form
 */
function clearPaymentForm() {
    CONFIG.CORTE_METODOS_PAGO.forEach(metodo => {
        const input = document.getElementById(`corte-${metodo.id}`);
        if (input) input.value = '';
    });

    const notasInput = document.getElementById('corte-num-notas');
    if (notasInput) notasInput.value = '';

    updateCorteTotal();
}

/**
 * Update the total display based on current input values
 */
function updateCorteTotal() {
    let total = 0;
    CONFIG.CORTE_METODOS_PAGO.forEach(metodo => {
        const input = document.getElementById(`corte-${metodo.id}`);
        if (input && input.value) {
            total += parseFloat(input.value) || 0;
        }
    });

    const totalEl = document.getElementById('corte-total');
    if (totalEl) {
        totalEl.textContent = CorteCard.formatAmount(total);
    }
}

/**
 * Handle date change in the registration form
 */
function onCorteDateChange() {
    // If vendedora is selected, check for existing data
    if (selectedVendedora) {
        selectVendedora(selectedVendedora);
    }

    updateExistingCortesForDate();
}

/**
 * Show existing cortes for the selected date
 */
function updateExistingCortesForDate() {
    const fecha = document.getElementById('corte-fecha')?.value;
    if (!fecha) return;

    const cortesForDate = allCortes.filter(c => c.fecha === fecha);
    const section = document.getElementById('corte-existing-section');
    const list = document.getElementById('corte-existing-list');

    if (cortesForDate.length > 0 && section && list) {
        section.style.display = 'block';
        list.innerHTML = cortesForDate.map(c =>
            CorteCard.render(c, { showDate: false, showDelete: true })
        ).join('');
    } else if (section) {
        section.style.display = 'none';
    }
}

/**
 * Save a corte entry
 */
async function saveCorte() {
    if (!selectedVendedora) {
        Utils.showToast('Selecciona una vendedora', 'warning');
        return;
    }

    const fecha = document.getElementById('corte-fecha').value;
    if (!fecha) {
        Utils.showToast('Selecciona una fecha', 'warning');
        return;
    }

    // Gather payment data
    const corteData = {
        fecha: fecha,
        vendedora: selectedVendedora,
        num_notas: parseInt(document.getElementById('corte-num-notas').value) || 0
    };

    let hasAmount = false;
    CONFIG.CORTE_METODOS_PAGO.forEach(metodo => {
        const input = document.getElementById(`corte-${metodo.id}`);
        const value = parseFloat(input?.value) || 0;
        corteData[metodo.id] = value;
        if (value > 0) hasAmount = true;
    });

    if (!hasAmount) {
        Utils.showToast('Ingresa al menos un monto', 'warning');
        return;
    }

    // Check if updating existing or creating new
    const existingIndex = allCortes.findIndex(c =>
        c.vendedora === selectedVendedora && c.fecha === fecha
    );

    const saveBtn = document.getElementById('corte-save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = 'Guardando...';
    saveBtn.disabled = true;

    try {
        if (existingIndex !== -1) {
            // Update existing
            const existingId = allCortes[existingIndex].id;
            const response = await API.updateCorte(existingId, corteData);

            if (response.success) {
                allCortes[existingIndex] = { ...allCortes[existingIndex], ...corteData };
                Utils.showToast('Corte actualizado', 'success');
            } else {
                Utils.showToast(response.error || 'Error al actualizar', 'error');
            }
        } else {
            // Create new
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

        // Refresh displays
        updateExistingCortesForDate();
        applyCorteHistoryFilters();

    } catch (error) {
        console.error('Error saving corte:', error);
        Utils.showToast('Error de conexión', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

/**
 * Delete a corte entry
 * @param {string} corteId - Corte ID
 */
async function deleteCorte(corteId) {
    if (!confirm('¿Estás seguro de eliminar este corte?')) return;

    try {
        const response = await API.deleteCorte(corteId);

        if (response.success) {
            allCortes = allCortes.filter(c => c.id !== corteId);
            Utils.showToast('Corte eliminado', 'success');
            updateExistingCortesForDate();
            applyCorteHistoryFilters();
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

/**
 * Initialize history filter dropdowns
 */
function initHistoryFilters() {
    const vendedoraSelect = document.getElementById('filter-vendedora');
    if (vendedoraSelect) {
        CONFIG.VENDEDORAS.forEach(vendedora => {
            const option = document.createElement('option');
            option.value = vendedora.id;
            option.textContent = vendedora.name;
            vendedoraSelect.appendChild(option);
        });
    }
}

/**
 * Load cortes from API
 */
async function loadCortes() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) loadingEl.classList.add('active');

    try {
        const response = await API.getCortes();

        if (response.success) {
            allCortes = response.data || [];
        } else {
            allCortes = [];
        }
    } catch (error) {
        console.error('Error loading cortes:', error);
        allCortes = [];
    } finally {
        if (loadingEl) loadingEl.classList.remove('active');
    }

    applyCorteHistoryFilters();
}

/**
 * Apply filters to history view
 */
function applyCorteHistoryFilters() {
    const vendedora = document.getElementById('filter-vendedora')?.value || '';
    const fechaDesde = document.getElementById('filter-fecha-desde')?.value || '';
    const fechaHasta = document.getElementById('filter-fecha-hasta')?.value || '';

    filteredCortes = allCortes.filter(corte => {
        if (vendedora && corte.vendedora !== vendedora) return false;
        if (fechaDesde && corte.fecha < fechaDesde) return false;
        if (fechaHasta && corte.fecha > fechaHasta) return false;
        return true;
    });

    // Sort by date descending, then vendedora
    filteredCortes.sort((a, b) => {
        const dateCompare = b.fecha.localeCompare(a.fecha);
        if (dateCompare !== 0) return dateCompare;
        return (a.vendedora || '').localeCompare(b.vendedora || '');
    });

    renderCorteHistory();
}

/**
 * Render the history list
 */
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

/**
 * Generate a printable report for a given date
 */
function generateReport() {
    const fecha = document.getElementById('report-fecha')?.value;
    if (!fecha) return;

    const container = document.getElementById('corte-report-container');
    if (!container) return;

    // Show print button
    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) printBtn.style.display = 'inline-flex';

    const cortesForDate = allCortes.filter(c => c.fecha === fecha);

    if (cortesForDate.length === 0) {
        container.innerHTML = `
            <div class="report-empty">
                <h3>Sin datos</h3>
                <p>No hay cortes registrados para ${Utils.formatDate(fecha)}</p>
            </div>
        `;
        return;
    }

    // Build report data
    const metodos = CONFIG.CORTE_METODOS_PAGO;
    let grandTotals = {};
    metodos.forEach(m => { grandTotals[m.id] = 0; });
    let grandTotal = 0;
    let totalNotas = 0;

    // Table rows per vendedora
    let rowsHtml = '';
    cortesForDate.forEach(corte => {
        const vendedora = CONFIG.VENDEDORAS.find(v => v.id === corte.vendedora);
        const name = vendedora ? vendedora.name : corte.vendedora;
        let rowTotal = 0;

        rowsHtml += '<tr>';
        rowsHtml += `<td>${escapeHtmlReport(name)}</td>`;

        metodos.forEach(m => {
            const amount = parseFloat(corte[m.id]) || 0;
            rowTotal += amount;
            grandTotals[m.id] += amount;
            rowsHtml += `<td>${amount > 0 ? CorteCard.formatAmount(amount) : '-'}</td>`;
        });

        grandTotal += rowTotal;
        totalNotas += (corte.num_notas || 0);

        rowsHtml += `<td class="report-row-total">${CorteCard.formatAmount(rowTotal)}</td>`;
        rowsHtml += `<td>${corte.num_notas || 0}</td>`;
        rowsHtml += '</tr>';
    });

    // Table header
    let headerHtml = '<tr><th>Vendedora</th>';
    metodos.forEach(m => {
        headerHtml += `<th>${m.name}</th>`;
    });
    headerHtml += '<th>Total</th><th>Notas</th></tr>';

    // Footer totals
    let footerHtml = '<tr><td>Totales</td>';
    metodos.forEach(m => {
        footerHtml += `<td>${grandTotals[m.id] > 0 ? CorteCard.formatAmount(grandTotals[m.id]) : '-'}</td>`;
    });
    footerHtml += `<td>${CorteCard.formatAmount(grandTotal)}</td>`;
    footerHtml += `<td>${totalNotas}</td>`;
    footerHtml += '</tr>';

    // Summary cards
    let summaryHtml = `
        <div class="report-summary-card">
            <div class="report-summary-label">Total del Día</div>
            <div class="report-summary-value total">${CorteCard.formatAmount(grandTotal)}</div>
        </div>
        <div class="report-summary-card">
            <div class="report-summary-label">Total de Notas</div>
            <div class="report-summary-value">${totalNotas}</div>
        </div>
    `;

    metodos.forEach(m => {
        if (grandTotals[m.id] > 0) {
            summaryHtml += `
                <div class="report-summary-card">
                    <div class="report-summary-label">${m.name}</div>
                    <div class="report-summary-value">${CorteCard.formatAmount(grandTotals[m.id])}</div>
                </div>
            `;
        }
    });

    container.innerHTML = `
        <div class="report-header">
            <div class="report-title">Corte de Caja</div>
            <div class="report-subtitle">Prisma · Joyería</div>
            <div class="report-date">${Utils.formatDate(fecha)}</div>
        </div>

        <div class="report-summary">
            ${summaryHtml}
        </div>

        <table class="report-table">
            <thead>${headerHtml}</thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>${footerHtml}</tfoot>
        </table>
    `;
}

/**
 * Escape HTML in report context
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtmlReport(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==========================================================================
// View Switching
// ==========================================================================

/**
 * Switch between views
 * @param {string} view - 'registro', 'historial', or 'reporte'
 */
function switchCorteView(view) {
    currentCorteView = view;

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

    // Show/hide print button
    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) {
        printBtn.style.display = view === 'reporte' ? 'inline-flex' : 'none';
    }

    // View-specific initialization
    if (view === 'historial') {
        applyCorteHistoryFilters();
    } else if (view === 'reporte') {
        generateReport();
    }
}

/**
 * Print the corte report
 */
function printCorteReport() {
    // Make sure report is generated
    generateReport();

    // Switch to report view if not already
    if (currentCorteView !== 'reporte') {
        switchCorteView('reporte');
    }

    // Trigger print
    setTimeout(() => {
        window.print();
    }, 200);
}
