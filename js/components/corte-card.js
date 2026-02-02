/**
 * Corte Card Component
 *
 * Renders corte entry cards for list/history views.
 * Each corte has two independent breakdowns: by vendedora and by payment method.
 */

const CorteCard = {
    getMethodColor(metodoId) {
        const colors = {
            'efectivo': '#059669',
            'tarjeta_credito': '#2563eb',
            'tarjeta_debito': '#9333ea',
            'transferencia': '#d97706'
        };
        return colors[metodoId] || '#6b7280';
    },

    getMethodIcon(metodoId) {
        const icons = {
            'efectivo': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
            'tarjeta_credito': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
            'tarjeta_debito': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
            'transferencia': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3L21 7L17 11"/><path d="M21 7H3"/><path d="M7 21L3 17L7 13"/><path d="M3 17H21"/></svg>'
        };
        return icons[metodoId] || '';
    },

    formatAmount(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
        const formatted = new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        return `$${formatted}`;
    },

    /**
     * Calculate total from payment method amounts
     */
    calculateTotal(corte) {
        let total = 0;
        CONFIG.CORTE_METODOS_PAGO.forEach(m => {
            total += parseFloat(corte[m.id]) || 0;
        });
        return total;
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Render a corte entry card showing both breakdowns
     */
    render(corte, options = {}) {
        const showDate = options.showDate !== false;
        const showDelete = options.showDelete === true;
        const total = this.calculateTotal(corte);
        const ventas = corte.ventas || {};

        // ── Vendedora breakdown ──
        let ventasHtml = '';
        CONFIG.VENDEDORAS.forEach(v => {
            const amount = ventas[v.id] || 0;
            if (amount > 0) {
                ventasHtml += `
                    <div class="corte-entry-row">
                        <span class="corte-entry-method">${this.escapeHtml(v.name)}</span>
                        <span class="corte-entry-amount">${this.formatAmount(amount)}</span>
                    </div>`;
            }
        });

        // ── Payment method breakdown ──
        let metodosHtml = '';
        CONFIG.CORTE_METODOS_PAGO.forEach(m => {
            const amount = corte[m.id] || 0;
            if (amount > 0) {
                metodosHtml += `
                    <div class="corte-entry-row">
                        <span class="corte-entry-method">
                            <span class="corte-entry-method-dot" style="background: ${this.getMethodColor(m.id)};"></span>
                            ${this.escapeHtml(m.name)}
                        </span>
                        <span class="corte-entry-amount">${this.formatAmount(amount)}</span>
                    </div>`;
            }
        });

        const emptyRow = '<div class="corte-entry-row"><span class="corte-entry-method" style="color:var(--text-muted);">—</span></div>';

        return `
            <div class="corte-entry-card" data-corte-id="${corte.id || ''}">
                <div class="corte-entry-header">
                    <span class="corte-entry-total">${this.formatAmount(total)}</span>
                    ${showDate ? `
                    <span class="corte-entry-date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        ${Utils.formatDate(corte.fecha)}
                    </span>` : ''}
                </div>
                <div class="corte-card-split">
                    <div class="corte-card-col">
                        <div class="corte-card-col-title">Vendedoras</div>
                        <div class="corte-entry-breakdown">${ventasHtml || emptyRow}</div>
                    </div>
                    <div class="corte-card-col">
                        <div class="corte-card-col-title">Métodos de Pago</div>
                        <div class="corte-entry-breakdown">${metodosHtml || emptyRow}</div>
                    </div>
                </div>
                <div class="corte-entry-footer">
                    <span class="corte-entry-notas">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                        ${corte.num_notas || 0} nota${(corte.num_notas || 0) !== 1 ? 's' : ''}
                    </span>
                    ${showDelete ? `
                    <div class="corte-entry-actions">
                        <button class="corte-delete-btn" onclick="event.stopPropagation(); deleteCorte('${corte.id}')" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }
};
