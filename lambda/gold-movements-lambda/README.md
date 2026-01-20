# Gold Movements Lambda

Lambda function for tracking gold inventory movements per joyero (jewelry maker).

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gold-movements` | GET | List movements (filter: `?joyero=Carlos`) |
| `/gold-movements` | POST | Create new movement |
| `/joyeros/balances` | GET | Get balance summary per joyero |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_API_KEY` | Notion integration API key |
| `NOTION_MOVEMENTS_DATABASE_ID` | ID of "Movimientos Oro" database |

## Notion Database Schema

Create a database called "Movimientos Oro" with these properties:

| Property | Type | Description |
|----------|------|-------------|
| id | Title | Auto-generated (e.g., "MOV-001") |
| joyero | Select | Carlos, Victor, Israel, Marcos, Salvador, Juan |
| tipo_movimiento | Select | "Entrada", "Salida Pedido", "Salida Ajuste" |
| gramos | Number | Amount (always positive) |
| order_id | Text | Link to order (for Salida Pedido) |
| numero_orden | Text | Order number for display |
| descripcion | Rich Text | Free text notes/reason |
| created_by | Rich Text | User who created |
| created_at | Created Time | Auto-generated timestamp |

## Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create ZIP file:
   ```bash
   zip -r gold-movements.zip index.js package.json node_modules/
   ```

3. Upload to AWS Lambda

4. Configure environment variables in Lambda console

5. Create API Gateway routes pointing to this Lambda

## API Examples

### Create Entry Movement
```json
POST /gold-movements
{
  "joyero": "Carlos",
  "tipo_movimiento": "Entrada",
  "gramos": 50.0,
  "descripcion": "Compra de oro"
}
```

### Create Exit Movement (from order)
```json
POST /gold-movements
{
  "joyero": "Carlos",
  "tipo_movimiento": "Salida Pedido",
  "gramos": 4.8,
  "order_id": "abc123",
  "numero_orden": "ORD-001",
  "descripcion": "Anillo compromiso"
}
```

### Get Balances Response
```json
{
  "success": true,
  "data": {
    "Carlos": { "balance": 45.5, "total_entrada": 100.0, "total_salida": 54.5 },
    "Victor": { "balance": 20.0, "total_entrada": 50.0, "total_salida": 30.0 }
  }
}
```
