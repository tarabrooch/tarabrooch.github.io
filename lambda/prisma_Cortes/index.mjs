/**
 * Cortes Lambda Handler
 *
 * AWS Lambda function for managing Cortes (daily sales closings) in Notion.
 *
 * Each corte is one record per date, with two independent breakdowns:
 *   - ventas: JSON object of vendedora amounts (stored as rich_text)
 *   - Payment methods: individual number properties
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
 * - ventas: Text (stores JSON of vendedora amounts, e.g. {"alba":5000,"rossy":3000})
 * - efectivo: Number
 * - tarjeta_credito: Number
 * - tarjeta_debito: Number
 * - transferencia: Number
 * - num_notas: Number
 * - creado_por: Text
 */

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CORTES_DATABASE_ID = process.env.CORTES_DATABASE_ID;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json'
};

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    const method = event.httpMethod || event.requestContext?.http?.method;

    if (method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const path = event.rawPath || event.path || event.resource || '';
        const pathParams = event.pathParameters || {};

        if (path === '/cortes' && method === 'POST') return await createCorte(event);
        if (path === '/cortes' && method === 'GET') return await getCortes(event);

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

        return { statusCode: 404, headers, body: JSON.stringify({ success: false, error: 'Not Found' }) };
    } catch (error) {
        console.error('Handler error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
    }
};

// ==========================================================================
// CRUD Operations
// ==========================================================================

async function createCorte(event) {
    const body = JSON.parse(event.body);
    const data = body.data;
    const createdBy = body.created_by || 'Sistema';

    const ventasJson = JSON.stringify(data.ventas || {});

    const properties = {
        'Name': { title: [{ text: { content: `Corte ${data.fecha}` } }] },
        'fecha': { date: { start: data.fecha } },
        'ventas': { rich_text: [{ text: { content: ventasJson } }] },
        'efectivo': { number: data.efectivo || 0 },
        'tarjeta_credito': { number: data.tarjeta_credito || 0 },
        'tarjeta_debito': { number: data.tarjeta_debito || 0 },
        'transferencia': { number: data.transferencia || 0 },
        'num_notas': { number: data.num_notas || 0 },
        'creado_por': { rich_text: [{ text: { content: createdBy } }] }
    };

    const response = await notion.pages.create({
        parent: { database_id: CORTES_DATABASE_ID },
        properties,
        children: [
            {
                object: 'block', type: 'heading_3',
                heading_3: { rich_text: [{ text: { content: 'Historial de Cambios' } }] }
            },
            {
                object: 'block', type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: `${formatTimestamp()} - Corte creado por ${createdBy}` } }] }
            }
        ]
    });

    return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, data: { id: response.id, ...data } })
    };
}

async function getCortes(event) {
    const queryParams = event.queryStringParameters || {};
    const filters = [];

    if (queryParams.fecha_desde) {
        filters.push({ property: 'fecha', date: { on_or_after: queryParams.fecha_desde } });
    }
    if (queryParams.fecha_hasta) {
        filters.push({ property: 'fecha', date: { on_or_before: queryParams.fecha_hasta } });
    }

    const queryOptions = {
        database_id: CORTES_DATABASE_ID,
        sorts: [{ property: 'fecha', direction: 'descending' }]
    };

    if (filters.length > 0) {
        queryOptions.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    const response = await notion.databases.query(queryOptions);
    const cortes = response.results.map(page => transformCorte(page));

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: cortes }) };
}

async function getCorte(corteId) {
    const response = await notion.pages.retrieve({ page_id: corteId });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: transformCorte(response) }) };
}

async function updateCorte(corteId, event) {
    const body = JSON.parse(event.body);
    const data = body.data;
    const userName = body.user || 'Sistema';

    const properties = {};

    if (data.fecha) properties['fecha'] = { date: { start: data.fecha } };
    if (data.ventas !== undefined) properties['ventas'] = { rich_text: [{ text: { content: JSON.stringify(data.ventas) } }] };
    if (data.efectivo !== undefined) properties['efectivo'] = { number: data.efectivo };
    if (data.tarjeta_credito !== undefined) properties['tarjeta_credito'] = { number: data.tarjeta_credito };
    if (data.tarjeta_debito !== undefined) properties['tarjeta_debito'] = { number: data.tarjeta_debito };
    if (data.transferencia !== undefined) properties['transferencia'] = { number: data.transferencia };
    if (data.num_notas !== undefined) properties['num_notas'] = { number: data.num_notas };

    const response = await notion.pages.update({ page_id: corteId, properties });

    await notion.blocks.children.append({
        block_id: corteId,
        children: [{
            object: 'block', type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: `${formatTimestamp()} - Corte actualizado por ${userName}` } }] }
        }]
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: transformCorte(response) }) };
}

async function deleteCorte(corteId) {
    await notion.pages.update({ page_id: corteId, archived: true });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
}

// ==========================================================================
// Transform & Helpers
// ==========================================================================

function transformCorte(page) {
    const props = page.properties;

    // Parse ventas JSON from rich_text
    let ventas = {};
    const ventasRaw = getRichText(props.ventas);
    if (ventasRaw) {
        try { ventas = JSON.parse(ventasRaw); } catch (e) { /* ignore parse errors */ }
    }

    return {
        id: page.id,
        fecha: getDate(props.fecha),
        ventas,
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

function getNumber(prop) { return prop?.number ?? null; }
function getSelect(prop) { return prop?.select?.name ?? null; }
function getRichText(prop) {
    if (!prop?.rich_text || prop.rich_text.length === 0) return null;
    return prop.rich_text.map(t => t.plain_text).join('');
}
function getDate(prop) { return prop?.date?.start ?? null; }

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
