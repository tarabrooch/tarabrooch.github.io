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
    // Joyeros (Jewelry Makers) and Proveedores (Providers)
    // ==========================================================================

    // List of jewelry makers and providers that can be assigned to orders
    // type: 'joyero' = jewelry maker (gold movements tracked)
    // type: 'proveedor' = external provider (no gold movement tracking)
    JOYEROS: [
        { id: 'carlos', name: 'Carlos', type: 'joyero' },
        { id: 'victor', name: 'Victor', type: 'joyero' },
        { id: 'israel', name: 'Israel', type: 'joyero' },
        { id: 'marcos', name: 'Marcos', type: 'joyero' },
        { id: 'salvador', name: 'Salvador', type: 'joyero' },
        { id: 'juan', name: 'Juan', type: 'joyero' },
        { id: 'a2', name: 'A2', type: 'proveedor' },
        { id: 'a30', name: 'A30', type: 'proveedor' },
        { id: 'a20', name: 'A20', type: 'proveedor' },
        { id: 'a99', name: 'A99', type: 'proveedor' },
        { id: 'a19', name: 'A19', type: 'proveedor' },
        { id: 'a14', name: 'A14', type: 'proveedor' },
        { id: 'a10', name: 'A10', type: 'proveedor' },
        { id: 'a6', name: 'A6', type: 'proveedor' },
    ],

    // Helper to get only joyeros (no providers)
    getJoyerosOnly() {
        return this.JOYEROS.filter(j => j.type === 'joyero');
    },

    // Helper to get only providers
    getProveedoresOnly() {
        return this.JOYEROS.filter(j => j.type === 'proveedor');
    },

    // Helper to check if a name is a provider
    isProveedor(name) {
        const entry = this.JOYEROS.find(j => j.name === name);
        return entry ? entry.type === 'proveedor' : false;
    },

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
    CURRENCY_SYMBOL: '$',

    // ==========================================================================
    // Pagos (Spending) Module
    // ==========================================================================

    // Password for Pagos module (separate from dashboard)
    PAGOS_PASSWORD: 'pagostara',

    // Password for Desglose (breakdown) access within Pagos
    DESGLOSE_PASSWORD: 'desglosetara',

    // Pago Statuses with colors
    // Colors: orange (presupuestado), red (confirmado), green (pagado), black (cancelado)
    PAGO_ESTADOS: [
        { id: 'presupuestado', name: 'Presupuestado', color: '#7c44a1d5' },    // orange
        { id: 'confirmado', name: 'Confirmado', color: '#a74141' },          // red
        { id: 'pagado', name: 'Pagado', color: '#11803a' },                  // green
        { id: 'cancelado', name: 'Cancelado', color: '#626364' }             // black
    ],

    // Pago Categories and Subcategories
    // Subcategories can be proveedores in some cases (e.g., mercancia)
    PAGO_CATEGORIES: {
        'fijos': {
            name: 'Gastos Fijos',
            subcategories: [
                'Renta',
                'Agua',
                'Luz',
                'Internet',
                'Alarmas',
                'Seguridad',
                'Limpieza',
                'Mantenimiento',
                'Seguros'
            ]
        },
        'proveedores': {
            name: 'Proveedores',
            subcategories: [
                'A1',
                'A2',
                'A3',
                'A6',
                'A9',
                'A10',
                'A12',
                'A14',
                'A15',
                'A16',
                'A17', 'A19', 'A20', 'A30', 'A31','A32'
            ]
        },
        'creditos': {
            name: 'Creditos y Bancos',
            subcategories: [
                'Crédito Banregio',
                'Crédito Banamex',
                'Otros Créditos',
                'Otras Comisiones Bancarias'
            ]
        },
        'nomina': {
            name: 'Nómina',
            subcategories: [
                'Sueldos',
                'Bonos',
                'Aguinaldo',
                'IMSS',
                'Infonavit',
                'Comisiones'
            ]
        },
        'gastos_operacion': {
            name: 'Gastos Variables',
            subcategories: [
                'Bolsas',
                'Papelería',
                'Fotografía',
                'Focos',
                'Fotos',
                'Publicidad',
                'Imprenta',
                'Paquetería',
                'Gasolina'
            ]
        },
        'servicios': {
            name: 'Servicios de Joyeros y Profesionales',
            subcategories: [
                'Joyero - Salvador',
                'Joyero - Carlos',
                'Joyero - Victor',
                'Joyero - Israel',
                'Joyero - Marcos',
                'Joyero - Juan',
                'Joyero - Otros',
                'Joyero - Paco',
                'Sistemas - Victor',
                'Electrico',
                'Contador',
                'Abogado',
                'Diseñador',
                'Marketing',
                'Consultoría'
            ]
        },
        'impuestos': {
            name: 'Impuestos',
            subcategories: [
                'ISR Alba',
                'ISR Lalo',
                'IVA Alba',
                'IVA Lalo',
                'Predial',
                'Tenencia',
                'Impuesto del Estado'
            ]
        },
        'equipo': {
            name: 'Equipo y Herramientas',
            subcategories: [
                'Herramientas de Taller',
                'Equipo de Cómputo',
                'Mobiliario',
                'Maquinaria'
            ]
        },
        'metodo_pago': {
            name: 'Tarjetas de Crédito',
            subcategories: [
                'American Express',
                'Visa',
                'Mastercard',
                'Transferencia',
                'Efectivo',
                'Otro'
            ]
        }
    },

    // Currency options for pagos
    PAGO_CURRENCIES: [
        { id: 'MXN', name: 'MXN (Pesos)', symbol: '$' },
        { id: 'USD', name: 'USD (Dólares)', symbol: '$' }
    ],

    // Default FX rate (USD to MXN)
    DEFAULT_FX_RATE: 19.10,

    // ==========================================================================
    // Cortes (Daily Sales Closings) Module
    // ==========================================================================

    // Payment methods available for cortes
    CORTE_METODOS_PAGO: [
        { id: 'efectivo', name: 'Efectivo' },
        { id: 'tarjeta_credito', name: 'Tarjeta de Crédito' },
        { id: 'tarjeta_debito', name: 'Tarjeta de Débito' },
        { id: 'transferencia', name: 'Transferencia' }
    ]
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG.VENDEDORAS);
Object.freeze(CONFIG.ESTADOS);
Object.freeze(CONFIG.TIPOS_PEDIDO);
Object.freeze(CONFIG.JOYEROS);
Object.freeze(CONFIG.GEMAS_ORIGEN);
Object.freeze(CONFIG.PAGO_ESTADOS);
Object.freeze(CONFIG.PAGO_CATEGORIES);
Object.freeze(CONFIG.PAGO_CURRENCIES);
Object.freeze(CONFIG.CORTE_METODOS_PAGO);
