// ==========================================
// PRODUCTS PAGE - UNIFIED JAVASCRIPT
// Smart Shopping Experience
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentFilters = {
    search: '',
    category: 'all',
    price: 'all',
    sort: 'name-asc'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const brand = document.body.getAttribute('data-brand');
    loadProducts(brand);
    loadCart();
    updateCartBadge();
    setupEventListeners();
});

// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================
async function loadProducts(brand) {
    try {
        showLoading();
        
        // Determine JSON file based on brand
        let jsonFile = '';
        if (brand === 'allproducts') {
            jsonFile = '../json/all-products.json';
        } else {
            jsonFile = `../json/${brand}-products.json`;
        }
        
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        hideLoading();
        displayProducts();
        updateProductCount();
        updateBrandTitle(brand);
        
        console.log(`✅ Loaded ${allProducts.length} products for ${brand}`);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        hideLoading();
        showError();
    }
}

function updateBrandTitle(brand) {
    const titles = {
        'babyliss': 'BaByliss Professional',
        'stylecraft': 'StyleCraft Gamma',
        'jrl': 'JRL Professional',
        'wahl': 'Wahl Professional',
        'wmark': 'W-Mark Professional',
        'ourbrand': 'Our Brand',
        'allproducts': 'All Products'
    };
    
    const titleElement = document.getElementById('brand-title');
    if (titleElement && titles[brand]) {
        titleElement.textContent = titles[brand];
    }
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================
function displayProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discount = hasDiscount ? product.originalPrice - product.price : 0;
    const mainImage = product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/400';
    
    return `
        <div class="product-card" onclick="openProductModal('${product.id}')">
            <div class="product-image-wrapper">
                <img src="${mainImage}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/400'">
                
                ${hasDiscount ? `<div class="sale-badge">SALE</div>` : ''}
                
                <button class="add-to-cart-btn" 
                        onclick="event.stopPropagation(); addToCart('${product.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price-wrapper">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    ${hasDiscount ? `
                        <span class="product-original-price">$${product.originalPrice.toFixed(2)}</span>
                        <span class="save-amount">Save $${discount.toFixed(2)}</span>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// FILTERS
// ==========================================
function handleSearch(value) {
    currentFilters.search = value.toLowerCase();
    applyFilters();
    
    // Sync search inputs
    const desktopSearch = document.getElementById('desktop-search');
    const mobileSearch = document.getElementById('mobile-search');
    if (desktopSearch) desktopSearch.value = value;
    if (mobileSearch) mobileSearch.value = value;
}

function handleCategoryFilter(category) {
    currentFilters.category = category;
    applyFilters();
    
    // Sync radio buttons
    const allRadios = document.querySelectorAll('input[name="category"], input[name="mobile-category"]');
    allRadios.forEach(radio => {
        radio.checked = radio.value === category;
    });
}

function handlePriceFilter(range) {
    currentFilters.price = range;
    applyFilters();
    
    // Sync radio buttons
    const allRadios = document.querySelectorAll('input[name="price"], input[name="mobile-price"]');
    allRadios.forEach(radio => {
        radio.checked = radio.value === range;
    });
}

function handleSort(sortBy) {
    currentFilters.sort = sortBy;
    applyFilters();
}

function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const matchesSearch = 
                product.name.toLowerCase().includes(searchLower) ||
                (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
                (product.description && product.description.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;
        }
        
        // Category filter
        if (currentFilters.category !== 'all') {
            if (product.category !== currentFilters.category) return false;
        }
        
        // Price filter
        if (currentFilters.price !== 'all') {
            const [min, max] = currentFilters.price.split('-').map(Number);
            if (product.price < min || product.price > max) return false;
        }
        
        return true;
    });
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });
    
    displayProducts();
    updateProductCount();
    updateFilterCount();
}

function clearAllFilters() {
    currentFilters = {
        search: '',
        category: 'all',
        price: 'all',
        sort: 'name-asc'
    };
    
    // Reset all inputs
    const searchInputs = document.querySelectorAll('.filter-search-input');
    searchInputs.forEach(input => input.value = '');
    
    const categoryRadios = document.querySelectorAll('input[name="category"], input[name="mobile-category"]');
    categoryRadios.forEach(radio => {
        radio.checked = radio.value === 'all';
    });
    
    const priceRadios = document.querySelectorAll('input[name="price"], input[name="mobile-price"]');
    priceRadios.forEach(radio => {
        radio.checked = radio.value === 'all';
    });
    
    const sortSelects = document.querySelectorAll('.filter-select');
    sortSelects.forEach(select => select.value = 'name-asc');
    
    applyFilters();
}

function updateProductCount() {
    const showingCount = document.getElementById('showing-count');
    const totalCount = document.getElementById('total-count');
    const filteredCount = document.getElementById('filtered-count');
    
    if (showingCount) showingCount.textContent = filteredProducts.length;
    if (totalCount) totalCount.textContent = allProducts.length;
    if (filteredCount) filteredCount.textContent = filteredProducts.length;
}

function updateFilterCount() {
    let count = 0;
    if (currentFilters.search) count++;
    if (currentFilters.category !== 'all') count++;
    if (currentFilters.price !== 'all') count++;
    
    const filterCountEl = document.getElementById('active-filter-count');
    const filterCountNumber = document.getElementById('filter-count-number');
    const clearAllBtn = document.getElementById('clear-all-btn');
    
    if (count > 0) {
        if (filterCountEl) filterCountEl.style.display = 'flex';
        if (filterCountNumber) filterCountNumber.textContent = count;
        if (clearAllBtn) clearAllBtn.style.display = 'block';
    } else {
        if (filterCountEl) filterCountEl.style.display = 'none';
        if (clearAllBtn) clearAllBtn.style.display = 'none';
    }
}

// ==========================================
// PRODUCT MODAL
// ==========================================
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    
    if (!modal || !modalContent) return;
    
    const mainImage = product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/600';
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    
    modalContent.innerHTML = `
        <div class="modal-grid">
            <div class="modal-image-section">
                <img src="${mainImage}" 
                     alt="${product.name}" 
                     class="modal-main-image" 
                     id="modal-main-image"
                     onerror="this.src='https://via.placeholder.com/600'">
                
                ${product.images && product.images.length > 1 ? `
                    <div class="modal-thumbnails">
                        ${product.images.map((img, index) => `
                            <img src="${img}" 
                                 alt="${product.name}" 
                                 class="modal-thumbnail ${index === 0 ? 'active' : ''}"
                                 onclick="changeModalImage('${img}', this)"
                                 onerror="this.src='https://via.placeholder.com/60'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-info-section">
                <div class="modal-brand">${product.brand || 'Professional'}</div>
                <h2>${product.name}</h2>
                
                <div class="modal-price">
                    $${product.price.toFixed(2)}
                    ${hasDiscount ? `
                        <span style="text-decoration: line-through; font-size: 1.25rem; color: var(--gray-600); margin-left: 0.5rem;">
                            $${product.originalPrice.toFixed(2)}
                        </span>
                    ` : ''}
                </div>
                
                ${product.description ? `
                    <p class="modal-description">${product.description}</p>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features">
                        <h4>Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li><i class="fas fa-check"></i> ${feature}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${product.specifications ? `
                    <div class="modal-features">
                        <h4>Specifications</h4>
                        <ul>
                            ${Object.entries(product.specifications).map(([key, value]) => `
                                <li><i class="fas fa-info-circle"></i> <strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <button class="modal-add-to-cart" onclick="addToCart('${product.id}'); closeProductModal();">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart - $${product.price.toFixed(2)}
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function changeModalImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// ==========================================
// CART MANAGEMENT
// ==========================================
function loadCart() {
    const savedCart = localStorage.getItem('barberworld_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('barberworld_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    updateCartDisplay();
    
    // Show feedback
    showAddedToCartFeedback(product.name);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    updateCartDisplay();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/80'}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel) {
        cartPanel.classList.add('active');
        updateCartDisplay();
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel) {
        cartPanel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function proceedToCheckout() {
    if (cart.length === 0) return;
    
    try {
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.images && item.images[0] ? [item.images[0]] : []
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));
        
        const response = await fetch('https://your-server.com/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineItems })
        });
        
        const session = await response.json();
        await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your checkout. Please try again.');
    }
}

// ==========================================
// UI HELPERS
// ==========================================
function toggleFilters() {
    const panel = document.getElementById('mobile-filter-panel');
    if (panel) {
        panel.classList.toggle('active');
        document.body.style.overflow = panel.classList.contains('active') ? 'hidden' : '';
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
}

function showLoading() {
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
    }
}

function hideLoading() {
    // Loading removed when products display
}

function showError() {
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Failed to load products</h3>
                <p>Please refresh the page to try again</p>
                <button class="reset-btn" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Reload Page
                </button>
            </div>
        `;
    }
}

function showAddedToCartFeedback(productName) {
    // You can add a toast notification here
    console.log(`✅ Added ${productName} to cart`);
}

function setupEventListeners() {
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCart();
            const filterPanel = document.getElementById('mobile-filter-panel');
            if (filterPanel && filterPanel.classList.contains('active')) {
                toggleFilters();
            }
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
}

// ==========================================
// MOBILE MENU & HEADER FUNCTIONS
// ==========================================
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
}

// ==========================================
// EXPORT FOR OTHER SCRIPTS
// ==========================================
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.changeModalImage = changeModalImage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.proceedToCheckout = proceedToCheckout;
window.toggleFilters = toggleFilters;
window.toggleMobileMenu = toggleMobileMenu;
window.handleSearch = handleSearch;
window.handleCategoryFilter = handleCategoryFilter;
window.handlePriceFilter = handlePriceFilter;
window.handleSort = handleSort;
window.clearAllFilters = clearAllFilters;
