/**
 * Pago Calendar Component
 *
 * Renders the calendar view for pagos with aggregation toggle.
 */

const PagoCalendar = {
    currentDate: new Date(),
    pagos: [],
    showAggregated: false,  // Toggle: false = individual, true = aggregated totals
    fxRate: CONFIG.DEFAULT_FX_RATE,

    /**
     * Initialize calendar with pagos
     * @param {Array} pagos - Array of pagos
     */
    render(pagos) {
        this.pagos = pagos;
        this.renderCalendar();
    },

    /**
     * Set FX rate for currency conversion
     * @param {number} rate - USD to MXN rate
     */
    setFxRate(rate) {
        this.fxRate = rate;
        if (this.showAggregated) {
            this.renderCalendar();
        }
    },

    /**
     * Toggle between individual and aggregated view
     * @param {boolean} aggregated - Show aggregated totals
     */
    setAggregated(aggregated) {
        this.showAggregated = aggregated;
        this.renderCalendar();
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
     * Render the full calendar
     */
    renderCalendar() {
        const container = document.getElementById('pago-calendar-container');
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Month names in Spanish
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Day names in Spanish
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        // Get pagos for this month
        const pagosByDate = this.groupPagosByDate();

        // Build calendar HTML
        let html = `
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" onclick="PagoCalendar.prevMonth()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <span class="calendar-month">${monthNames[month]} ${year}</span>
                    <button class="calendar-nav-btn" onclick="PagoCalendar.nextMonth()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                <button class="calendar-nav-btn calendar-today-btn" onclick="PagoCalendar.goToToday()">Hoy</button>
            </div>
            <div class="calendar-grid">
        `;

        // Day headers
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Today's date for highlighting
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dateStr = this.formatDateKey(year, month - 1, day);
            const dayPagos = pagosByDate[dateStr] || [];

            html += this.renderDay(day, dayPagos, true, false);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateKey(year, month, day);
            const dayPagos = pagosByDate[dateStr] || [];
            const isToday = isCurrentMonth && today.getDate() === day;

            html += this.renderDay(day, dayPagos, false, isToday);
        }

        // Next month days (fill to complete grid)
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (firstDay + daysInMonth);

        for (let day = 1; day <= nextMonthDays; day++) {
            const dateStr = this.formatDateKey(year, month + 1, day);
            const dayPagos = pagosByDate[dateStr] || [];

            html += this.renderDay(day, dayPagos, true, false);
        }

        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Render a single calendar day
     * @param {number} day - Day number
     * @param {Array} pagos - Pagos on this day
     * @param {boolean} isOtherMonth - Is from adjacent month
     * @param {boolean} isToday - Is today
     * @returns {string} HTML string
     */
    renderDay(day, pagos, isOtherMonth, isToday) {
        const classes = ['calendar-day'];
        if (isOtherMonth) classes.push('other-month');
        if (isToday) classes.push('today');

        let contentHtml = '';

        if (this.showAggregated && pagos.length > 0) {
            // Aggregated view - show total
            const total = pagos.reduce((sum, pago) => {
                return sum + this.convertToMXN(pago.monto, pago.moneda);
            }, 0);

            contentHtml = PagoCard.renderCalendarTotal(total, pagos.length);
        } else {
            // Individual view - show up to 3 pagos, then "+X more"
            const maxDisplay = 3;

            pagos.slice(0, maxDisplay).forEach(pago => {
                contentHtml += PagoCard.renderCalendar(pago);
            });

            if (pagos.length > maxDisplay) {
                contentHtml += `<div class="calendar-more">+${pagos.length - maxDisplay} más</div>`;
            }
        }

        return `
            <div class="${classes.join(' ')}">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-pagos">
                    ${contentHtml}
                </div>
            </div>
        `;
    },

    /**
     * Group pagos by date
     * @returns {Object} Pagos grouped by date string
     */
    groupPagosByDate() {
        const grouped = {};

        this.pagos.forEach(pago => {
            const dateValue = pago.fecha_vencimiento;
            if (dateValue) {
                const dateKey = dateValue.split('T')[0]; // Get just the date part
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(pago);
            }
        });

        return grouped;
    },

    /**
     * Format date key (YYYY-MM-DD)
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @returns {string} Date key
     */
    formatDateKey(year, month, day) {
        // Handle month overflow
        const date = new Date(year, month, day);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    /**
     * Go to previous month
     */
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    },

    /**
     * Go to next month
     */
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    },

    /**
     * Go to today
     */
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }
};

/**
 * Toggle calendar aggregation mode
 * @param {boolean} aggregated - Show aggregated totals
 */
function togglePagoCalendarAggregation(aggregated) {
    // Update toggle UI
    document.getElementById('calendar-toggle-individual').classList.toggle('active', !aggregated);
    document.getElementById('calendar-toggle-aggregated').classList.toggle('active', aggregated);

    PagoCalendar.setAggregated(aggregated);
}
