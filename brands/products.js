// ==========================================
// ULTRA-MODERN E-COMMERCE JAVASCRIPT
// Production-Ready with Advanced Features
// ==========================================

'use strict';

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// All brand JSON file paths
const ALL_BRAND_JSON_FILES = [
    '../json/babyliss-products.json',
    '../json/stylecraft-products.json',
    '../json/jrl-products.json',
    '../json/wahl-products.json',
    '../json/wmark-products.json',
    '../json/vgr-products.json',
    '../json/monster-products.json',
    '../json/barberworld-products.json'
];

// Global State Management
const STATE = {
    allProducts: [],
    filteredProducts: [],
    cart: [],
    currentView: 'grid',
    brand: document.body.dataset.brand || 'All Products',
    filters: {
        search: '',
        categories: [],
        priceMin: 0,
        priceMax: Infinity,
        inStockOnly: false,
        sort: 'featured'
    },
    ui: {
        modalOpen: false,
        cartOpen: false,
        filtersOpen: false
    }
};

// Configuration
const CONFIG = {
    ANIMATION_DELAY: 50,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    MAX_PRODUCTS_PER_PAGE: 100
};

// ==========================================
// INITIALIZATION & SETUP
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Modern E-Commerce System...');
    
    try {
        await loadProducts();
        loadCart();
        updateCartBadge();
        initializeEventListeners();
        initializeKeyboardShortcuts();
        initializePerformanceOptimizations();
        
        console.log('✨ Modern E-Commerce System Ready!');
        console.log('📦 Products Loaded:', STATE.allProducts.length);
        console.log('🛒 Cart Items:', STATE.cart.length);
    } catch (error) {
        console.error('❌ Initialization Error:', error);
        showErrorToast('Failed to initialize. Please refresh the page.');
    }
});

// ==========================================
// PRODUCT LOADING & DATA MANAGEMENT
// ==========================================

async function loadProducts() {
    try {
        showLoading(true);
        
        const needsAllProducts = [
            'clippers', 
            'trimmers', 
            'shavers', 
            'combos', 
            'All Products'
        ].includes(STATE.brand);
        
        if (needsAllProducts) {
            console.log('📦 Loading from all brand JSON files...');
            
            // Parallel loading for better performance
            const productArrays = await Promise.all(
                ALL_BRAND_JSON_FILES.map(file => 
                    fetch(file)
                        .then(res => res.ok ? res.json() : [])
                        .catch(err => {
                            console.warn(`⚠️ Failed to load ${file}:`, err);
                            return [];
                        })
                )
            );
            
            STATE.allProducts = productArrays.flat();
            console.log(`✅ Loaded ${STATE.allProducts.length} products from all brands`);
            
            // Filter by category
            switch(STATE.brand) {
                case 'clippers':
                    STATE.filteredProducts = STATE.allProducts.filter(p => p.category === 'Clipper');
                    break;
                case 'trimmers':
                    STATE.filteredProducts = STATE.allProducts.filter(p => p.category === 'Trimmer');
                    break;
                case 'shavers':
                    STATE.filteredProducts = STATE.allProducts.filter(p => p.category === 'Shaver');
                    break;
                case 'combos':
                    STATE.filteredProducts = STATE.allProducts.filter(p => p.category === 'Combo Set');
                    break;
                default:
                    STATE.filteredProducts = [...STATE.allProducts];
            }
            
            console.log(`🎯 Filtered to ${STATE.filteredProducts.length} products`);
            
        } else {
            // Load single brand
            const jsonFile = getBrandJsonFile(STATE.brand);
            console.log(`📦 Loading ${jsonFile}...`);
            
            const response = await fetch(jsonFile);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            STATE.allProducts = await response.json();
            STATE.filteredProducts = [...STATE.allProducts];
            
            console.log(`✅ Loaded ${STATE.allProducts.length} products`);
        }
        
        // Initialize filters and display
        populateCategoryFilters();
        applyFilters();
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showErrorToast('Failed to load products. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

function getBrandJsonFile(brand) {
    const brandMap = {
        'Babyliss': '../json/babyliss-products.json',
        'StyleCraft': '../json/stylecraft-products.json',
        'ourbrand': '../json/barberworld-products.json',
        'Monster': '../json/monster-products.json',
        'JRL': '../json/jrl-products.json',
        'Wahl': '../json/wahl-products.json',
        'WMark': '../json/wmark-products.json',
        'VGR': '../json/vgr-products.json'
    };
    return brandMap[brand] || '../json/babyliss-products.json';
}

function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    const productsGrid = document.getElementById('products-grid');
    
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
    if (productsGrid) {
        productsGrid.style.display = show ? 'none' : 'grid';
    }
}

// ==========================================
// SMART FILTER SYSTEM
// ==========================================

function populateCategoryFilters() {
    const categories = [...new Set(STATE.allProducts.map(p => p.category))].filter(Boolean).sort();
    const categoryContainer = document.querySelector('.filter-options');
    
    if (!categoryContainer || categories.length === 0) return;
    
    categoryContainer.innerHTML = categories.map((category, index) => `
        <label class="filter-option" style="animation-delay: ${index * 0.05}s">
            <input type="checkbox" 
                   value="${escapeHtml(category)}" 
                   onchange="applyFilters()"
                   data-category="${escapeHtml(category)}">
            <span class="checkmark"></span>
            <span>${escapeHtml(category)}</span>
        </label>
    `).join('');
}

// Debounced filter application
let filterTimeout;
function applyFilters() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        performFilterOperation();
    }, CONFIG.DEBOUNCE_DELAY);
}

function performFilterOperation() {
    console.log('🔍 Applying filters...');
    
    // Gather filter values
    const searchInput = document.getElementById('search-input');
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const inStockCheckbox = document.getElementById('in-stock-only');
    const sortSelect = document.getElementById('sort-select');
    
    STATE.filters.search = searchInput?.value.toLowerCase().trim() || '';
    STATE.filters.categories = Array.from(
        document.querySelectorAll('.filter-option input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    STATE.filters.priceMin = parseFloat(priceMinInput?.value) || 0;
    STATE.filters.priceMax = parseFloat(priceMaxInput?.value) || Infinity;
    STATE.filters.inStockOnly = inStockCheckbox?.checked || false;
    STATE.filters.sort = sortSelect?.value || 'featured';
    
    // Apply filters
    STATE.filteredProducts = STATE.allProducts.filter(product => {
        // Search filter
        const matchesSearch = !STATE.filters.search || 
            product.name.toLowerCase().includes(STATE.filters.search) ||
            (product.brand && product.brand.toLowerCase().includes(STATE.filters.search)) ||
            (product.description && product.description.toLowerCase().includes(STATE.filters.search)) ||
            (product.category && product.category.toLowerCase().includes(STATE.filters.search));
        
        // Category filter
        const matchesCategory = STATE.filters.categories.length === 0 || 
            STATE.filters.categories.includes(product.category);
        
        // Price filter
        const matchesPrice = product.price >= STATE.filters.priceMin && 
                            product.price <= STATE.filters.priceMax;
        
        // Stock filter
        const matchesStock = !STATE.filters.inStockOnly || product.inStock !== false;
        
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });
    
    // Apply sorting
    sortProducts();
    
    // Display results
    displayProducts();
    updateResultsCount();
    
    console.log(`✅ Filtered to ${STATE.filteredProducts.length} products`);
}

function sortProducts() {
    switch(STATE.filters.sort) {
        case 'price-low':
            STATE.filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            STATE.filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-az':
            STATE.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-za':
            STATE.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'featured':
        default:
            // Sort by stock status, then by original order
            STATE.filteredProducts.sort((a, b) => {
                if (a.inStock === b.inStock) return 0;
                return (a.inStock === false) ? 1 : -1;
            });
            break;
    }
}

function updateResultsCount() {
    const resultsInfo = document.querySelector('.results-info');
    if (resultsInfo) {
        const count = STATE.filteredProducts.length;
        resultsInfo.textContent = `Showing ${count} ${count === 1 ? 'product' : 'products'}`;
    }
}

function displayProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid) return;
    
    // Handle empty state
    if (STATE.filteredProducts.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';
    
    // Render products with staggered animation
    grid.innerHTML = STATE.filteredProducts.map((product, index) => 
        createProductCard(product, index)
    ).join('');
}

function createProductCard(product, index) {
    const animationDelay = `${index * 0.05}s`;
    const stockClass = product.inStock === false ? 'out-of-stock' : '';
    const stockText = product.inStock === false ? 'Out of Stock' : 'In Stock';
    
    return `
        <div class="product-card" style="animation-delay: ${animationDelay}">
            <div class="product-image-container" onclick="openProductModal(${product.id})">
                <img src="${escapeHtml(product.image)}" 
                     alt="${escapeHtml(product.name)}" 
                     class="product-image"
                     loading="lazy">
                <button class="quick-add-btn" 
                        onclick="event.stopPropagation(); quickAddToCart(${product.id})" 
                        ${product.inStock === false ? 'disabled' : ''}
                        aria-label="Quick add to cart">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <span class="stock-badge ${stockClass}">${stockText}</span>
            </div>
            <div class="product-info">
                ${product.brand ? `<div class="product-brand">${escapeHtml(product.brand)}</div>` : ''}
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        </div>
    `;
}

function clearAllFilters() {
    console.log('🔄 Clearing all filters...');
    
    // Clear search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        updateClearSearchButton();
    }
    
    // Clear categories
    document.querySelectorAll('.filter-option input[type="checkbox"]')
        .forEach(cb => cb.checked = false);
    
    // Clear price
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    // Clear stock
    const inStockOnly = document.getElementById('in-stock-only');
    if (inStockOnly) inStockOnly.checked = false;
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';
    
    // Reset state and apply
    STATE.filters = {
        search: '',
        categories: [],
        priceMin: 0,
        priceMax: Infinity,
        inStockOnly: false,
        sort: 'featured'
    };
    
    applyFilters();
    showToast('Filters Cleared', 'All filters have been reset');
}

function toggleFilterGroup(header) {
    header.classList.toggle('collapsed');
    
    // Save state to localStorage
    const filterTitle = header.querySelector('.filter-title span')?.textContent;
    if (filterTitle) {
        const isCollapsed = header.classList.contains('collapsed');
        localStorage.setItem(`filter_${filterTitle}`, isCollapsed);
    }
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.querySelector('.clear-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            updateClearSearchButton();
            applyFilters();
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                updateClearSearchButton();
                searchInput.focus();
                applyFilters();
            }
        });
    }
}

function updateClearSearchButton() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.querySelector('.clear-search');
    
    if (searchInput && clearBtn) {
        const hasValue = searchInput.value.length > 0;
        clearBtn.classList.toggle('active', hasValue);
    }
}

// ==========================================
// PRODUCT MODAL - ENHANCED WITH ZOOM
// ==========================================

function openProductModal(productId) {
    const product = STATE.allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    console.log('🔍 Opening modal for:', product.name);
    
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) return;
    
    // Prepare images
    const images = product.images && product.images.length > 0 ? 
        [product.image, ...product.images] : [product.image];
    
    // Render modal content
    modalBody.innerHTML = createModalContent(product, images);
    
    // Show modal
    modal.classList.add('active');
    STATE.ui.modalOpen = true;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    // Track analytics (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
            items: [{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price
            }]
        });
    }
}

function createModalContent(product, images) {
    const stockClass = product.inStock === false ? 'out-of-stock' : '';
    const stockIcon = product.inStock === false ? 'times-circle' : 'check-circle';
    const stockText = product.inStock === false ? 'Out of Stock' : 'In Stock - Ships Today';
    
    return `
        <div class="modal-grid">
            <div class="modal-images">
                <div class="modal-main-image-container">
                    <img id="modal-main-image" 
                         src="${escapeHtml(images[0])}" 
                         alt="${escapeHtml(product.name)}" 
                         class="modal-main-image"
                         onclick="toggleImageZoom(this)">
                </div>
                ${images.length > 1 ? `
                    <div class="modal-thumbnails">
                        ${images.map((img, idx) => `
                            <img src="${escapeHtml(img)}" 
                                 alt="${escapeHtml(product.name)}" 
                                 class="modal-thumbnail ${idx === 0 ? 'active' : ''}" 
                                 onclick="changeModalImage('${escapeHtml(img)}', this)"
                                 loading="lazy">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-details">
                ${product.brand ? `<div class="modal-brand">${escapeHtml(product.brand)}</div>` : ''}
                <h2>${escapeHtml(product.name)}</h2>
                
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                
                <div class="modal-stock ${stockClass}">
                    <i class="fas fa-${stockIcon}"></i>
                    ${stockText}
                </div>
                
                ${product.description ? `
                    <div class="modal-description">${escapeHtml(product.description)}</div>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features">
                        <h4><i class="fas fa-star"></i> Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li>${escapeHtml(feature)}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <button class="btn-add-to-cart" 
                            onclick="addToCart(${product.id})"
                            ${product.inStock === false ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        <span>${product.inStock === false ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function closeModal(event) {
    // Only close if clicking backdrop or explicitly called
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        STATE.ui.modalOpen = false;
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }
}

function changeModalImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('modal-main-image');
    if (!mainImage) return;
    
    // Remove zoom if applied
    mainImage.classList.remove('zoomed');
    mainImage.style.transform = '';
    mainImage.style.cursor = 'zoom-in';
    
    // Change image
    mainImage.src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

function toggleImageZoom(img) {
    img.classList.toggle('zoomed');
    
    if (img.classList.contains('zoomed')) {
        img.style.cursor = 'zoom-out';
    } else {
        img.style.cursor = 'zoom-in';
    }
}

// ==========================================
// CART FUNCTIONALITY - UNCHANGED LOGIC
// ==========================================

function loadCart() {
    const savedCart = localStorage.getItem('barber_cart');
    STATE.cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartDisplay();
    console.log('🛒 Cart loaded:', STATE.cart.length, 'items');
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(STATE.cart));
    window.dispatchEvent(new Event('cartUpdated'));
    console.log('💾 Cart saved:', STATE.cart.length, 'items');
}

function addToCart(productId) {
    const product = STATE.allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    if (product.inStock === false) {
        showToast('Out of Stock', 'This product is currently unavailable', 'warning');
        return;
    }
    
    const existingItem = STATE.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('📈 Increased quantity for:', product.name);
    } else {
        STATE.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            brand: product.brand,
            quantity: 1
        });
        console.log('➕ Added to cart:', product.name);
    }
    
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    showToast('Added to Cart', `${product.name} has been added to your cart`);
    openCart();
    closeModal();
    
    // Track analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            items: [{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                quantity: 1
            }]
        });
    }
}

function quickAddToCart(productId) {
    const product = STATE.allProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (product.inStock === false) {
        showToast('Out of Stock', 'This product is currently unavailable', 'warning');
        return;
    }
    
    const existingItem = STATE.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        STATE.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            brand: product.brand,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    showToast('Added to Cart', `${product.name} has been added to your cart`);
}

function removeFromCart(productId) {
    const item = STATE.cart.find(item => item.id === productId);
    if (item) {
        console.log('🗑️ Removing from cart:', item.name);
    }
    
    STATE.cart = STATE.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartBadge();
}

function updateQuantity(productId, change) {
    const item = STATE.cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        console.log('🔢 Updated quantity for:', item.name, 'to', item.quantity);
        saveCart();
        updateCartDisplay();
        updateCartBadge();
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartItemsContainer) return;
    
    const totalItems = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update count
    if (cartCount) {
        cartCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }
    
    // Handle empty cart
    if (STATE.cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="empty-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <p>Your cart is empty</p>
                <span>Start shopping now!</span>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }
    
    // Show footer
    if (cartFooter) cartFooter.style.display = 'block';
    
    // Render cart items
    cartItemsContainer.innerHTML = STATE.cart.map((item, index) => `
        <div class="cart-item" style="animation-delay: ${index * 0.05}s">
            <img src="${escapeHtml(item.image)}" 
                 alt="${escapeHtml(item.name)}" 
                 class="cart-item-image"
                 loading="lazy">
            <div class="cart-item-details">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn" 
                                onclick="updateQuantity(${item.id}, -1)"
                                aria-label="Decrease quantity">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn" 
                                onclick="updateQuantity(${item.id}, 1)"
                                aria-label="Increase quantity">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" 
                            onclick="removeFromCart(${item.id})"
                            aria-label="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (totalElement) {
        totalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function openCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel) cartPanel.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    
    STATE.ui.cartOpen = true;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cart-open');
    
    console.log('🛒 Cart opened');
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel) cartPanel.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    
    STATE.ui.cartOpen = false;
    document.body.style.overflow = '';
    document.body.classList.remove('cart-open');
    
    console.log('🛒 Cart closed');
}

async function proceedToCheckout() {
    if (STATE.cart.length === 0) {
        showToast('Cart Empty', 'Please add items to your cart first', 'warning');
        return;
    }
    
    console.log('💳 Proceeding to checkout...');
    
    try {
        const lineItems = STATE.cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));
        
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lineItems })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const session = await response.json();
        
        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'begin_checkout', {
                items: STATE.cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    brand: item.brand,
                    price: item.price,
                    quantity: item.quantity
                })),
                value: STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            });
        }
        
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('💳 Checkout error:', error);
        showToast('Checkout Error', 'There was an error processing your checkout. Please try again.', 'error');
    }
}

// ==========================================
// UI CONTROLS & INTERACTIONS
// ==========================================

function toggleFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (!sidebar) return;
    
    const isActive = sidebar.classList.toggle('active');
    STATE.ui.filtersOpen = isActive;
    
    if (overlay) {
        if (isActive) {
            overlay.classList.add('active');
            overlay.onclick = () => toggleFilters();
        } else {
            overlay.classList.remove('active');
            overlay.onclick = () => closeCart();
        }
    }
    
    document.body.style.overflow = isActive ? 'hidden' : '';
    document.body.classList.toggle('menu-open', isActive);
    
    console.log(isActive ? '🎛️ Filters opened' : '🎛️ Filters closed');
}

function changeView(view) {
    STATE.currentView = view;
    const grid = document.getElementById('products-grid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    if (grid) {
        grid.setAttribute('data-view', view);
    }
    
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    console.log(`👁️ View changed to: ${view}`);
}

function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastTitle = document.querySelector('.toast-title');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-icon i');
    
    if (!toast || !toastTitle || !toastMessage || !toastIcon) return;
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    toastIcon.className = `fas ${icons[type] || icons.success}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
}

function showErrorToast(message) {
    showToast('Error', message, 'error');
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================

function initializeEventListeners() {
    // Search functionality
    initializeSearch();
    
    // Escape key handlers
    document.addEventListener('keydown', handleKeyPress);
    
    // Storage sync across tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Cart updates
    window.addEventListener('cartUpdated', () => {
        updateCartBadge();
    });
    
    // Click outside to close
    document.addEventListener('click', handleOutsideClick);
    
    // Prevent body scroll when modals open
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    console.log('✅ Event listeners initialized');
}

function handleKeyPress(e) {
    // Escape key
    if (e.key === 'Escape') {
        if (STATE.ui.modalOpen) {
            closeModal();
        } else if (STATE.ui.cartOpen) {
            closeCart();
        } else if (STATE.ui.filtersOpen) {
            toggleFilters();
        }
    }
}

function handleStorageChange(e) {
    if (e.key === 'barber_cart') {
        loadCart();
        updateCartBadge();
        console.log('🔄 Cart synced from another tab');
    }
}

function handleOutsideClick(e) {
    // Close filters if clicking outside on mobile
    const sidebar = document.getElementById('filters-sidebar');
    const filterBtn = document.querySelector('.filter-toggle-btn');
    
    if (sidebar && 
        STATE.ui.filtersOpen && 
        !sidebar.contains(e.target) && 
        !filterBtn?.contains(e.target)) {
        // Only on mobile
        if (window.innerWidth <= 768) {
            toggleFilters();
        }
    }
}

function handleTouchMove(e) {
    if (STATE.ui.modalOpen || STATE.ui.cartOpen || STATE.ui.filtersOpen) {
        // Allow scrolling only within scrollable containers
        const scrollableContainers = [
            '.modal-body',
            '.cart-items',
            '.filters-content'
        ];
        
        const isInScrollableContainer = scrollableContainers.some(selector => {
            const container = document.querySelector(selector);
            return container && container.contains(e.target);
        });
        
        if (!isInScrollableContainer) {
            e.preventDefault();
        }
    }
}

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + B: Toggle cart
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            if (STATE.ui.cartOpen) {
                closeCart();
            } else {
                openCart();
            }
        }
    });
    
    console.log('⌨️ Keyboard shortcuts initialized');
}

function initializePerformanceOptimizations() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Debounce window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('📐 Window resized');
        }, 250);
    });
    
    console.log('⚡ Performance optimizations active');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==========================================
// CONSOLE LOGGING & DIAGNOSTICS
// ==========================================

console.log(`
╔════════════════════════════════════════════════╗
║   🛍️  MODERN E-COMMERCE SYSTEM v2.0          ║
║   ─────────────────────────────────────────   ║
║   ✨ Production-Ready JavaScript              ║
║   🎨 Ultra-Modern Design System               ║
║   🚀 Optimized Performance                    ║
║   📱 Fully Responsive                         ║
║   ♿ Accessibility Compliant                  ║
║   🔒 Secure Checkout Integration              ║
╚════════════════════════════════════════════════╝
`);

// Export for debugging (development only)
if (typeof window !== 'undefined') {
    window.ECOMMERCE_STATE = STATE;
    window.ECOMMERCE_CONFIG = CONFIG;
}
