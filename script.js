// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global Cart State (shared across all pages)
let cart = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    console.log('🚀 Barber World Homepage Loaded');
});

// ==========================================
// LOAD FEATURED PRODUCTS
// ==========================================
async function loadFeaturedProducts() {
    try {
        // Load all brand JSONs from json folder
        const brands = ['babyliss', 'stylecraft', 'jrl', 'wahl'];
        const promises = brands.map(brand => 
            fetch(`json/${brand}-products.json`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        const allProducts = results.flat();
        
        // Shuffle and get 8 random products
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 8);
        
        displayFeaturedProducts(featured);
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
    }
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id}, '${product.brand}')">
            <div class="product-image">
                <img src="${product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}" 
                     alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">${truncateText(product.name, 50)}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation();">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================
async function addToCart(productId, brandName) {
    try {
        // Load the correct brand JSON from json folder
        const brand = brandName.toLowerCase();
        const response = await fetch(`json/${brand}-products.json`);
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found');
            return;
        }
        
        const existingItem = cart.find(item => item.id === productId && item.brand === brandName);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({...product, quantity: 1});
        }
        
        saveCart();
        updateCartBadge();
        showNotification(`${product.name} added to cart!`);
        
        // Animate badge
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.style.transform = 'scale(1.3)';
            setTimeout(() => badge.style.transform = 'scale(1)', 300);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
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

function displayCart() {
    const container = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    
    if (cart.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'flex';
        footerEl.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}" alt="${item.name}">
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
        cart = JSON.parse(saved);
    }
}

function openCart() {
    displayCart();
    document.getElementById('cart-modal').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-modal').classList.remove('active');
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
        showNotification('Checkout failed. Please contact support.', 'error');
    }
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
async function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    try {
        const brands = ['babyliss', 'stylecraft', 'jrl', 'wahl'];
        const promises = brands.map(brand => 
            fetch(`json/${brand}-products.json`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        const allProducts = results.flat();
        
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query))
        ).slice(0, 10);
        
        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No results found</p>';
            return;
        }
        
        resultsContainer.innerHTML = filtered.map(product => `
            <div class="product-card" onclick="addToCart(${product.id}, '${product.brand}')">
                <div class="product-image">
                    <img src="${product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}" 
                         alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h3 class="product-name">${truncateText(product.name, 50)}</h3>
                    <div class="product-price">${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation();">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Search error:', error);
    }
}

function openSearch() {
    document.getElementById('search-modal').classList.add('active');
    document.getElementById('search-input').focus();
}

function closeSearch() {
    document.getElementById('search-modal').classList.remove('active');
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
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
        animation: slideInRight 0.3s ease;
        font-weight: 500;
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
    }, 3000);
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('active');
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('active');
}

// Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('✅ Barber World Homepage Ready');
