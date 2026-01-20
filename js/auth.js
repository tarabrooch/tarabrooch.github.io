/**
 * Prisma Authentication
 *
 * Handles simple password-based session management for dashboard access.
 * Vendedora selection is now handled at order creation time, not at login.
 */

const Auth = {
    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const session = sessionStorage.getItem(CONFIG.SESSION_KEY);
        if (session) {
            try {
                const data = JSON.parse(session);
                return data.authenticated === true;
            } catch (e) {
                sessionStorage.removeItem(CONFIG.SESSION_KEY);
            }
        }
        return false;
    },

    /**
     * Initialize auth - alias for isAuthenticated for backward compatibility
     * @returns {boolean}
     */
    init() {
        return this.isAuthenticated();
    },

    /**
     * Verify password
     * @param {string} password - Password to verify
     * @returns {boolean}
     */
    verifyPassword(password) {
        return password === CONFIG.DASHBOARD_PASSWORD;
    },

    /**
     * Login (saves session)
     */
    login() {
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify({
            authenticated: true,
            timestamp: Date.now()
        }));
    },

    /**
     * Logout current session
     */
    logout() {
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
    },

    /**
     * Get current user - returns null since we no longer track users at login
     * Kept for backward compatibility
     * @returns {null}
     */
    getUser() {
        return null;
    },

    /**
     * Alias for getUser
     * @returns {null}
     */
    getCurrentUser() {
        return null;
    },

    /**
     * Get user name - returns null since vendedora is selected per order
     * @returns {null}
     */
    getUserName() {
        return null;
    },

    /**
     * Check if current user is admin
     * With generic login, everyone who logs in has full access
     * @returns {boolean}
     */
    isAdmin() {
        return this.isAuthenticated();
    },

    /**
     * Navigate to a page
     * @param {string} page - Page name (without .html)
     */
    navigateTo(page) {
        window.location.href = page + '.html';
    },

    /**
     * Get user from URL - kept for backward compatibility
     * @returns {null}
     */
    getUserFromUrl() {
        return null;
    }
};
