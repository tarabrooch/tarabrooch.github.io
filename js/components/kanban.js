/**
 * Kanban Component
 *
 * Renders the Kanban board view for orders.
 */

const Kanban = {
    // Track collapsed state of columns
    collapsedColumns: new Set(['entregado', 'cancelado']),

    /**
     * Render the kanban board
     * @param {Array} orders - Array of orders
     */
    render(orders) {
        const board = document.getElementById('kanban-board');

        // Group orders by status
        const ordersByStatus = this.groupByStatus(orders);

        // Build columns HTML
        let html = '';

        CONFIG.ESTADOS.forEach(status => {
            const statusKey = this.getStatusKey(status.name);
            const statusOrders = ordersByStatus[status.name] || [];
            const isCollapsed = this.collapsedColumns.has(statusKey);

            html += this.renderColumn(status, statusOrders, isCollapsed);
        });

        board.innerHTML = html;
    },

    /**
     * Group orders by status
     * @param {Array} orders - Array of orders
     * @returns {Object} Orders grouped by status name
     */
    groupByStatus(orders) {
        const grouped = {};

        orders.forEach(order => {
            const status = order.estado || 'Sin estado';
            if (!grouped[status]) {
                grouped[status] = [];
            }
            grouped[status].push(order);
        });

        return grouped;
    },

    /**
     * Render a single kanban column
     * @param {Object} status - Status config object
     * @param {Array} orders - Orders in this status
     * @param {boolean} isCollapsed - Whether column is collapsed
     * @returns {string} HTML string
     */
    renderColumn(status, orders, isCollapsed) {
        const statusKey = this.getStatusKey(status.name);
        const colorClass = status.color || 'gray';

        // Render cards
        const cardsHtml = orders.map(order => OrderCard.renderCompact(order)).join('');

        return `
            <div class="kanban-column ${isCollapsed ? 'collapsed' : ''}" data-status="${statusKey}">
                <div class="kanban-column-header" style="border-color: var(--${colorClass});">
                    <div class="kanban-column-title">
                        <span class="kanban-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--${colorClass});"></span>
                        ${status.name}
                        <span class="kanban-column-count">${orders.length}</span>
                    </div>
                    <button class="kanban-column-toggle" onclick="Kanban.toggleColumn('${statusKey}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                </div>
                <div class="kanban-column-cards">
                    ${cardsHtml || '<div class="kanban-empty">Sin pedidos</div>'}
                </div>
            </div>
        `;
    },

    /**
     * Toggle column collapsed state
     * @param {string} statusKey - Status key
     */
    toggleColumn(statusKey) {
        const column = document.querySelector(`.kanban-column[data-status="${statusKey}"]`);

        if (this.collapsedColumns.has(statusKey)) {
            this.collapsedColumns.delete(statusKey);
            column.classList.remove('collapsed');
        } else {
            this.collapsedColumns.add(statusKey);
            column.classList.add('collapsed');
        }
    },

    /**
     * Get normalized status key
     * @param {string} statusName - Status name
     * @returns {string} Normalized key
     */
    getStatusKey(statusName) {
        return statusName
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/ó/g, 'o')
            .replace(/á/g, 'a')
            .replace(/é/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ú/g, 'u');
    }
};
