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
    }
};
