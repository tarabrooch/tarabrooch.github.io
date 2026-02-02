# prisma_shopifyWebhook

AWS Lambda function that receives Shopify `orders/create` webhooks and automatically creates orders in the Notion pedidos database.

## How It Works

1. Shopify fires an `orders/create` webhook when a new order is placed
2. API Gateway routes it to this Lambda
3. Lambda verifies the HMAC signature to ensure authenticity
4. Shopify order fields are mapped to Notion database properties
5. A new order page is created in Notion with status "Pendiente Aprobacion"

## Field Mapping

| Shopify Field | Notion Property | Notes |
|---|---|---|
| `name` (#1001) | `numero_orden` | Prefixed with `SH-` (e.g. `SH-#1001`) |
| `customer.first_name + last_name` | `nombre_cliente` | Falls back to billing address, then email |
| `customer.phone` | `telefono_cliente` | Falls back to billing/shipping phone |
| `line_items` titles | `descripcion` | Formatted as `[SHOPIFY] 1x Item, 2x Item` |
| `line_items` product type | `tipo_pedido` | Inferred from keywords (anillo, aretes, etc.) |
| `total_price` | `importe_total` | |
| financial_status | `anticipo` | paid → full amount, partially_paid → partial, pending → 0 |
| — | `estado` | Always `Pendiente Aprobacion` |
| `created_at` | `fecha_pedido` | |
| `note`, shipping address, email | `notas` | Combined with `[Pedido importado de Shopify]` tag |

## Setup

### 1. Environment Variables

Set these on the Lambda function:

| Variable | Required | Description |
|---|---|---|
| `NOTION_TOKEN` | Yes | Notion integration token (also accepts `NOTION_API_KEY`) |
| `NOTION_DATABASE_ID` | Yes | Notion pedidos database ID |
| `SHOPIFY_WEBHOOK_SECRET` | Yes | Shopify webhook signing secret (from your Shopify app) |

### 2. Deploy to AWS Lambda

```bash
cd lambda/prisma_shopifyWebhook
npm install
zip -r function.zip .
aws lambda create-function \
  --function-name prisma_shopifyWebhook \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/YOUR_LAMBDA_ROLE \
  --environment "Variables={NOTION_TOKEN=secret_xxx,NOTION_DATABASE_ID=xxx,SHOPIFY_WEBHOOK_SECRET=xxx}"
```

### 3. Create API Gateway Endpoint

Create a POST endpoint in your API Gateway (e.g. `/shopify/webhook`) and connect it to this Lambda.

### 4. Register Webhook in Shopify

In your Shopify Admin:
1. Go to **Settings > Notifications > Webhooks**
2. Click **Create webhook**
3. Event: **Order creation**
4. Format: **JSON**
5. URL: Your API Gateway endpoint (e.g. `https://your-api.execute-api.us-east-1.amazonaws.com/shopify/webhook`)
6. Webhook API version: **2024-01** or latest

Copy the webhook signing secret and set it as the `SHOPIFY_WEBHOOK_SECRET` environment variable.

## Testing

You can test with Shopify's "Send test notification" button on the webhook configuration page, or by placing a test order in your Shopify development store.

Test orders (with `test: true`) are automatically skipped.
