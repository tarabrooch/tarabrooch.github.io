// -------------------------------------
// Prisma Shopify Webhook Lambda
// -------------------------------------
// Receives Shopify orders/create webhooks and creates
// corresponding orders in the Notion pedidos database.
// -------------------------------------
import { Client } from '@notionhq/client';
import crypto from 'crypto';

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

export const handler = async (event) => {
    try {
        console.log('Shopify webhook received:', JSON.stringify({
            headers: event.headers,
            bodyLength: event.body?.length
        }));

        // 1. Verify the webhook signature
        if (!verifyWebhook(event)) {
            console.error('Webhook verification failed');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid webhook signature' })
            };
        }

        // 2. Parse the Shopify order payload
        const shopifyOrder = JSON.parse(event.body);

        // 3. Skip test/bogus orders
        if (shopifyOrder.test || shopifyOrder.source_name === 'web' && shopifyOrder.gateway === 'bogus') {
            console.log('Skipping test order:', shopifyOrder.id);
            return { statusCode: 200, body: JSON.stringify({ skipped: true }) };
        }

        // 4. Map Shopify order to Notion properties
        const properties = mapShopifyToNotion(shopifyOrder);

        // 5. Create the order in Notion
        const newPage = await notion.pages.create({
            parent: { database_id: DATABASE_ID },
            properties
        });

        console.log('Order created in Notion:', newPage.id, 'from Shopify order:', shopifyOrder.name);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                notion_page_id: newPage.id,
                shopify_order: shopifyOrder.name
            })
        };

    } catch (error) {
        console.error('Error processing Shopify webhook:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error processing webhook',
                details: error.message
            })
        };
    }
};

// ==========================================================================
// Webhook Verification
// ==========================================================================

/**
 * Verify Shopify HMAC signature to ensure the webhook is authentic.
 * Shopify signs each webhook with the app's shared secret using HMAC-SHA256.
 */
function verifyWebhook(event) {
    if (!SHOPIFY_WEBHOOK_SECRET) {
        console.warn('SHOPIFY_WEBHOOK_SECRET not set - skipping verification');
        return true;
    }

    const hmacHeader = event.headers['x-shopify-hmac-sha256']
        || event.headers['X-Shopify-Hmac-Sha256']
        || event.headers['X-SHOPIFY-HMAC-SHA256'];

    if (!hmacHeader) {
        return false;
    }

    const body = event.body || '';
    const computed = crypto
        .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
        .update(body, 'utf8')
        .digest('base64');

    return crypto.timingSafeEqual(
        Buffer.from(hmacHeader),
        Buffer.from(computed)
    );
}

// ==========================================================================
// Shopify → Notion Field Mapping
// ==========================================================================

/**
 * Map a Shopify order object to Notion database properties.
 *
 * Shopify fields used:
 *   - name (#1001)           → numero_orden (prefixed "SH-")
 *   - customer name          → nombre_cliente
 *   - customer phone         → telefono_cliente
 *   - line_items             → tipo_pedido + descripcion
 *   - total_price            → importe_total
 *   - financial_status       → anticipo (paid → full, partial → partial, pending → 0)
 *   - note                   → notas
 *   - created_at             → fecha_pedido
 */
function mapShopifyToNotion(order) {
    const customerName = buildCustomerName(order);
    const customerPhone = getCustomerPhone(order);
    const description = buildDescription(order);
    const tipoPedido = inferTipoPedido(order);
    const totalPrice = parseFloat(order.total_price) || 0;
    const anticipo = calculateAnticipo(order, totalPrice);
    const fechaPedido = order.created_at
        ? order.created_at.split('T')[0]
        : new Date().toISOString().split('T')[0];

    const properties = {
        // Title - order number prefixed with SH- to identify Shopify origin
        numero_orden: {
            title: [{ text: { content: `SH-${order.name || order.order_number || order.id}` } }]
        },

        // Customer name
        nombre_cliente: {
            rich_text: customerName ? [{ text: { content: customerName } }] : []
        },

        // Customer phone
        telefono_cliente: {
            rich_text: customerPhone ? [{ text: { content: customerPhone } }] : []
        },

        // Order type (inferred from line items)
        tipo_pedido: {
            select: { name: tipoPedido }
        },

        // Description (line items summary)
        descripcion: {
            rich_text: description ? [{ text: { content: truncate(description, 2000) } }] : []
        },

        // Total price
        importe_total: {
            number: totalPrice
        },

        // Amount paid so far
        anticipo: {
            number: anticipo
        },

        // Default status: Pendiente Aprobacion
        estado: {
            select: { name: 'Pendiente Aprobación' }
        },

        // Order date
        fecha_pedido: {
            date: { start: fechaPedido }
        },

        // Notes - include Shopify order notes + source tag
        notas: {
            rich_text: [{
                text: {
                    content: truncate(buildNotes(order), 2000)
                }
            }]
        }
    };

    return properties;
}

/**
 * Build the customer display name from the Shopify order.
 */
function buildCustomerName(order) {
    if (order.customer) {
        const first = order.customer.first_name || '';
        const last = order.customer.last_name || '';
        const name = `${first} ${last}`.trim();
        if (name) return name;
    }

    // Fallback to billing/shipping address name
    const address = order.billing_address || order.shipping_address;
    if (address) {
        const name = `${address.first_name || ''} ${address.last_name || ''}`.trim();
        if (name) return name;
    }

    return order.email || 'Cliente Shopify';
}

/**
 * Extract the customer phone number.
 */
function getCustomerPhone(order) {
    return order.customer?.phone
        || order.billing_address?.phone
        || order.shipping_address?.phone
        || '';
}

/**
 * Build a description string from line items.
 * Format: "1x Anillo de Oro 14k, 2x Aretes de Plata"
 */
function buildDescription(order) {
    if (!order.line_items || order.line_items.length === 0) {
        return 'Pedido Shopify sin artículos';
    }

    const items = order.line_items.map(item => {
        const qty = item.quantity || 1;
        const name = item.title || item.name || 'Artículo';
        const variant = item.variant_title ? ` (${item.variant_title})` : '';
        return `${qty}x ${name}${variant}`;
    });

    return `[SHOPIFY] ${items.join(', ')}`;
}

/**
 * Infer the tipo_pedido (order type) from line items.
 * Matches against known product type keywords.
 */
function inferTipoPedido(order) {
    if (!order.line_items || order.line_items.length === 0) {
        return 'otro';
    }

    // Keyword map: search term → tipo_pedido id
    const typeKeywords = {
        'anillo de compromiso': 'anillo_compromiso',
        'engagement ring': 'anillo_compromiso',
        'anillo': 'anillo',
        'ring': 'anillo',
        'argolla': 'argollas',
        'wedding band': 'argollas',
        'arras': 'arras',
        'churumbela': 'churumbela',
        'arete': 'aretes',
        'earring': 'aretes',
        'collar': 'collar',
        'necklace': 'collar',
        'pulsera': 'pulsera',
        'bracelet': 'pulsera',
        'cadena': 'cadena',
        'chain': 'cadena',
        'dije': 'dije',
        'pendant': 'dije',
        'reparacion': 'reparacion',
        'repair': 'reparacion'
    };

    // Check first line item's title and product_type
    for (const item of order.line_items) {
        const searchText = [
            item.title,
            item.product_type,
            item.variant_title
        ].filter(Boolean).join(' ').toLowerCase();

        for (const [keyword, type] of Object.entries(typeKeywords)) {
            if (searchText.includes(keyword)) {
                return type;
            }
        }
    }

    return 'otro';
}

/**
 * Calculate anticipo (advance payment) based on Shopify financial status.
 *   - paid/refunded/partially_refunded → full amount
 *   - partially_paid → amount paid so far
 *   - pending/authorized/voided → 0
 */
function calculateAnticipo(order, totalPrice) {
    switch (order.financial_status) {
        case 'paid':
        case 'refunded':
        case 'partially_refunded':
            return totalPrice;
        case 'partially_paid':
            // Use the total minus outstanding balance if available
            if (order.total_outstanding) {
                return totalPrice - parseFloat(order.total_outstanding);
            }
            return 0;
        case 'pending':
        case 'authorized':
        case 'voided':
        default:
            return 0;
    }
}

/**
 * Build the notas field with Shopify metadata.
 */
function buildNotes(order) {
    const parts = ['[Pedido importado de Shopify]'];

    if (order.note) {
        parts.push(`Nota del cliente: ${order.note}`);
    }

    if (order.shipping_address) {
        const addr = order.shipping_address;
        const addressParts = [
            addr.address1,
            addr.address2,
            addr.city,
            addr.province,
            addr.zip,
            addr.country
        ].filter(Boolean);
        if (addressParts.length > 0) {
            parts.push(`Envío: ${addressParts.join(', ')}`);
        }
    }

    if (order.email) {
        parts.push(`Email: ${order.email}`);
    }

    if (order.tags) {
        parts.push(`Tags: ${order.tags}`);
    }

    return parts.join('\n');
}

/**
 * Truncate a string to a maximum length.
 */
function truncate(str, maxLength) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}
