# Tara Brooch System Expansion Plan

## Executive Summary

**Recommended Stack:**
- **Backend:** Supabase (PostgreSQL) - Free tier
- **Frontend:** Static HTML/JS (same as current) + PWA for offline
- **Hosting:** GitHub Pages (free) + Supabase (free)
- **Estimated Monthly Cost:** $0 (free tiers)

---

## Why Supabase over Firebase?

| Requirement | Supabase | Firebase |
|-------------|----------|----------|
| 20K SKUs with complex queries | PostgreSQL - excellent | Firestore - harder |
| P&L / Reports | SQL queries - easy | Aggregations - painful |
| Offline support | Via IndexedDB + sync | Built-in but NoSQL |
| Learning curve for you | SQL (familiar) | NoSQL (new paradigm) |
| Cost | Free tier sufficient | Free tier sufficient |
| Data migration from DBF | Direct SQL import | Transform to documents |

**Winner: Supabase** - SQL is better for inventory/financial data, and you can write reports easily.

---

## Offline Strategy

Since you need offline capability across 3 locations:

```
┌─────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Location 1          Location 2          Location 3        │
│   ┌────────┐          ┌────────┐          ┌────────┐       │
│   │ Browser│          │ Browser│          │ Browser│       │
│   │  +     │          │  +     │          │  +     │       │
│   │IndexedDB│         │IndexedDB│         │IndexedDB│      │
│   └───┬────┘          └───┬────┘          └───┬────┘       │
│       │                   │                   │             │
│       └───────────────────┼───────────────────┘             │
│                           │                                  │
│                           ▼                                  │
│                   ┌──────────────┐                          │
│                   │   Supabase   │                          │
│                   │  PostgreSQL  │                          │
│                   │  (Cloud)     │                          │
│                   └──────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Offline-capable operations:**
- View inventory (cached locally)
- Create sales (queued, synced when online)
- Create layaway payments (queued)
- Barcode scanning/lookup (cached SKUs)

**Online-required operations:**
- Reports / P&L
- Daily tally (needs all locations)
- Inventory reconciliation
- Admin functions

---

## Database Schema (Supabase/PostgreSQL)

```sql
-- INVENTORY MODULE
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- "Sucursal Centro", etc.
  address TEXT
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- "Anillos", "Aretes", etc.
  parent_id UUID REFERENCES categories(id)
);

CREATE TABLE skus (
  id UUID PRIMARY KEY,
  sku_code TEXT UNIQUE NOT NULL, -- Barcode number
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  cost DECIMAL(10,2),           -- Costo
  price DECIMAL(10,2),          -- Precio venta
  gold_weight DECIMAL(6,2),     -- Gramos de oro
  location_id UUID REFERENCES locations(id),
  status TEXT DEFAULT 'available', -- available, sold, layaway, reserved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_counts (
  id UUID PRIMARY KEY,
  sku_id UUID REFERENCES skus(id),
  count_date DATE,
  theoretical_qty INTEGER,
  physical_qty INTEGER,
  difference INTEGER,
  notes TEXT,
  counted_by TEXT
);

-- POS MODULE
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  sale_number TEXT UNIQUE,
  location_id UUID REFERENCES locations(id),
  salesperson TEXT NOT NULL,
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  payment_method TEXT,          -- efectivo, tarjeta, transferencia
  payment_reference TEXT,       -- Last 4 digits, reference, etc.
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  sku_id UUID REFERENCES skus(id),
  price DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0
);

-- LAYAWAY MODULE
CREATE TABLE layaways (
  id UUID PRIMARY KEY,
  layaway_number TEXT UNIQUE,
  location_id UUID REFERENCES locations(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  salesperson TEXT NOT NULL,
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',  -- active, completed, cancelled
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE layaway_items (
  id UUID PRIMARY KEY,
  layaway_id UUID REFERENCES layaways(id),
  sku_id UUID REFERENCES skus(id),
  price DECIMAL(10,2)
);

CREATE TABLE layaway_payments (
  id UUID PRIMARY KEY,
  layaway_id UUID REFERENCES layaways(id),
  amount DECIMAL(10,2),
  payment_method TEXT,
  payment_reference TEXT,
  received_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY TALLY MODULE
CREATE TABLE daily_tallies (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  tally_date DATE,
  salesperson TEXT,
  cash_sales DECIMAL(10,2),
  card_sales DECIMAL(10,2),
  transfer_sales DECIMAL(10,2),
  layaway_payments DECIMAL(10,2),
  order_payments DECIMAL(10,2), -- From existing orders module
  total DECIMAL(10,2),
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  emailed_at TIMESTAMPTZ
);

-- SPENDING MODULE
CREATE TABLE spending_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- "Renta", "Nomina", "Servicios"
  pl_line_item TEXT             -- P&L mapping
);

CREATE TABLE spending (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES spending_categories(id),
  location_id UUID REFERENCES locations(id),
  description TEXT NOT NULL,
  amount DECIMAL(10,2),
  has_factura BOOLEAN DEFAULT FALSE,
  factura_number TEXT,
  scheduled_date DATE,          -- When it should be paid
  paid_date DATE,               -- When it was actually paid
  status TEXT DEFAULT 'pending', -- pending, approved, paid
  approved_by TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOST CUSTOMERS MODULE
CREATE TABLE lost_customers (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  salesperson TEXT NOT NULL,
  reason TEXT,                  -- "Precio", "No encontró lo que buscaba", etc.
  looking_for TEXT,             -- What they were looking for
  price_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KEEP EXISTING: orders, gold_movements tables
```

---

## Module Breakdown

### Module 1: Inventory Management
**Pages:** `inventario.html`, `inventario-agregar.html`, `inventario-conteo.html`

**Features:**
- Quick SKU entry form (optimized for speed)
- Barcode generation (Code 128) + Zebra printer integration
- Barcode scanner input (USB scanner acts as keyboard)
- Physical count vs theoretical report
- Auto-subtract on sale/layaway

### Module 2: Point of Sale (POS)
**Pages:** `pos.html`

**Features:**
- Barcode scan to add items
- Manual SKU search
- Payment method selection
- Receipt printing (Epson LX-350)
- Offline queue with sync

### Module 3: Layaway (Apartados)
**Pages:** `apartados.html`, `apartado-detalle.html`

**Features:**
- Create layaway with customer info
- Record installment payments
- Convert to sale when fully paid
- Alerts for overdue layaways

### Module 4: Daily Tally (Corte)
**Pages:** `corte.html`

**Features:**
- Auto-populated from day's transactions
- Manual adjustments
- Email to management
- Print summary

### Module 5: Spending (Gastos)
**Pages:** `gastos.html`, `gasto-nuevo.html`

**Features:**
- Scheduled vs ad-hoc spending
- Approval workflow
- Factura tracking
- P&L categorization

### Module 6: Reports (Reportes)
**Pages:** `reportes.html`

**Features:**
- P&L statement (simple table)
- Sales by category/payment method/location
- Inventory valuation
- Layaway status report

### Module 7: Lost Customers
**Pages:** `clientes-perdidos.html`

**Features:**
- Quick feedback form
- Email notification to management
- Query/filter by reason, date, location

---

## Implementation Phases

| Phase | Modules | Priority |
|-------|---------|----------|
| **1** | Supabase setup + Inventory + POS | Critical |
| **2** | Layaway + Daily Tally | High |
| **3** | Spending + Reports | Medium |
| **4** | Lost Customers + Polish | Low |

---

## Questions Before Proceeding

1. **Barcode format:** Do you have existing barcodes, or should we generate new ones? What prefix/format? (e.g., "TB-00001")

2. **Payment methods:** Which do you accept?
   - [ ] Efectivo
   - [ ] Tarjeta de débito
   - [ ] Tarjeta de crédito
   - [ ] Transferencia
   - [ ] Other?

3. **Receipt content:** What information should POS receipts include? (Store name, address, RFC, return policy text?)

4. **Email service:** For sending tallies/alerts, we need an email service. Options:
   - **Resend** (free 100 emails/day)
   - **EmailJS** (free 200 emails/month)
   - Manual copy-paste (no cost)

5. **User permissions:** Who can do what?
   - Salespeople: POS, Layaway, Lost Customers, view inventory
   - Admin: Everything + spending approval + reports
   - Is this sufficient, or more granular?

6. **SKU data structure:** From your DBF files, what fields do you have per SKU?
