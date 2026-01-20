/**
 * Nuevo Pedido Page Logic
 *
 * Handles the new order form submission and validation.
 */

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
            option.value = joyero.id;
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

        // Set minimum date for delivery dates (today)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha_entrega_cliente').min = today;
        document.getElementById('fecha_entrega_tienda').min = today;
        document.getElementById('fecha_fabricacion').min = today;

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

        // Required fields
        const requiredFields = [
            { id: 'numero_orden', label: 'Número de orden' },
            { id: 'nombre_cliente', label: 'Nombre del cliente' },
            { id: 'tipo_pedido', label: 'Tipo de pedido' },
            { id: 'descripcion', label: 'Descripción' },
            { id: 'importe_total', label: 'Importe total' },
            { id: 'anticipo', label: 'Anticipo' },
            { id: 'fecha_entrega_cliente', label: 'Fecha de entrega al cliente' }
        ];

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

        // Validate anticipo <= importe_total
        const importeTotal = parseFloat(document.getElementById('importe_total').value) || 0;
        const anticipo = parseFloat(document.getElementById('anticipo').value) || 0;

        if (anticipo > importeTotal) {
            errors.push('El anticipo no puede ser mayor al importe total');
            document.getElementById('anticipo').classList.add('error');
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
        const formData = {
            numero_orden: document.getElementById('numero_orden').value.trim(),
            nombre_cliente: document.getElementById('nombre_cliente').value.trim(),
            telefono_cliente: document.getElementById('telefono_cliente').value.trim() || null,
            tipo_pedido: document.getElementById('tipo_pedido').value,
            descripcion: document.getElementById('descripcion').value.trim(),
            importe_total: parseFloat(document.getElementById('importe_total').value),
            anticipo: parseFloat(document.getElementById('anticipo').value),
            fecha_entrega_cliente: document.getElementById('fecha_entrega_cliente').value,
            fecha_entrega_tienda: document.getElementById('fecha_entrega_tienda').value || null,
            fecha_fabricacion: document.getElementById('fecha_fabricacion').value || null,
            oro_gramos: parseFloat(document.getElementById('oro_gramos').value) || null,
            joyero: document.getElementById('joyero').value || null,
            gemas_requeridas: document.getElementById('gemas_requeridas').value.trim() || null,
            gemas_origen: document.getElementById('gemas_origen').value || null,
            notas: document.getElementById('notas').value.trim() || null,
            vendedora: Auth.getUserName() || null
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
