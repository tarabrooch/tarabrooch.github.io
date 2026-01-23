/**
 * Nuevo Pago Page Logic
 *
 * Handles the new pago form submission and validation.
 */

(function() {
    'use strict';

    // ==========================================================================
    // Initialization
    // ==========================================================================

    document.addEventListener('DOMContentLoaded', () => {
        // Check for pagos authentication
        if (!isPagosAuthenticated()) {
            // Redirect to pagos with auth prompt
            window.location.href = 'pagos.html';
            return;
        }

        // Initialize form
        initForm();
        setupEventListeners();
    });

    /**
     * Check if user is authenticated for pagos module
     */
    function isPagosAuthenticated() {
        const session = sessionStorage.getItem('prisma_pagos_session');
        if (!session) return false;

        try {
            const data = JSON.parse(session);
            return data.authenticated === true;
        } catch {
            return false;
        }
    }

    // ==========================================================================
    // Form Initialization
    // ==========================================================================

    function initForm() {
        // Populate category dropdown
        const categoriaSelect = document.getElementById('categoria');
        for (const [key, category] of Object.entries(CONFIG.PAGO_CATEGORIES)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = category.name;
            categoriaSelect.appendChild(option);
        }

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha_vencimiento').value = today;

        // Initialize status stepper
        initStatusStepper();
    }

    /**
     * Initialize the status stepper component
     */
    function initStatusStepper() {
        const steps = document.querySelectorAll('.status-step');

        steps.forEach(step => {
            step.addEventListener('click', () => {
                // Remove active class from all steps
                steps.forEach(s => s.classList.remove('active'));

                // Add active class to clicked step
                step.classList.add('active');

                // Update hidden input
                document.getElementById('estado').value = step.dataset.status;
            });
        });
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    function setupEventListeners() {
        // Form submission
        document.getElementById('nuevo-pago-form').addEventListener('submit', handleSubmit);

        // Category change -> update subcategories
        document.getElementById('categoria').addEventListener('change', updateSubcategories);

        // Currency toggle
        const monedaOptions = document.querySelectorAll('#moneda-toggle .toggle-option');
        monedaOptions.forEach(option => {
            option.addEventListener('click', () => {
                monedaOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    /**
     * Update subcategory dropdown based on selected category
     */
    function updateSubcategories() {
        const categoriaSelect = document.getElementById('categoria');
        const subcategoriaSelect = document.getElementById('subcategoria');
        const selectedCategory = categoriaSelect.value;

        // Clear existing options
        subcategoriaSelect.innerHTML = '';

        if (!selectedCategory) {
            subcategoriaSelect.innerHTML = '<option value="" disabled selected>Primero selecciona categoría</option>';
            subcategoriaSelect.disabled = true;
            return;
        }

        // Enable dropdown
        subcategoriaSelect.disabled = false;

        // Add placeholder
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = 'Selecciona subcategoría';
        subcategoriaSelect.appendChild(placeholder);

        // Add subcategories
        const category = CONFIG.PAGO_CATEGORIES[selectedCategory];
        if (category && category.subcategories) {
            category.subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subcategoriaSelect.appendChild(option);
            });
        }
    }

    // ==========================================================================
    // Form Validation
    // ==========================================================================

    function validateForm() {
        const errors = [];

        // Required fields
        const requiredFields = [
            { id: 'monto', label: 'Monto' },
            { id: 'categoria', label: 'Categoría' },
            { id: 'subcategoria', label: 'Subcategoría' },
            { id: 'fecha_vencimiento', label: 'Fecha de vencimiento' }
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

        // Validate monto is positive
        const monto = parseFloat(document.getElementById('monto').value) || 0;
        if (monto <= 0) {
            errors.push('El monto debe ser mayor a 0');
            document.getElementById('monto').classList.add('error');
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

        // Get selected currency
        const selectedMoneda = document.querySelector('input[name="moneda"]:checked').value;

        // Gather form data
        const formData = {
            monto: parseFloat(document.getElementById('monto').value),
            moneda: selectedMoneda,
            es_fiscal: document.getElementById('es_fiscal').checked,
            categoria: document.getElementById('categoria').value,
            subcategoria: document.getElementById('subcategoria').value,
            fecha_vencimiento: document.getElementById('fecha_vencimiento').value,
            estado: document.getElementById('estado').value,
            descripcion: document.getElementById('descripcion').value.trim() || null
        };

        // Show loading
        Utils.showLoading();

        try {
            // Submit to API
            const result = await API.createPago(formData);

            // Hide loading
            Utils.hideLoading();

            // Show success
            showSuccess(formData, result);

        } catch (error) {
            Utils.hideLoading();
            Utils.showError('Error al registrar el pago: ' + error.message);
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

        // Get category name
        const categoryName = CONFIG.PAGO_CATEGORIES[formData.categoria]?.name || formData.categoria;

        // Get status name
        const statusInfo = CONFIG.PAGO_ESTADOS.find(s => s.id === formData.estado);
        const statusName = statusInfo ? statusInfo.name : formData.estado;

        // Format currency
        const currencySymbol = formData.moneda === 'USD' ? 'USD $' : '$';
        const formattedAmount = `${currencySymbol}${formData.monto.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;

        // Render pago summary
        const summaryContainer = document.getElementById('pago-summary');
        summaryContainer.innerHTML = `
            <div class="pago-summary-row">
                <span class="pago-summary-label">Monto</span>
                <span class="pago-summary-value">${formattedAmount}</span>
            </div>
            <div class="pago-summary-row">
                <span class="pago-summary-label">Categoría</span>
                <span class="pago-summary-value">${categoryName}</span>
            </div>
            <div class="pago-summary-row">
                <span class="pago-summary-label">Subcategoría</span>
                <span class="pago-summary-value">${formData.subcategoria}</span>
            </div>
            <div class="pago-summary-row">
                <span class="pago-summary-label">Fecha Vencimiento</span>
                <span class="pago-summary-value">${Utils.formatDate(formData.fecha_vencimiento)}</span>
            </div>
            <div class="pago-summary-row">
                <span class="pago-summary-label">Estado</span>
                <span class="pago-summary-value" style="color: ${statusInfo?.color || '#000'};">${statusName}</span>
            </div>
            <div class="pago-summary-row">
                <span class="pago-summary-label">Fiscal</span>
                <span class="pago-summary-value">${formData.es_fiscal ? 'Sí' : 'No'}</span>
            </div>
            ${result.data?.id ? `
            <div class="pago-summary-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <span class="pago-summary-label">Notion ID</span>
                <span class="pago-summary-value" style="font-family: monospace; font-size: 12px; color: #6b7280;">${result.data.id}</span>
            </div>
            ` : ''}
        `;
    }

})();
