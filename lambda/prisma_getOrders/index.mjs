// -------------------------------------
// Prisma Get/Search Orders Lambda
// -------------------------------------
import { Client } from '@notionhq/client';

const notion = new Client({
    auth: process.env.NOTION_API_KEY || 'secret_vxCZixTbzZn3eZzyk7QivNp8Si6nd1BHaVixHoKPX7U'
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '2e513ec889418052a426da8ce67b70fa';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

export const handler = async (event) => {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;

    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        const params = event.queryStringParameters || {};
        
        // Check if this is a search request
        const isSearch = params.q && params.q.trim().length >= 2;
        
        let queryOptions;
        
        if (isSearch) {
            // SEARCH MODE: Search by nombre_cliente or numero_orden
            // Include ALL orders (even closed ones)
            const searchQuery = params.q.trim();
            
            queryOptions = {
                database_id: DATABASE_ID,
                filter: {
                    or: [
                        {
                            property: 'nombre_cliente',
                            rich_text: { contains: searchQuery }
                        },
                        {
                            property: 'numero_orden',
                            title: { contains: searchQuery }
                        }
                    ]
                },
                sorts: [
                    {
                        property: 'fecha_pedido',
                        direction: 'descending'
                    }
                ]
            };
        } else {
            // REGULAR MODE: Get orders with filters, exclude closed
            const filters = buildFilters(params);
            
            queryOptions = {
                database_id: DATABASE_ID,
                filter: filters.length > 0 ? { and: filters } : undefined,
                sorts: [
                    {
                        property: 'fecha_entrega_cliente',
                        direction: 'ascending'
                    }
                ]
            };
        }

        const response = await notion.databases.query(queryOptions);
        const orders = response.results.map(page => transformPage(page));

        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: 'Error al obtener pedidos',
                details: error.message
            })
        };
    }
};

/**
 * Build Notion filters from query parameters (for regular get, not search)
 */
function buildFilters(params) {
    const filters = [];

    // Always exclude closed/archived orders in regular mode
    filters.push({
        property: 'estado_final',
        select: { does_not_equal: 'cerrado_completo' }
    });

    if (params.estado) {
        filters.push({
            property: 'estado',
            select: { equals: params.estado }
        });
    }

    if (params.joyero) {
        filters.push({
            property: 'joyero',
            select: { equals: params.joyero }
        });
    }

    if (params.fecha_desde) {
        filters.push({
            property: 'fecha_entrega_cliente',
            date: { on_or_after: params.fecha_desde }
        });
    }

    if (params.fecha_hasta) {
        filters.push({
            property: 'fecha_entrega_cliente',
            date: { on_or_before: params.fecha_hasta }
        });
    }

    if (params.activos === 'true') {
        filters.push({
            and: [
                { property: 'estado', select: { does_not_equal: 'Entregado' } },
                { property: 'estado', select: { does_not_equal: 'Cancelado' } }
            ]
        });
    }

    return filters;
}

/**
 * Transform Notion page to order object
 */
function transformPage(page) {
    const props = page.properties;

    return {
        id: page.id,
        numero_orden: getTitle(props.numero_orden),
        nombre_cliente: getRichText(props.nombre_cliente),
        telefono_cliente: getRichText(props.telefono_cliente),
        tipo_pedido: getSelect(props.tipo_pedido),
        descripcion: getRichText(props.descripcion),
        importe_total: getNumber(props.importe_total),
        anticipo: getNumber(props.anticipo),
        estado: getSelect(props.estado),
        estado_final: getSelect(props.estado_final),  // Added for search results
        fecha_pedido: getDate(props.fecha_pedido),
        fecha_entrega_cliente: getDate(props.fecha_entrega_cliente),
        fecha_entrega_tienda: getDate(props.fecha_entrega_tienda),
        fecha_fabricacion: getDate(props.fecha_fabricacion),
        oro_gramos: getNumber(props.oro_gramos),
        oro_con_joyero: getCheckbox(props.oro_con_joyero),
        joyero: getSelect(props.joyero),
        gemas_requeridas: getRichText(props.gemas_requeridas),
        gemas_origen: getSelect(props.gemas_origen),
        gemas_listas: getCheckbox(props.gemas_listas),
        notas: getRichText(props.notas),
        vendedora: getSelect(props.vendedora),
        created_time: page.created_time,
        last_edited_time: page.last_edited_time
    };
}

function getTitle(prop) { return prop?.title?.[0]?.plain_text || ''; }
function getRichText(prop) { return prop?.rich_text?.[0]?.plain_text || ''; }
function getSelect(prop) { return prop?.select?.name || null; }
function getNumber(prop) { return prop?.number ?? null; }
function getDate(prop) { return prop?.date?.start || null; }
function getCheckbox(prop) { return prop?.checkbox || false; }
