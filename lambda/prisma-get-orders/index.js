/**
 * Lambda: prisma-get-orders
 *
 * Fetches all orders from Notion database with optional filters.
 */

const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

/**
 * Main handler
 */
exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        // Parse query parameters for filters
        const params = event.queryStringParameters || {};
        const filters = buildFilters(params);

        // Query Notion database
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: filters.length > 0 ? { and: filters } : undefined,
            sorts: [
                {
                    property: 'fecha_entrega_cliente',
                    direction: 'ascending'
                }
            ]
        });

        // Transform results
        const orders = response.results.map(page => transformPage(page));

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                data: orders,
                has_more: response.has_more,
                next_cursor: response.next_cursor
            })
        };

    } catch (error) {
        console.error('Error fetching orders:', error);

        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: 'Error al obtener pedidos',
                details: error.message
            })
        };
    }
};

/**
 * Build Notion filters from query parameters
 * @param {Object} params - Query parameters
 * @returns {Array} Notion filter conditions
 */
function buildFilters(params) {
    const filters = [];

    // Estado filter
    if (params.estado) {
        filters.push({
            property: 'estado',
            select: {
                equals: params.estado
            }
        });
    }

    // Joyero filter
    if (params.joyero) {
        filters.push({
            property: 'joyero',
            select: {
                equals: params.joyero
            }
        });
    }

    // Date range filter (fecha_entrega_cliente)
    if (params.fecha_desde) {
        filters.push({
            property: 'fecha_entrega_cliente',
            date: {
                on_or_after: params.fecha_desde
            }
        });
    }

    if (params.fecha_hasta) {
        filters.push({
            property: 'fecha_entrega_cliente',
            date: {
                on_or_before: params.fecha_hasta
            }
        });
    }

    // Exclude delivered/cancelled by default (optional)
    if (params.activos === 'true') {
        filters.push({
            and: [
                {
                    property: 'estado',
                    select: {
                        does_not_equal: 'Entregado'
                    }
                },
                {
                    property: 'estado',
                    select: {
                        does_not_equal: 'Cancelado'
                    }
                }
            ]
        });
    }

    return filters;
}

/**
 * Transform Notion page to order object
 * @param {Object} page - Notion page object
 * @returns {Object} Order object
 */
function transformPage(page) {
    const props = page.properties;

    return {
        id: page.id,
        nombre_cliente: getTitle(props.nombre_cliente),
        telefono_cliente: getRichText(props.telefono_cliente),
        tipo_pedido: getSelect(props.tipo_pedido),
        descripcion: getRichText(props.descripcion),
        importe_total: getNumber(props.importe_total),
        anticipo: getNumber(props.anticipo),
        estado: getSelect(props.estado),
        fecha_pedido: getDate(props.fecha_pedido),
        fecha_entrega_cliente: getDate(props.fecha_entrega_cliente),
        fecha_entrega_tienda: getDate(props.fecha_entrega_tienda),
        oro_gramos: getNumber(props.oro_gramos),
        joyero: getSelect(props.joyero),
        gemas_requeridas: getRichText(props.gemas_requeridas),
        gemas_origen: getSelect(props.gemas_origen),
        notas: getRichText(props.notas),
        created_time: page.created_time,
        last_edited_time: page.last_edited_time
    };
}

// Property extractors
function getTitle(prop) {
    return prop?.title?.[0]?.plain_text || '';
}

function getRichText(prop) {
    return prop?.rich_text?.[0]?.plain_text || '';
}

function getSelect(prop) {
    return prop?.select?.name || null;
}

function getNumber(prop) {
    return prop?.number ?? null;
}

function getDate(prop) {
    return prop?.date?.start || null;
}
