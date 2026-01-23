/**
 * Prisma Utilities
 *
 * Shared utility functions for formatting, validation, etc.
 */

const Utils = {
    // ==========================================================================
    // Date Formatting
    // ==========================================================================

    /**
     * Parse date string as local time to avoid timezone issues
     * @param {string|Date} date - Date to parse
     * @returns {Date} Parsed date in local time
     */
    parseLocalDate(date) {
        if (date instanceof Date) return date;
        if (!date) return new Date(NaN);

        // If it's a date-only string (YYYY-MM-DD), parse as local midnight
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return new Date(date + 'T00:00:00');
        }
        return new Date(date);
    },

    /**
     * Format date for display (e.g., "15 Ene 2026")
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return '-';

        const d = this.parseLocalDate(date);
        if (isNaN(d.getTime())) return '-';

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    },

    /**
     * Format date for input fields (YYYY-MM-DD)
     * @param {string|Date} date - Date to format
     * @returns {string} ISO date string in local time
     */
    formatDateForInput(date) {
        if (!date) return '';

        const d = this.parseLocalDate(date);
        if (isNaN(d.getTime())) return '';

        // Use local date components to avoid timezone shifts
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Format timestamp for change log (e.g., "11:10 am, 2026-01-20")
     * @param {Date} date - Date to format
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(date = new Date()) {
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const hour12 = hours % 12 || 12;

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${hour12}:${minutes} ${ampm}, ${year}-${month}-${day}`;
    },

    /**
     * Calculate date X days before another date
     * @param {string|Date} date - Reference date
     * @param {number} days - Number of days before
     * @returns {Date} Calculated date
     */
    subtractDays(date, days) {
        const d = this.parseLocalDate(date);
        d.setDate(d.getDate() - days);
        return d;
    },

    /**
     * Calculate date X days after another date
     * @param {string|Date} date - Reference date
     * @param {number} days - Number of days after
     * @returns {Date} Calculated date
     */
    addDays(date, days) {
        const d = this.parseLocalDate(date);
        d.setDate(d.getDate() + days);
        return d;
    },

    // ==========================================================================
    // Currency Formatting
    // ==========================================================================

    /**
     * Format number as currency
     * @param {number} amount - Amount to format
     * @param {boolean} showSymbol - Whether to show currency symbol
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, showSymbol = true) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return showSymbol ? `${CONFIG.CURRENCY_SYMBOL}0` : '0';
        }

        const formatted = new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);

        return showSymbol ? `${CONFIG.CURRENCY_SYMBOL}${formatted}` : formatted;
    },

    /**
     * Parse currency string to number
     * @param {string} value - Currency string
     * @returns {number} Numeric value
     */
    parseCurrency(value) {
        if (typeof value === 'number') return value;
        if (!value) return 0;

        // Remove currency symbol and commas
        const cleaned = value.toString()
            .replace(CONFIG.CURRENCY_SYMBOL, '')
            .replace(/,/g, '')
            .trim();

        return parseFloat(cleaned) || 0;
    },

    // ==========================================================================
    // String Utilities
    // ==========================================================================

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Truncate string with ellipsis
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated string
     */
    truncate(str, maxLength = 50) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },

    // ==========================================================================
    // Status Helpers
    // ==========================================================================

    /**
     * Get status object by ID
     * @param {string} statusId - Status ID
     * @returns {Object|null} Status object
     */
    getStatus(statusId) {
        return CONFIG.ESTADOS.find(s => s.id === statusId) || null;
    },

    /**
     * Get status name by ID
     * @param {string} statusId - Status ID
     * @returns {string} Status name
     */
    getStatusName(statusId) {
        const status = this.getStatus(statusId);
        return status ? status.name : statusId;
    },

    /**
     * Get status color by ID
     * @param {string} statusId - Status ID
     * @returns {string} Status color class
     */
    getStatusColor(statusId) {
        const status = this.getStatus(statusId);
        return status ? status.color : 'gray';
    },

    // ==========================================================================
    // Lookup Helpers
    // ==========================================================================

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Object|null} User object
     */
    getUser(userId) {
        return CONFIG.USERS.find(u => u.id === userId) || null;
    },

    /**
     * Get user name by ID
     * @param {string} userId - User ID
     * @returns {string} User name
     */
    getUserName(userId) {
        const user = this.getUser(userId);
        return user ? user.name : userId;
    },

    /**
     * Get joyero by ID
     * @param {string} joyeroId - Joyero ID
     * @returns {Object|null} Joyero object
     */
    getJoyero(joyeroId) {
        return CONFIG.JOYEROS.find(j => j.id === joyeroId) || null;
    },

    /**
     * Get joyero name by ID
     * @param {string} joyeroId - Joyero ID
     * @returns {string} Joyero name
     */
    getJoyeroName(joyeroId) {
        const joyero = this.getJoyero(joyeroId);
        return joyero ? joyero.name : joyeroId;
    },

    /**
     * Get order type by ID
     * @param {string} tipoId - Type ID
     * @returns {Object|null} Type object
     */
    getTipoPedido(tipoId) {
        return CONFIG.TIPOS_PEDIDO.find(t => t.id === tipoId) || null;
    },

    /**
     * Get order type name by ID
     * @param {string} tipoId - Type ID
     * @returns {string} Type name
     */
    getTipoPedidoName(tipoId) {
        const tipo = this.getTipoPedido(tipoId);
        return tipo ? tipo.name : tipoId;
    },

    // ==========================================================================
    // Validation
    // ==========================================================================

    /**
     * Validate phone number (basic Mexican format)
     * @param {string} phone - Phone number
     * @returns {boolean} Is valid
     */
    isValidPhone(phone) {
        if (!phone) return false;
        // Remove spaces and dashes
        const cleaned = phone.replace(/[\s-]/g, '');
        // Check if it's 10 digits (Mexican mobile) or valid format
        return /^\d{10}$/.test(cleaned) || /^\+?\d{10,15}$/.test(cleaned);
    },

    /**
     * Validate required fields
     * @param {Object} data - Data to validate
     * @param {Array<string>} requiredFields - List of required field names
     * @returns {Array<string>} List of missing fields
     */
    validateRequired(data, requiredFields) {
        const missing = [];
        for (const field of requiredFields) {
            const value = data[field];
            if (value === null || value === undefined || value === '') {
                missing.push(field);
            }
        }
        return missing;
    },

    // ==========================================================================
    // DOM Helpers
    // ==========================================================================

    /**
     * Show element
     * @param {string|Element} el - Element or selector
     */
    show(el) {
        const element = typeof el === 'string' ? document.querySelector(el) : el;
        if (element) element.classList.remove('hidden');
    },

    /**
     * Hide element
     * @param {string|Element} el - Element or selector
     */
    hide(el) {
        const element = typeof el === 'string' ? document.querySelector(el) : el;
        if (element) element.classList.add('hidden');
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('active');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showToast(message, 'error');
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'info', 'warning'
     */
    showToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add styles if not present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 12px 24px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    font-size: 14px;
                    z-index: 10000;
                    animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s forwards;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .toast-success { background: #10b981; }
                .toast-error { background: #ef4444; }
                .toast-info { background: #3b82f6; }
                .toast-warning { background: #f59e0b; }
                @keyframes toast-in {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes toast-out {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
