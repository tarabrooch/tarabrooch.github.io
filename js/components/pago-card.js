/**
 * Pago Card Component
 *
 * Renders pago cards for the list view.
 */

const PagoCard = {
    /**
     * Check if date is within X days from now
     * @param {string} dateStr - Date string
     * @param {number} days - Number of days
     * @returns {boolean}
     */
    isDateUrgent(dateStr, days = 4) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= days;
    },

    /**
     * Check if date is overdue
     * @param {string} dateStr - Date string
     * @returns {boolean}
     */
    isDateOverdue(dateStr) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return date < now;
    },

    /**
     * Get status info (name and color)
     * @param {string} estado - Status ID
     * @returns {Object} Status info with name and color
     */
    getStatusInfo(estado) {
        const status = CONFIG.PAGO_ESTADOS.find(s => s.id === estado || s.name === estado);
        return status || { id: estado, name: estado, color: '#6b7280' };
    },

    /**
     * Get category name from ID
     * @param {string} categoriaId - Category ID
     * @returns {string} Category name
     */
    getCategoryName(categoriaId) {
        const category = CONFIG.PAGO_CATEGORIES[categoriaId];
        return category ? category.name : categoriaId;
    },

    /**
     * Format currency with symbol
     * @param {number} amount - Amount
     * @param {string} currency - Currency code (MXN or USD)
     * @returns {string} Formatted currency string
     */
    formatPagoCurrency(amount, currency = 'MXN') {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return currency === 'USD' ? 'USD $0' : '$0';
        }

        const formatted = new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);

        return currency === 'USD' ? `USD $${formatted}` : `$${formatted}`;
    },

    /**
     * Check if a pago is a payment method type that needs breakdown
     * @param {Object} pago - Pago data
     * @returns {boolean}
     */
    isMetodoPago(pago) {
        return pago.categoria === 'metodo_pago';
    },

    /**
     * Get desglose status info for a metodo_pago pago
     * @param {Object} pago - Pago data
     * @returns {Object} Status with label, class, count
     */
    getDesgloseStatus(pago) {
        if (!this.isMetodoPago(pago)) return null;

        const desglose = pago.desglose;
        if (!desglose || !Array.isArray(desglose) || desglose.length === 0) {
            return { label: 'Desglose pendiente', cssClass: 'desglose-badge-pending', count: 0 };
        }

        const total = desglose.reduce((sum, item) => sum + (parseFloat(item.monto) || 0), 0);
        const balanced = Math.abs(total - (pago.monto || 0)) < 0.01;

        if (balanced) {
            return { label: `Desglose: ${desglose.length} partida${desglose.length !== 1 ? 's' : ''}`, cssClass: 'desglose-badge-complete', count: desglose.length };
        }

        return { label: `Desglose: incompleto`, cssClass: 'desglose-badge-partial', count: desglose.length };
    },

    /**
     * Render a full pago card for list view
     * @param {Object} pago - Pago data
     * @returns {string} HTML string
     */
    render(pago) {
        const statusInfo = this.getStatusInfo(pago.estado);
        const dateUrgent = this.isDateUrgent(pago.fecha_vencimiento);
        const dateOverdue = this.isDateOverdue(pago.fecha_vencimiento);
        const dateClass = dateOverdue ? 'date-overdue' : (dateUrgent ? 'date-urgent' : '');

        // Only show overdue/urgent for non-paid/cancelled
        const showDateWarning = pago.estado !== 'pagado' && pago.estado !== 'cancelado';
        const finalDateClass = showDateWarning ? dateClass : '';

        const categoryName = this.getCategoryName(pago.categoria);
        const desgloseStatus = this.getDesgloseStatus(pago);

        return `
            <div class="pago-card" data-pago-id="${pago.id}" onclick="openPagoEditModal('${pago.id}')">
                <div class="pago-card-header">
                    <div>
                        <div class="pago-card-amount">${this.formatPagoCurrency(pago.monto, pago.moneda)}</div>
                        <div class="pago-card-category">${this.escapeHtml(categoryName)}</div>
                    </div>
                    <div class="pago-status-badge" style="background: ${statusInfo.color}20; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}40;">
                        ${statusInfo.name}
                    </div>
                </div>
                <div class="pago-card-body">
                    <div class="pago-card-row">
                        <span class="pago-card-label">Subcategoría</span>
                        <span class="pago-card-value">${this.escapeHtml(pago.subcategoria || '-')}</span>
                    </div>
                    <div class="pago-card-row">
                        <span class="pago-card-label">Fiscal</span>
                        <span class="pago-card-value">${pago.es_fiscal ? 'Sí' : 'No'}</span>
                    </div>
                    ${pago.descripcion ? `
                    <div class="pago-card-row">
                        <span class="pago-card-label">Notas</span>
                        <span class="pago-card-value">${this.escapeHtml(Utils.truncate(pago.descripcion, 30))}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="pago-card-footer">
                    <div class="pago-card-date ${finalDateClass}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        ${Utils.formatDate(pago.fecha_vencimiento)}
                    </div>
                    ${desgloseStatus ? `
                    <span class="desglose-badge ${desgloseStatus.cssClass}" onclick="event.stopPropagation(); openDesgloseModal('${pago.id}')" title="Ver desglose">
                        ${desgloseStatus.label}
                    </span>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render a compact card for kanban view
     * @param {Object} pago - Pago data
     * @returns {string} HTML string
     */
    renderCompact(pago) {
        const dateUrgent = this.isDateUrgent(pago.fecha_vencimiento);
        const dateOverdue = this.isDateOverdue(pago.fecha_vencimiento);
        const dateClass = dateOverdue ? 'date-overdue' : (dateUrgent ? 'date-urgent' : '');

        // Only show overdue/urgent for non-paid/cancelled
        const showDateWarning = pago.estado !== 'pagado' && pago.estado !== 'cancelado';
        const finalDateClass = showDateWarning ? dateClass : '';

        const categoryName = this.getCategoryName(pago.categoria);
        const desgloseStatus = this.getDesgloseStatus(pago);

        return `
            <div class="kanban-card pago-kanban-card" data-pago-id="${pago.id}" onclick="openPagoEditModal('${pago.id}')">
                <div class="kanban-card-amount">${this.formatPagoCurrency(pago.monto, pago.moneda)}</div>
                <div class="kanban-card-category">${this.escapeHtml(Utils.truncate(categoryName, 20))}</div>
                <div class="kanban-card-subcategory">${this.escapeHtml(Utils.truncate(pago.subcategoria || '', 25))}</div>
                ${desgloseStatus ? `
                <div class="desglose-badge ${desgloseStatus.cssClass}" onclick="event.stopPropagation(); openDesgloseModal('${pago.id}')" style="margin-bottom: 6px; font-size: 10px;">
                    ${desgloseStatus.label}
                </div>
                ` : ''}
                <div class="kanban-card-footer">
                    <span class="kanban-card-fiscal">${pago.es_fiscal ? '📄' : ''}</span>
                    <span class="kanban-card-date ${finalDateClass}">${Utils.formatDate(pago.fecha_vencimiento)}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render a minimal card for calendar view
     * @param {Object} pago - Pago data
     * @returns {string} HTML string
     */
    renderCalendar(pago) {
        const statusInfo = this.getStatusInfo(pago.estado);
        const amount = this.formatPagoCurrency(pago.monto, pago.moneda);

        return `
            <div class="calendar-pago" data-pago-id="${pago.id}" onclick="openPagoEditModal('${pago.id}')" title="${this.escapeHtml(pago.subcategoria || '')} - ${amount}" style="background: ${statusInfo.color}15; border-left: 3px solid ${statusInfo.color};">
                ${this.escapeHtml(Utils.truncate(amount, 15))}
            </div>
        `;
    },

    /**
     * Render aggregated total for calendar view
     * @param {number} total - Total amount in MXN
     * @param {number} count - Number of pagos
     * @returns {string} HTML string
     */
    renderCalendarTotal(total, count) {
        return `
            <div class="calendar-pago-total" title="${count} pago(s)">
                ${Utils.formatCurrency(total)}
                <span class="calendar-pago-count">(${count})</span>
            </div>
        `;
    },

    /**
     * Escape HTML to prevent XSS
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
