/**
 * Gold Calendar Component
 *
 * Renders calendar view for gold requirements by date.
 */

const GoldCalendar = {
    currentDate: new Date(),
    goldData: {}, // { 'YYYY-MM-DD': { grams: number, orders: [] } }

    /**
     * Initialize calendar with gold data
     * @param {Object} goldByDate - Gold requirements grouped by date
     */
    render(goldByDate) {
        this.goldData = goldByDate;
        this.renderCalendar();
    },

    /**
     * Render the full calendar
     */
    renderCalendar() {
        const container = document.getElementById('calendar-container');

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Month names in Spanish
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Day names in Spanish
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        // Build calendar HTML
        let html = `
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" onclick="GoldCalendar.prevMonth()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <span class="calendar-month">${monthNames[month]} ${year}</span>
                    <button class="calendar-nav-btn" onclick="GoldCalendar.nextMonth()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                <button class="calendar-nav-btn calendar-today-btn" onclick="GoldCalendar.goToToday()">Hoy</button>
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
            const dayData = this.goldData[dateStr] || null;

            html += this.renderDay(day, dateStr, dayData, true, false);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateKey(year, month, day);
            const dayData = this.goldData[dateStr] || null;
            const isToday = isCurrentMonth && today.getDate() === day;

            html += this.renderDay(day, dateStr, dayData, false, isToday);
        }

        // Next month days (fill to complete grid)
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (firstDay + daysInMonth);

        for (let day = 1; day <= nextMonthDays; day++) {
            const dateStr = this.formatDateKey(year, month + 1, day);
            const dayData = this.goldData[dateStr] || null;

            html += this.renderDay(day, dateStr, dayData, true, false);
        }

        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Render a single calendar day
     * @param {number} day - Day number
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @param {Object|null} data - Gold data for this day { grams, orders }
     * @param {boolean} isOtherMonth - Is from adjacent month
     * @param {boolean} isToday - Is today
     * @returns {string} HTML string
     */
    renderDay(day, dateStr, data, isOtherMonth, isToday) {
        const classes = ['calendar-day'];
        if (isOtherMonth) classes.push('other-month');
        if (isToday) classes.push('today');

        let contentHtml = '';

        if (data && data.grams > 0) {
            // Determine urgency
            const urgencyClass = this.getUrgencyClass(dateStr);
            const orderCount = data.orders.length;

            contentHtml = `
                <div class="gold-requirement ${urgencyClass}" onclick="showOrdersForDate('${dateStr}')">
                    ${data.grams.toFixed(1)}g
                </div>
                <div class="gold-orders-count">${orderCount} pedido${orderCount !== 1 ? 's' : ''}</div>
            `;
        }

        return `
            <div class="${classes.join(' ')}" ${data ? `onclick="showOrdersForDate('${dateStr}')"` : ''}>
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-content">
                    ${contentHtml}
                </div>
            </div>
        `;
    },

    /**
     * Get urgency class based on date
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {string} CSS class
     */
    getUrgencyClass(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays <= 4) {
            return 'urgent';
        }
        return 'normal';
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
