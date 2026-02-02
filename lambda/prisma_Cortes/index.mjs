/**
 * Cortes Lambda Handler
 *
 * AWS Lambda function for managing Cortes (daily sales closings) in Notion.
 *
 * ENDPOINTS:
 * - POST   /cortes          - Create new corte
 * - GET    /cortes          - Get all cortes (with optional filters)
 * - GET    /cortes/{id}     - Get single corte by ID
 * - PUT    /cortes/{id}     - Update corte
 * - DELETE /cortes/{id}     - Delete (archive) corte
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new AWS Lambda function
 * 2. Copy this code to index.mjs
 * 3. Copy node_modules from an existing lambda (prisma_Pagos)
 * 4. Set environment variables:
 *    - NOTION_TOKEN: Your Notion integration token
 *    - CORTES_DATABASE_ID: Your Notion database ID for Cortes
 * 5. Create API Gateway endpoints pointing to this Lambda
 *
 * NOTION DATABASE SCHEMA:
 * Create a database in Notion with these properties:
 * - fecha: Date
 * - vendedora: Select (Alba, Margarita, Rossy, Martha, Conchis)
 * - efectivo: Number
 * - tarjeta_credito: Number
 * - tarjeta_debito: Number
 * - transferencia: Number
 * - num_notas: Number
 * - creado_por: Text
 */

import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CORTES_DATABASE_ID = process.env.CORTES_DATABASE_ID;

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
        if (path === '/cortes' && method === 'POST') {
            return await createCorte(event);
        }

        if (path === '/cortes' && method === 'GET') {
            return await getCortes(event);
        }

        if (path.match(/\/cortes\/[^/]+$/) && method === 'GET') {
            const id = pathParams.id || pathParams.proxy || path.split('/')[2];
            return await getCorte(id);
        }

        if (path.match(/\/cortes\/[^/]+$/) && method === 'PUT') {
            const id = pathParams.id || pathParams.proxy || path.split('/')[2];
            return await updateCorte(id, event);
        }

        if (path.match(/\/cortes\/[^/]+$/) && method === 'DELETE') {
            const id = pathParams.id || pathParams.proxy || path.split('/')[2];
            return await deleteCorte(id);
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
 * Create a new corte
 */
async function createCorte(event) {
    const body = JSON.parse(event.body);
    const data = body.data;
    const createdBy = body.created_by || 'Sistema';

    console.log('Creating corte:', data);

    // Build Notion properties
    const properties = {
        // Title (required for Notion pages)
        'Name': {
            title: [{ text: { content: `Corte ${data.vendedora} - ${data.fecha}` } }]
        },
        'fecha': { date: { start: data.fecha } },
        'vendedora': { select: { name: data.vendedora } },
        'efectivo': { number: data.efectivo || 0 },
        'tarjeta_credito': { number: data.tarjeta_credito || 0 },
        'tarjeta_debito': { number: data.tarjeta_debito || 0 },
        'transferencia': { number: data.transferencia || 0 },
        'num_notas': { number: data.num_notas || 0 },
        'creado_por': { rich_text: [{ text: { content: createdBy } }] }
    };

    // Create Notion page
    const response = await notion.pages.create({
        parent: { database_id: CORTES_DATABASE_ID },
        properties: properties,
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
                            content: `${formatTimestamp()} - Corte creado por ${createdBy}`
                        }
                    }]
                }
            }
        ]
    });

    console.log('Created corte:', response.id);

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
 * Get all cortes (with optional filters)
 */
async function getCortes(event) {
    const queryParams = event.queryStringParameters || {};

    console.log('Getting cortes with filters:', queryParams);

    // Build filter
    const filters = [];

    if (queryParams.vendedora) {
        filters.push({
            property: 'vendedora',
            select: { equals: queryParams.vendedora }
        });
    }

    if (queryParams.fecha_desde) {
        filters.push({
            property: 'fecha',
            date: { on_or_after: queryParams.fecha_desde }
        });
    }

    if (queryParams.fecha_hasta) {
        filters.push({
            property: 'fecha',
            date: { on_or_before: queryParams.fecha_hasta }
        });
    }

    // Query Notion
    const queryOptions = {
        database_id: CORTES_DATABASE_ID,
        sorts: [{ property: 'fecha', direction: 'descending' }]
    };

    if (filters.length > 0) {
        queryOptions.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    const response = await notion.databases.query(queryOptions);

    // Transform results
    const cortes = response.results.map(page => transformCorte(page));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: cortes })
    };
}

/**
 * Get single corte by ID
 */
async function getCorte(corteId) {
    console.log('Getting corte:', corteId);

    const response = await notion.pages.retrieve({ page_id: corteId });
    const corte = transformCorte(response);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: corte })
    };
}

/**
 * Update a corte
 */
async function updateCorte(corteId, event) {
    const body = JSON.parse(event.body);
    const data = body.data;
    const userName = body.user || 'Sistema';

    console.log('Updating corte:', corteId, data);

    // Build properties to update
    const properties = {};

    if (data.fecha) {
        properties['fecha'] = { date: { start: data.fecha } };
    }

    if (data.vendedora) {
        properties['vendedora'] = { select: { name: data.vendedora } };
    }

    if (data.efectivo !== undefined) {
        properties['efectivo'] = { number: data.efectivo };
    }

    if (data.tarjeta_credito !== undefined) {
        properties['tarjeta_credito'] = { number: data.tarjeta_credito };
    }

    if (data.tarjeta_debito !== undefined) {
        properties['tarjeta_debito'] = { number: data.tarjeta_debito };
    }

    if (data.transferencia !== undefined) {
        properties['transferencia'] = { number: data.transferencia };
    }

    if (data.num_notas !== undefined) {
        properties['num_notas'] = { number: data.num_notas };
    }

    // Update Notion page
    const response = await notion.pages.update({
        page_id: corteId,
        properties: properties
    });

    // Log the update
    const changeLogEntry = `${formatTimestamp()} - Corte actualizado por ${userName}`;
    await notion.blocks.children.append({
        block_id: corteId,
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

    console.log('Updated corte:', corteId);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data: transformCorte(response)
        })
    };
}

/**
 * Delete (archive) a corte
 */
async function deleteCorte(corteId) {
    console.log('Archiving corte:', corteId);

    await notion.pages.update({
        page_id: corteId,
        archived: true
    });

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
    };
}

/**
 * Transform Notion page to corte object
 */
function transformCorte(page) {
    const props = page.properties;

    return {
        id: page.id,
        fecha: getDate(props.fecha),
        vendedora: getSelect(props.vendedora),
        efectivo: getNumber(props.efectivo) || 0,
        tarjeta_credito: getNumber(props.tarjeta_credito) || 0,
        tarjeta_debito: getNumber(props.tarjeta_debito) || 0,
        transferencia: getNumber(props.transferencia) || 0,
        num_notas: getNumber(props.num_notas) || 0,
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
