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
        },
        // Closed/Completed orders (estado_final = cerrado_completo) - for search testing
        {
            id: 'mock-closed-001',
            numero_orden: 'ORD-2025-150',
            nombre_cliente: 'María González Pérez',
            telefono_cliente: '8181111222',
            tipo_pedido: 'anillo_compromiso',
            descripcion: 'Anillo de compromiso oro blanco 14k con diamante 0.3ct',
            importe_total: 18500,
            anticipo: 18500,
            estado: 'Entregado',
            estado_final: 'cerrado_completo',
            fecha_pedido: '2025-11-15',
            fecha_entrega_cliente: '2025-12-01',
            fecha_entrega_tienda: '2025-11-28',
            oro_gramos: 3.5,
            oro_con_joyero: true,
            joyero: 'Carlos',
            gemas_requeridas: '1 diamante 0.3ct',
            gemas_origen: 'tienda',
            gemas_listas: true,
            notas: 'Entregado exitosamente. Cliente muy satisfecho.'
        },
        {
            id: 'mock-closed-002',
            numero_orden: 'ORD-2025-145',
            nombre_cliente: 'Roberto García Luna',
            telefono_cliente: '8182223344',
            tipo_pedido: 'argollas',
            descripcion: 'Argollas de matrimonio oro amarillo 18k comfort fit',
            importe_total: 24000,
            anticipo: 24000,
            estado: 'Entregado',
            estado_final: 'cerrado_completo',
            fecha_pedido: '2025-10-20',
            fecha_entrega_cliente: '2025-11-15',
            fecha_entrega_tienda: '2025-11-10',
            oro_gramos: 12.8,
            oro_con_joyero: true,
            joyero: 'Victor',
            gemas_requeridas: null,
            gemas_origen: null,
            gemas_listas: false,
            notas: 'Grabado interior: R&L 15.11.2025'
        },
        {
            id: 'mock-closed-003',
            numero_orden: 'ORD-2025-130',
            nombre_cliente: 'Ana María Rodríguez',
            telefono_cliente: '8183334455',
            tipo_pedido: 'collar',
            descripcion: 'Collar con dije de corazón oro rosa 14k con zirconias',
            importe_total: 5600,
            anticipo: 5600,
            estado: 'Entregado',
            estado_final: 'cerrado_completo',
            fecha_pedido: '2025-09-10',
            fecha_entrega_cliente: '2025-09-25',
            fecha_entrega_tienda: '2025-09-22',
            oro_gramos: 4.2,
            oro_con_joyero: true,
            joyero: 'Carlos',
            gemas_requeridas: '15 zirconias 1mm',
            gemas_origen: 'tienda',
            gemas_listas: true,
            notas: 'Regalo de cumpleaños para hija.'
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
    },

    // ==========================================================================
    // Gold Movements
    // ==========================================================================

    // In-memory storage for mock gold movements
    goldMovements: [
        {
            id: 'MOV-001',
            joyero: 'Carlos',
            tipo_movimiento: 'Entrada',
            gramos: 100.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Compra inicial de oro',
            created_by: 'Alba',
            created_at: '2026-01-02T10:00:00Z'
        },
        {
            id: 'MOV-002',
            joyero: 'Carlos',
            tipo_movimiento: 'Salida Pedido',
            gramos: 4.8,
            order_id: 'mock-001',
            numero_orden: 'ORD-001',
            descripcion: 'Anillo de compromiso María García',
            created_by: 'Alba',
            created_at: '2026-01-10T11:30:00Z'
        },
        {
            id: 'MOV-003',
            joyero: 'Carlos',
            tipo_movimiento: 'Salida Pedido',
            gramos: 45.5,
            order_id: 'mock-004',
            numero_orden: 'ORD-004',
            descripcion: 'Pulsera eslabón cubano Roberto Sánchez',
            created_by: 'Alba',
            created_at: '2026-01-08T14:00:00Z'
        },
        {
            id: 'MOV-004',
            joyero: 'Carlos',
            tipo_movimiento: 'Salida Pedido',
            gramos: 18.2,
            order_id: 'mock-006',
            numero_orden: 'ORD-006',
            descripcion: 'Anillo caballero Fernando Torres',
            created_by: 'Alba',
            created_at: '2026-01-12T09:15:00Z'
        },
        {
            id: 'MOV-005',
            joyero: 'Carlos',
            tipo_movimiento: 'Salida Pedido',
            gramos: 3.4,
            order_id: 'mock-009',
            numero_orden: 'ORD-009',
            descripcion: 'Aretes huggies Carolina Ruiz',
            created_by: 'Margarita',
            created_at: '2026-01-13T16:45:00Z'
        },
        {
            id: 'MOV-006',
            joyero: 'Victor',
            tipo_movimiento: 'Entrada',
            gramos: 50.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Transferencia de inventario',
            created_by: 'Alba',
            created_at: '2026-01-05T08:30:00Z'
        },
        {
            id: 'MOV-007',
            joyero: 'Victor',
            tipo_movimiento: 'Salida Pedido',
            gramos: 2.1,
            order_id: 'mock-005',
            numero_orden: 'ORD-005',
            descripcion: 'Dije inicial L Laura Martínez',
            created_by: 'Alba',
            created_at: '2026-01-05T10:00:00Z'
        },
        {
            id: 'MOV-008',
            joyero: 'Victor',
            tipo_movimiento: 'Salida Pedido',
            gramos: 15.8,
            order_id: 'mock-010',
            numero_orden: 'ORD-010',
            descripcion: 'Cadena rope Alberto Mendoza',
            created_by: 'Rossy',
            created_at: '2026-01-02T15:20:00Z'
        },
        {
            id: 'MOV-009',
            joyero: 'Israel',
            tipo_movimiento: 'Entrada',
            gramos: 30.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Asignación inicial',
            created_by: 'Alba',
            created_at: '2026-01-03T09:00:00Z'
        },
        {
            id: 'MOV-010',
            joyero: 'Israel',
            tipo_movimiento: 'Salida Ajuste',
            gramos: 5.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Ajuste por merma de taller',
            created_by: 'Alba',
            created_at: '2026-01-15T11:00:00Z'
        },
        {
            id: 'MOV-011',
            joyero: 'Marcos',
            tipo_movimiento: 'Entrada',
            gramos: 20.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Transferencia desde bodega',
            created_by: 'Alba',
            created_at: '2026-01-10T08:00:00Z'
        },
        {
            id: 'MOV-012',
            joyero: 'Salvador',
            tipo_movimiento: 'Entrada',
            gramos: 15.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Asignación inicial',
            created_by: 'Alba',
            created_at: '2026-01-08T10:00:00Z'
        },
        {
            id: 'MOV-013',
            joyero: 'Juan',
            tipo_movimiento: 'Entrada',
            gramos: 10.0,
            order_id: null,
            numero_orden: null,
            descripcion: 'Asignación inicial',
            created_by: 'Alba',
            created_at: '2026-01-12T14:00:00Z'
        }
    ],

    /**
     * Get gold movements (simulates API call)
     * @param {Object} filters - Optional filters (joyero, tipo_movimiento)
     * @returns {Object} Response with movements array
     */
    getGoldMovements(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.goldMovements];

                // Apply filters
                if (filters.joyero) {
                    result = result.filter(m => m.joyero === filters.joyero);
                }
                if (filters.tipo_movimiento) {
                    result = result.filter(m => m.tipo_movimiento === filters.tipo_movimiento);
                }

                // Sort by date descending
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                resolve({
                    success: true,
                    data: result
                });
            }, 300);
        });
    },

    /**
     * Create a gold movement (simulates API call)
     * @param {Object} movementData - Movement data
     * @returns {Object} Response with created movement
     */
    createGoldMovement(movementData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const count = this.goldMovements.length + 1;
                const newMovement = {
                    id: `MOV-${String(count).padStart(3, '0')}`,
                    ...movementData,
                    created_at: new Date().toISOString()
                };

                this.goldMovements.unshift(newMovement);

                console.log(`\n📊 Nuevo movimiento de oro creado:`);
                console.log(`   - Joyero: ${newMovement.joyero}`);
                console.log(`   - Tipo: ${newMovement.tipo_movimiento}`);
                console.log(`   - Gramos: ${newMovement.gramos}`);
                console.log(`   - Descripción: ${newMovement.descripcion}`);

                resolve({
                    success: true,
                    data: newMovement
                });
            }, 300);
        });
    },

    /**
     * Get balance summary per joyero (simulates API call)
     * @returns {Object} Response with balances per joyero
     */
    getJoyeroBalances() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const balances = {};

                // Initialize all joyeros from config
                CONFIG.JOYEROS.forEach(j => {
                    balances[j.name] = {
                        balance: 0,
                        total_entrada: 0,
                        total_salida: 0
                    };
                });

                // Calculate from movements
                this.goldMovements.forEach(m => {
                    if (!balances[m.joyero]) {
                        balances[m.joyero] = {
                            balance: 0,
                            total_entrada: 0,
                            total_salida: 0
                        };
                    }

                    if (m.tipo_movimiento === 'Entrada') {
                        balances[m.joyero].total_entrada += m.gramos;
                        balances[m.joyero].balance += m.gramos;
                    } else {
                        // Salida Pedido or Salida Ajuste
                        balances[m.joyero].total_salida += m.gramos;
                        balances[m.joyero].balance -= m.gramos;
                    }
                });

                // Round to 1 decimal place
                for (const joyero of Object.keys(balances)) {
                    balances[joyero].balance = Math.round(balances[joyero].balance * 10) / 10;
                    balances[joyero].total_entrada = Math.round(balances[joyero].total_entrada * 10) / 10;
                    balances[joyero].total_salida = Math.round(balances[joyero].total_salida * 10) / 10;
                }

                resolve({
                    success: true,
                    data: balances
                });
            }, 200);
        });
    },

    // ==========================================================================
    // Order Search
    // ==========================================================================

    /**
     * Search orders by customer name or order number (simulates API call)
     * Includes orders with estado_final = "cerrado_completo"
     * @param {string} query - Search query
     * @returns {Object} Response with matching orders
     */
    searchOrders(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const searchQuery = query.toLowerCase().trim();

                // Search across all orders including closed ones
                const results = this.orders.filter(order => {
                    const searchFields = [
                        order.numero_orden,
                        order.nombre_cliente,
                        order.telefono_cliente,
                        order.descripcion
                    ].filter(Boolean).join(' ').toLowerCase();

                    return searchFields.includes(searchQuery);
                });

                // Sort by date descending (most recent first)
                results.sort((a, b) => {
                    const dateA = new Date(a.fecha_pedido || '1970-01-01');
                    const dateB = new Date(b.fecha_pedido || '1970-01-01');
                    return dateB - dateA;
                });

                resolve({
                    success: true,
                    data: results
                });
            }, 400);
        });
    },

    /**
     * Get Notion page content for an order (simulates API call)
     * @param {string} orderId - Order ID
     * @returns {Object} Response with page content blocks
     */
    getOrderPageContent(orderId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock page content based on order ID
                const mockContent = {
                    'mock-001': {
                        blocks: [
                            { type: 'heading_2', text: 'Especificaciones del Diamante' },
                            { type: 'paragraph', text: 'Diamante central: 0.5ct, corte brillante, color G, claridad VS1' },
                            { type: 'paragraph', text: 'Diamantes laterales: 6 x 0.05ct, mismo corte y calidad' },
                            { type: 'heading_2', text: 'Medidas' },
                            { type: 'paragraph', text: 'Talla del anillo: 6.5' },
                            { type: 'paragraph', text: 'Ancho de la banda: 2mm' },
                            { type: 'heading_2', text: 'Notas de Producción' },
                            { type: 'paragraph', text: 'Grabado solicitado: "M&J 2026" en el interior' },
                            { type: 'paragraph', text: 'Cliente pidió caja especial de terciopelo azul.' }
                        ]
                    },
                    'mock-closed-001': {
                        blocks: [
                            { type: 'heading_2', text: 'Historial del Pedido' },
                            { type: 'paragraph', text: '15 Nov 2025 - Pedido recibido' },
                            { type: 'paragraph', text: '18 Nov 2025 - Oro entregado a joyero' },
                            { type: 'paragraph', text: '25 Nov 2025 - Anillo terminado' },
                            { type: 'paragraph', text: '01 Dic 2025 - Entregado al cliente' },
                            { type: 'heading_2', text: 'Feedback del Cliente' },
                            { type: 'paragraph', text: 'El cliente quedó muy satisfecho con el resultado. Mencionó que la piedra brilla más de lo esperado.' }
                        ]
                    },
                    'mock-closed-002': {
                        blocks: [
                            { type: 'heading_2', text: 'Detalles de las Argollas' },
                            { type: 'paragraph', text: 'Argolla hombre: Talla 10, 6mm ancho' },
                            { type: 'paragraph', text: 'Argolla mujer: Talla 6, 4mm ancho' },
                            { type: 'paragraph', text: 'Acabado: Comfort fit, pulido brillante exterior, mate interior' },
                            { type: 'heading_2', text: 'Grabado' },
                            { type: 'paragraph', text: 'Interior de ambas: R&L 15.11.2025' }
                        ]
                    }
                };

                const content = mockContent[orderId] || {
                    blocks: [
                        { type: 'paragraph', text: 'No hay notas adicionales para este pedido.' }
                    ]
                };

                resolve({
                    success: true,
                    data: content
                });
            }, 300);
        });
    },

    // ==========================================================================
    // Pagos (Spending)
    // ==========================================================================

    // In-memory storage for mock pagos
    pagos: [
        {
            id: 'pago-001',
            monto: 15000,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'operacion',
            subcategoria: 'Renta',
            fecha_vencimiento: '2026-01-25',
            estado: 'confirmado',
            descripcion: 'Renta mensual del local',
            creado_por: 'Alba',
            created_at: '2026-01-01T10:00:00Z'
        },
        {
            id: 'pago-002',
            monto: 2500,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'operacion',
            subcategoria: 'Luz',
            fecha_vencimiento: '2026-01-20',
            estado: 'presupuestado',
            descripcion: 'Recibo de luz CFE',
            creado_por: 'Alba',
            created_at: '2026-01-15T09:00:00Z'
        },
        {
            id: 'pago-003',
            monto: 5000,
            moneda: 'USD',
            es_fiscal: true,
            categoria: 'mercancia',
            subcategoria: 'Proveedor Oro',
            fecha_vencimiento: '2026-01-28',
            estado: 'presupuestado',
            descripcion: 'Compra de oro 24k - Proveedor Miami',
            creado_por: 'Margarita',
            created_at: '2026-01-10T14:00:00Z'
        },
        {
            id: 'pago-004',
            monto: 8500,
            moneda: 'MXN',
            es_fiscal: false,
            categoria: 'nomina',
            subcategoria: 'Sueldos',
            fecha_vencimiento: '2026-01-31',
            estado: 'confirmado',
            descripcion: 'Nómina quincenal empleados',
            creado_por: 'Alba',
            created_at: '2026-01-05T08:00:00Z'
        },
        {
            id: 'pago-005',
            monto: 3500,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'servicios',
            subcategoria: 'Contador',
            fecha_vencimiento: '2026-02-05',
            estado: 'presupuestado',
            descripcion: 'Honorarios mensuales contador',
            creado_por: 'Alba',
            created_at: '2026-01-12T11:00:00Z'
        },
        {
            id: 'pago-006',
            monto: 12000,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'impuestos',
            subcategoria: 'IVA',
            fecha_vencimiento: '2026-02-17',
            estado: 'presupuestado',
            descripcion: 'Pago mensual de IVA',
            creado_por: 'Alba',
            created_at: '2026-01-08T15:00:00Z'
        },
        {
            id: 'pago-007',
            monto: 850,
            moneda: 'MXN',
            es_fiscal: false,
            categoria: 'otros',
            subcategoria: 'Papelería',
            fecha_vencimiento: '2026-01-22',
            estado: 'pagado',
            descripcion: 'Compra de papelería y suministros',
            creado_por: 'Rossy',
            created_at: '2026-01-18T10:30:00Z'
        },
        {
            id: 'pago-008',
            monto: 25000,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'mercancia',
            subcategoria: 'Proveedor Gemas',
            fecha_vencimiento: '2026-01-30',
            estado: 'confirmado',
            descripcion: 'Diamantes sueltos - Proveedor Antwerp',
            creado_por: 'Alba',
            created_at: '2026-01-14T09:00:00Z'
        },
        {
            id: 'pago-009',
            monto: 1200,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'operacion',
            subcategoria: 'Internet',
            fecha_vencimiento: '2026-01-19',
            estado: 'pagado',
            descripcion: 'Servicio de internet mensual',
            creado_por: 'Alba',
            created_at: '2026-01-15T08:00:00Z'
        },
        {
            id: 'pago-010',
            monto: 4500,
            moneda: 'MXN',
            es_fiscal: false,
            categoria: 'equipo',
            subcategoria: 'Herramientas de Taller',
            fecha_vencimiento: '2026-02-10',
            estado: 'presupuestado',
            descripcion: 'Nuevas brocas y limas para joyeros',
            creado_por: 'Margarita',
            created_at: '2026-01-16T14:00:00Z'
        },
        {
            id: 'pago-011',
            monto: 500,
            moneda: 'USD',
            es_fiscal: false,
            categoria: 'servicios',
            subcategoria: 'Marketing',
            fecha_vencimiento: '2026-02-01',
            estado: 'presupuestado',
            descripcion: 'Campaña de publicidad en Instagram',
            creado_por: 'Alba',
            created_at: '2026-01-17T11:00:00Z'
        },
        {
            id: 'pago-012',
            monto: 18000,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'mercancia',
            subcategoria: 'Proveedor Cadenas',
            fecha_vencimiento: '2026-01-26',
            estado: 'confirmado',
            descripcion: 'Cadenas de oro 14k variadas',
            creado_por: 'Alba',
            created_at: '2026-01-13T10:00:00Z'
        },
        {
            id: 'pago-013',
            monto: 2000,
            moneda: 'MXN',
            es_fiscal: false,
            categoria: 'operacion',
            subcategoria: 'Limpieza',
            fecha_vencimiento: '2026-01-24',
            estado: 'cancelado',
            descripcion: 'Servicio de limpieza - CANCELADO por cambio proveedor',
            creado_por: 'Alba',
            created_at: '2026-01-10T08:00:00Z'
        },
        {
            id: 'pago-014',
            monto: 6800,
            moneda: 'MXN',
            es_fiscal: true,
            categoria: 'nomina',
            subcategoria: 'Comisiones',
            fecha_vencimiento: '2026-02-03',
            estado: 'presupuestado',
            descripcion: 'Comisiones vendedoras enero',
            creado_por: 'Alba',
            created_at: '2026-01-19T09:00:00Z'
        },
        {
            id: 'pago-015',
            monto: 950,
            moneda: 'MXN',
            es_fiscal: false,
            categoria: 'otros',
            subcategoria: 'Empaque',
            fecha_vencimiento: '2026-01-27',
            estado: 'presupuestado',
            descripcion: 'Cajas y bolsas para joyería',
            creado_por: 'Rossy',
            created_at: '2026-01-18T15:00:00Z'
        }
    ],

    /**
     * Get all pagos (simulates API call)
     * @param {Object} filters - Optional filters (estado, categoria)
     * @returns {Object} Response with pagos array
     */
    getPagos(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.pagos];

                // Apply filters
                if (filters.estado) {
                    result = result.filter(p => p.estado === filters.estado);
                }
                if (filters.categoria) {
                    result = result.filter(p => p.categoria === filters.categoria);
                }

                // Sort by fecha_vencimiento ascending
                result.sort((a, b) => {
                    const dateA = a.fecha_vencimiento ? new Date(a.fecha_vencimiento) : new Date('9999-12-31');
                    const dateB = b.fecha_vencimiento ? new Date(b.fecha_vencimiento) : new Date('9999-12-31');
                    return dateA - dateB;
                });

                resolve({
                    success: true,
                    data: result
                });
            }, 300);
        });
    },

    /**
     * Get a single pago by ID
     * @param {string} pagoId - Pago ID
     * @returns {Object} Response with pago data
     */
    getPago(pagoId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const pago = this.pagos.find(p => p.id === pagoId);

                if (pago) {
                    resolve({
                        success: true,
                        data: pago
                    });
                } else {
                    reject({
                        success: false,
                        error: 'Pago no encontrado'
                    });
                }
            }, 200);
        });
    },

    /**
     * Create a new pago (simulates API call)
     * @param {Object} pagoData - Pago data
     * @returns {Object} Response with created pago
     */
    createPago(pagoData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPago = {
                    id: 'pago-' + Date.now(),
                    ...pagoData,
                    created_at: new Date().toISOString()
                };

                this.pagos.unshift(newPago);

                console.log(`\n💰 Nuevo pago creado:`);
                console.log(`   - Monto: ${newPago.moneda === 'USD' ? 'USD ' : ''}$${newPago.monto}`);
                console.log(`   - Categoría: ${newPago.categoria}`);
                console.log(`   - Estado: ${newPago.estado}`);

                resolve({
                    success: true,
                    data: newPago
                });
            }, 300);
        });
    },

    /**
     * Update a pago (simulates API call)
     * @param {string} pagoId - Pago ID
     * @param {Object} updates - Fields to update
     * @param {string} userName - User making the update
     * @param {Array} changes - List of changes
     * @returns {Object} Response with updated pago
     */
    updatePago(pagoId, updates, userName, changes = []) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.pagos.findIndex(p => p.id === pagoId);

                if (index === -1) {
                    reject({
                        success: false,
                        error: 'Pago no encontrado'
                    });
                    return;
                }

                // Update the pago
                this.pagos[index] = {
                    ...this.pagos[index],
                    ...updates
                };

                // Log changes to console
                if (changes.length > 0) {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    const dateStr = now.toISOString().split('T')[0];

                    console.log(`\n📝 Cambios en pago ${pagoId}:`);
                    changes.forEach(change => {
                        console.log(`   - ${timeStr}, ${dateStr}: ${change} por ${userName}`);
                    });
                }

                resolve({
                    success: true,
                    data: this.pagos[index]
                });
            }, 300);
        });
    }
};
