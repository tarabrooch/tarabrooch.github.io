/**
 * Prisma Authentication & User Management
 *
 * Handles user selection, session management, and password verification.
 */

const Auth = {
    // Current user state
    currentUser: null,

    /**
     * Initialize auth - check for existing session
     */
    init() {
        const savedSession = sessionStorage.getItem(CONFIG.SESSION_KEY);
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const user = CONFIG.USERS.find(u => u.id === session.userId);
                if (user && session.authenticated) {
                    this.currentUser = user;
                    return true;
                }
            } catch (e) {
                sessionStorage.removeItem(CONFIG.SESSION_KEY);
            }
        }
        return false;
    },

    /**
     * Get current user
     * @returns {Object|null} Current user object or null
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Alias for getUser (for compatibility)
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        // Try to restore from session if not set
        if (!this.currentUser) {
            this.init();
            // Also check URL for user
            if (!this.currentUser) {
                this.getUserFromUrl();
            }
        }
        return this.currentUser;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        // Check current state
        if (this.currentUser) {
            return true;
        }
        // Try to restore from session
        if (this.init()) {
            return true;
        }
        // Check URL for user parameter
        if (this.getUserFromUrl()) {
            return true;
        }
        return false;
    },

    /**
     * Get current user's name
     * @returns {string} User name or 'Usuario'
     */
    getUserName() {
        return this.currentUser ? this.currentUser.name : 'Usuario';
    },

    /**
     * Check if current user is admin
     * @returns {boolean}
     */
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    },

    /**
     * Check if user requires password
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    requiresPassword(userId) {
        const user = CONFIG.USERS.find(u => u.id === userId);
        return user && user.password;
    },

    /**
     * Select a user (before password check if needed)
     * @param {string} userId - User ID to select
     * @returns {Object} User object
     */
    selectUser(userId) {
        const user = CONFIG.USERS.find(u => u.id === userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    },

    /**
     * Verify password for a user
     * @param {string} userId - User ID
     * @param {string} password - Password to verify
     * @returns {boolean}
     */
    verifyPassword(userId, password) {
        const user = CONFIG.USERS.find(u => u.id === userId);
        if (!user || !user.password) {
            return true; // No password required
        }
        return user.password === password;
    },

    /**
     * Login user (saves session)
     * @param {string} userId - User ID to login
     */
    login(userId) {
        const user = CONFIG.USERS.find(u => u.id === userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        this.currentUser = user;

        // Save session
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify({
            userId: user.id,
            authenticated: true,
            timestamp: Date.now()
        }));
    },

    /**
     * Logout current user
     */
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
    },

    /**
     * Get URL with user parameter
     * @param {string} page - Page name (without .html)
     * @param {Object} extraParams - Additional URL parameters
     * @returns {string} URL with parameters
     */
    buildUrl(page, extraParams = {}) {
        const params = new URLSearchParams();

        if (this.currentUser) {
            params.set('user', this.currentUser.id);
        }

        for (const [key, value] of Object.entries(extraParams)) {
            if (value !== null && value !== undefined) {
                params.set(key, value);
            }
        }

        const queryString = params.toString();
        return page + '.html' + (queryString ? '?' + queryString : '');
    },

    /**
     * Navigate to a page with current user context
     * @param {string} page - Page name (without .html)
     * @param {Object} extraParams - Additional URL parameters
     */
    navigateTo(page, extraParams = {}) {
        window.location.href = this.buildUrl(page, extraParams);
    },

    /**
     * Read user from URL parameters (for pages that receive user via URL)
     * @returns {Object|null} User object or null
     */
    getUserFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        if (userId) {
            const user = CONFIG.USERS.find(u => u.id === userId);
            if (user) {
                this.currentUser = user;
                return user;
            }
        }
        return null;
    }
};
