/**
 * Desglose (Breakdown) Modal Component
 *
 * Allows the business owner to break down a "Método de Pago" pago
 * into individual line items classified as personal or negocio.
 */

const DesgloseModal = {
    currentPagoId: null,
    currentPagoMonto: 0,
    currentPagoMoneda: 'MXN',
    lineItems: [],
    isLoading: false,
    pendingPago: null,

    /**
     * Check if desglose session is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const session = sessionStorage.getItem('prisma_desglose_session');
        if (!session) return false;
        try {
            return JSON.parse(session).authenticated === true;
        } catch {
            return false;
        }
    },

    /**
     * Store desglose session
     */
    storeSession() {
        sessionStorage.setItem('prisma_desglose_session', JSON.stringify({
            authenticated: true,
            timestamp: Date.now()
        }));
    },

    /**
     * Open the desglose modal for a given pago
     * @param {Object} pago - Pago data
     */
    async open(pago) {
        this.currentPagoId = pago.id;
        this.currentPagoMonto = pago.monto || 0;
        this.currentPagoMoneda = pago.moneda || 'MXN';

        document.getElementById('desglose-modal').classList.add('active');
        document.body.style.overflow = 'hidden';

        // Check auth before showing content
        if (!this.isAuthenticated()) {
            this.pendingPago = pago;
            this.renderPasswordGate();
            return;
        }

        await this.loadContent(pago);
    },

    /**
     * Render password gate inside the modal body
     */
    renderPasswordGate() {
        const body = document.getElementById('desglose-modal-body');
        body.innerHTML = `
            <div class="desglose-password-gate">
                <div class="desglose-password-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 class="desglose-password-title">Acceso al Desglose</h3>
                <p class="desglose-password-desc">Ingresa la contraseña para ver y editar el desglose de partidas.</p>
                <input type="password" class="form-input desglose-password-input" id="desglose-password-input" placeholder="Contraseña" onkeypress="if(event.key==='Enter') DesgloseModal.checkPassword()">
                <p class="desglose-password-error" id="desglose-password-error">Contraseña incorrecta</p>
                <button class="btn btn-primary desglose-password-btn" onclick="DesgloseModal.checkPassword()">Entrar</button>
            </div>
        `;

        // Hide the footer buttons while on password gate
        document.getElementById('desglose-modal-save-btn').style.display = 'none';

        setTimeout(() => {
            const input = document.getElementById('desglose-password-input');
            if (input) input.focus();
        }, 100);
    },

    /**
     * Validate the entered password
     */
    async checkPassword() {
        const input = document.getElementById('desglose-password-input');
        const error = document.getElementById('desglose-password-error');

        if (input.value === CONFIG.DESGLOSE_PASSWORD) {
            error.classList.remove('visible');
            input.classList.remove('error');
            this.storeSession();

            // Restore save button visibility
            document.getElementById('desglose-modal-save-btn').style.display = '';

            // Load the actual content
            if (this.pendingPago) {
                await this.loadContent(this.pendingPago);
                this.pendingPago = null;
            }
        } else {
            error.classList.add('visible');
            input.classList.add('error', 'shake');
            setTimeout(() => input.classList.remove('shake'), 300);
            input.select();
        }
    },

    /**
     * Load desglose content after authentication
     * @param {Object} pago - Pago data
     */
    async loadContent(pago) {
        // If desglose data already loaded on the pago object, use it
        if (pago.desglose && Array.isArray(pago.desglose)) {
            this.lineItems = JSON.parse(JSON.stringify(pago.desglose));
        } else {
            this.lineItems = [];
        }

        this.render();

        // If no cached desglose, try fetching from API
        if (!pago.desglose) {
            await this.loadFromAPI(pago.id);
        }
    },

    /**
     * Load desglose from API
     * @param {string} pagoId - Pago ID
     */
    async loadFromAPI(pagoId) {
        try {
            this.isLoading = true;
            this.renderLoadingState();
            const response = await API.getDesglose(pagoId);
            if (response.success && Array.isArray(response.data)) {
                this.lineItems = response.data;
            }
        } catch (error) {
            console.warn('Could not load desglose:', error);
        } finally {
            this.isLoading = false;
            this.render();
        }
    },

    /**
     * Close the modal
     */
    close() {
        this.currentPagoId = null;
        this.lineItems = [];
        document.getElementById('desglose-modal').classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Add a new empty line item
     */
    addLineItem() {
        this.lineItems.push({
            descripcion: '',
            monto: 0,
            tipo: 'negocio',
            categoria: '',
            subcategoria: '',
            es_fiscal: false
        });
        this.render();

        // Focus the new description input
        setTimeout(() => {
            const inputs = document.querySelectorAll('.desglose-item-desc');
            if (inputs.length > 0) {
                inputs[inputs.length - 1].focus();
            }
        }, 50);
    },

    /**
     * Remove a line item by index
     * @param {number} index - Index to remove
     */
    removeLineItem(index) {
        this.lineItems.splice(index, 1);
        this.render();
    },

    /**
     * Update a line item field
     * @param {number} index - Line item index
     * @param {string} field - Field name
     * @param {*} value - New value
     */
    updateLineItem(index, field, value) {
        if (!this.lineItems[index]) return;
        this.lineItems[index][field] = value;

        // When tipo changes to personal, clear category fields
        if (field === 'tipo' && value === 'personal') {
            this.lineItems[index].categoria = '';
            this.lineItems[index].subcategoria = '';
        }

        // When categoria changes, reset subcategoria
        if (field === 'categoria') {
            this.lineItems[index].subcategoria = '';
        }

        this.render();
    },

    /**
     * Sync line item values from DOM inputs (for fields that don't trigger full re-render)
     */
    syncFromDOM() {
        this.lineItems.forEach((item, i) => {
            const descInput = document.getElementById(`desglose-desc-${i}`);
            const montoInput = document.getElementById(`desglose-monto-${i}`);
            if (descInput) item.descripcion = descInput.value;
            if (montoInput) item.monto = parseFloat(montoInput.value) || 0;
        });
    },

    /**
     * Calculate totals
     * @returns {Object} Totals object
     */
    getTotals() {
        let totalDesglose = 0;
        let totalPersonal = 0;
        let totalNegocio = 0;

        this.lineItems.forEach(item => {
            const monto = parseFloat(item.monto) || 0;
            totalDesglose += monto;
            if (item.tipo === 'personal') {
                totalPersonal += monto;
            } else {
                totalNegocio += monto;
            }
        });

        return {
            totalDesglose,
            totalPersonal,
            totalNegocio,
            sinAsignar: this.currentPagoMonto - totalDesglose
        };
    },

    /**
     * Format currency amount
     * @param {number} amount - Amount
     * @returns {string} Formatted string
     */
    formatCurrency(amount) {
        const formatted = new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
        const prefix = this.currentPagoMoneda === 'USD' ? 'USD $' : '$';
        return `${amount < 0 ? '-' : ''}${prefix}${formatted}`;
    },

    /**
     * Build category options HTML (excluding metodo_pago)
     * @param {string} selected - Selected category key
     * @returns {string} HTML options
     */
    buildCategoryOptions(selected) {
        let html = '<option value="">-- Categoría --</option>';
        for (const [key, cat] of Object.entries(CONFIG.PAGO_CATEGORIES)) {
            if (key === 'metodo_pago') continue;
            html += `<option value="${key}" ${selected === key ? 'selected' : ''}>${cat.name}</option>`;
        }
        return html;
    },

    /**
     * Build subcategory options HTML
     * @param {string} categoriaKey - Category key
     * @param {string} selected - Selected subcategory
     * @returns {string} HTML options
     */
    buildSubcategoryOptions(categoriaKey, selected) {
        let html = '<option value="">-- Subcategoría --</option>';
        const category = CONFIG.PAGO_CATEGORIES[categoriaKey];
        if (category && category.subcategories) {
            category.subcategories.forEach(sub => {
                html += `<option value="${sub}" ${selected === sub ? 'selected' : ''}>${sub}</option>`;
            });
        }
        return html;
    },

    /**
     * Show loading state
     */
    renderLoadingState() {
        const body = document.getElementById('desglose-modal-body');
        if (body) {
            body.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Cargando desglose...</div>';
        }
    },

    /**
     * Render the modal content
     */
    render() {
        const totals = this.getTotals();
        const balanceOk = Math.abs(totals.sinAsignar) < 0.01;
        const hasItems = this.lineItems.length > 0;

        // Build line items HTML
        let itemsHtml = '';
        this.lineItems.forEach((item, i) => {
            const isPersonal = item.tipo === 'personal';
            const tipoBadgeClass = isPersonal ? 'desglose-tipo-personal' : 'desglose-tipo-negocio';
            const tipoBadgeText = isPersonal ? 'Personal' : 'Negocio';

            itemsHtml += `
                <div class="desglose-item" data-index="${i}">
                    <div class="desglose-item-header">
                        <span class="desglose-item-number">#${i + 1}</span>
                        <button class="desglose-item-remove" onclick="DesgloseModal.syncFromDOM(); DesgloseModal.removeLineItem(${i})" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <div class="desglose-item-row">
                        <div class="desglose-item-field desglose-item-field-desc">
                            <label class="desglose-field-label">Descripción</label>
                            <input type="text" class="form-input desglose-item-desc" id="desglose-desc-${i}" value="${this.escapeAttr(item.descripcion)}" placeholder="Ej: Compra de piedras">
                        </div>
                        <div class="desglose-item-field desglose-item-field-monto">
                            <label class="desglose-field-label">Monto</label>
                            <input type="number" class="form-input desglose-item-monto" id="desglose-monto-${i}" value="${item.monto || ''}" step="0.01" min="0" placeholder="0.00" onchange="DesgloseModal.syncFromDOM(); DesgloseModal.render();">
                        </div>
                    </div>
                    <div class="desglose-item-row">
                        <div class="desglose-item-field">
                            <label class="desglose-field-label">Tipo</label>
                            <div class="desglose-tipo-toggle">
                                <button class="desglose-tipo-btn ${!isPersonal ? 'active desglose-tipo-negocio' : ''}" onclick="DesgloseModal.syncFromDOM(); DesgloseModal.updateLineItem(${i}, 'tipo', 'negocio')">Negocio</button>
                                <button class="desglose-tipo-btn ${isPersonal ? 'active desglose-tipo-personal' : ''}" onclick="DesgloseModal.syncFromDOM(); DesgloseModal.updateLineItem(${i}, 'tipo', 'personal')">Personal</button>
                            </div>
                        </div>
                        <div class="desglose-item-field">
                            <label class="desglose-field-label">
                                <input type="checkbox" ${item.es_fiscal ? 'checked' : ''} onchange="DesgloseModal.syncFromDOM(); DesgloseModal.updateLineItem(${i}, 'es_fiscal', this.checked)">
                                Fiscal
                            </label>
                        </div>
                    </div>
                    ${!isPersonal ? `
                    <div class="desglose-item-row">
                        <div class="desglose-item-field">
                            <label class="desglose-field-label">Categoría P&L</label>
                            <select class="form-select desglose-cat-select" onchange="DesgloseModal.syncFromDOM(); DesgloseModal.updateLineItem(${i}, 'categoria', this.value)">
                                ${this.buildCategoryOptions(item.categoria)}
                            </select>
                        </div>
                        <div class="desglose-item-field">
                            <label class="desglose-field-label">Subcategoría</label>
                            <select class="form-select" onchange="DesgloseModal.syncFromDOM(); DesgloseModal.updateLineItem(${i}, 'subcategoria', this.value)">
                                ${this.buildSubcategoryOptions(item.categoria, item.subcategoria)}
                            </select>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        });

        // Totals summary
        const sinAsignarClass = balanceOk ? 'desglose-balance-ok' : (totals.sinAsignar < 0 ? 'desglose-balance-over' : 'desglose-balance-pending');
        const sinAsignarLabel = balanceOk ? 'Cuadra' : (totals.sinAsignar < 0 ? 'Excedente' : 'Sin asignar');

        const html = `
            <div class="desglose-summary-header">
                <div class="desglose-pago-total">
                    Total del pago: <strong>${this.formatCurrency(this.currentPagoMonto)}</strong>
                </div>
            </div>

            <div class="desglose-items-container">
                ${hasItems ? itemsHtml : '<div class="desglose-empty">No hay partidas. Agrega una para comenzar el desglose.</div>'}
            </div>

            <button class="btn btn-secondary desglose-add-btn" onclick="DesgloseModal.syncFromDOM(); DesgloseModal.addLineItem()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                Agregar partida
            </button>

            ${hasItems ? `
            <div class="desglose-totals">
                <div class="desglose-totals-row">
                    <span>Total desglose:</span>
                    <span>${this.formatCurrency(totals.totalDesglose)}</span>
                </div>
                <div class="desglose-totals-row desglose-totals-negocio">
                    <span>Negocio:</span>
                    <span>${this.formatCurrency(totals.totalNegocio)}</span>
                </div>
                <div class="desglose-totals-row desglose-totals-personal">
                    <span>Personal:</span>
                    <span>${this.formatCurrency(totals.totalPersonal)}</span>
                </div>
                <div class="desglose-totals-row desglose-totals-balance ${sinAsignarClass}">
                    <span>${sinAsignarLabel}:</span>
                    <span>${balanceOk ? '0.00' : this.formatCurrency(Math.abs(totals.sinAsignar))}</span>
                </div>
            </div>
            ` : ''}
        `;

        document.getElementById('desglose-modal-body').innerHTML = html;
    },

    /**
     * Save desglose to API
     */
    async save() {
        this.syncFromDOM();

        // Validate
        const errors = [];
        this.lineItems.forEach((item, i) => {
            if (!item.descripcion || !item.descripcion.trim()) {
                errors.push(`Partida #${i + 1}: descripción requerida`);
            }
            if (!item.monto || item.monto <= 0) {
                errors.push(`Partida #${i + 1}: monto debe ser mayor a 0`);
            }
            if (item.tipo === 'negocio' && !item.categoria) {
                errors.push(`Partida #${i + 1}: categoría P&L requerida para partidas de negocio`);
            }
        });

        if (errors.length > 0) {
            Utils.showToast(errors[0], 'error');
            return;
        }

        const saveBtn = document.getElementById('desglose-modal-save-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Guardando...';
        saveBtn.disabled = true;

        try {
            const response = await API.updateDesglose(this.currentPagoId, this.lineItems);

            if (response.success) {
                Utils.showToast('Desglose guardado', 'success');

                // Update local pago data
                const pago = allPagos.find(p => p.id === this.currentPagoId);
                if (pago) {
                    pago.desglose = JSON.parse(JSON.stringify(this.lineItems));
                }

                this.close();

                // Re-render views
                if (typeof applyPagoFilters === 'function') {
                    applyPagoFilters();
                }
            } else {
                Utils.showToast(response.error || 'Error al guardar desglose', 'error');
            }
        } catch (error) {
            console.error('Error saving desglose:', error);
            Utils.showToast('Error de conexión', 'error');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    },

    /**
     * Escape HTML attribute
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

// Global function for onclick
function openDesgloseModal(pagoId) {
    const pago = allPagos.find(p => p.id === pagoId);
    if (pago) {
        DesgloseModal.open(pago);
    }
}

function closeDesgloseModal() {
    DesgloseModal.close();
}

function saveDesglose() {
    DesgloseModal.save();
}
