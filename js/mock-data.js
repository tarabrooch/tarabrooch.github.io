/**
 * Mock Data for Development
 *
 * This file provides mock data for testing the UI without connecting to the real API.
 *
 * ============================================================================
 * TO SWITCH TO REAL DATA:
 * ============================================================================
 * 1. Open js/api.js
 * 2. Change USE_MOCK_DATA from true to false
 * 3. Make sure CONFIG.API_URL in js/config.js points to your API Gateway
 * ============================================================================
 */

const MockData = {
    // In-memory storage for mock orders
    orders: [
        {
            id: 'mock-001',
            nombre_cliente: 'María García Rodríguez',
            telefono_cliente: '8181234567',
            tipo_pedido: 'anillo_compromiso',
            descripcion: 'Anillo de compromiso en oro blanco 14k con diamante central de 0.5ct corte brillante y 6 diamantes laterales de 0.05ct cada uno',
            importe_total: 28500,
            anticipo: 14250,
            estado: 'En Producción',
            fecha_pedido: '2026-01-10',
            fecha_entrega_cliente: '2026-01-20', // Within 4 days - URGENT
            fecha_entrega_tienda: '2026-01-18',
            oro_gramos: 4.8,
            oro_con_joyero: true,
            joyero: 'Carlos',
            gemas_requeridas: '1 diamante 0.5ct + 6 diamantes 0.05ct',
            gemas_origen: 'cliente',
            gemas_listas: true,
            notas: 'Cliente quiere grabado interior: "M&J 2026"'
        },
        {
            id: 'mock-002',
            nombre_cliente: 'Juan Pérez Sánchez',
            telefono_cliente: '8187654321',
            tipo_pedido: 'reparacion',
            descripcion: 'Soldadura de cadena de oro 10k rota en el broche',
            importe_total: 450,
            anticipo: 450,
            estado: 'Listo para Entrega',
            fecha_pedido: '2026-01-15',
            fecha_entrega_cliente: '2026-01-18', // Within 4 days - URGENT
            fecha_entrega_tienda: '2026-01-17',
            oro_gramos: null,
            oro_con_joyero: false,
            joyero: 'Victor',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Listo, llamar al cliente'
        },
        {
            id: 'mock-003',
            nombre_cliente: 'Ana López Martínez',
            telefono_cliente: '8189998877',
            tipo_pedido: 'aretes',
            descripcion: 'Aretes de oro amarillo 18k con zafiros azules de 5mm en montura de 4 uñas',
            importe_total: 15800,
            anticipo: 5000,
            estado: 'Pendiente Aprobación',
            fecha_pedido: '2026-01-16',
            fecha_entrega_cliente: '2026-01-30',
            fecha_entrega_tienda: '2026-01-27',
            oro_gramos: 3.2,
            oro_con_joyero: false,
            joyero: null,
            gemas_requeridas: '2 zafiros azules redondos 5mm',
            gemas_origen: 'tienda',
            gemas_listas: false,
            notas: 'Esperando confirmación de precio de zafiros'
        },
        {
            id: 'mock-004',
            nombre_cliente: 'Roberto Sánchez Luna',
            telefono_cliente: '8181112233',
            tipo_pedido: 'pulsera',
            descripcion: 'Pulsera de eslabón grueso tipo cubano en oro amarillo 14k, 22cm de largo',
            importe_total: 32000,
            anticipo: 16000,
            estado: 'En Producción',
            fecha_pedido: '2026-01-08',
            fecha_entrega_cliente: '2026-01-19', // Within 4 days - URGENT
            fecha_entrega_tienda: '2026-01-17',
            oro_gramos: 45.5,
            oro_con_joyero: true,
            joyero: 'Carlos',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Cliente prefiere broche de seguridad doble'
        },
        {
            id: 'mock-005',
            nombre_cliente: 'Laura Martínez Reyes',
            telefono_cliente: '8184445566',
            tipo_pedido: 'dije',
            descripcion: 'Dije de inicial "L" en oro rosa 14k con 12 zirconias incrustadas',
            importe_total: 4200,
            anticipo: 4200,
            estado: 'Entregado',
            fecha_pedido: '2026-01-05',
            fecha_entrega_cliente: '2026-01-15',
            fecha_entrega_tienda: '2026-01-14',
            oro_gramos: 2.1,
            oro_con_joyero: true,
            joyero: 'Victor',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Entregado el 14 de enero, cliente satisfecha'
        },
        {
            id: 'mock-006',
            nombre_cliente: 'Fernando Torres Díaz',
            telefono_cliente: '8182223344',
            tipo_pedido: 'anillo',
            descripcion: 'Anillo de caballero con sello familiar grabado, oro amarillo 18k',
            importe_total: 18500,
            anticipo: 9250,
            estado: 'En Producción',
            fecha_pedido: '2026-01-12',
            fecha_entrega_cliente: '2026-01-28',
            fecha_entrega_tienda: '2026-01-25',
            oro_gramos: 18.2,
            oro_con_joyero: true,
            joyero: 'Carlos',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Diseño del sello aprobado, en proceso de fundición'
        },
        {
            id: 'mock-007',
            nombre_cliente: 'Patricia Gómez Vega',
            telefono_cliente: '8185556677',
            tipo_pedido: 'collar',
            descripcion: 'Collar tipo tennis con 45 diamantes de 0.10ct cada uno, oro blanco 14k',
            importe_total: 95000,
            anticipo: 47500,
            estado: 'Pendiente Aprobación',
            fecha_pedido: '2026-01-17',
            fecha_entrega_cliente: '2026-02-15',
            fecha_entrega_tienda: '2026-02-10',
            oro_gramos: 12.5,
            oro_con_joyero: false,
            joyero: null,
            gemas_requeridas: '45 diamantes redondos 0.10ct G-H VS',
            gemas_origen: 'tienda',
            gemas_listas: false,
            notas: 'Proyecto especial, requiere aprobación de diamantes'
        },
        {
            id: 'mock-008',
            nombre_cliente: 'Miguel Hernández',
            telefono_cliente: '8186667788',
            tipo_pedido: 'reparacion',
            descripcion: 'Cambio de piedra en anillo de compromiso, zirconia por diamante',
            importe_total: 12000,
            anticipo: 6000,
            estado: 'Listo para Entrega',
            fecha_pedido: '2026-01-14',
            fecha_entrega_cliente: '2026-01-18', // Within 4 days - URGENT
            fecha_entrega_tienda: '2026-01-17',
            oro_gramos: null,
            oro_con_joyero: false,
            joyero: 'Victor',
            gemas_requeridas: '1 diamante 0.40ct',
            gemas_origen: 'tienda',
            gemas_listas: true,
            notas: 'Diamante ya montado, verificar que el cliente traiga el anillo original'
        },
        {
            id: 'mock-009',
            nombre_cliente: 'Carolina Ruiz Flores',
            telefono_cliente: '8187778899',
            tipo_pedido: 'aretes',
            descripcion: 'Aretes tipo huggies con 20 diamantes pequeños, oro blanco 14k',
            importe_total: 8900,
            anticipo: 4450,
            estado: 'En Producción',
            fecha_pedido: '2026-01-13',
            fecha_entrega_cliente: '2026-01-22',
            fecha_entrega_tienda: '2026-01-20',
            oro_gramos: 3.4,
            oro_con_joyero: true,
            joyero: 'Carlos',
            gemas_requeridas: '20 diamantes 1.5mm',
            gemas_origen: 'tienda',
            gemas_listas: true,
            notas: null
        },
        {
            id: 'mock-010',
            nombre_cliente: 'Alberto Mendoza',
            telefono_cliente: '8188889900',
            tipo_pedido: 'cadena',
            descripcion: 'Cadena de oro amarillo 10k tipo rope, 60cm',
            importe_total: 12500,
            anticipo: 12500,
            estado: 'Entregado',
            fecha_pedido: '2026-01-02',
            fecha_entrega_cliente: '2026-01-10',
            fecha_entrega_tienda: '2026-01-09',
            oro_gramos: 15.8,
            oro_con_joyero: true,
            joyero: 'Victor',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Pagado en su totalidad'
        },
        {
            id: 'mock-011',
            nombre_cliente: 'Sofía Castro Jiménez',
            telefono_cliente: '8181234000',
            tipo_pedido: 'anillo_compromiso',
            descripcion: 'Anillo solitario con diamante princesa 0.7ct, oro blanco 18k',
            importe_total: 42000,
            anticipo: 21000,
            estado: 'Pendiente Aprobación',
            fecha_pedido: '2026-01-17',
            fecha_entrega_cliente: '2026-02-14',
            fecha_entrega_tienda: '2026-02-10',
            oro_gramos: 5.5,
            oro_con_joyero: false,
            joyero: null,
            gemas_requeridas: '1 diamante princesa 0.7ct E-F VVS1',
            gemas_origen: 'tienda',
            gemas_listas: false,
            notas: 'Pedido para San Valentín - PRIORIDAD'
        },
        {
            id: 'mock-012',
            nombre_cliente: 'Eduardo Vázquez',
            telefono_cliente: '8189990011',
            tipo_pedido: 'reparacion',
            descripcion: 'Baño de rodio en anillo de oro blanco',
            importe_total: 350,
            anticipo: 350,
            estado: 'Listo para Entrega',
            fecha_pedido: '2026-01-16',
            fecha_entrega_cliente: '2026-01-18', // Within 4 days - URGENT
            fecha_entrega_tienda: '2026-01-17',
            oro_gramos: null,
            oro_con_joyero: false,
            joyero: 'Victor',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: null
        },
        {
            id: 'mock-013',
            nombre_cliente: 'Daniela Moreno',
            telefono_cliente: '8182345678',
            tipo_pedido: 'pulsera',
            descripcion: 'Pulsera de dijes (charm bracelet) en plata 925 con 5 dijes personalizados',
            importe_total: 3800,
            anticipo: 1900,
            estado: 'En Producción',
            fecha_pedido: '2026-01-15',
            fecha_entrega_cliente: '2026-01-23',
            fecha_entrega_tienda: '2026-01-21',
            oro_gramos: null,
            oro_con_joyero: false,
            joyero: 'Carlos',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Dijes: corazón, estrella, inicial D, luna, infinito'
        },
        {
            id: 'mock-014',
            nombre_cliente: 'Ricardo Salinas',
            telefono_cliente: '8183456789',
            tipo_pedido: 'reloj',
            descripcion: 'Servicio completo de reloj Rolex Submariner - limpieza, ajuste y pulido',
            importe_total: 8500,
            anticipo: 4250,
            estado: 'En Producción',
            fecha_pedido: '2026-01-11',
            fecha_entrega_cliente: '2026-01-25',
            fecha_entrega_tienda: '2026-01-23',
            oro_gramos: null,
            oro_con_joyero: false,
            joyero: 'Israel',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Enviado al taller de relojería, esperando regreso'
        },
        {
            id: 'mock-015',
            nombre_cliente: 'Gabriela Fuentes',
            telefono_cliente: '8184567890',
            tipo_pedido: 'collar',
            descripcion: 'Gargantilla con perla cultivada de 12mm y cadena de oro amarillo 14k',
            importe_total: 6800,
            anticipo: 3400,
            estado: 'Cancelado',
            fecha_pedido: '2026-01-09',
            fecha_entrega_cliente: '2026-01-20',
            fecha_entrega_tienda: '2026-01-18',
            oro_gramos: 2.8,
            oro_con_joyero: false,
            joyero: null,
            gemas_requeridas: '1 perla cultivada blanca 12mm',
            gemas_origen: 'tienda',
            gemas_listas: false,
            notas: 'CANCELADO - Cliente cambió de opinión. Anticipo devuelto.'
        }
    ],

    /**
     * Get all orders (simulates API call)
     * @param {Object} filters - Optional filters
     * @returns {Object} Response with orders array
     */
    getOrders(filters = {}) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                let result = [...this.orders];

                // Apply filters
                if (filters.estado) {
                    result = result.filter(o => o.estado === filters.estado);
                }
                if (filters.joyero) {
                    result = result.filter(o => o.joyero === filters.joyero);
                }

                resolve({
                    success: true,
                    data: result
                });
            }, 300);
        });
    },

    /**
     * Get a single order by ID
     * @param {string} orderId - Order ID
     * @returns {Object} Response with order data
     */
    getOrder(orderId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const order = this.orders.find(o => o.id === orderId);

                if (order) {
                    resolve({
                        success: true,
                        data: order
                    });
                } else {
                    reject({
                        success: false,
                        error: 'Pedido no encontrado'
                    });
                }
            }, 200);
        });
    },

    /**
     * Update an order (simulates API call)
     * @param {string} orderId - Order ID
     * @param {Object} updates - Fields to update
     * @param {string} userName - User making the update
     * @param {Array} changes - List of changes
     * @returns {Object} Response with updated order
     */
    updateOrder(orderId, updates, userName, changes = []) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.orders.findIndex(o => o.id === orderId);

                if (index === -1) {
                    reject({
                        success: false,
                        error: 'Pedido no encontrado'
                    });
                    return;
                }

                // Update the order
                this.orders[index] = {
                    ...this.orders[index],
                    ...updates
                };

                // Log changes to console (simulates Notion change log)
                if (changes.length > 0) {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    const dateStr = now.toISOString().split('T')[0];

                    console.log(`\n📝 Cambios en pedido ${orderId}:`);
                    changes.forEach(change => {
                        console.log(`   - ${timeStr}, ${dateStr}: ${change} por ${userName}`);
                    });
                }

                resolve({
                    success: true,
                    data: this.orders[index]
                });
            }, 300);
        });
    },

    /**
     * Create a new order (simulates API call)
     * @param {Object} orderData - Order data
     * @returns {Object} Response with created order
     */
    createOrder(orderData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newOrder = {
                    id: 'mock-' + Date.now(),
                    ...orderData,
                    fecha_pedido: new Date().toISOString().split('T')[0]
                };

                this.orders.unshift(newOrder);

                resolve({
                    success: true,
                    data: newOrder
                });
            }, 300);
        });
    }
};
