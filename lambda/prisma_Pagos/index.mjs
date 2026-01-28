/**
 * Pagos Lambda Handler
 *
 * AWS Lambda function for managing Pagos (spending/payments) in Notion.
 *
 * ENDPOINTS:
 * - POST /pagos          - Create new pago
 * - GET  /pagos          - Get all pagos (with optional filters)
 * - GET  /pagos/{id}     - Get single pago by ID
 * - PUT  /pagos/{id}     - Update pago
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new AWS Lambda function
 * 2. Copy this code to index.js
 * 3. Copy node_modules from an existing lambda (notion-handler)
 * 4. Set environment variables:
 *    - NOTION_TOKEN: Your Notion integration token
 *    - PAGOS_DATABASE_ID: Your Notion database ID for Pagos
 * 5. Create API Gateway endpoints pointing to this Lambda
 *
 * NOTION DATABASE SCHEMA:
 * Create a database in Notion with these properties:
 * - monto: Number
 * - moneda: Select (MXN, USD)
 * - es_fiscal: Checkbox
 * - categoria: Select (from CONFIG.PAGO_CATEGORIES keys)
 * - subcategoria: Text
 * - fecha_vencimiento: Date
 * - estado: Select (presupuestado, confirmado, pagado, cancelado)
 * - descripcion: Text
 * - creado_por: Text
 */

import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PAGOS_DATABASE_ID = process.env.PAGOS_DATABASE_ID;

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Main handler
 */
export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    // Support both REST API (v1) and HTTP API (v2) event formats
    const method = event.httpMethod || event.requestContext?.http?.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // HTTP API v2 uses rawPath, REST API v1 uses path or resource
        const path = event.rawPath || event.path || event.resource || '';
        const pathParams = event.pathParameters || {};

        // Route handling
        if (path === '/pagos' && method === 'POST') {
            return await createPago(event);
        }

        if (path === '/pagos' && method === 'GET') {
            return await getPagos(event);
        }

        if (path.match(/\/pagos\/[^/]+$/) && method === 'GET') {
            return await getPago(pathParams.id || pathParams.proxy);
        }

        if (path.match(/\/pagos\/[^/]+$/) && method === 'PUT') {
            return await updatePago(pathParams.id || pathParams.proxy, event);
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, error: 'Not Found' })
        };

    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

/**
 * Create a new pago
 */
async function createPago(event) {
    const body = JSON.parse(event.body);
    const data = body.data;
    const createdBy = body.created_by || 'Sistema';

    console.log('Creating pago:', data);

    // Build Notion properties
    const properties = {
        // Title (required for Notion pages)
        'Name': {
            title: [{ text: { content: `${data.categoria} - ${data.subcategoria || 'Sin subcategoría'}` } }]
        },
        'monto': { number: data.monto || 0 },
        'moneda': { select: { name: data.moneda || 'MXN' } },
        'es_fiscal': { checkbox: data.es_fiscal || false },
        'categoria': { select: { name: data.categoria } },
        'subcategoria': { rich_text: [{ text: { content: data.subcategoria || '' } }] },
        'estado': { select: { name: data.estado || 'presupuestado' } },
        'creado_por': { rich_text: [{ text: { content: createdBy } }] }
    };

    // Add optional date
    if (data.fecha_vencimiento) {
        properties['fecha_vencimiento'] = { date: { start: data.fecha_vencimiento } };
    }

    // Add description if provided
    if (data.descripcion) {
        properties['descripcion'] = { rich_text: [{ text: { content: data.descripcion } }] };
    }

    // Create Notion page
    const response = await notion.pages.create({
        parent: { database_id: PAGOS_DATABASE_ID },
        properties: properties,
        // Add initial change log to page content
        children: [
            {
                object: 'block',
                type: 'heading_3',
                heading_3: {
                    rich_text: [{ text: { content: 'Historial de Cambios' } }]
                }
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        text: {
                            content: `${formatTimestamp()} - Pago creado por ${createdBy}`
                        }
                    }]
                }
            }
        ]
    });

    console.log('Created pago:', response.id);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data: { id: response.id, ...data }
        })
    };
}

/**
 * Get all pagos (with optional filters)
 */
async function getPagos(event) {
    const queryParams = event.queryStringParameters || {};

    console.log('Getting pagos with filters:', queryParams);

    // Build filter
    const filters = [];

    if (queryParams.estado) {
        filters.push({
            property: 'estado',
            select: { equals: queryParams.estado }
        });
    }

    if (queryParams.categoria) {
        filters.push({
            property: 'categoria',
            select: { equals: queryParams.categoria }
        });
    }

    // Query Notion
    const queryOptions = {
        database_id: PAGOS_DATABASE_ID,
        sorts: [{ property: 'fecha_vencimiento', direction: 'ascending' }]
    };

    if (filters.length > 0) {
        queryOptions.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    const response = await notion.databases.query(queryOptions);

    // Transform results
    const pagos = response.results.map(page => transformPago(page));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: pagos })
    };
}

/**
 * Get single pago by ID
 */
async function getPago(pagoId) {
    console.log('Getting pago:', pagoId);

    const response = await notion.pages.retrieve({ page_id: pagoId });
    const pago = transformPago(response);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: pago })
    };
}

/**
 * Update a pago
 */
async function updatePago(pagoId, event) {
    const body = JSON.parse(event.body);
    const data = body.data;
    const userName = body.user || 'Sistema';
    const changes = body.changes || [];

    console.log('Updating pago:', pagoId, data);

    // Build properties to update
    const properties = {};

    if (data.monto !== undefined) {
        properties['monto'] = { number: data.monto };
    }

    if (data.moneda) {
        properties['moneda'] = { select: { name: data.moneda } };
    }

    if (data.es_fiscal !== undefined) {
        properties['es_fiscal'] = { checkbox: data.es_fiscal };
    }

    if (data.categoria) {
        properties['categoria'] = { select: { name: data.categoria } };
    }

    if (data.subcategoria !== undefined) {
        properties['subcategoria'] = { rich_text: [{ text: { content: data.subcategoria || '' } }] };
    }

    if (data.fecha_vencimiento !== undefined) {
        if (data.fecha_vencimiento) {
            properties['fecha_vencimiento'] = { date: { start: data.fecha_vencimiento } };
        } else {
            properties['fecha_vencimiento'] = { date: null };
        }
    }

    if (data.estado) {
        properties['estado'] = { select: { name: data.estado } };
    }

    if (data.descripcion !== undefined) {
        properties['descripcion'] = { rich_text: [{ text: { content: data.descripcion || '' } }] };
    }

    // Update Notion page
    const response = await notion.pages.update({
        page_id: pagoId,
        properties: properties
    });

    // Append to change log if there are changes
    if (changes.length > 0) {
        const changeLogEntry = `${formatTimestamp()} - ${changes.join(', ')} por ${userName}`;

        await notion.blocks.children.append({
            block_id: pagoId,
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ text: { content: changeLogEntry } }]
                    }
                }
            ]
        });
    }

    console.log('Updated pago:', pagoId);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data: transformPago(response)
        })
    };
}

/**
 * Transform Notion page to pago object
 */
function transformPago(page) {
    const props = page.properties;

    return {
        id: page.id,
        monto: getNumber(props.monto),
        moneda: getSelect(props.moneda) || 'MXN',
        es_fiscal: getCheckbox(props.es_fiscal),
        categoria: getSelect(props.categoria),
        subcategoria: getRichText(props.subcategoria),
        fecha_vencimiento: getDate(props.fecha_vencimiento),
        estado: getSelect(props.estado) || 'presupuestado',
        descripcion: getRichText(props.descripcion),
        creado_por: getRichText(props.creado_por),
        created_at: page.created_time,
        updated_at: page.last_edited_time
    };
}

// ==========================================================================
// Helper functions
// ==========================================================================

function getNumber(prop) {
    return prop?.number ?? null;
}

function getSelect(prop) {
    return prop?.select?.name ?? null;
}

function getCheckbox(prop) {
    return prop?.checkbox ?? false;
}

function getRichText(prop) {
    if (!prop?.rich_text || prop.rich_text.length === 0) return null;
    return prop.rich_text.map(t => t.plain_text).join('');
}

function getDate(prop) {
    return prop?.date?.start ?? null;
}

function formatTimestamp() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    return `${hour12}:${minutes} ${ampm}, ${year}-${month}-${day}`;
}
