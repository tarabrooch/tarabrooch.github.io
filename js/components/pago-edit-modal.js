/**
 * Pago Edit Modal Component
 *
 * Handles the pago editing modal with stepper status.
 */

const PagoEditModal = {
    currentPago: null,

    /**
     * Open modal with pago data
     * @param {Object} pago - Pago data
     */
    open(pago) {
        this.currentPago = pago;
        this.render(pago);
        document.getElementById('pago-edit-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close modal
     */
    close() {
        this.currentPago = null;
        document.getElementById('pago-edit-modal').classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Get status info
     * @param {string} estado - Status ID
     * @returns {Object} Status info
     */
    getStatusInfo(estado) {
        return CONFIG.PAGO_ESTADOS.find(s => s.id === estado || s.name === estado) ||
               { id: estado, name: estado, color: '#6b7280' };
    },

    /**
     * Get category name
     * @param {string} categoriaId - Category ID
     * @returns {string} Category name
     */
    getCategoryName(categoriaId) {
        const category = CONFIG.PAGO_CATEGORIES[categoriaId];
        return category ? category.name : categoriaId;
    },

    /**
     * Format currency
     * @param {number} amount - Amount
     * @param {string} currency - Currency code
     * @returns {string} Formatted string
     */
    formatCurrency(amount, currency = 'MXN') {
        const formatted = new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
        return currency === 'USD' ? `USD $${formatted}` : `$${formatted}`;
    },

    /**
     * Render modal form
     * @param {Object} pago - Pago data
     */
    render(pago) {
        const statusInfo = this.getStatusInfo(pago.estado);
        const categoryName = this.getCategoryName(pago.categoria);

        // Build category options
        const categoryOptions = Object.entries(CONFIG.PAGO_CATEGORIES).map(([key, cat]) =>
            `<option value="${key}" ${pago.categoria === key ? 'selected' : ''}>${cat.name}</option>`
        ).join('');

        // Build subcategory options
        const category = CONFIG.PAGO_CATEGORIES[pago.categoria];
        const subcategoryOptions = category ? category.subcategories.map(sub =>
            `<option value="${sub}" ${pago.subcategoria === sub ? 'selected' : ''}>${sub}</option>`
        ).join('') : '';

        const html = `
            <input type="hidden" id="edit-pago-id" value="${pago.id}">

            <!-- Pago Header (read-only summary) -->
            <div style="background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-weight: 600; font-size: 18px; color: ${statusInfo.color};">${this.formatCurrency(pago.monto, pago.moneda)}</div>
                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${this.escapeHtml(categoryName)} · ${this.escapeHtml(pago.subcategoria || '')}</div>
            </div>

            <!-- Status Stepper -->
            <div class="form-group">
                <label class="form-label">Estado del Pago</label>
                <div class="status-stepper-edit" id="status-stepper-edit">
                    ${CONFIG.PAGO_ESTADOS.map(status => `
                        <div class="status-step-edit ${pago.estado === status.id ? 'active' : ''}" data-status="${status.id}" onclick="PagoEditModal.setStatus('${status.id}')">
                            <div class="status-step-indicator-edit" style="background: ${status.color};"></div>
                            <div class="status-step-label-edit">${status.name}</div>
                        </div>
                    `).join('<div class="status-step-connector-edit"></div>')}
                </div>
                <input type="hidden" id="edit-pago-estado" value="${pago.estado}">
            </div>

            <div class="divider"></div>

            <!-- Amount & Currency -->
            <div class="input-row">
                <div class="form-group">
                    <label class="form-label">Monto</label>
                    <input type="number" class="form-input" id="edit-pago-monto" value="${pago.monto || ''}" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Moneda</label>
                    <select class="form-select" id="edit-pago-moneda">
                        <option value="MXN" ${pago.moneda === 'MXN' ? 'selected' : ''}>MXN (Pesos)</option>
                        <option value="USD" ${pago.moneda === 'USD' ? 'selected' : ''}>USD (Dólares)</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="edit-pago-es_fiscal" ${pago.es_fiscal ? 'checked' : ''}>
                    <span class="checkbox-text">Es gasto fiscal (con factura)</span>
                </label>
            </div>

            <div class="divider"></div>

            <!-- Category & Subcategory -->
            <div class="input-row">
                <div class="form-group">
                    <label class="form-label">Categoría</label>
                    <select class="form-select" id="edit-pago-categoria" onchange="PagoEditModal.updateSubcategories()">
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Subcategoría</label>
                    <select class="form-select" id="edit-pago-subcategoria">
                        ${subcategoryOptions}
                    </select>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Due Date -->
            <div class="form-group">
                <label class="form-label">Fecha de Vencimiento</label>
                <input type="date" class="form-input" id="edit-pago-fecha_vencimiento" value="${pago.fecha_vencimiento || ''}">
            </div>

            <!-- Description -->
            <div class="form-group">
                <label class="form-label">Descripción / Notas</label>
                <textarea class="form-textarea" id="edit-pago-descripcion">${this.escapeHtml(pago.descripcion || '')}</textarea>
            </div>

            <!-- Notion Link -->
            ${pago.id ? `
            <div style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 16px;">
                <a href="https://www.notion.so/${pago.id.replace(/-/g, '')}" target="_blank" style="color: var(--primary); text-decoration: none;">
                    Ver en Notion
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
            </div>
            ` : ''}
        `;

        document.getElementById('pago-modal-body').innerHTML = html;
    },

    /**
     * Set status from stepper click
     * @param {string} statusId - Status ID
     */
    setStatus(statusId) {
        // Update hidden input
        document.getElementById('edit-pago-estado').value = statusId;

        // Update UI
        const steps = document.querySelectorAll('.status-step-edit');
        steps.forEach(step => {
            step.classList.toggle('active', step.dataset.status === statusId);
        });
    },

    /**
     * Update subcategory dropdown based on selected category
     */
    updateSubcategories() {
        const categoriaSelect = document.getElementById('edit-pago-categoria');
        const subcategoriaSelect = document.getElementById('edit-pago-subcategoria');
        const selectedCategory = categoriaSelect.value;

        // Clear existing options
        subcategoriaSelect.innerHTML = '';

        // Add subcategories
        const category = CONFIG.PAGO_CATEGORIES[selectedCategory];
        if (category && category.subcategories) {
            category.subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subcategoriaSelect.appendChild(option);
            });
        }
    },

    /**
     * Get form data
     * @returns {Object} Form data
     */
    getFormData() {
        return {
            monto: parseFloat(document.getElementById('edit-pago-monto').value) || 0,
            moneda: document.getElementById('edit-pago-moneda').value,
            es_fiscal: document.getElementById('edit-pago-es_fiscal').checked,
            categoria: document.getElementById('edit-pago-categoria').value,
            subcategoria: document.getElementById('edit-pago-subcategoria').value,
            fecha_vencimiento: document.getElementById('edit-pago-fecha_vencimiento').value || null,
            estado: document.getElementById('edit-pago-estado').value,
            descripcion: document.getElementById('edit-pago-descripcion').value.trim() || null
        };
    },

    /**
     * Escape HTML attribute
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeAttr(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    /**
     * Escape HTML
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Global functions for onclick handlers
function openPagoEditModal(pagoId) {
    if (typeof window.handleOpenPagoEditModal === 'function') {
        window.handleOpenPagoEditModal(pagoId);
    }
}

function closePagoEditModal() {
    PagoEditModal.close();
}

function savePago() {
    if (typeof window.handleSavePago === 'function') {
        window.handleSavePago();
    }
}
