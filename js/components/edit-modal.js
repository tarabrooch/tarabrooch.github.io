/**
 * Edit Modal Component
 *
 * Handles the order editing modal.
 */

const EditModal = {
    currentOrder: null,
    pendingAbono: null, // Stores abono data to be added as a change entry

    /**
     * Open modal with order data
     * @param {Object} order - Order data
     */
    open(order) {
        this.currentOrder = order;
        this.render(order);
        document.getElementById('edit-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close modal
     */
    close() {
        this.currentOrder = null;
        document.getElementById('edit-modal').classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Render modal form
     * @param {Object} order - Order data
     */
    render(order) {
        const saldo = (order.importe_total || 0) - (order.anticipo || 0);

        // Build status options
        const statusOptions = CONFIG.ESTADOS.map(s =>
            `<option value="${s.id}" ${order.estado === s.name ? 'selected' : ''}>${s.name}</option>`
        ).join('');

        // Build joyero options with grouped sections (Joyeros and Proveedores)
        const joyerosOptions = CONFIG.getJoyerosOnly().map(j =>
            `<option value="${j.name}" ${order.joyero === j.name ? 'selected' : ''}>${j.name}</option>`
        ).join('');
        const proveedoresOptions = CONFIG.getProveedoresOnly().map(j =>
            `<option value="${j.name}" ${order.joyero === j.name ? 'selected' : ''}>${j.name}</option>`
        ).join('');
        const joyeroOptions = `
            <optgroup label="Joyeros">${joyerosOptions}</optgroup>
            <optgroup label="Proveedores">${proveedoresOptions}</optgroup>
        `;

        // Build tipo pedido options
        const tipoOptions = CONFIG.TIPOS_PEDIDO.map(t =>
            `<option value="${t.id}" ${order.tipo_pedido === t.name || order.tipo_pedido === t.id ? 'selected' : ''}>${t.name}</option>`
        ).join('');

        // Build gemas origen options
        const gemasOrigenOptions = CONFIG.GEMAS_ORIGEN.map(g =>
            `<option value="${g.id}" ${order.gemas_origen === g.name || order.gemas_origen === g.id ? 'selected' : ''}>${g.name}</option>`
        ).join('');

        const html = `
            <input type="hidden" id="edit-order-id" value="${order.id}">

            <!-- Order Header (read-only summary) -->
            <div style="background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-weight: 600; font-size: 16px;">[${this.escapeHtml(order.numero_orden || 'Sin número')}] ${this.escapeHtml(order.nombre_cliente || 'Sin nombre')}</div>
                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || 'Sin tipo'} · ${Utils.formatCurrency(order.importe_total)} · Saldo: ${Utils.formatCurrency(saldo)}</div>
            </div>

            <!-- ========== COMMON FIELDS ========== -->

            <!-- Status -->
            <div class="form-group">
                <label class="form-label">Estado</label>
                <select class="form-select" id="edit-estado">
                    ${statusOptions}
                </select>
            </div>

            <!-- Quick Actions -->
            <div class="form-group">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="btn btn-success btn-sm" onclick="EditModal.markAsDelivered()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Marcar Entregado
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="EditModal.markAsReady()">
                        Listo para Entrega
                    </button>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Production: Oro & Joyero -->
            <div class="input-row">
                <div class="form-group">
                    <label class="form-label">Oro (gramos)</label>
                    <input type="number" class="form-input" id="edit-oro_gramos" value="${order.oro_gramos || ''}" step="0.1" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Joyero</label>
                    <select class="form-select" id="edit-joyero">
                        <option value="">Sin asignar</option>
                        ${joyeroOptions}
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="edit-oro_con_joyero" ${order.oro_con_joyero ? 'checked' : ''}>
                    <span class="checkbox-text">Oro entregado al joyero</span>
                </label>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="edit-requiere_certificado" ${order.requiere_certificado ? 'checked' : ''}>
                    <span class="checkbox-text">Requiere Certificado</span>
                </label>
                <p class="form-hint" style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; margin-left: 28px;">Marcar si el pedido requiere un certificado</p>
            </div>

            <div class="divider"></div>

            <!-- Gemas -->
            <div class="form-group">
                <label class="form-label">Gemas Requeridas</label>
                <textarea class="form-textarea" id="edit-gemas_requeridas" style="min-height: 60px;">${this.escapeHtml(order.gemas_requeridas || '')}</textarea>
            </div>

            <div class="input-row">
                <div class="form-group">
                    <label class="form-label">Origen de Gemas</label>
                    <select class="form-select" id="edit-gemas_origen">
                        <option value="">No aplica</option>
                        ${gemasOrigenOptions}
                    </select>
                </div>
                <div class="form-group" style="display: flex; align-items: flex-end;">
                    <label class="checkbox-label">
                        <input type="checkbox" id="edit-gemas_listas" ${order.gemas_listas ? 'checked' : ''}>
                        <span class="checkbox-text">Gemas listas</span>
                    </label>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Notes -->
            <div class="form-group">
                <label class="form-label">Notas</label>
                <textarea class="form-textarea" id="edit-notas">${this.escapeHtml(order.notas || '')}</textarea>
            </div>

            <!-- ========== ORDER DETAILS (less frequently edited) ========== -->
            <div class="divider"></div>
            <div style="background: #f9fafb; margin: 0 -20px; padding: 16px 20px; border-top: 1px solid #e5e7eb;">
                <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">Detalles del Pedido</div>

                <!-- Order Number & Customer -->
                <div class="input-row">
                    <div class="form-group">
                        <label class="form-label">Número de Orden</label>
                        <input type="text" class="form-input" id="edit-numero_orden" value="${this.escapeAttr(order.numero_orden || '')}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nombre del Cliente</label>
                        <input type="text" class="form-input" id="edit-nombre_cliente" value="${this.escapeAttr(order.nombre_cliente || '')}">
                    </div>
                </div>

                <div class="input-row">
                    <div class="form-group">
                        <label class="form-label">Teléfono</label>
                        <input type="text" class="form-input" id="edit-telefono_cliente" value="${this.escapeAttr(order.telefono_cliente || '')}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de Pedido</label>
                        <select class="form-select" id="edit-tipo_pedido">
                            <option value="">Seleccionar...</option>
                            ${tipoOptions}
                        </select>
                    </div>
                </div>

                <!-- Description -->
                <div class="form-group">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-textarea" id="edit-descripcion">${this.escapeHtml(order.descripcion || '')}</textarea>
                </div>

                <!-- Pricing -->
                <div class="input-row">
                    <div class="form-group">
                        <label class="form-label">Importe Total</label>
                        <input type="number" class="form-input" id="edit-importe_total" value="${order.importe_total || 0}" step="0.01" min="0" onchange="EditModal.updateSaldo()">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Anticipo</label>
                        <input type="number" class="form-input" id="edit-anticipo" value="${order.anticipo || 0}" step="0.01" min="0" onchange="EditModal.updateSaldo()">
                        <!-- Abono Button -->
                        <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 12px; width: 100%;" onclick="EditModal.openAbonoForm()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Registrar Abono
                        </button>
                        <!-- Abono Form (collapsible) -->
                        <div id="abono-form-container" class="abono-form-container" style="display: none;">
                            <div class="abono-form">
                                <div class="form-group" style="margin-bottom: 12px;">
                                    <label class="form-label">Monto del Abono</label>
                                    <input type="number" class="form-input" id="abono-monto" step="0.01" min="0" placeholder="0.00">
                                </div>
                                <div class="form-group" style="margin-bottom: 12px;">
                                    <label class="form-label">Número de Nota</label>
                                    <input type="text" class="form-input" id="abono-nota" placeholder="Ej: 1234">
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button type="button" class="btn btn-secondary btn-sm" style="flex: 1;" onclick="EditModal.closeAbonoForm()">Cancelar</button>
                                    <button type="button" class="btn btn-success btn-sm" style="flex: 1;" onclick="EditModal.confirmAbono()">Confirmar Abono</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Saldo Pendiente</label>
                    <div class="saldo-display" id="edit-saldo-display">${Utils.formatCurrency(saldo)}</div>
                </div>

                <!-- Dates -->
                <div class="input-row">
                    <div class="form-group">
                        <label class="form-label">Fecha Entrega Cliente</label>
                        <input type="date" class="form-input" id="edit-fecha_entrega_cliente" value="${order.fecha_entrega_cliente || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha Entrega Tienda</label>
                        <input type="date" class="form-input" id="edit-fecha_entrega_tienda" value="${order.fecha_entrega_tienda || ''}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Fecha Fabricación</label>
                    <input type="date" class="form-input" id="edit-fecha_fabricacion" value="${order.fecha_fabricacion || ''}">
                    <p class="form-hint" style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Fecha límite para que el joyero tenga el oro</p>
                </div>

                <!-- Notion Link -->
                <div style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 16px;">
                    <a href="https://www.notion.so/eduardoflores/${order.id.replace(/-/g, '')}" target="_blank" style="color: var(--primary); text-decoration: none;">
                        Ver en Notion
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                </div>
            </div>
        `;

        document.getElementById('modal-body').innerHTML = html;

        // Add saldo display style if not present
        if (!document.getElementById('edit-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'edit-modal-styles';
            style.textContent = `
                .modal-body .saldo-display {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary);
                    padding: 12px 16px;
                    background: var(--primary-light);
                    border-radius: var(--radius);
                    text-align: center;
                }
                .abono-form-container {
                    margin-top: 12px;
                    padding: 16px;
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    border-radius: var(--radius);
                    animation: fadeIn 0.2s ease;
                }
                .abono-form .form-label {
                    font-size: 13px;
                    color: #166534;
                }
                .abono-form .form-input {
                    border-color: #86efac;
                }
                .abono-form .form-input:focus {
                    border-color: #22c55e;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Update saldo display
     */
    updateSaldo() {
        const importe = parseFloat(document.getElementById('edit-importe_total').value) || 0;
        const anticipo = parseFloat(document.getElementById('edit-anticipo').value) || 0;
        const saldo = importe - anticipo;

        document.getElementById('edit-saldo-display').textContent = Utils.formatCurrency(saldo);
    },

    /**
     * Add amount to anticipo
     * @param {number} amount - Amount to add
     */
    addToAnticipo(amount) {
        const input = document.getElementById('edit-anticipo');
        const current = parseFloat(input.value) || 0;
        input.value = current + amount;
        this.updateSaldo();
    },

    /**
     * Mark order as delivered
     */
    markAsDelivered() {
        // Set status to "Entregado"
        const estadoSelect = document.getElementById('edit-estado');
        const entregadoOption = Array.from(estadoSelect.options).find(opt =>
            opt.text.toLowerCase().includes('entregado')
        );
        if (entregadoOption) {
            estadoSelect.value = entregadoOption.value;
        }

        // Check if saldo is 0
        const importe = parseFloat(document.getElementById('edit-importe_total').value) || 0;
        const anticipo = parseFloat(document.getElementById('edit-anticipo').value) || 0;
        const saldo = importe - anticipo;

        if (saldo > 0) {
            if (confirm(`El saldo pendiente es ${Utils.formatCurrency(saldo)}. ¿Deseas registrar el pago completo?`)) {
                document.getElementById('edit-anticipo').value = importe;
                this.updateSaldo();
            }
        }
    },

    /**
     * Mark order as ready for delivery
     */
    markAsReady() {
        const estadoSelect = document.getElementById('edit-estado');
        const readyOption = Array.from(estadoSelect.options).find(opt =>
            opt.text.toLowerCase().includes('listo')
        );
        if (readyOption) {
            estadoSelect.value = readyOption.value;
        }
    },

    /**
     * Open abono form
     */
    openAbonoForm() {
        const container = document.getElementById('abono-form-container');
        if (container) {
            container.style.display = 'block';
            // Clear previous values
            document.getElementById('abono-monto').value = '';
            document.getElementById('abono-nota').value = '';
            // Focus on amount input
            document.getElementById('abono-monto').focus();
        }
    },

    /**
     * Close abono form
     */
    closeAbonoForm() {
        const container = document.getElementById('abono-form-container');
        if (container) {
            container.style.display = 'none';
        }
    },

    /**
     * Confirm abono and update anticipo
     */
    confirmAbono() {
        const montoInput = document.getElementById('abono-monto');
        const notaInput = document.getElementById('abono-nota');

        const monto = parseFloat(montoInput.value) || 0;
        const nota = notaInput.value.trim();

        if (monto <= 0) {
            Utils.showToast('Ingresa un monto válido', 'error');
            montoInput.focus();
            return;
        }

        if (!nota) {
            Utils.showToast('Ingresa el número de nota', 'error');
            notaInput.focus();
            return;
        }

        // Update anticipo field
        const anticipoInput = document.getElementById('edit-anticipo');
        const currentAnticipo = parseFloat(anticipoInput.value) || 0;
        anticipoInput.value = currentAnticipo + monto;
        this.updateSaldo();

        // Store abono data for change log
        this.pendingAbono = {
            monto: monto,
            nota: nota
        };

        // Close form and show confirmation
        this.closeAbonoForm();
        Utils.showToast(`Abono de ${Utils.formatCurrency(monto)} registrado`, 'success');
    },

    /**
     * Get pending abono data (if any)
     * @returns {Object|null} Abono data or null
     */
    getPendingAbono() {
        const abono = this.pendingAbono;
        this.pendingAbono = null; // Clear after getting
        return abono;
    },

    /**
     * Get form data
     * @returns {Object} Form data
     */
    getFormData() {
        return {
            numero_orden: document.getElementById('edit-numero_orden').value.trim(),
            nombre_cliente: document.getElementById('edit-nombre_cliente').value.trim(),
            telefono_cliente: document.getElementById('edit-telefono_cliente').value.trim() || null,
            tipo_pedido: document.getElementById('edit-tipo_pedido').value,
            descripcion: document.getElementById('edit-descripcion').value.trim(),
            importe_total: parseFloat(document.getElementById('edit-importe_total').value) || 0,
            anticipo: parseFloat(document.getElementById('edit-anticipo').value) || 0,
            estado: document.getElementById('edit-estado').options[document.getElementById('edit-estado').selectedIndex].text,
            fecha_entrega_cliente: document.getElementById('edit-fecha_entrega_cliente').value || null,
            fecha_entrega_tienda: document.getElementById('edit-fecha_entrega_tienda').value || null,
            fecha_fabricacion: document.getElementById('edit-fecha_fabricacion').value || null,
            oro_gramos: parseFloat(document.getElementById('edit-oro_gramos').value) || null,
            oro_con_joyero: document.getElementById('edit-oro_con_joyero').checked,
            joyero: document.getElementById('edit-joyero').value || null,
            gemas_requeridas: document.getElementById('edit-gemas_requeridas').value.trim() || null,
            gemas_origen: document.getElementById('edit-gemas_origen').value || null,
            gemas_listas: document.getElementById('edit-gemas_listas').checked,
            notas: document.getElementById('edit-notas').value.trim() || null,
            requiere_certificado: document.getElementById('edit-requiere_certificado').checked
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
function openEditModal(orderId) {
    // This will be implemented in pedidos.js
    if (typeof window.handleOpenEditModal === 'function') {
        window.handleOpenEditModal(orderId);
    }
}

function closeEditModal() {
    EditModal.close();
}

function saveOrder() {
    // This will be implemented in pedidos.js
    if (typeof window.handleSaveOrder === 'function') {
        window.handleSaveOrder();
    }
}
