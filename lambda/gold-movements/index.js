/**
 * Gold Movements Lambda Function
 *
 * Handles gold inventory tracking per joyero (jewelry maker).
 *
 * Endpoints:
 * - GET /gold-movements - List movements (optional filter: ?joyero=)
 * - POST /gold-movements - Create new movement
 * - GET /joyeros/balances - Get balance summary per joyero
 */

const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Database ID for "Movimientos Oro" database
const MOVEMENTS_DATABASE_ID = process.env.NOTION_MOVEMENTS_DATABASE_ID;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const path = event.path || event.rawPath || '';
        const method = event.httpMethod || event.requestContext?.http?.method;

        // Route requests
        if (path.endsWith('/gold-movements') && method === 'GET') {
            return await getGoldMovements(event);
        }

        if (path.endsWith('/gold-movements') && method === 'POST') {
            return await createGoldMovement(event);
        }

        if (path.endsWith('/joyeros/balances') && method === 'GET') {
            return await getJoyeroBalances();
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Not found' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Internal server error'
            })
        };
    }
};

/**
 * GET /gold-movements
 * List gold movements with optional joyero filter
 */
async function getGoldMovements(event) {
    const queryParams = event.queryStringParameters || {};
    const joyeroFilter = queryParams.joyero;
    const tipoFilter = queryParams.tipo_movimiento;

    // Build Notion filter
    const filters = [];

    if (joyeroFilter) {
        filters.push({
            property: 'joyero',
            select: { equals: joyeroFilter }
        });
    }

    if (tipoFilter) {
        filters.push({
            property: 'tipo_movimiento',
            select: { equals: tipoFilter }
        });
    }

    const queryOptions = {
        database_id: MOVEMENTS_DATABASE_ID,
        sorts: [
            { property: 'created_at', direction: 'descending' }
        ]
    };

    if (filters.length > 0) {
        queryOptions.filter = filters.length === 1
            ? filters[0]
            : { and: filters };
    }

    const response = await notion.databases.query(queryOptions);

    const movements = response.results.map(page => mapPageToMovement(page));

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            data: movements
        })
    };
}

/**
 * POST /gold-movements
 * Create a new gold movement
 */
async function createGoldMovement(event) {
    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    const { joyero, tipo_movimiento, gramos, descripcion, created_by } = body;

    if (!joyero || !tipo_movimiento || !gramos) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Missing required fields: joyero, tipo_movimiento, gramos'
            })
        };
    }

    // Generate movement ID
    const count = await getMovementCount();
    const movementId = `MOV-${String(count + 1).padStart(3, '0')}`;

    // Create Notion page
    const properties = {
        id: { title: [{ text: { content: movementId } }] },
        joyero: { select: { name: joyero } },
        tipo_movimiento: { select: { name: tipo_movimiento } },
        gramos: { number: parseFloat(gramos) },
        descripcion: { rich_text: [{ text: { content: descripcion || '' } }] },
        created_by: { rich_text: [{ text: { content: created_by || 'Sistema' } }] }
    };

    // Add optional order fields
    if (body.order_id) {
        properties.order_id = { rich_text: [{ text: { content: body.order_id } }] };
    }
    if (body.numero_orden) {
        properties.numero_orden = { rich_text: [{ text: { content: body.numero_orden } }] };
    }

    const response = await notion.pages.create({
        parent: { database_id: MOVEMENTS_DATABASE_ID },
        properties: properties
    });

    const movement = mapPageToMovement(response);

    return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            data: movement
        })
    };
}

/**
 * GET /joyeros/balances
 * Calculate balance summary per joyero
 */
async function getJoyeroBalances() {
    // Get all movements
    const allMovements = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: MOVEMENTS_DATABASE_ID,
            start_cursor: startCursor,
            page_size: 100
        });

        allMovements.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    // Calculate balances
    const balances = {};

    // Initialize known joyeros
    const knownJoyeros = ['Carlos', 'Victor', 'Israel', 'Marcos', 'Salvador', 'Juan'];
    knownJoyeros.forEach(name => {
        balances[name] = {
            balance: 0,
            total_entrada: 0,
            total_salida: 0
        };
    });

    // Process movements
    allMovements.forEach(page => {
        const movement = mapPageToMovement(page);

        if (!balances[movement.joyero]) {
            balances[movement.joyero] = {
                balance: 0,
                total_entrada: 0,
                total_salida: 0
            };
        }

        if (movement.tipo_movimiento === 'Entrada') {
            balances[movement.joyero].total_entrada += movement.gramos;
            balances[movement.joyero].balance += movement.gramos;
        } else {
            // Salida Pedido or Salida Ajuste
            balances[movement.joyero].total_salida += movement.gramos;
            balances[movement.joyero].balance -= movement.gramos;
        }
    });

    // Round to 1 decimal place
    for (const joyero of Object.keys(balances)) {
        balances[joyero].balance = Math.round(balances[joyero].balance * 10) / 10;
        balances[joyero].total_entrada = Math.round(balances[joyero].total_entrada * 10) / 10;
        balances[joyero].total_salida = Math.round(balances[joyero].total_salida * 10) / 10;
    }

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            data: balances
        })
    };
}

/**
 * Get total movement count for ID generation
 */
async function getMovementCount() {
    const response = await notion.databases.query({
        database_id: MOVEMENTS_DATABASE_ID,
        page_size: 1
    });

    // This is a simplified count - in production, you might want to
    // track the count separately or use a different ID scheme
    return response.results.length > 0 ?
        await getTotalCount() : 0;
}

async function getTotalCount() {
    let count = 0;
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: MOVEMENTS_DATABASE_ID,
            start_cursor: startCursor,
            page_size: 100
        });

        count += response.results.length;
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    return count;
}

/**
 * Map Notion page to movement object
 */
function mapPageToMovement(page) {
    const props = page.properties;

    return {
        id: getTitle(props.id),
        joyero: getSelect(props.joyero),
        tipo_movimiento: getSelect(props.tipo_movimiento),
        gramos: getNumber(props.gramos),
        order_id: getRichText(props.order_id),
        numero_orden: getRichText(props.numero_orden),
        descripcion: getRichText(props.descripcion),
        created_by: getRichText(props.created_by),
        created_at: page.created_time
    };
}

// Property extractors
function getTitle(prop) {
    return prop?.title?.[0]?.plain_text || '';
}

function getRichText(prop) {
    return prop?.rich_text?.[0]?.plain_text || null;
}

function getSelect(prop) {
    return prop?.select?.name || null;
}

function getNumber(prop) {
    return prop?.number || 0;
}
