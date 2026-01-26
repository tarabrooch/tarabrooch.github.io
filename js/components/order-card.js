/**
 * Order Card Component
 *
 * Renders order cards for the list view.
 */

const OrderCard = {
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
     * Get status CSS class with consistent colors
     * @param {string} estado - Status name
     * @returns {string} CSS class
     */
    getStatusClass(estado) {
        if (!estado) return '';
        const normalized = estado.toLowerCase()
            .replace(/ /g, '_')
            .replace(/ó/g, 'o')
            .replace(/á/g, 'a');
        return normalized;
    },

    /**
     * Render a full order card for list view
     * @param {Object} order - Order data
     * @returns {string} HTML string
     */
    /**
     * Get display title for order: "[numero_orden] nombre_cliente"
     * @param {Object} order - Order data
     * @returns {string} Display title
     */
    getDisplayTitle(order) {
        const orderNum = order.numero_orden || '';
        const clientName = order.nombre_cliente || 'Sin nombre';
        if (orderNum) {
            return `[${orderNum}] ${clientName}`;
        }
        return clientName;
    },

    render(order) {
        const statusClass = this.getStatusClass(order.estado);
        const dateUrgent = this.isDateUrgent(order.fecha_entrega_cliente);
        const dateOverdue = this.isDateOverdue(order.fecha_entrega_cliente);
        const dateClass = dateOverdue ? 'date-overdue' : (dateUrgent ? 'date-urgent' : '');

        // Gold status
        const hasGold = order.oro_gramos && order.oro_gramos > 0;
        const goldWithJeweler = order.oro_con_joyero === true;
        const goldStatus = hasGold
            ? (goldWithJeweler ? 'status-ok' : 'status-pending')
            : 'status-na';
        const goldText = hasGold
            ? `${order.oro_gramos}g ${goldWithJeweler ? '✓' : '(pendiente)'}`
            : 'N/A';

        // Gems status - only show if has gems
        const hasGems = order.gemas_requeridas && order.gemas_requeridas.trim() !== '';
        const gemsReady = order.gemas_listas === true;
        const gemsStatus = hasGems
            ? (gemsReady ? 'status-ok' : 'status-pending')
            : 'status-na';

        // Build gems row only if has gems
        const gemsRow = hasGems ? `
                    <div class="order-card-row">
                        <span class="order-card-label">Gemas</span>
                        <span class="order-card-value ${gemsStatus}">${this.escapeHtml(Utils.truncate(order.gemas_requeridas, 20))} ${gemsReady ? '✓' : '⏳'}</span>
                    </div>` : '';

        return `
            <div class="order-card" data-order-id="${order.id}" onclick="openEditModal('${order.id}')">
                <div class="order-card-header">
                    <div>
                        <div class="order-card-cliente">${this.escapeHtml(this.getDisplayTitle(order))}</div>
                        <div class="order-card-tipo">${Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || '-'}</div>
                    </div>
                    <span class="order-status ${statusClass}">${order.estado || 'Sin estado'}</span>
                </div>
                <div class="order-card-body">
                    <div class="order-card-row">
                        <span class="order-card-label">Importe Total</span>
                        <span class="order-card-value">${Utils.formatCurrency(order.importe_total)}</span>
                    </div>
                    <div class="order-card-row">
                        <span class="order-card-label">Oro</span>
                        <span class="order-card-value ${goldStatus}">${goldText}</span>
                    </div>${gemsRow}
                    ${order.joyero ? `
                    <div class="order-card-row">
                        <span class="order-card-label">Joyero</span>
                        <span class="order-card-value">${this.escapeHtml(order.joyero)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="order-card-footer">
                    <div class="order-card-date ${dateClass}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        ${Utils.formatDate(order.fecha_entrega_cliente)}
                    </div>
                    ${order.requiere_certificado ? '<span class="certificate-badge">Certificado</span>' : ''}
                    </div>
                    ${order.telefono_cliente ? `
                    <a href="tel:${order.telefono_cliente}" class="order-card-phone" onclick="event.stopPropagation()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render a compact card for kanban view
     * @param {Object} order - Order data
     * @returns {string} HTML string
     */
    renderCompact(order) {
        const dateUrgent = this.isDateUrgent(order.fecha_entrega_cliente);
        const dateOverdue = this.isDateOverdue(order.fecha_entrega_cliente);
        const dateClass = dateOverdue ? 'date-overdue' : (dateUrgent ? 'date-urgent' : '');

        return `
            <div class="kanban-card" data-order-id="${order.id}" onclick="openEditModal('${order.id}')">
                <div class="kanban-card-cliente">${this.escapeHtml(this.getDisplayTitle(order))}</div>
                <div class="kanban-card-tipo">${Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || '-'}</div>
                <div class="kanban-card-footer">
                    <span class="kanban-card-total">${Utils.formatCurrency(order.importe_total)}</span>
                    <span class="kanban-card-date ${dateClass}">${Utils.formatDate(order.fecha_entrega_cliente)}</span>
                </div>
                ${order.requiere_certificado ? '<span class="certificate-badge certificate-badge-sm">Certificado</span>' : ''}
            </div>
        `;
    },

    /**
     * Render a minimal card for calendar view
     * @param {Object} order - Order data
     * @returns {string} HTML string
     */
    renderCalendar(order) {
        const statusClass = this.getStatusClass(order.estado);
        const displayTitle = this.getDisplayTitle(order);

        return `
            <div class="calendar-order ${statusClass}" data-order-id="${order.id}" onclick="openEditModal('${order.id}')" title="${this.escapeHtml(displayTitle)} - ${Utils.getTipoPedidoName(order.tipo_pedido)}">
                ${this.escapeHtml(Utils.truncate(displayTitle, 18))}
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
