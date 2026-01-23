/**
 * Nuevo Pedido Page Logic
 *
 * Handles the new order form submission and validation.
 */

// Store last created order for printing
let lastCreatedOrder = null;

// Garantía state
let isGarantia = false;

/**
 * Toggle garantía mode - sets total and anticipo to 0
 */
window.toggleGarantia = function() {
    isGarantia = !isGarantia;

    const btn = document.getElementById('btn-garantia');
    const hint = document.getElementById('garantia-hint');
    const importeInput = document.getElementById('importe_total');
    const anticipoInput = document.getElementById('anticipo');

    if (isGarantia) {
        btn.classList.add('active');
        hint.style.display = 'block';
        importeInput.value = '0';
        anticipoInput.value = '0';
        importeInput.disabled = true;
        anticipoInput.disabled = true;
    } else {
        btn.classList.remove('active');
        hint.style.display = 'none';
        importeInput.value = '';
        anticipoInput.value = '';
        importeInput.disabled = false;
        anticipoInput.disabled = false;
    }

    // Update saldo display
    const saldoDisplay = document.getElementById('saldo-display');
    if (saldoDisplay) {
        saldoDisplay.textContent = '$0.00';
        saldoDisplay.classList.remove('negative');
    }
};

/**
 * Print order receipt (for Epson LX-350 dot matrix printer)
 */
window.printOrder = function() {
    if (!lastCreatedOrder) {
        alert('No hay pedido para imprimir');
        return;
    }

    const order = lastCreatedOrder;
    const saldo = order.importe_total - order.anticipo;
    const fechaHoy = new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Create print window with simple text format for dot matrix
    const printWindow = window.open('', '_blank', 'width=400,height=600');

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Comprobante - ${order.numero_orden}</title>
    <style>
        @page {
            size: auto;
            margin: 5mm;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .title {
            font-size: 16px;
            font-weight: bold;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }
        .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
        }
        .label {
            font-weight: normal;
        }
        .value {
            font-weight: bold;
            text-align: right;
        }
        .total-row {
            font-size: 14px;
            font-weight: bold;
            margin-top: 8px;
        }
        .description {
            margin: 8px 0;
            word-wrap: break-word;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
        }
        @media print {
            body { margin: 0; padding: 5px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">TARA BROOCH</div>
        <div>Comprobante de Pedido</div>
        <div>${fechaHoy}</div>
    </div>

    <div class="divider"></div>

    <div class="row">
        <span class="label">Orden:</span>
        <span class="value">${order.numero_orden}</span>
    </div>
    <div class="row">
        <span class="label">Cliente:</span>
        <span class="value">${order.nombre_cliente}</span>
    </div>
    ${order.telefono_cliente ? `
    <div class="row">
        <span class="label">Tel:</span>
        <span class="value">${order.telefono_cliente}</span>
    </div>
    ` : ''}

    <div class="divider"></div>

    <div class="row">
        <span class="label">Tipo:</span>
        <span class="value">${order.tipo_pedido_name || order.tipo_pedido}</span>
    </div>

    <div class="description">
        <strong>Descripcion:</strong><br>
        ${order.descripcion}
    </div>

    <div class="divider"></div>

    <div class="row">
        <span class="label">Importe Total:</span>
        <span class="value">$${order.importe_total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="row">
        <span class="label">Anticipo:</span>
        <span class="value">$${order.anticipo.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="row total-row">
        <span class="label">SALDO:</span>
        <span class="value">$${saldo.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
    </div>

    <div class="divider"></div>

    <div class="row">
        <span class="label">Entrega:</span>
        <span class="value">${new Date(order.fecha_entrega_cliente + 'T00:00:00').toLocaleDateString('es-MX', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
    </div>

    <div class="footer">
        <div class="divider"></div>
        <div>Gracias por su preferencia</div>
        <div>Conserve este comprobante</div>
    </div>
</body>
</html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
    }, 250);
};

(function() {
    'use strict';

    // ==========================================================================
    // Initialization
    // ==========================================================================

    document.addEventListener('DOMContentLoaded', () => {
        // Check for user session
        if (!Auth.init() && !Auth.getUserFromUrl()) {
            // No user, redirect to portal
            window.location.href = 'index.html';
            return;
        }

        // Initialize form
        initForm();
        setupEventListeners();
    });

    // ==========================================================================
    // Form Initialization
    // ==========================================================================

    function initForm() {
        // Populate vendedora dropdown
        const vendedoraSelect = document.getElementById('vendedora');
        CONFIG.VENDEDORAS.forEach(vendedora => {
            const option = document.createElement('option');
            option.value = vendedora.name;
            option.textContent = vendedora.name;
            vendedoraSelect.appendChild(option);
        });

        // Populate tipo de pedido dropdown
        const tipoSelect = document.getElementById('tipo_pedido');
        CONFIG.TIPOS_PEDIDO.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.textContent = tipo.name;
            tipoSelect.appendChild(option);
        });

        // Populate joyeros dropdown
        const joyeroSelect = document.getElementById('joyero');
        CONFIG.JOYEROS.forEach(joyero => {
            const option = document.createElement('option');
            option.value = joyero.name;
            option.textContent = joyero.name;
            joyeroSelect.appendChild(option);
        });

        // Populate gemas origen dropdown
        const gemasOrigenSelect = document.getElementById('gemas_origen');
        CONFIG.GEMAS_ORIGEN.forEach(origen => {
            const option = document.createElement('option');
            option.value = origen.id;
            option.textContent = origen.name;
            gemasOrigenSelect.appendChild(option);
        });

        // Update saldo display initially
        updateSaldoDisplay();
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    function setupEventListeners() {
        // Form submission
        document.getElementById('nuevo-pedido-form').addEventListener('submit', handleSubmit);

        // Real-time saldo calculation
        document.getElementById('importe_total').addEventListener('input', updateSaldoDisplay);
        document.getElementById('anticipo').addEventListener('input', updateSaldoDisplay);

        // Auto-set fecha_entrega_tienda when fecha_entrega_cliente changes
        document.getElementById('fecha_entrega_cliente').addEventListener('change', autoSetFechaTienda);
    }

    // ==========================================================================
    // Saldo Calculation
    // ==========================================================================

    function updateSaldoDisplay() {
        const importeTotal = parseFloat(document.getElementById('importe_total').value) || 0;
        const anticipo = parseFloat(document.getElementById('anticipo').value) || 0;
        const saldo = importeTotal - anticipo;

        const saldoDisplay = document.getElementById('saldo-display');
        saldoDisplay.textContent = Utils.formatCurrency(saldo);

        // Add visual indicator if negative (shouldn't happen but just in case)
        if (saldo < 0) {
            saldoDisplay.classList.add('negative');
        } else {
            saldoDisplay.classList.remove('negative');
        }
    }

    // ==========================================================================
    // Auto-set Store Delivery Date
    // ==========================================================================

    function autoSetFechaTienda() {
        const fechaCliente = document.getElementById('fecha_entrega_cliente').value;
        const fechaTiendaInput = document.getElementById('fecha_entrega_tienda');

        // Only auto-set if fecha_tienda is empty
        if (fechaCliente && !fechaTiendaInput.value) {
            const fechaTienda = Utils.subtractDays(fechaCliente, CONFIG.DEFAULT_DAYS_BEFORE_CUSTOMER);
            fechaTiendaInput.value = Utils.formatDateForInput(fechaTienda);
        }
    }

    // ==========================================================================
    // Form Validation
    // ==========================================================================

    function validateForm() {
        const errors = [];

        // Required fields (skip importe/anticipo for garantía orders)
        const requiredFields = [
            { id: 'numero_orden', label: 'Número de orden' },
            { id: 'vendedora', label: 'Vendedora' },
            { id: 'nombre_cliente', label: 'Nombre del cliente' },
            { id: 'tipo_pedido', label: 'Tipo de pedido' },
            { id: 'descripcion', label: 'Descripción' },
            { id: 'fecha_entrega_cliente', label: 'Fecha de entrega al cliente' }
        ];

        // Only require importe/anticipo if not garantía
        if (!isGarantia) {
            requiredFields.push(
                { id: 'importe_total', label: 'Importe total' },
                { id: 'anticipo', label: 'Anticipo' }
            );
        }

        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();

            if (!value) {
                errors.push(`${field.label} es requerido`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        // Validate anticipo <= importe_total (skip for garantía)
        if (!isGarantia) {
            const importeTotal = parseFloat(document.getElementById('importe_total').value) || 0;
            const anticipo = parseFloat(document.getElementById('anticipo').value) || 0;

            if (anticipo > importeTotal) {
                errors.push('El anticipo no puede ser mayor al importe total');
                document.getElementById('anticipo').classList.add('error');
            }
        }

        return errors;
    }

    // ==========================================================================
    // Form Submission
    // ==========================================================================

    async function handleSubmit(e) {
        e.preventDefault();

        // Validate
        const errors = validateForm();
        if (errors.length > 0) {
            Utils.showError(errors.join('\n'));
            return;
        }

        // Gather form data
        let descripcion = document.getElementById('descripcion').value.trim();

        // Prepend [GARANTÍA] to description for garantía orders
        if (isGarantia) {
            descripcion = '[GARANTÍA] ' + descripcion;
        }

        const formData = {
            numero_orden: document.getElementById('numero_orden').value.trim(),
            vendedora: document.getElementById('vendedora').value,
            nombre_cliente: document.getElementById('nombre_cliente').value.trim(),
            telefono_cliente: document.getElementById('telefono_cliente').value.trim() || null,
            tipo_pedido: document.getElementById('tipo_pedido').value,
            descripcion: descripcion,
            importe_total: isGarantia ? 0 : parseFloat(document.getElementById('importe_total').value),
            anticipo: isGarantia ? 0 : parseFloat(document.getElementById('anticipo').value),
            fecha_entrega_cliente: document.getElementById('fecha_entrega_cliente').value,
            fecha_entrega_tienda: document.getElementById('fecha_entrega_tienda').value || null,
            fecha_fabricacion: document.getElementById('fecha_fabricacion').value || null,
            oro_gramos: parseFloat(document.getElementById('oro_gramos').value) || null,
            joyero: document.getElementById('joyero').value || null,
            gemas_requeridas: document.getElementById('gemas_requeridas').value.trim() || null,
            gemas_origen: document.getElementById('gemas_origen').value || null,
            notas: document.getElementById('notas').value.trim() || null
        };

        // If fecha_entrega_tienda not set, calculate it
        if (!formData.fecha_entrega_tienda && formData.fecha_entrega_cliente) {
            const fechaTienda = Utils.subtractDays(formData.fecha_entrega_cliente, CONFIG.DEFAULT_DAYS_BEFORE_CUSTOMER);
            formData.fecha_entrega_tienda = Utils.formatDateForInput(fechaTienda);
        }

        // Show loading
        Utils.showLoading();

        try {
            // Submit to API
            const result = await API.createOrder(formData);

            // Hide loading
            Utils.hideLoading();

            // Show success
            showSuccess(formData, result);

        } catch (error) {
            Utils.hideLoading();
            Utils.showError('Error al crear el pedido: ' + error.message);
        }
    }

    // ==========================================================================
    // Success Display
    // ==========================================================================

    function showSuccess(formData, result) {
        // Store order data for printing
        lastCreatedOrder = {
            ...formData,
            tipo_pedido_name: Utils.getTipoPedidoName(formData.tipo_pedido)
        };

        // Hide form
        document.getElementById('form-container').classList.add('hidden');

        // Show success container
        document.getElementById('success-container').classList.remove('hidden');

        // Render order summary
        const summaryContainer = document.getElementById('order-summary');
        summaryContainer.innerHTML = `
            <div class="order-summary-row">
                <span class="order-summary-label">Orden</span>
                <span class="order-summary-value">[${formData.numero_orden}] ${formData.nombre_cliente}</span>
            </div>
            <div class="order-summary-row">
                <span class="order-summary-label">Tipo</span>
                <span class="order-summary-value">${Utils.getTipoPedidoName(formData.tipo_pedido)}</span>
            </div>
            <div class="order-summary-row">
                <span class="order-summary-label">Importe Total</span>
                <span class="order-summary-value">${Utils.formatCurrency(formData.importe_total)}</span>
            </div>
            <div class="order-summary-row">
                <span class="order-summary-label">Anticipo</span>
                <span class="order-summary-value">${Utils.formatCurrency(formData.anticipo)}</span>
            </div>
            <div class="order-summary-row">
                <span class="order-summary-label">Saldo Pendiente</span>
                <span class="order-summary-value" style="color: var(--primary); font-weight: 600;">
                    ${Utils.formatCurrency(formData.importe_total - formData.anticipo)}
                </span>
            </div>
            <div class="order-summary-row">
                <span class="order-summary-label">Entrega Cliente</span>
                <span class="order-summary-value">${Utils.formatDate(formData.fecha_entrega_cliente)}</span>
            </div>
            <div class="order-summary-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <span class="order-summary-label">Notion ID</span>
                <span class="order-summary-value" style="font-family: monospace; font-size: 12px; color: #6b7280;">${result.data?.id || 'N/A'}</span>
            </div>
        `;
    }

})();
