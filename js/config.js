/**
 * Prisma Configuration
 *
 * Edit these values to customize the application.
 * All lists (users, joyeros, etc.) are configurable here.
 */

const CONFIG = {
    // ==========================================================================
    // API Configuration
    // ==========================================================================

    // Replace with your AWS API Gateway URL after deployment
    API_URL: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com',

    // ==========================================================================
    // Dashboard Access
    // ==========================================================================

    // Password to access the dashboard (generic for all users)
    DASHBOARD_PASSWORD: 'tarabrooch',

    // Password for gold movements (joyeros page)
    GOLD_MOVEMENTS_PASSWORD: 'oroprisma',

    // Session key for storing authentication state
    SESSION_KEY: 'prisma_session',

    // ==========================================================================
    // Vendedoras (Salespeople)
    // ==========================================================================

    // List of vendedoras that can be assigned to orders
    VENDEDORAS: [
        { id: 'alba', name: 'Alba' },
        { id: 'margarita', name: 'Margarita' },
        { id: 'rossy', name: 'Rossy' },
        { id: 'martha', name: 'Martha' },
        { id: 'conchis', name: 'Conchis' },
    ],

    // Keep USERS for backward compatibility (references VENDEDORAS)
    get USERS() {
        return this.VENDEDORAS;
    },

    // ==========================================================================
    // Joyeros (Jewelry Makers)
    // ==========================================================================

    // List of jewelry makers that can be assigned to orders
    JOYEROS: [
        { id: 'carlos', name: 'Carlos' },
        { id: 'victor', name: 'Victor' },
        { id: 'israel', name: 'Israel' },
        { id: 'marcos', name: 'Marcos' },
        { id: 'salvador', name: 'Salvador' },
        { id: 'juan', name: 'Juan' },
    ],

    // ==========================================================================
    // Order Types
    // ==========================================================================

    TIPOS_PEDIDO: [
        { id: 'anillo_compromiso', name: 'Anillo de Compromiso' },
        { id: 'anillo', name: 'Anillo' },
        { id: 'argollas', name: 'Argollas de Matrimonio' },
        { id: 'arras', name: 'Arras' },
        { id: 'churumbela', name: 'Churumbela' },
        { id: 'aretes', name: 'Aretes' },
        { id: 'collar', name: 'Collar' },
        { id: 'pulsera', name: 'Pulsera' },
        { id: 'cadena', name: 'Cadena' },
        { id: 'dije', name: 'Dije' },
        { id: 'reparacion', name: 'Reparación' },
        { id: 'otro', name: 'Otro' }
    ],

    // ==========================================================================
    // Order Statuses
    // ==========================================================================

    // Status options for orders
    // color: matches CSS classes (amber, blue, green, gray, red)
    ESTADOS: [
        { id: 'pendiente_aprobacion', name: 'Pendiente Aprobación', color: 'amber' },
        { id: 'en_produccion', name: 'En Producción', color: 'blue' },
        { id: 'listo_entrega', name: 'Listo para Entrega', color: 'green' },
        { id: 'entregado', name: 'Entregado', color: 'gray' },
        { id: 'cancelado', name: 'Cancelado', color: 'red' }
    ],

    // ==========================================================================
    // Gems Sources
    // ==========================================================================

    GEMAS_ORIGEN: [
        { id: 'tienda', name: 'Tienda (Stock)' },
        { id: 'cliente', name: 'Cliente' },
        { id: 'por_pedir', name: 'Por Pedir' }
    ],

    // ==========================================================================
    // Default Values
    // ==========================================================================

    // Days before customer date to set as store target (if not specified)
    DEFAULT_DAYS_BEFORE_CUSTOMER: 2,

    // Currency
    CURRENCY: 'MXN',
    CURRENCY_SYMBOL: '$'
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG.VENDEDORAS);
Object.freeze(CONFIG.ESTADOS);
Object.freeze(CONFIG.TIPOS_PEDIDO);
Object.freeze(CONFIG.JOYEROS);
Object.freeze(CONFIG.GEMAS_ORIGEN);
