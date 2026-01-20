/**
 * Lambda: prisma-gold-movements
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
const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = process.env.NOTION_MOVEMENTS_DATABASE_ID;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

/**
 * Main handler
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
        const path = event.path || '';
        const method = event.httpMethod;

        // Route: GET /joyeros/balances
        if (path.endsWith('/joyeros/balances') && method === 'GET') {
            return await getJoyeroBalances();
        }

        // Route: GET /gold-movements
        if (path.endsWith('/gold-movements') && method === 'GET') {
            return await getGoldMovements(event);
        }

        // Route: POST /gold-movements
        if (path.endsWith('/gold-movements') && method === 'POST') {
            return await createGoldMovement(event);
        }

        return {
            statusCode: 404,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: false, error: 'Not found' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: 'Error interno',
                details: error.message
            })
        };
    }
};

/**
 * GET /gold-movements
 */
async function getGoldMovements(event) {
    const params = event.queryStringParameters || {};

    // Build filters
    const filters = [];

    if (params.joyero) {
        filters.push({
            property: 'joyero',
            select: { equals: params.joyero }
        });
    }

    if (params.tipo_movimiento) {
        filters.push({
            property: 'tipo_movimiento',
            select: { equals: params.tipo_movimiento }
        });
    }

    const queryOptions = {
        database_id: DATABASE_ID,
        sorts: [
            { property: 'created_at', direction: 'descending' }
        ]
    };

    if (filters.length === 1) {
        queryOptions.filter = filters[0];
    } else if (filters.length > 1) {
        queryOptions.filter = { and: filters };
    }

    const response = await notion.databases.query(queryOptions);
    const movements = response.results.map(page => mapPageToMovement(page));

    return {
        statusCode: 200,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: true,
            data: movements
        })
    };
}

/**
 * POST /gold-movements
 */
async function createGoldMovement(event) {
    const body = JSON.parse(event.body || '{}');
    const { joyero, tipo_movimiento, gramos, descripcion, created_by, order_id, numero_orden } = body;

    // Validate required fields
    if (!joyero || !tipo_movimiento || !gramos) {
        return {
            statusCode: 400,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: 'Campos requeridos: joyero, tipo_movimiento, gramos'
            })
        };
    }

    // Generate movement ID
    const count = await getTotalCount();
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

    if (order_id) {
        properties.order_id = { rich_text: [{ text: { content: order_id } }] };
    }
    if (numero_orden) {
        properties.numero_orden = { rich_text: [{ text: { content: numero_orden } }] };
    }

    const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: properties
    });

    const movement = mapPageToMovement(response);

    return {
        statusCode: 201,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: true,
            data: movement
        })
    };
}

/**
 * GET /joyeros/balances
 */
async function getJoyeroBalances() {
    // Get all movements (paginated)
    const allMovements = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            start_cursor: startCursor,
            page_size: 100
        });

        allMovements.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    // Initialize balances for known joyeros
    const balances = {};
    const knownJoyeros = ['Carlos', 'Victor', 'Israel', 'Marcos', 'Salvador', 'Juan'];

    knownJoyeros.forEach(name => {
        balances[name] = {
            balance: 0,
            total_entrada: 0,
            total_salida: 0
        };
    });

    // Calculate from movements
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
            balances[movement.joyero].total_salida += movement.gramos;
            balances[movement.joyero].balance -= movement.gramos;
        }
    });

    // Round to 1 decimal
    for (const joyero of Object.keys(balances)) {
        balances[joyero].balance = Math.round(balances[joyero].balance * 10) / 10;
        balances[joyero].total_entrada = Math.round(balances[joyero].total_entrada * 10) / 10;
        balances[joyero].total_salida = Math.round(balances[joyero].total_salida * 10) / 10;
    }

    return {
        statusCode: 200,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: true,
            data: balances
        })
    };
}

/**
 * Get total movement count for ID generation
 */
async function getTotalCount() {
    let count = 0;
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
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
