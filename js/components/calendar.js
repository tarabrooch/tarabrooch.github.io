/**
 * Calendar Component
 *
 * Renders the calendar view for orders.
 */

const Calendar = {
    currentDate: new Date(),
    dateField: 'fecha_entrega_cliente', // or 'fecha_entrega_tienda'
    orders: [],

    /**
     * Initialize calendar with orders
     * @param {Array} orders - Array of orders
     */
    render(orders) {
        this.orders = orders;
        this.renderCalendar();
    },

    /**
     * Set which date field to use
     * @param {string} field - 'cliente', 'tienda', or 'fabricacion'
     */
    setDateField(field) {
        if (field === 'tienda') {
            this.dateField = 'fecha_entrega_tienda';
        } else if (field === 'fabricacion') {
            this.dateField = 'fecha_fabricacion';
        } else {
            this.dateField = 'fecha_entrega_cliente';
        }
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

        // Get orders for this month
        const ordersByDate = this.groupOrdersByDate();

        // Build calendar HTML
        let html = `
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" onclick="Calendar.prevMonth()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <span class="calendar-month">${monthNames[month]} ${year}</span>
                    <button class="calendar-nav-btn" onclick="Calendar.nextMonth()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                <button class="calendar-nav-btn calendar-today-btn" onclick="Calendar.goToToday()">Hoy</button>
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
            const dayOrders = ordersByDate[dateStr] || [];

            html += this.renderDay(day, dayOrders, true, false);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateKey(year, month, day);
            const dayOrders = ordersByDate[dateStr] || [];
            const isToday = isCurrentMonth && today.getDate() === day;

            html += this.renderDay(day, dayOrders, false, isToday);
        }

        // Next month days (fill to complete grid)
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (firstDay + daysInMonth);

        for (let day = 1; day <= nextMonthDays; day++) {
            const dateStr = this.formatDateKey(year, month + 1, day);
            const dayOrders = ordersByDate[dateStr] || [];

            html += this.renderDay(day, dayOrders, true, false);
        }

        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Render a single calendar day
     * @param {number} day - Day number
     * @param {Array} orders - Orders on this day
     * @param {boolean} isOtherMonth - Is from adjacent month
     * @param {boolean} isToday - Is today
     * @returns {string} HTML string
     */
    renderDay(day, orders, isOtherMonth, isToday) {
        const classes = ['calendar-day'];
        if (isOtherMonth) classes.push('other-month');
        if (isToday) classes.push('today');

        // Render up to 3 orders, then show "+X more"
        let ordersHtml = '';
        const maxDisplay = 3;

        orders.slice(0, maxDisplay).forEach(order => {
            ordersHtml += OrderCard.renderCalendar(order);
        });

        if (orders.length > maxDisplay) {
            ordersHtml += `<div class="calendar-more">+${orders.length - maxDisplay} más</div>`;
        }

        return `
            <div class="${classes.join(' ')}">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-orders">
                    ${ordersHtml}
                </div>
            </div>
        `;
    },

    /**
     * Group orders by date
     * @returns {Object} Orders grouped by date string
     */
    groupOrdersByDate() {
        const grouped = {};

        this.orders.forEach(order => {
            const dateValue = order[this.dateField];
            if (dateValue) {
                const dateKey = dateValue.split('T')[0]; // Get just the date part
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(order);
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
 * Change calendar date field
 * @param {string} field - 'cliente', 'tienda', or 'fabricacion'
 */
function changeCalendarDate(field) {
    // Update toggle UI
    document.getElementById('date-toggle-cliente').classList.toggle('active', field === 'cliente');
    document.getElementById('date-toggle-tienda').classList.toggle('active', field === 'tienda');
    document.getElementById('date-toggle-fabricacion').classList.toggle('active', field === 'fabricacion');

    Calendar.setDateField(field);
}
