/**
 * Buscar Pedido Page
 *
 * Search functionality for orders including closed/completed ones.
 * Displays full order details including Notion page content.
 */

// State
let searchResults = [];
let currentOrder = null;

/**
 * Initialize page
 */
function initPage() {
    // Check authentication
    if (!Auth.isAuthenticated()) {
        if (USE_MOCK_DATA) {
            sessionStorage.setItem('prisma_user', JSON.stringify({
                id: 'dev',
                name: 'Developer',
                isAdmin: true
            }));
        } else {
            window.location.href = 'index.html';
            return;
        }
    }

    // Set up search input event listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * Perform search
 */
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();

    if (!query) {
        Utils.showToast('Ingresa un término de búsqueda', 'warning');
        searchInput.focus();
        return;
    }

    if (query.length < 2) {
        Utils.showToast('Ingresa al menos 2 caracteres', 'warning');
        searchInput.focus();
        return;
    }

    showLoading('Buscando pedidos...');

    try {
        const response = await API.searchOrders(query);

        if (response.success) {
            searchResults = response.data || [];
            renderResults();
        } else {
            Utils.showToast(response.error || 'Error al buscar', 'error');
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching orders:', error);
        Utils.showToast('Error de conexión', 'error');
        showNoResults();
    } finally {
        hideLoading();
    }
}

/**
 * Render search results
 */
function renderResults() {
    const emptyState = document.getElementById('empty-state');
    const resultsList = document.getElementById('results-list');
    const noResultsState = document.getElementById('no-results-state');
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');

    // Hide all states first
    emptyState.classList.add('hidden');
    resultsList.classList.add('hidden');
    noResultsState.classList.add('hidden');

    if (searchResults.length === 0) {
        noResultsState.classList.remove('hidden');
        return;
    }

    // Show results
    resultsList.classList.remove('hidden');
    resultsCount.textContent = `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''}`;

    // Render cards
    resultsGrid.innerHTML = searchResults.map(order => renderResultCard(order)).join('');
}

/**
 * Render a result card
 * @param {Object} order - Order data
 * @returns {string} HTML string
 */
function renderResultCard(order) {
    const saldo = (order.importe_total || 0) - (order.anticipo || 0);
    const statusClass = getStatusClass(order.estado, order.estado_final);
    const statusDisplay = order.estado_final === 'cerrado_completo' ? 'Cerrado' : (order.estado || 'Sin estado');

    return `
        <div class="result-card" onclick="openOrderDetail('${order.id}')">
            <div class="result-card-header">
                <div>
                    <div class="result-card-cliente">[${escapeHtml(order.numero_orden || 'Sin número')}] ${escapeHtml(order.nombre_cliente || 'Sin nombre')}</div>
                    <div class="result-card-tipo">${Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || 'Sin tipo'}</div>
                </div>
                <span class="order-status ${statusClass}">${statusDisplay}</span>
            </div>
            <div class="result-card-body">
                <div class="result-card-row">
                    <span class="result-card-label">Total</span>
                    <span class="result-card-value">${Utils.formatCurrency(order.importe_total)}</span>
                </div>
                <div class="result-card-row">
                    <span class="result-card-label">Saldo</span>
                    <span class="result-card-value" style="color: ${saldo > 0 ? 'var(--primary)' : 'var(--success)'};">${Utils.formatCurrency(saldo)}</span>
                </div>
                ${order.joyero ? `
                <div class="result-card-row">
                    <span class="result-card-label">Joyero</span>
                    <span class="result-card-value">${escapeHtml(order.joyero)}</span>
                </div>
                ` : ''}
            </div>
            <div class="result-card-footer">
                <span class="result-card-date">
                    ${order.fecha_entrega_cliente ? `Entrega: ${Utils.formatDate(order.fecha_entrega_cliente)}` : 'Sin fecha de entrega'}
                    ${order.requiere_certificado ? '<span class="certificate-icon" title="Requiere Certificado"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></span>' : ''}
                </span>
            </div>
        </div>
    `;
}

/**
 * Get status CSS class
 * @param {string} estado - Current status
 * @param {string} estadoFinal - Final status (if closed)
 * @returns {string} CSS class
 */
function getStatusClass(estado, estadoFinal) {
    if (estadoFinal === 'cerrado_completo') {
        return 'cerrado_completo';
    }

    if (!estado) return '';

    const statusMap = {
        'Pendiente Aprobación': 'pendiente_aprobacion',
        'En Producción': 'en_produccion',
        'Listo para Entrega': 'listo_para_entrega',
        'Listo Entrega': 'listo_entrega',
        'Entregado': 'entregado',
        'Cancelado': 'cancelado'
    };

    return statusMap[estado] || estado.toLowerCase().replace(/\s+/g, '_').replace(/[áéíóú]/g, match => {
        const map = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
        return map[match];
    });
}

/**
 * Open order detail modal
 * @param {string} orderId - Order ID
 */
async function openOrderDetail(orderId) {
    const order = searchResults.find(o => o.id === orderId);
    if (!order) {
        Utils.showToast('Pedido no encontrado', 'error');
        return;
    }

    currentOrder = order;
    showLoading('Cargando detalles...');

    try {
        // Fetch page content from Notion
        const contentResponse = await API.getOrderPageContent(orderId);

        // Handle different API response formats:
        // - Standard format: { success: true, data: { blocks/results: [...] } }
        // - Direct data format: { blocks/results: [...] }
        // - Direct array format: [...]
        let pageContent = null;
        if (contentResponse) {
            if (contentResponse.success && contentResponse.data) {
                pageContent = contentResponse.data;
            } else if (contentResponse.results || contentResponse.blocks || Array.isArray(contentResponse)) {
                pageContent = contentResponse;
            }
        }

        renderOrderDetail(order, pageContent);
        openDetailModal();
    } catch (error) {
        console.error('Error fetching page content:', error);
        // Still show the order details even if content fetch fails
        renderOrderDetail(order, null);
        openDetailModal();
    } finally {
        hideLoading();
    }
}

/**
 * Render order detail in modal
 * @param {Object} order - Order data
 * @param {Object} pageContent - Notion page content (blocks)
 */
function renderOrderDetail(order, pageContent) {
    const modalTitle = document.getElementById('detail-modal-title');
    const modalBody = document.getElementById('detail-modal-body');
    const notionLink = document.getElementById('notion-link');

    const saldo = (order.importe_total || 0) - (order.anticipo || 0);
    const statusClass = getStatusClass(order.estado, order.estado_final);
    const statusDisplay = order.estado_final === 'cerrado_completo' ? 'Cerrado Completo' : (order.estado || 'Sin estado');

    modalTitle.textContent = `Pedido ${order.numero_orden || 'Sin número'}`;
    notionLink.href = `https://www.notion.so/eduardoflores/${order.id.replace(/-/g, '')}`;

    const html = `
        <!-- Order Header -->
        <div class="order-detail-header">
            <div class="order-detail-header-left">
                <div class="order-detail-title">${escapeHtml(order.nombre_cliente || 'Sin nombre')}</div>
                <div class="order-detail-subtitle">${Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || 'Sin tipo'}</div>
            </div>
            <span class="order-status ${statusClass}">${statusDisplay}</span>
        </div>

        <!-- Customer Information -->
        <div class="detail-section">
            <div class="detail-section-title">Información del Cliente</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Nombre</span>
                    <span class="detail-value">${escapeHtml(order.nombre_cliente || '-')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Teléfono</span>
                    <span class="detail-value">${escapeHtml(order.telefono_cliente || '-')}</span>
                </div>
            </div>
        </div>

        <!-- Order Details -->
        <div class="detail-section">
            <div class="detail-section-title">Detalles del Pedido</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Número de Orden</span>
                    <span class="detail-value">${escapeHtml(order.numero_orden || '-')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tipo de Pedido</span>
                    <span class="detail-value">${Utils.getTipoPedidoName(order.tipo_pedido) || order.tipo_pedido || '-'}</span>
                </div>
                <div class="detail-item full-width">
                    <span class="detail-label">Descripción</span>
                    <span class="detail-value">${escapeHtml(order.descripcion || '-')}</span>
                </div>
            </div>
        </div>

        <!-- Financial Information -->
        <div class="detail-section">
            <div class="detail-section-title">Información Financiera</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Importe Total</span>
                    <span class="detail-value">${Utils.formatCurrency(order.importe_total)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Anticipo</span>
                    <span class="detail-value success">${Utils.formatCurrency(order.anticipo)}</span>
                </div>
            </div>
            <div class="saldo-display-modal" style="margin-top: 16px;">
                Saldo: ${Utils.formatCurrency(saldo)}
            </div>
        </div>

        <!-- Production Information -->
        <div class="detail-section">
            <div class="detail-section-title">Producción</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Joyero</span>
                    <span class="detail-value">${escapeHtml(order.joyero || 'Sin asignar')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Oro (gramos)</span>
                    <span class="detail-value">${order.oro_gramos ? order.oro_gramos + 'g' : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Oro con Joyero</span>
                    <span class="detail-value ${order.oro_con_joyero ? 'success' : ''}">${order.oro_con_joyero ? 'Sí' : 'No'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gemas Listas</span>
                    <span class="detail-value ${order.gemas_listas ? 'success' : ''}">${order.gemas_listas ? 'Sí' : 'No'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Requiere Certificado</span>
                    <span class="detail-value ${order.requiere_certificado ? 'warning' : ''}">${order.requiere_certificado ? 'Sí' : 'No'}</span>
                </div>
                ${order.gemas_requeridas ? `
                <div class="detail-item full-width">
                    <span class="detail-label">Gemas Requeridas</span>
                    <span class="detail-value">${escapeHtml(order.gemas_requeridas)}</span>
                </div>
                ` : ''}
                ${order.gemas_origen ? `
                <div class="detail-item">
                    <span class="detail-label">Origen de Gemas</span>
                    <span class="detail-value">${escapeHtml(order.gemas_origen)}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Dates -->
        <div class="detail-section">
            <div class="detail-section-title">Fechas</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Fecha de Pedido</span>
                    <span class="detail-value">${Utils.formatDate(order.fecha_pedido)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Entrega Cliente</span>
                    <span class="detail-value">${Utils.formatDate(order.fecha_entrega_cliente)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Entrega Tienda</span>
                    <span class="detail-value">${Utils.formatDate(order.fecha_entrega_tienda)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fecha Fabricación</span>
                    <span class="detail-value">${Utils.formatDate(order.fecha_fabricacion)}</span>
                </div>
            </div>
        </div>

        <!-- Notes -->
        ${order.notas ? `
        <div class="detail-section">
            <div class="detail-section-title">Notas</div>
            <div class="detail-value">${escapeHtml(order.notas)}</div>
        </div>
        ` : ''}

        <!-- Page Content -->
        <div class="detail-section">
            <div class="detail-section-title">Contenido de la Página</div>
            <div class="page-content-section">
                <div class="page-content-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Notas de Notion
                </div>
                <div class="page-content-blocks">
                    ${renderPageContent(pageContent)}
                </div>
            </div>
        </div>
    `;

    modalBody.innerHTML = html;
}

/**
 * Extract text content from a Notion block
 * Handles both simplified format (block.text) and native Notion API format
 * @param {Object} block - Notion block object
 * @returns {string} Plain text content
 */
function extractBlockText(block) {
    // Handle simplified mock format (block.text)
    if (block.text !== undefined) {
        return block.text;
    }

    const blockType = block.type;

    // Handle child_page blocks - extract title
    if (blockType === 'child_page' && block.child_page) {
        return block.child_page.title || '';
    }

    // Handle child_database blocks
    if (blockType === 'child_database' && block.child_database) {
        return block.child_database.title || '';
    }

    // Handle blocks with rich_text content (paragraph, headings, list items, etc.)
    const blockContent = block[blockType];
    if (blockContent && blockContent.rich_text && Array.isArray(blockContent.rich_text)) {
        return blockContent.rich_text.map(rt => rt.plain_text || rt.text?.content || '').join('');
    }

    // Handle toggle blocks (may have title in rich_text)
    if (blockType === 'toggle' && blockContent) {
        const toggleText = blockContent.rich_text?.map(rt => rt.plain_text || '').join('') || '';
        return toggleText;
    }

    // Handle callout blocks
    if (blockType === 'callout' && blockContent) {
        const calloutText = blockContent.rich_text?.map(rt => rt.plain_text || '').join('') || '';
        return calloutText;
    }

    // Handle quote blocks
    if (blockType === 'quote' && blockContent) {
        const quoteText = blockContent.rich_text?.map(rt => rt.plain_text || '').join('') || '';
        return quoteText;
    }

    // Handle code blocks
    if (blockType === 'code' && blockContent) {
        const codeText = blockContent.rich_text?.map(rt => rt.plain_text || '').join('') || '';
        return codeText;
    }

    // Handle divider (return empty or visual separator indicator)
    if (blockType === 'divider') {
        return '---';
    }

    return '';
}

/**
 * Render a single Notion block as HTML
 * @param {Object} block - Notion block object
 * @param {number} depth - Nesting depth for indentation
 * @returns {string} HTML string
 */
function renderBlock(block, depth = 0) {
    const blockType = block.type;
    const text = extractBlockText(block);
    const indentClass = depth > 0 ? ` indent-${Math.min(depth, 3)}` : '';

    // Determine CSS class based on block type
    let blockClass = 'page-content-block';
    if (blockType === 'heading_1' || blockType === 'heading_2' || blockType === 'heading_3') {
        blockClass += ' heading';
    } else if (blockType === 'child_page') {
        blockClass += ' child-page';
    } else if (blockType === 'child_database') {
        blockClass += ' child-database';
    } else if (blockType === 'bulleted_list_item') {
        blockClass += ' list-item bulleted';
    } else if (blockType === 'numbered_list_item') {
        blockClass += ' list-item numbered';
    } else if (blockType === 'to_do') {
        const isChecked = block.to_do?.checked || false;
        blockClass += ` to-do${isChecked ? ' checked' : ''}`;
    } else if (blockType === 'toggle') {
        blockClass += ' toggle';
    } else if (blockType === 'callout') {
        blockClass += ' callout';
    } else if (blockType === 'quote') {
        blockClass += ' quote';
    } else if (blockType === 'code') {
        blockClass += ' code';
    } else if (blockType === 'divider') {
        blockClass += ' divider';
    }

    blockClass += indentClass;

    // Skip empty blocks except dividers
    if (!text && blockType !== 'divider') {
        return '';
    }

    // Render the block
    let html = `<div class="${blockClass}">${escapeHtml(text)}</div>`;

    // Recursively render children if present
    if (block.children && Array.isArray(block.children) && block.children.length > 0) {
        const childrenHtml = block.children.map(child => renderBlock(child, depth + 1)).join('');
        html += childrenHtml;
    }

    return html;
}

/**
 * Render Notion page content blocks
 * @param {Object} pageContent - Page content data
 * @returns {string} HTML string
 */
function renderPageContent(pageContent) {
    if (!pageContent) {
        return '<div class="page-content-empty">No hay contenido adicional en esta página.</div>';
    }

    // Handle different API response formats:
    // - Mock data format: { blocks: [...] }
    // - Notion API format: { results: [...] }
    // - Direct array format: [...]
    let blocks = null;

    if (Array.isArray(pageContent)) {
        blocks = pageContent;
    } else if (pageContent.blocks && Array.isArray(pageContent.blocks)) {
        blocks = pageContent.blocks;
    } else if (pageContent.results && Array.isArray(pageContent.results)) {
        blocks = pageContent.results;
    }

    if (!blocks || blocks.length === 0) {
        return '<div class="page-content-empty">No hay contenido adicional en esta página.</div>';
    }

    return blocks.map(block => renderBlock(block, 0)).filter(html => html).join('');
}

/**
 * Show no results state
 */
function showNoResults() {
    const emptyState = document.getElementById('empty-state');
    const resultsList = document.getElementById('results-list');
    const noResultsState = document.getElementById('no-results-state');

    emptyState.classList.add('hidden');
    resultsList.classList.add('hidden');
    noResultsState.classList.remove('hidden');
}

/**
 * Open detail modal
 */
function openDetailModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close detail modal
 */
function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentOrder = null;
}

/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoading(message = 'Cargando...') {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    if (text) text.textContent = message;
    if (overlay) overlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeDetailModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPage);
