// ==========================================
// PRODUCTS PAGE - UNIFIED JAVASCRIPT
// Modern, Fast, 
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentBrand = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    currentBrand = document.body.getAttribute('data-brand') || 'babyliss';
    loadCart();
    updateCartBadge();
    loadProducts();
    initializeScrollAnimations();
    console.log(`🚀 ${currentBrand} products page loaded`);
});

// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================
async function loadProducts() {
    try {
        const response = await fetch(`../json/${currentBrand}-products.json`);
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        updateProductCount();
        
        console.log(`✅ Loaded ${allProducts.length} ${currentBrand} products`);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showErrorState();
    }
}

function showErrorState() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
            <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem; display: block;"></i>
            <h3 style="color: #666; margin-bottom: 0.5rem;">Failed to load products</h3>
            <p style="color: #999; margin-bottom: 1.5rem;">Please try refreshing the page</p>
            <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: var(--gold); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Refresh Page
            </button>
        </div>
    `;
}

// ==========================================
// DISPLAY PRODUCTS WITH ANIMATIONS
// ==========================================
function displayProducts() {
    const grid = document.getElementById('products-grid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem; display: block;"></i>
                <h3 style="color: #666; margin-bottom: 0.5rem;">No products found</h3>
                <p style="color: #999;">Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    // Add staggered fade-in animation
    grid.innerHTML = filteredProducts.map((product, index) => {
        const card = createProductCard(product);
        return card.replace('<div class="product-card"', 
            `<div class="product-card" style="animation: fadeInUp 0.5s ease forwards; animation-delay: ${Math.min(index * 0.05, 0.5)}s; opacity: 0;"`);
    }).join('');
}

function createProductCard(product) {
    const rating = product.rating || 4.5;
    const reviewCount = product.reviewCount || 0;
    const stars = generateStars(rating);
    
    return `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <img src="${getProductImage(product)}" alt="${escapeHtml(product.name)}" loading="lazy">
                ${!product.inStock ? '<div class="product-badge">Out of Stock</div>' : ''}
            </div>
            <div class="product-info">
                <div>
                    <span class="product-brand">${escapeHtml(product.brand)}</span>
                    ${product.category ? `<span class="product-category">${escapeHtml(product.category)}</span>` : ''}
                </div>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                ${reviewCount > 0 ? `
                    <div class="product-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-count">(${reviewCount})</span>
                    </div>
                ` : ''}
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartQuick(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

function getProductImage(product) {
    if (product.image) return product.image;
    if (product.images && product.images[0]) return product.images[0];
    
    // Fallback images based on category
    const name = product.name.toLowerCase();
    if (name.includes('trimmer')) return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&h=600&fit=crop';
    if (name.includes('shaver')) return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=600&h=600&fit=crop';
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop';
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// FILTERING & SORTING
// ==========================================
function filterProducts() {
    // Get values from both desktop and mobile filters
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
    
    // Sync filter values between desktop and mobile
    syncFilterValues(searchTerm, category, priceRange, sortBy);
    
    // Start with all products
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
        filteredProducts = filteredProducts.filter(p => 
            p.price >= min && p.price <= max
        );
    }
    
    // Apply sorting
    applySorting(sortBy);
    
    displayProducts();
    updateProductCount();
    
    // Add smooth scroll to top on mobile after filtering
    if (window.innerWidth <= 1024) {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }
}

function syncFilterValues(search, category, price, sort) {
    // Sync desktop and mobile filter values
    const searchDesktop = document.getElementById('product-search-desktop');
    const searchMobile = document.getElementById('product-search-mobile');
    if (searchDesktop && searchMobile) {
        searchDesktop.value = search;
        searchMobile.value = search;
    }
    
    const categoryDesktop = document.getElementById('category-filter-desktop');
    const categoryMobile = document.getElementById('category-filter-mobile');
    if (categoryDesktop && categoryMobile) {
        categoryDesktop.value = category;
        categoryMobile.value = category;
    }
    
    const priceDesktop = document.getElementById('price-filter-desktop');
    const priceMobile = document.getElementById('price-filter-mobile');
    if (priceDesktop && priceMobile) {
        priceDesktop.value = price;
        priceMobile.value = price;
    }
    
    const sortDesktop = document.getElementById('sort-filter-desktop');
    const sortMobile = document.getElementById('sort-filter-mobile');
    if (sortDesktop && sortMobile) {
        sortDesktop.value = sort;
        sortMobile.value = sort;
    }
}

function applySorting(sortBy) {
    switch(sortBy) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
    }
}

function clearFilters() {
    // Clear all filter inputs
    ['desktop', 'mobile'].forEach(type => {
        const search = document.getElementById(`product-search-${type}`);
        const category = document.getElementById(`category-filter-${type}`);
        const price = document.getElementById(`price-filter-${type}`);
        const sort = document.getElementById(`sort-filter-${type}`);
        
        if (search) search.value = '';
        if (category) category.value = '';
        if (price) price.value = '';
        if (sort) sort.value = 'name-asc';
    });
    
    filterProducts();
    showNotification('Filters cleared', 'success');
}

function updateProductCount() {
    const count = filteredProducts.length;
    const total = allProducts.length;
    const countEl = document.getElementById('products-count');
    if (countEl) {
        countEl.textContent = count === total 
            ? `Showing all ${total} products` 
            : `Showing ${count} of ${total} products`;
    }
}

// ==========================================
// MOBILE FILTERS DRAWER
// ==========================================
function toggleMobileFilters() {
    const overlay = document.getElementById('mobile-filters-overlay');
    const drawer = document.getElementById('mobile-filters-drawer');
    
    if (!overlay || !drawer) return;
    
    const isActive = overlay.classList.contains('active');
    
    if (isActive) {
        // Close
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        // Open
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ==========================================
// PRODUCT MODAL
// ==========================================
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const images = product.images || [getProductImage(product)];
    const features = product.features || [];
    const specs = product.specifications || {};
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="modal-gallery">
            <div class="main-image">
                <img src="${images[0]}" alt="${escapeHtml(product.name)}" id="main-product-image">
            </div>
            ${images.length > 1 ? `
                <div class="thumbnail-images">
                    ${images.map((img, idx) => `
                        <div class="thumbnail ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                            <img src="${img}" alt="View ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="modal-details">
            <h2>${escapeHtml(product.name)}</h2>
            <div class="modal-meta">
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                <span class="stock-badge ${product.inStock !== false ? '' : 'out-of-stock'}">
                    ${product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                </span>
                ${product.rating ? `
                    <div class="product-rating">
                        <div class="stars">${generateStars(product.rating)}</div>
                        <span class="rating-count">(${product.reviewCount || 0} reviews)</span>
                    </div>
                ` : ''}
            </div>
            
            ${product.shortDescription ? `
                <p class="modal-description"><strong>${escapeHtml(product.shortDescription)}</strong></p>
            ` : ''}
            
            ${product.description ? `
                <p class="modal-description">${escapeHtml(product.description)}</p>
            ` : ''}
            
            ${features.length > 0 ? `
                <div class="modal-features">
                    <h3>Key Features</h3>
                    <ul>
                        ${features.map(f => `<li><i class="fas fa-check-circle"></i> ${escapeHtml(f)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${Object.keys(specs).length > 0 ? `
                <div class="modal-specs">
                    <h3>Specifications</h3>
                    <div class="specs-grid">
                        ${Object.entries(specs).map(([key, value]) => `
                            <div class="spec-item">
                                <span class="spec-label">${formatSpecKey(key)}</span>
                                <span class="spec-value">${escapeHtml(String(value))}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="modal-actions">
                <button class="modal-add-to-cart" onclick="addToCartFromModal(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart - $${product.price.toFixed(2)}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function changeMainImage(src, thumbnail) {
    const mainImg = document.getElementById('main-product-image');
    if (mainImg) {
        // Smooth fade transition
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = src;
            mainImg.style.opacity = '1';
        }, 150);
    }
    
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    if (thumbnail) thumbnail.classList.add('active');
}

function formatSpecKey(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================
function addToCartQuick(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    addToCart(product);
}

function addToCartFromModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    addToCart(product);
    closeProductModal();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id && item.brand === product.brand);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartBadge();
    showNotification(`${truncateText(product.name, 40)} added to cart!`);
    
    // Animate badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.style.animation = 'none';
        setTimeout(() => {
            badge.style.animation = 'badgePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
    }
}

function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    displayCart();
    updateCartBadge();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
    updateCartBadge();
    showNotification('Item removed from cart');
}

function clearAllCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear all items from your cart?')) {
        cart = [];
        saveCart();
        displayCart();
        updateCartBadge();
        showNotification('Cart cleared successfully');
    }
}

function displayCart() {
    const container = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
        if (footerEl) footerEl.style.display = 'none';
        return;
    }
    
    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${getProductImage(item)}" alt="${escapeHtml(item.name)}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${truncateText(item.name, 40)}</div>
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
    
    updateCartTotal();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalEl = document.getElementById('cart-total');
    if (totalEl) {
        totalEl.textContent = `$${total.toFixed(2)}`;
    }
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
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

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// ==========================================
// STRIPE CHECKOUT
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
        showNotification('Checkout failed. Please contact support at barberworldnyc@gmail.com', 'error');
    }
}

// ==========================================
// GLOBAL SEARCH (ALL BRANDS)
// ==========================================
async function globalSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (!resultsContainer) return;
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    try {
        const brands = ['babyliss', 'stylecraft', 'jrl', 'wahl', 'wmark', 'vgr'];
        const promises = brands.map(brand => 
            fetch(`../json/${brand}-products.json`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        const allBrandProducts = results.flat();
        
        const filtered = allBrandProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(query))
        ).slice(0, 12);
        
        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No results found</p>';
            return;
        }
        
        resultsContainer.innerHTML = filtered.map(product => `
            <div class="search-result-card" onclick="redirectToProduct('${product.brand.toLowerCase()}', ${product.id})" style="cursor: pointer;">
                <div class="search-result-image">
                    <img src="${getProductImage(product)}" alt="${escapeHtml(product.name)}" loading="lazy">
                </div>
                <div class="search-result-info">
                    <span class="search-result-brand">${escapeHtml(product.brand)}</span>
                    <h4 class="search-result-name">${truncateText(product.name, 60)}</h4>
                    <div class="search-result-price">$${product.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 2rem;">Search error. Please try again.</p>';
    }
}

function redirectToProduct(brand, productId) {
    window.location.href = `${brand}.html#product-${productId}`;
}

function openSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    if (searchModal) {
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
}

function closeSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchModal) {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initializeScrollAnimations() {
    // Add CSS for fade-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes badgePop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        max-width: 350px;
        font-size: 0.95rem;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'error' ? 5000 : 3000);
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('active');
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('active');
}

// ==========================================
// ANIMATIONS STYLES
// ==========================================
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animationStyles);

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', (e) => {
    // ESC key closes modals
    if (e.key === 'Escape') {
        closeProductModal();
        closeCart();
        closeSearch();
        if (document.getElementById('mobile-filters-drawer')?.classList.contains('active')) {
            toggleMobileFilters();
        }
    }
    
    // Ctrl/Cmd + K opens search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
});

console.log('✅ Products page system ready');
console.log('💡 Tip: Press Ctrl+K to search, ESC to close modals');
