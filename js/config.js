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
    // Users Configuration
    // ==========================================================================

    // List of users who can access the system
    // isAdmin: true means they will see admin-only features (optional)
    // password: if set, user must enter password to access (optional)
    USERS: [
        { id: 'alba', name: 'Alba', isAdmin: true, password: 'prisma2024' },
        // Add more users here:
        // { id: 'margarita', name: 'Margarita' },
        // { id: 'juan', name: 'Juan' },
    ],

    // Session key for storing current user
    SESSION_KEY: 'prisma_user_session',

    // ==========================================================================
    // Joyeros (Jewelry Makers)
    // ==========================================================================

    // List of jewelry makers that can be assigned to orders
    JOYEROS: [
        { id: 'carlos', name: 'Carlos' },
        { id: 'miguel', name: 'Miguel' },
        { id: 'especialista', name: 'Especialista Externo' }
        // Add more joyeros here as needed
    ],

    // ==========================================================================
    // Order Types
    // ==========================================================================

    TIPOS_PEDIDO: [
        { id: 'anillo_compromiso', name: 'Anillo de Compromiso' },
        { id: 'anillo', name: 'Anillo' },
        { id: 'argollas', name: 'Argollas de Matrimonio' },
        { id: 'aretes', name: 'Aretes' },
        { id: 'collar', name: 'Collar' },
        { id: 'pulsera', name: 'Pulsera' },
        { id: 'cadena', name: 'Cadena' },
        { id: 'dije', name: 'Dije' },
        { id: 'reloj', name: 'Servicio de Reloj' },
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
Object.freeze(CONFIG);
Object.freeze(CONFIG.ESTADOS);
Object.freeze(CONFIG.TIPOS_PEDIDO);
