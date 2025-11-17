// ==========================================
// BARBER WORLD - PREMIUM PRODUCTS PAGE
// Complete Redesign - Modern & Elegant
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentView = 'grid';
let currentModalQuantity = 1;

// Get brand from body data attribute
const brandName = document.body.dataset.brand || 'Babyliss';

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartUI();
    loadProducts();
    initializeEventListeners();
    initTypewriter();
    
    console.log(`🚀 Premium ${brandName} Products Page Loaded`);
});

function initializeEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeMobileMenu();
            closeMobileFilters();
            closeCart();
        }
    });
    
    // Storage sync
    window.addEventListener('storage', (e) => {
        if (e.key === 'barber_cart') {
            loadCart();
            updateCartUI();
        }
    });
    
    // Sync mobile search with desktop
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const desktopSearch = document.getElementById('search-input');
            if (desktopSearch) {
                desktopSearch.value = e.target.value;
            }
            applyFilters();
        });
    }
    
    // Sync mobile price with desktop
    const mobilePriceMin = document.getElementById('mobile-price-min');
    const mobilePriceMax = document.getElementById('mobile-price-max');
    if (mobilePriceMin && mobilePriceMax) {
        mobilePriceMin.addEventListener('input', (e) => {
            const desktopMin = document.getElementById('price-min');
            if (desktopMin) desktopMin.value = e.target.value;
            applyFilters();
        });
        mobilePriceMax.addEventListener('input', (e) => {
            const desktopMax = document.getElementById('price-max');
            if (desktopMax) desktopMax.value = e.target.value;
            applyFilters();
        });
    }
}

// ==========================================
// TYPEWRITER EFFECT
// ==========================================

function initTypewriter() {
    const typingElement = document.getElementById('typing-brand');
    if (!typingElement) return;
    
    const text = brandName === 'Babyliss' ? 'BaBylissPRO' : brandName;
    let index = 0;
    
    function type() {
        if (index < text.length) {
            typingElement.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, 100);
        }
    }
    
    type();
}

// ==========================================
// PRODUCT LOADING
// ==========================================

async function loadProducts() {
    const loadingState = document.getElementById('loading-state');
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    try {
        if (loadingState) loadingState.style.display = 'flex';
        if (productsGrid) productsGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'none';
        
        const brandFiles = {
            'Babyliss': 'babyliss-products.json',
            'StyleCraft': 'stylecraft-products.json',
            'JRL': 'jrl-products.json',
            'Wahl': 'wahl-products.json',
            'W-Mark': 'wmark-products.json',
            'VGR': 'vgr-products.json',
            'Monster': 'monster-products.json',
            'OurBrand': 'barberworld-products.json'
        };
        
        const jsonFile = brandFiles[brandName] || 'babyliss-products.json';
        const response = await fetch(`../json/${jsonFile}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.statusText}`);
        }
        
        const products = await response.json();
        
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('No products found');
        }
        
        allProducts = products;
        filteredProducts = [...allProducts];
        
        renderProducts();
        updateResultsCount();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState();
    } finally {
        if (loadingState) loadingState.style.display = 'none';
    }
}

// ==========================================
// PRODUCT RENDERING WITH PAYMENT OPTIONS
// ==========================================

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        showEmptyState();
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    productsGrid.innerHTML = filteredProducts.map((product) => {
        const monthlyPayment = (product.price / 4).toFixed(2);
        
        return `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image-wrapper">
                <img src="${getProductImage(product)}" 
                     alt="${escapeHtml(product.name)}" 
                     class="product-image" 
                     loading="lazy">
                <button class="add-quick-btn" 
                        onclick="event.stopPropagation(); quickAddToCart(${product.id})" 
                        title="Add to cart">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${truncateText(product.name, 60)}</h3>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="payment-options">
                        <span>or 4 interest-free payments of $${monthlyPayment}</span>
                    </div>
                    <div class="payment-logos">
                        <span class="payment-logo">Klarna</span>
                        <span class="payment-logo">Afterpay</span>
                    </div>
                    <span class="stock-badge ${product.inStock ? '' : 'out-of-stock'}">
                        <i class="fas ${product.inStock ? 'fa-check' : 'fa-times'}"></i>
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </div>
        </div>
    `}).join('');
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (productsGrid) productsGrid.innerHTML = '';
}

// ==========================================
// FILTERS SYSTEM
// ==========================================

function applyFilters() {
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
    const inStockOnly = document.getElementById('stock-toggle-input')?.checked || false;
    const sortBy = document.getElementById('sort-select')?.value || 'featured';
    
    // Get selected categories from chips
    const selectedCategories = [];
    document.querySelectorAll('.category-chip.active').forEach(chip => {
        selectedCategories.push(chip.dataset.category);
    });
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery) ||
            (product.description && product.description.toLowerCase().includes(searchQuery));
        
        const matchesPrice = product.price >= priceMin && product.price <= priceMax;
        const matchesStock = !inStockOnly || product.inStock;
        const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(product.category);
        
        return matchesSearch && matchesPrice && matchesStock && matchesCategory;
    });
    
    // Sort products
    sortProducts(sortBy);
    
    // Update UI
    renderProducts();
    updateResultsCount();
}

function toggleCategory(category) {
    // Toggle on all category chips (desktop and mobile)
    document.querySelectorAll(`.category-chip[data-category="${category}"]`).forEach(chip => {
        chip.classList.toggle('active');
    });
    applyFilters();
}

function toggleStockFilter() {
    const toggle = document.getElementById('stock-toggle');
    const input = document.getElementById('stock-toggle-input');
    const mobileToggle = document.getElementById('mobile-stock-toggle');
    const mobileInput = document.getElementById('mobile-stock-toggle-input');
    
    if (toggle && input) {
        input.checked = !input.checked;
        toggle.classList.toggle('active', input.checked);
    }
    
    if (mobileToggle && mobileInput) {
        mobileInput.checked = input?.checked || false;
        mobileToggle.classList.toggle('active', mobileInput.checked);
    }
    
    applyFilters();
}

function clearAllFilters() {
    // Clear search
    const searchInputs = [
        document.getElementById('search-input'),
        document.getElementById('mobile-search-input')
    ];
    searchInputs.forEach(input => {
        if (input) input.value = '';
    });
    
    // Clear price
    const priceInputs = [
        document.getElementById('price-min'),
        document.getElementById('price-max'),
        document.getElementById('mobile-price-min'),
        document.getElementById('mobile-price-max')
    ];
    priceInputs.forEach(input => {
        if (input) input.value = '';
    });
    
    // Clear categories
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Clear stock
    const stockToggles = [
        { toggle: document.getElementById('stock-toggle'), input: document.getElementById('stock-toggle-input') },
        { toggle: document.getElementById('mobile-stock-toggle'), input: document.getElementById('mobile-stock-toggle-input') }
    ];
    stockToggles.forEach(({ toggle, input }) => {
        if (toggle && input) {
            input.checked = false;
            toggle.classList.remove('active');
        }
    });
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';
    
    applyFilters();
}

function sortProducts(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // featured
            break;
    }
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const count = filteredProducts.length;
        resultsCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
}

// Mobile Filters
function openMobileFilters() {
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
        drawer.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

function closeMobileFilters() {
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
        drawer.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// ==========================================
// VIEW SWITCHING
// ==========================================

function changeView(view) {
    currentView = view;
    
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.setAttribute('data-view', view);
    }
}

// ==========================================
// PREMIUM PRODUCT MODAL
// ==========================================

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    
    if (!modal || !modalContent) return;
    
    const images = product.images && product.images.length > 0 
        ? [product.image, ...product.images] 
        : [product.image];
    
    const monthlyPayment = (product.price / 4).toFixed(2);
    
    currentModalQuantity = 1;
    
    modalContent.innerHTML = `
        <div class="modal-grid">
            <div class="modal-left">
                <div class="modal-image-container">
                    <img src="${images[0]}" alt="${escapeHtml(product.name)}" class="modal-main-image" id="modal-main-img">
                </div>
                ${images.length > 1 ? `
                    <div class="modal-thumbnails">
                        ${images.map((img, idx) => `
                            <img src="${img}" 
                                 alt="${escapeHtml(product.name)}" 
                                 class="modal-thumbnail ${idx === 0 ? 'active' : ''}" 
                                 onclick="changeModalImage('${img}', this)">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-right">
                <div class="modal-header">
                    <h2>${escapeHtml(product.name)}</h2>
                    <div class="modal-price-row">
                        <div class="modal-price">$${product.price.toFixed(2)}</div>
                        <div class="modal-stock ${product.inStock ? '' : 'out-of-stock'}">
                            <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            ${product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                    </div>
                    <div class="modal-payment-info">
                        <i class="fas fa-credit-card"></i>
                        <span>or 4 interest-free payments of $${monthlyPayment}</span>
                        <div class="modal-payment-logos">
                            <span class="modal-payment-logo">Klarna</span>
                            <span class="modal-payment-logo">Afterpay</span>
                        </div>
                    </div>
                </div>
                
                ${product.description ? `
                    <p class="modal-description">${escapeHtml(product.description)}</p>
                ` : ''}
                
                ${(product.features && product.features.length > 0) || product.specifications ? `
                    <div class="modal-tabs">
                        ${product.features && product.features.length > 0 ? `
                            <button class="modal-tab active" onclick="switchModalTab('features')">
                                Features
                            </button>
                        ` : ''}
                        ${product.specifications ? `
                            <button class="modal-tab ${!product.features ? 'active' : ''}" onclick="switchModalTab('specs')">
                                Specifications
                            </button>
                        ` : ''}
                    </div>
                    
                    ${product.features && product.features.length > 0 ? `
                        <div class="modal-tab-content active" id="features-content">
                            <div class="modal-features">
                                <ul>
                                    ${product.features.map(feature => `
                                        <li>${escapeHtml(feature)}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${product.specifications ? `
                        <div class="modal-tab-content ${!product.features ? 'active' : ''}" id="specs-content">
                            <div class="specs-grid">
                                ${Object.entries(product.specifications).map(([key, value]) => `
                                    <div class="spec-item">
                                        <div class="spec-label">${formatSpecLabel(key)}</div>
                                        <div class="spec-value">${escapeHtml(value)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                ` : ''}
                
                <div class="modal-actions">
                    <div class="modal-quantity">
                        <label>Quantity:</label>
                        <div class="quantity-selector">
                            <button class="qty-btn-modal" onclick="updateModalQuantity(-1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-display-modal" id="modal-qty-display">1</span>
                            <button class="qty-btn-modal" onclick="updateModalQuantity(1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="modal-add-to-cart" onclick="addToCartFromModal(${product.id})">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Add to Cart - $${product.price.toFixed(2)}</span>
                    </button>
                    <div class="modal-trust-badges">
                        <div class="modal-trust-badge">
                            <i class="fas fa-shield-check"></i>
                            <span>100% Authentic</span>
                        </div>
                        <div class="modal-trust-badge">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Free Shipping</span>
                        </div>
                        <div class="modal-trust-badge">
                            <i class="fas fa-undo"></i>
                            <span>Easy Returns</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function updateModalQuantity(change) {
    currentModalQuantity = Math.max(1, currentModalQuantity + change);
    const qtyDisplay = document.getElementById('modal-qty-display');
    if (qtyDisplay) {
        qtyDisplay.textContent = currentModalQuantity;
    }
}

function switchModalTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetContent = document.getElementById(`${tab}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

function changeModalImage(imageSrc, thumbnail) {
    const mainImg = document.getElementById('modal-main-img');
    if (mainImg) {
        mainImg.src = imageSrc;
    }
    
    document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
    currentModalQuantity = 1;
}

function addToCartFromModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId && item.brand === brandName);
    
    if (existingItem) {
        existingItem.quantity += currentModalQuantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: getProductImage(product),
            brand: brandName,
            quantity: currentModalQuantity
        });
    }
    
    saveCart();
    closeModal();
    showToast(`${currentModalQuantity}x ${truncateText(product.name, 30)} added to cart!`);
}

// ==========================================
// CART FUNCTIONS (UNCHANGED)
// ==========================================

function loadCart() {
    const savedCart = localStorage.getItem('barber_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
    updateCartUI();
}

function quickAddToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId && item.brand === brandName);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: getProductImage(product),
            brand: brandName,
            quantity: 1
        });
    }
    
    saveCart();
    showToast(`${truncateText(product.name, 30)} added to cart!`);
}

function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.id === productId && i.brand === brandName);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
}

function removeFromCart(productId) {
    const product = cart.find(item => item.id === productId && item.brand === brandName);
    cart = cart.filter(item => !(item.id === productId && item.brand === brandName));
    saveCart();
    
    if (product) {
        showToast(`${truncateText(product.name, 30)} removed`);
    }
}

function updateCartUI() {
    updateCartBadge();
    updateCartItems();
    updateCartFooter();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateCartItems() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartItemsDiv) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="cart-empty">
                <div class="empty-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <p>Your cart is empty</p>
                <span>Start shopping now!</span>
            </div>
        `;
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${truncateText(item.name, 45)}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCartFooter() {
    const cartFooter = document.getElementById('cart-footer');
    const subtotalSpan = document.getElementById('cart-subtotal');
    const totalSpan = document.getElementById('cart-total');
    
    if (!cartFooter) return;
    
    if (cart.length === 0) {
        cartFooter.style.display = 'none';
        return;
    }
    
    cartFooter.style.display = 'block';
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (subtotalSpan) subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    if (totalSpan) totalSpan.textContent = `$${subtotal.toFixed(2)}`;
}

function openCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel) {
        updateCartUI();
        cartPanel.classList.add('active');
    }
    if (cartOverlay) {
        cartOverlay.classList.add('active');
    }
    document.body.classList.add('no-scroll');
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel) cartPanel.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

async function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }

    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    try {
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.brand,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lineItems: lineItems,
                successUrl: `${window.location.origin}/success.html`,
                cancelUrl: window.location.href
            })
        });

        if (!response.ok) throw new Error('Checkout failed');

        const { sessionId } = await response.json();
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) throw error;

    } catch (error) {
        console.error('Checkout error:', error);
        showToast(error.message || 'Checkout failed');

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> <span>Secure Checkout</span>';
        }
    }
}

// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menu) {
        menu.classList.toggle('active');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menu) menu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.remove('show', 'hiding');
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.classList.remove('show', 'hiding'), 500);
    }, 3000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getProductImage(product) {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }
    return product.image || 'https://via.placeholder.com/400x400?text=No+Image';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatSpecLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

console.log('%c🚀 Barber World NYC - Premium Redesign', 'color: #d4af37; font-size: 18px; font-weight: bold;');
console.log('%c✨ Modern, Elegant & Conversion-Optimized', 'color: #666; font-size: 12px;');
