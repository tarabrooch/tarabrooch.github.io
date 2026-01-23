/**
 * Pago Graph Component
 *
 * Renders a 30-day line graph showing due payments.
 * Uses vanilla JavaScript with SVG (no external charting library).
 */

const PagoGraph = {
    pagos: [],
    fxRate: CONFIG.DEFAULT_FX_RATE,

    // Graph dimensions
    width: 900,
    height: 300,
    padding: { top: 30, right: 30, bottom: 50, left: 80 },

    /**
     * Initialize graph with pagos
     * @param {Array} pagos - Array of pagos
     */
    render(pagos) {
        this.pagos = pagos;
        this.renderGraph();
    },

    /**
     * Set FX rate for currency conversion
     * @param {number} rate - USD to MXN rate
     */
    setFxRate(rate) {
        this.fxRate = rate;
        this.renderGraph();
    },

    /**
     * Convert amount to MXN
     * @param {number} amount - Amount
     * @param {string} currency - Currency code
     * @returns {number} Amount in MXN
     */
    convertToMXN(amount, currency) {
        if (currency === 'USD') {
            return amount * this.fxRate;
        }
        return amount;
    },

    /**
     * Get data for next 30 days
     * @returns {Array} Array of { date, total, count } objects
     */
    getGraphData() {
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter only presupuestado and confirmado (not paid/cancelled)
        const activePagos = this.pagos.filter(p =>
            p.estado === 'presupuestado' || p.estado === 'confirmado'
        );

        // Create a map of date -> total
        const dateMap = {};
        activePagos.forEach(pago => {
            if (pago.fecha_vencimiento) {
                const dateKey = pago.fecha_vencimiento.split('T')[0];
                if (!dateMap[dateKey]) {
                    dateMap[dateKey] = { total: 0, count: 0 };
                }
                dateMap[dateKey].total += this.convertToMXN(pago.monto, pago.moneda);
                dateMap[dateKey].count += 1;
            }
        });

        // Generate 30 days of data
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];

            data.push({
                date: date,
                dateKey: dateKey,
                total: dateMap[dateKey]?.total || 0,
                count: dateMap[dateKey]?.count || 0
            });
        }

        return data;
    },

    /**
     * Render the graph
     */
    renderGraph() {
        const container = document.getElementById('pago-graph-container');
        if (!container) return;

        const data = this.getGraphData();

        // Calculate max value for scaling
        const maxValue = Math.max(...data.map(d => d.total), 1000); // Minimum 1000 for scale
        const roundedMax = Math.ceil(maxValue / 1000) * 1000;

        // Calculate dimensions
        const graphWidth = this.width - this.padding.left - this.padding.right;
        const graphHeight = this.height - this.padding.top - this.padding.bottom;

        // Scale functions
        const xScale = (index) => this.padding.left + (index / (data.length - 1)) * graphWidth;
        const yScale = (value) => this.padding.top + graphHeight - (value / roundedMax) * graphHeight;

        // Build SVG
        let svg = `
            <svg width="100%" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" preserveAspectRatio="xMidYMid meet">
                <!-- Background -->
                <rect x="${this.padding.left}" y="${this.padding.top}" width="${graphWidth}" height="${graphHeight}" fill="#f8fafc" rx="4"/>

                <!-- Grid lines -->
                ${this.renderGridLines(roundedMax, graphWidth, graphHeight, yScale)}

                <!-- X-axis labels (dates) -->
                ${this.renderXAxisLabels(data, xScale)}

                <!-- Y-axis labels (amounts) -->
                ${this.renderYAxisLabels(roundedMax, yScale)}

                <!-- Line path -->
                ${this.renderLine(data, xScale, yScale)}

                <!-- Area fill -->
                ${this.renderArea(data, xScale, yScale, graphHeight)}

                <!-- Data points -->
                ${this.renderDataPoints(data, xScale, yScale)}
            </svg>
        `;

        // Calculate total due
        const totalDue = data.reduce((sum, d) => sum + d.total, 0);
        const totalCount = data.reduce((sum, d) => sum + d.count, 0);

        container.innerHTML = `
            <div class="graph-summary">
                <div class="graph-summary-item">
                    <span class="graph-summary-label">Total próximos 30 días</span>
                    <span class="graph-summary-value">${Utils.formatCurrency(totalDue)}</span>
                </div>
                <div class="graph-summary-item">
                    <span class="graph-summary-label">Pagos pendientes</span>
                    <span class="graph-summary-value">${totalCount}</span>
                </div>
            </div>
            <div class="graph-wrapper">
                ${svg}
            </div>
            <div class="graph-legend">
                <span class="graph-legend-item">
                    <span class="graph-legend-dot" style="background: #2563eb;"></span>
                    Pagos por vencer (Presupuestado + Confirmado)
                </span>
            </div>
        `;
    },

    /**
     * Render horizontal grid lines
     */
    renderGridLines(maxValue, graphWidth, graphHeight, yScale) {
        const lines = [];
        const steps = 5;

        for (let i = 0; i <= steps; i++) {
            const value = (maxValue / steps) * i;
            const y = yScale(value);
            lines.push(`
                <line x1="${this.padding.left}" y1="${y}" x2="${this.padding.left + graphWidth}" y2="${y}"
                      stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>
            `);
        }

        return lines.join('');
    },

    /**
     * Render X-axis date labels
     */
    renderXAxisLabels(data, xScale) {
        const labels = [];
        const showEvery = 5; // Show label every N days

        data.forEach((d, i) => {
            if (i % showEvery === 0 || i === data.length - 1) {
                const x = xScale(i);
                const label = d.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

                labels.push(`
                    <text x="${x}" y="${this.height - 15}" text-anchor="middle"
                          font-size="11" fill="#64748b" font-family="Inter, sans-serif">
                        ${label}
                    </text>
                `);
            }
        });

        return labels.join('');
    },

    /**
     * Render Y-axis amount labels
     */
    renderYAxisLabels(maxValue, yScale) {
        const labels = [];
        const steps = 5;

        for (let i = 0; i <= steps; i++) {
            const value = (maxValue / steps) * i;
            const y = yScale(value);
            const label = value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;

            labels.push(`
                <text x="${this.padding.left - 10}" y="${y + 4}" text-anchor="end"
                      font-size="11" fill="#64748b" font-family="Inter, sans-serif">
                    ${label}
                </text>
            `);
        }

        return labels.join('');
    },

    /**
     * Render line path
     */
    renderLine(data, xScale, yScale) {
        if (data.length === 0) return '';

        const points = data.map((d, i) => `${xScale(i)},${yScale(d.total)}`).join(' L ');
        return `
            <path d="M ${points}" fill="none" stroke="#2563eb" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
        `;
    },

    /**
     * Render area fill under line
     */
    renderArea(data, xScale, yScale, graphHeight) {
        if (data.length === 0) return '';

        const points = data.map((d, i) => `${xScale(i)},${yScale(d.total)}`).join(' L ');
        const areaPath = `M ${xScale(0)},${this.padding.top + graphHeight} L ${points} L ${xScale(data.length - 1)},${this.padding.top + graphHeight} Z`;

        return `
            <path d="${areaPath}" fill="url(#areaGradient)" opacity="0.3"/>
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563eb;stop-opacity:0.4"/>
                    <stop offset="100%" style="stop-color:#2563eb;stop-opacity:0"/>
                </linearGradient>
            </defs>
        `;
    },

    /**
     * Render data points (circles)
     */
    renderDataPoints(data, xScale, yScale) {
        return data.map((d, i) => {
            if (d.total === 0) return '';

            const x = xScale(i);
            const y = yScale(d.total);
            const tooltipText = `${d.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}: ${Utils.formatCurrency(d.total)} (${d.count} pago${d.count !== 1 ? 's' : ''})`;

            return `
                <circle cx="${x}" cy="${y}" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"
                        style="cursor: pointer;">
                    <title>${tooltipText}</title>
                </circle>
            `;
        }).join('');
    }
};
