// -------------------------------------
// Prisma Update Order Lambda
// -------------------------------------
import { Client } from '@notionhq/client';

// Initialize Notion client
// TODO: Replace with your Notion API key or use environment variable
const notion = new Client({
    auth: process.env.NOTION_API_KEY || 'secret_vxCZixTbzZn3eZzyk7QivNp8Si6nd1BHaVixHoKPX7U'
});

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'PUT,PATCH,OPTIONS'
};


export const handler = async (event) => {
    // Get HTTP method (works for both REST API and HTTP API)
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        // Get order ID from path parameters (works for both REST API and HTTP API)
        let orderId = event.pathParameters?.id;

        // Fallback: extract from path for HTTP API v2
        if (!orderId) {
            const path = event.rawPath || event.requestContext?.http?.path || '';
            const match = path.match(/\/orders\/([^\/]+)/);
            if (match) {
                orderId = match[1];
            }
        }

        if (!orderId) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'ID de pedido requerido'
                })
            };
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { data, user, changes } = body;

        if (!data) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Datos de actualización requeridos'
                })
            };
        }

        // Build properties object for Notion
        const properties = buildProperties(data);

        // Update page in Notion
        const updatedPage = await notion.pages.update({
            page_id: orderId,
            properties
        });

        // Append change log entries
        if (changes && changes.length > 0 && user) {
            await appendChangeLog(orderId, changes, user);
        }

        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                data: {
                    id: updatedPage.id,
                    last_edited_time: updatedPage.last_edited_time
                }
            })
        };

    } catch (error) {
        console.error('Error updating order:', error);

        // Handle not found
        if (error.code === 'object_not_found') {
            return {
                statusCode: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Pedido no encontrado'
                })
            };
        }

        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: 'Error al actualizar pedido',
                details: error.message
            })
        };
    }
};

/**
 * Build Notion properties object from data
 */
function buildProperties(data) {
    const properties = {};

    // Title property (numero_orden)
    if (data.numero_orden !== undefined) {
        properties.numero_orden = {
            title: [{ text: { content: data.numero_orden || '' } }]
        };
    }

    // Rich text properties (including nombre_cliente)
    const richTextFields = ['nombre_cliente', 'descripcion', 'gemas_requeridas', 'notas', 'telefono_cliente'];
    richTextFields.forEach(field => {
        if (data[field] !== undefined) {
            properties[field] = {
                rich_text: data[field] ? [{ text: { content: data[field] } }] : []
            };
        }
    });

    // Number properties
    const numberFields = ['importe_total', 'anticipo', 'oro_gramos'];
    numberFields.forEach(field => {
        if (data[field] !== undefined) {
            properties[field] = {
                number: data[field] !== null ? Number(data[field]) : null
            };
        }
    });

    // Checkbox properties
    const checkboxFields = ['oro_con_joyero', 'gemas_listas'];
    checkboxFields.forEach(field => {
        if (data[field] !== undefined) {
            properties[field] = {
                checkbox: Boolean(data[field])
            };
        }
    });

    // Select properties
    const selectFields = ['estado', 'tipo_pedido', 'joyero', 'gemas_origen', 'vendedora'];
    selectFields.forEach(field => {
        if (data[field] !== undefined) {
            properties[field] = {
                select: data[field] ? { name: data[field] } : null
            };
        }
    });

    // Date properties
    const dateFields = ['fecha_entrega_cliente', 'fecha_entrega_tienda', 'fecha_fabricacion'];
    dateFields.forEach(field => {
        if (data[field] !== undefined) {
            properties[field] = {
                date: data[field] ? { start: data[field] } : null
            };
        }
    });

    return properties;
}

/**
 * Append change log entries to page content
 */
async function appendChangeLog(pageId, changes, user) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const dateStr = now.toISOString().split('T')[0];

    // Create bullet blocks for each change
    const blocks = changes.map(change => ({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
            rich_text: [{
                type: 'text',
                text: { content: `${timeStr}, ${dateStr}: ${change} por ${user}` }
            }]
        }
    }));

    // Append blocks to page
    await notion.blocks.children.append({
        block_id: pageId,
        children: blocks
    });
}
