// -------------------------------------
// Prisma Create Order Lambda
// -------------------------------------
import { Client } from '@notionhq/client';

// Initialize Notion client
// TODO: Replace with your Notion API key or use environment variable
const notion = new Client({
    auth: process.env.NOTION_API_KEY || 'secret_vxCZixTbzZn3eZzyk7QivNp8Si6nd1BHaVixHoKPX7U'
});

// TODO: Replace with your Notion database ID
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '2e513ec889418052a426da8ce67b70fa';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
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

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { data } = body;

        if (!data) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Datos del pedido requeridos'
                })
            };
        }

        // Build properties object for Notion
        const properties = buildProperties(data);

        // Create page in Notion
        const newPage = await notion.pages.create({
            parent: { database_id: DATABASE_ID },
            properties
        });

        return {
            statusCode: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                data: {
                    id: newPage.id,
                    created_time: newPage.created_time
                }
            })
        };

    } catch (error) {
        console.error('Error creating order:', error);

        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: 'Error al crear pedido',
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

    // Title property (numero_orden) - required
    properties.numero_orden = {
        title: [{ text: { content: data.numero_orden || 'Sin número' } }]
    };

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
    const checkboxFields = ['oro_con_joyero', 'gemas_listas', 'requiere_certificado'];
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
    const dateFields = ['fecha_pedido', 'fecha_entrega_cliente', 'fecha_entrega_tienda', 'fecha_fabricacion'];
    dateFields.forEach(field => {
        if (data[field] !== undefined) {
            properties[field] = {
                date: data[field] ? { start: data[field] } : null
            };
        }
    });

    // Set default estado if not provided
    if (!properties.estado) {
        properties.estado = {
            select: { name: 'Pendiente Aprobación' }
        };
    }

    // Set fecha_pedido to today if not provided
    if (!properties.fecha_pedido) {
        properties.fecha_pedido = {
            date: { start: new Date().toISOString().split('T')[0] }
        };
    }

    return properties;
}
