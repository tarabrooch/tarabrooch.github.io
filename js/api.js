/**
 * Prisma API Client
 *
 * Wrapper for all API calls to the backend Lambda functions.
 *
 * ============================================================================
 * HOW TO SWITCH FROM MOCK DATA TO REAL API:
 * ============================================================================
 *
 * 1. Set up your Lambda functions on AWS:
 *    - prisma-create-order
 *    - prisma-get-orders
 *    - prisma-get-order
 *    - prisma-update-order
 *
 * 2. Create an API Gateway and connect it to your Lambda functions
 *
 * 3. Update CONFIG.API_URL in js/config.js with your API Gateway URL:
 *    API_URL: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'
 *
 * 4. Set USE_MOCK_DATA to false below:
 *    const USE_MOCK_DATA = false;
 *
 * That's it! The API will now call your real Lambda functions.
 * ============================================================================
 */

// Set to false to use real API, true to use mock data for development
const USE_MOCK_DATA = false;
// const CONFIG.API_URL = '';

const API = {
    /**
     * Make an API request
     * @param {string} endpoint - API endpoint (e.g., '/orders')
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = 'https://5lkxb28di4.execute-api.us-east-1.amazonaws.com' + endpoint;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, mergedOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ==========================================================================
    // Orders API
    // ==========================================================================

    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} Created order
     */
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify({
                data: {
                    ...orderData
                },
                created_by: Auth.getUserName()
            })
        });
    },

    /**
     * Get all orders with optional filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Array>} Array of orders
     */
    async getOrders(filters = {}) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getOrders(filters);
        }

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(filters)) {
            if (value !== null && value !== undefined && value !== '') {
                params.set(key, value);
            }
        }

        const queryString = params.toString();
        const endpoint = '/orders' + (queryString ? '?' + queryString : '');

        return this.request(endpoint, {
            method: 'GET'
        });
    },

    /**
     * Get a single order by ID
     * @param {string} orderId - Notion page ID
     * @returns {Promise<Object>} Order data
     */
    async getOrder(orderId) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getOrder(orderId);
        }

        return this.request(`/orders/${orderId}`, {
            method: 'GET'
        });
    },

    /**
     * Update an order
     * @param {string} orderId - Notion page ID
     * @param {Object} updates - Fields to update
     * @param {string} userName - User making the update
     * @param {Array} changes - List of changes for the log
     * @returns {Promise<Object>} Updated order
     */
    async updateOrder(orderId, updates, userName, changes = []) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.updateOrder(orderId, updates, userName, changes);
        }

        return this.request(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({
                data: updates,
                user: userName,
                changes: changes
            })
        });
    },

    /**
     * Approve an order (admin action)
     * @param {string} orderId - Notion page ID
     * @param {Object} approvalData - Approval data (oro_gramos, joyero, etc.)
     * @returns {Promise<Object>} Updated order
     */
    async approveOrder(orderId, approvalData) {
        return this.request(`/orders/${orderId}/approve`, {
            method: 'POST',
            body: JSON.stringify({
                ...approvalData,
                approved_by: Auth.getUserName()
            })
        });
    },

    // ==========================================================================
    // Order Search API
    // ==========================================================================

    /**
     * Search orders by customer name or order number
     * Includes orders with estado_final = "cerrado_completo"
     * @param {string} query - Search query (customer name or order number)
     * @returns {Promise<Object>} Search results with order data
     */
    async searchOrders(query) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.searchOrders(query);
        }

        const params = new URLSearchParams();
        params.set('q', query);

        return this.request('/orders/search?' + params.toString(), {
            method: 'GET'
        });
    },

    /**
     * Get Notion page content (blocks/children) for an order
     * @param {string} orderId - Notion page ID
     * @returns {Promise<Object>} Page content with blocks array
     */
    async getOrderPageContent(orderId) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getOrderPageContent(orderId);
        }

        return this.request(`/orders/${orderId}/content`, {
            method: 'GET'
        });
    },

    // ==========================================================================
    // Gold Movements API
    // ==========================================================================

    /**
     * Get gold movements with optional filters
     * @param {Object} filters - Filter parameters (joyero, tipo_movimiento)
     * @returns {Promise<Array>} Array of gold movements
     */
    async getGoldMovements(filters = {}) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getGoldMovements(filters);
        }

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(filters)) {
            if (value !== null && value !== undefined && value !== '') {
                params.set(key, value);
            }
        }

        const queryString = params.toString();
        const endpoint = '/gold-movements' + (queryString ? '?' + queryString : '');

        return this.request(endpoint, {
            method: 'GET'
        });
    },

    /**
     * Create a new gold movement
     * @param {Object} movementData - Movement data (joyero, tipo_movimiento, gramos, etc.)
     * @returns {Promise<Object>} Created movement
     */
    async createGoldMovement(movementData) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.createGoldMovement(movementData);
        }

        return this.request('/gold-movements', {
            method: 'POST',
            body: JSON.stringify({
                ...movementData,
                created_by: Auth.getUserName()
            })
        });
    },

    /**
     * Get balance summary per joyero
     * @returns {Promise<Object>} Object with joyero names as keys and balance info as values
     */
    async getJoyeroBalances() {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getJoyeroBalances();
        }

        return this.request('/joyeros/balances', {
            method: 'GET'
        });
    },

    // ==========================================================================
    // Pagos (Spending) API
    // ==========================================================================

    /**
     * Create a new pago
     * @param {Object} pagoData - Pago data
     * @returns {Promise<Object>} Created pago
     */
    async createPago(pagoData) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.createPago(pagoData);
        }

        return this.request('/pagos', {
            method: 'POST',
            body: JSON.stringify({
                data: {
                    ...pagoData
                },
                created_by: Auth.getUserName()
            })
        });
    },

    /**
     * Get all pagos with optional filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Array>} Array of pagos
     */
    async getPagos(filters = {}) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getPagos(filters);
        }

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(filters)) {
            if (value !== null && value !== undefined && value !== '') {
                params.set(key, value);
            }
        }

        const queryString = params.toString();
        const endpoint = '/pagos' + (queryString ? '?' + queryString : '');

        return this.request(endpoint, {
            method: 'GET'
        });
    },

    /**
     * Get a single pago by ID
     * @param {string} pagoId - Notion page ID
     * @returns {Promise<Object>} Pago data
     */
    async getPago(pagoId) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.getPago(pagoId);
        }

        return this.request(`/pagos/${pagoId}`, {
            method: 'GET'
        });
    },

    /**
     * Update a pago
     * @param {string} pagoId - Notion page ID
     * @param {Object} updates - Fields to update
     * @param {string} userName - User making the update
     * @param {Array} changes - List of changes for the log
     * @returns {Promise<Object>} Updated pago
     */
    async updatePago(pagoId, updates, userName, changes = []) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return MockData.updatePago(pagoId, updates, userName, changes);
        }

        return this.request(`/pagos/${pagoId}`, {
            method: 'PUT',
            body: JSON.stringify({
                data: updates,
                user: userName,
                changes: changes
            })
        });
    },

    // ==========================================================================
    // Desglose (Breakdown) API
    // ==========================================================================

    /**
     * Get desglose (breakdown) for a pago
     * @param {string} pagoId - Pago ID
     * @returns {Promise<Array>} Array of desglose line items
     */
    async getDesglose(pagoId) {
        return this.request(`/pagos/${pagoId}/desglose`, {
            method: 'GET'
        });
    },

    /**
     * Update desglose (breakdown) for a pago
     * @param {string} pagoId - Pago ID
     * @param {Array} desglose - Array of breakdown line items
     * @returns {Promise<Object>} Updated desglose
     */
    async updateDesglose(pagoId, desglose) {
        return this.request(`/pagos/${pagoId}/desglose`, {
            method: 'PUT',
            body: JSON.stringify({
                desglose: desglose,
                user: Auth.getUserName()
            })
        });
    },

    // ==========================================================================
    // FX Rate API
    // ==========================================================================

    /**
     * Get current USD/MXN exchange rate
     * Tries frankfurter.app API first, falls back to config default
     * @returns {Promise<number>} Exchange rate
     */
    async getFxRate() {
        try {
            // Try frankfurter.app (free, no API key required)
            const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=MXN');

            if (response.ok) {
                const data = await response.json();
                if (data.rates && data.rates.MXN) {
                    return data.rates.MXN;
                }
            }
        } catch (error) {
            console.warn('FX API unavailable, using default rate:', error.message);
        }

        // Fallback to config default
        return CONFIG.DEFAULT_FX_RATE;
    }
};
