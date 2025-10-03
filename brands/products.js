// ==========================================
// PRODUCTS PAGE - COMPLETE JAVASCRIPT
// Modern, Fast, Professional
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentBrand = '';
let currentView = 'grid';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    currentBrand = document.body.getAttribute('data-brand') || 'babyliss';
    loadCart();
    updateCartBadge();
    loadProducts();
    initializeScrollAnimations();
    console.log(`🚀 ${currentBrand} products page initialized`);
});

// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch(`../json/${currentBrand}-products.json`);
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        hideLoading();
        displayProducts();
        updateProductCount();
        
        console.log(`✅ Loaded ${allProducts.length} ${currentBrand} products`);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        hideLoading();
        showErrorState();
    }
}

function showErrorState() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Failed to Load Products</h3>
            <p>We couldn't load the products. Please try again.</p>
            <button onclick="location.reload()" class="empty-state-btn">
                <i class="fas fa-redo"></i> Refresh Page
            </button>
        </div>
    `;
}

// ==========================================
// DISPLAY PRODUCTS WITH ANIMATIONS
// ==========================================
function displayProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onclick="clearFilters()" class="empty-state-btn">
                    Clear All Filters
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    filteredProducts.forEach((product, index) => {
        const card = createProductCard(product, index);
        grid.appendChild(card);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const isNew = product.isNew || false;
    const isSale = product.oldPrice && product.oldPrice > product.price;
    
    card.innerHTML = `
        <div class="product-image-wrapper">
            <img src="${getProductImage(product)}" alt="${escapeHtml(product.name)}" class="product-image" loading="lazy">
            ${isNew ? '<div class="product-badge">New</div>' : ''}
            ${isSale ? '<div class="product-badge" style="background: #dc3545;">Sale</div>' : ''}
            <button class="quick-view-btn" onclick="quickView(${product.id})" aria-label="Quick View">
                <i class="fas fa-eye"></i>
            </button>
        </div>
        <div class="product-info">
            <div class="product-category">${escapeHtml(product.category || 'Product')}</div>
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <p class="product-description">${escapeHtml(product.shortDescription || product.description || '')}</p>
            <div class="product-footer">
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function getProductImage(product) {
    if (product.image) return product.image;
    if (product.images && product.images[0]) return product.images[0];
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop';
}

// ==========================================
// FILTERING & SORTING
// ==========================================
function filterProducts() {
    const searchDesktop = document.getElementById('product-search-desktop')?.value.toLowerCase() || '';
    const searchMobile = document.getElementById('product-search-mobile')?.value.toLowerCase() || '';
    const searchTerm = searchDesktop || searchMobile;
    
    const categoryDesktop = document.getElementById('category-filter-desktop')?.value || '';
    const categoryMobile = document.getElementById('category-filter-mobile')?.value || '';
    const category = categoryDesktop || categoryMobile;
    
    const priceDesktop = document.getElementById('price-filter-desktop')?.value || '';
    const priceMobile = document.getElementById('price-filter-mobile')?.value || '';
    const priceRange = priceDesktop || priceMobile;
    
    const sortDesktop = document.getElementById('sort-filter-desktop')?.value || 'name-asc';
    const sortMobile = document.getElementById('sort-filter-mobile')?.value || 'name-asc';
    const sortBy = sortDesktop || sortMobile;
    
    syncFilterValues(searchTerm, category, priceRange, sortBy);
    
    filteredProducts = [...allProducts];
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.category && p.category.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply category filter
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Apply price filter
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });
    
    displayProducts();
    updateProductCount();
}

function syncFilterValues(search, category, price, sort) {
    const searchDesktop = document.getElementById('product-search-desktop');
    const searchMobile = document.getElementById('product-search-mobile');
    const categoryDesktop = document.getElementById('category-filter-desktop');
    const categoryMobile = document.getElementById('category-filter-mobile');
    const priceDesktop = document.getElementById('price-filter-desktop');
    const priceMobile = document.getElementById('price-filter-mobile');
    const sortDesktop = document.getElementById('sort-filter-desktop');
    const sortMobile = document.getElementById('sort-filter-mobile');
    
    if (searchDesktop) searchDesktop.value = search;
    if (searchMobile) searchMobile.value = search;
    if (categoryDesktop) categoryDesktop.value = category;
    if (categoryMobile) categoryMobile.value = category;
    if (priceDesktop) priceDesktop.value = price;
    if (priceMobile) priceMobile.value = price;
    if (sortDesktop) sortDesktop.value = sort;
    if (sortMobile) sortMobile.value = sort;
}

function clearFilters() {
    const inputs = [
        'product-search-desktop',
        'product-search-mobile',
        'category-filter-desktop',
        'category-filter-mobile',
        'price-filter-desktop',
        'price-filter-mobile'
    ];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    const sorts = ['sort-filter-desktop', 'sort-filter-mobile'];
    sorts.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 'name-asc';
    });
    
    filterProducts();
}

function updateProductCount() {
    const countElements = document.querySelectorAll('.products-count');
    countElements.forEach(el => {
        el.innerHTML = `Showing <strong>${filteredProducts.length}</strong> of <strong>${allProducts.length}</strong> products`;
    });
}

// ==========================================
// MOBILE FILTERS
// ==========================================
function openFilters() {
    const panel = document.getElementById('mobile-filters-panel');
    if (panel) {
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFilters() {
    const panel = document.getElementById('mobile-filters-panel');
    if (panel) {
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function applyFilters() {
    closeFilters();
    filterProducts();
}

// ==========================================
// VIEW TOGGLE
// ==========================================
function toggleView(view) {
    currentView = view;
    
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    const productsGrid = document.getElementById('products-grid');
    
    if (gridBtn && listBtn && productsGrid) {
        if (view === 'grid') {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            productsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            productsGrid.style.gridTemplateColumns = '1fr';
        }
    }
}

// ==========================================
// QUICK VIEW
// ==========================================
function quickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    showNotification(`Quick view for ${product.name} - Feature coming soon!`, 'info');
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: getProductImage(product),
            brand: product.brand,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    displayCart();
    
    // Visual feedback
    const btn = event.target.closest('.add-to-cart-btn');
    if (btn) {
        const originalHTML = btn.innerHTML;
        btn.classList.add('added');
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = originalHTML;
        }, 2000);
    }
    
    showNotification(`${product.name} added to cart!`, 'success');
}

function updateCart(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    updateCartBadge();
    displayCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    displayCart();
    showNotification('Item removed from cart', 'info');
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-value');
    
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
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${escapeHtml(truncateText(item.name, 60))}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCart(${item.id}, -1)">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCart(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('barber_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }
}

function openCart() {
    displayCart();
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================
// CHECKOUT
// ==========================================
async function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `${item.brand} - Professional Equipment`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));
        
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lineItems }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Checkout failed');
        }
        
        const result = await stripe.redirectToCheckout({
            sessionId: data.id,
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        hideLoading();
        showNotification('Checkout failed. Please try again.', 'error');
    }
}

// ==========================================
// SEARCH
// ==========================================
function openSearch() {
    showNotification('Search feature - Focus on the filters above!', 'info');
    const searchInput = document.getElementById('product-search-desktop') || document.getElementById('product-search-mobile');
    if (searchInput) {
        searchInput.focus();
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'info' ? 'info-circle' : 'check-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.4s reverse';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

function showLoading() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-overlay')) {
        closeCart();
    }
    if (e.target.closest('.mobile-filters-panel') === null && e.target.closest('.filters-toggle-btn') === null) {
        const panel = document.getElementById('mobile-filters-panel');
        if (panel && panel.classList.contains('active') && !e.target.closest('.mobile-filters-content')) {
            closeFilters();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCart();
        closeFilters();
    }
});

console.log('✨ Products page JavaScript loaded successfully');
