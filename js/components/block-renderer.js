/**
 * Block Renderer Component
 *
 * Shared renderer for Notion page content blocks.
 * Supports text blocks (paragraphs, headings, lists, etc.) and
 * media blocks (images, files, bookmarks, video, embed).
 *
 * Used by both buscar-pedido.js and edit-modal.js.
 */

const BlockRenderer = {
    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Extract the URL from an image, file, video, or pdf block
     * Notion uses either { type: 'file', file: { url } } or { type: 'external', external: { url } }
     * @param {Object} mediaObj - The block's media object (e.g., block.image, block.file)
     * @returns {string} URL or empty string
     */
    getMediaUrl(mediaObj) {
        if (!mediaObj) return '';
        if (mediaObj.type === 'file' && mediaObj.file) {
            return mediaObj.file.url || '';
        }
        if (mediaObj.type === 'external' && mediaObj.external) {
            return mediaObj.external.url || '';
        }
        // Fallback: try direct url property
        if (mediaObj.url) return mediaObj.url;
        return '';
    },

    /**
     * Extract caption text from a media block
     * @param {Object} mediaObj - The block's media object
     * @returns {string} Caption text or empty string
     */
    getCaption(mediaObj) {
        if (!mediaObj || !mediaObj.caption || !Array.isArray(mediaObj.caption)) return '';
        return mediaObj.caption.map(rt => rt.plain_text || '').join('');
    },

    /**
     * Extract text content from a Notion block
     * Handles both simplified format (block.text) and native Notion API format
     * @param {Object} block - Notion block object
     * @returns {string} Plain text content
     */
    extractBlockText(block) {
        // Handle simplified mock format (block.text)
        if (block.text !== undefined) {
            return block.text;
        }

        const blockType = block.type;

        // Handle child_page blocks
        if (blockType === 'child_page' && block.child_page) {
            return block.child_page.title || '';
        }

        // Handle child_database blocks
        if (blockType === 'child_database' && block.child_database) {
            return block.child_database.title || '';
        }

        // Handle divider
        if (blockType === 'divider') {
            return '---';
        }

        // Handle blocks with rich_text content (paragraph, headings, list items, etc.)
        const blockContent = block[blockType];
        if (blockContent && blockContent.rich_text && Array.isArray(blockContent.rich_text)) {
            return blockContent.rich_text.map(rt => rt.plain_text || rt.text?.content || '').join('');
        }

        return '';
    },

    /**
     * Render a single Notion block as HTML
     * @param {Object} block - Notion block object
     * @param {number} depth - Nesting depth for indentation
     * @returns {string} HTML string
     */
    renderBlock(block, depth = 0) {
        const blockType = block.type;
        const indentClass = depth > 0 ? ` indent-${Math.min(depth, 3)}` : '';
        const baseClass = 'page-content-block';

        // === MEDIA BLOCKS (handle before text extraction) ===

        // Image block
        if (blockType === 'image') {
            const url = this.getMediaUrl(block.image);
            const caption = this.getCaption(block.image);
            if (!url) return '';
            return `<div class="${baseClass} image${indentClass}">` +
                `<img src="${this.escapeHtml(url)}" alt="${this.escapeHtml(caption || 'Imagen del pedido')}" loading="lazy">` +
                (caption ? `<p class="block-caption">${this.escapeHtml(caption)}</p>` : '') +
                `</div>`;
        }

        // File / PDF block
        if (blockType === 'file' || blockType === 'pdf') {
            const url = this.getMediaUrl(block[blockType]);
            const caption = this.getCaption(block[blockType]);
            const name = block[blockType]?.name || caption || 'Archivo adjunto';
            if (!url) return '';
            return `<div class="${baseClass} file${indentClass}">` +
                `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>` +
                `<span>${this.escapeHtml(name)}</span>` +
                `</a></div>`;
        }

        // Bookmark block
        if (blockType === 'bookmark') {
            const url = block.bookmark?.url || '';
            const caption = this.getCaption(block.bookmark);
            if (!url) return '';
            const displayUrl = url.length > 60 ? url.substring(0, 60) + '...' : url;
            return `<div class="${baseClass} bookmark${indentClass}">` +
                `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` +
                `<span class="bookmark-text">` +
                (caption ? `<span class="bookmark-title">${this.escapeHtml(caption)}</span>` : '') +
                `<span class="bookmark-url">${this.escapeHtml(displayUrl)}</span>` +
                `</span></a></div>`;
        }

        // Video block
        if (blockType === 'video') {
            const url = this.getMediaUrl(block.video);
            const caption = this.getCaption(block.video);
            if (!url) return '';
            // For external URLs (YouTube, etc.) just show a link
            if (block.video?.type === 'external') {
                return `<div class="${baseClass} video${indentClass}">` +
                    `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>` +
                    `<span>${this.escapeHtml(caption || 'Ver video')}</span>` +
                    `</a></div>`;
            }
            return `<div class="${baseClass} video${indentClass}">` +
                `<video controls preload="metadata"><source src="${this.escapeHtml(url)}"></video>` +
                (caption ? `<p class="block-caption">${this.escapeHtml(caption)}</p>` : '') +
                `</div>`;
        }

        // Audio block
        if (blockType === 'audio') {
            const url = this.getMediaUrl(block.audio);
            const caption = this.getCaption(block.audio);
            if (!url) return '';
            return `<div class="${baseClass} audio${indentClass}">` +
                `<audio controls preload="metadata"><source src="${this.escapeHtml(url)}"></audio>` +
                (caption ? `<p class="block-caption">${this.escapeHtml(caption)}</p>` : '') +
                `</div>`;
        }

        // Embed block
        if (blockType === 'embed') {
            const url = block.embed?.url || '';
            const caption = this.getCaption(block.embed);
            if (!url) return '';
            return `<div class="${baseClass} bookmark${indentClass}">` +
                `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` +
                `<span>${this.escapeHtml(caption || url)}</span>` +
                `</a></div>`;
        }

        // Table block (render children as rows)
        if (blockType === 'table') {
            if (!block.children || !Array.isArray(block.children) || block.children.length === 0) {
                return '';
            }
            const hasHeader = block.table?.has_column_header || false;
            let rows = '';
            block.children.forEach((row, i) => {
                if (row.type !== 'table_row' || !row.table_row?.cells) return;
                const tag = (hasHeader && i === 0) ? 'th' : 'td';
                const cells = row.table_row.cells.map(cell => {
                    const text = cell.map(rt => rt.plain_text || '').join('');
                    return `<${tag}>${this.escapeHtml(text)}</${tag}>`;
                }).join('');
                rows += `<tr>${cells}</tr>`;
            });
            return `<div class="${baseClass} table${indentClass}"><table>${rows}</table></div>`;
        }

        // === TEXT BLOCKS ===

        const text = this.extractBlockText(block);

        // Determine CSS class based on block type
        let blockClass = baseClass;
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
        let html = `<div class="${blockClass}">${this.escapeHtml(text)}</div>`;

        // Recursively render children if present
        if (block.children && Array.isArray(block.children) && block.children.length > 0) {
            const childrenHtml = block.children.map(child => this.renderBlock(child, depth + 1)).join('');
            html += childrenHtml;
        }

        return html;
    },

    /**
     * Render Notion page content blocks
     * @param {Object} pageContent - Page content data (various formats)
     * @returns {string} HTML string
     */
    renderPageContent(pageContent) {
        if (!pageContent) {
            return '<div class="page-content-empty">No hay contenido adicional en esta página.</div>';
        }

        // Handle different API response formats
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

        return blocks.map(block => this.renderBlock(block, 0)).filter(html => html).join('');
    }
};
