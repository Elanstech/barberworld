// ==========================================
// BARBER WORLD - COMPLETE SHOPPING SYSTEM
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE'; // Replace with your key
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// State Management
let allProducts = [];
let cart = [];
let currentView = 'home';
let currentCategory = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    loadCart();
    updateCartBadge();
});

// Load Products from JSON
async function loadAllProducts() {
    try {
        const response = await fetch('all-products.json');
        allProducts = await response.json();
        displayFeaturedProducts();
        console.log('✅ Products loaded:', allProducts.length);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback sample data
        allProducts = [
            {id: 1, name: "JRL Onyx Clipper", price: 225, brand: "JRL"},
            {id: 2, name: "Wahl Magic Clip", price: 150, brand: "Wahl"},
            {id: 3, name: "BaByliss FX Clipper", price: 229, brand: "Babyliss"},
            {id: 4, name: "StyleCraft Instinct", price: 269, brand: "StyleCraft"}
        ];
        displayFeaturedProducts();
    }
}

// Display Featured Products
function displayFeaturedProducts() {
    const container = document.getElementById('featured-products');
    const featured = allProducts.slice(0, 4);
    
    container.innerHTML = featured.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-image">
                <img src="${getProductImage(product)}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Load Products by Category
function loadProducts(category) {
    currentCategory = category;
    currentView = 'products';
    
    const filtered = allProducts.filter(p => 
        p.brand.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(p.brand.toLowerCase())
    );
    
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('products-view').style.display = 'block';
    document.getElementById('category-title').textContent = category;
    
    const grid = document.getElementById('products-grid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No products found</h3>
                <p style="color: #6c757d;">Try another category</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${getProductImage(product)}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
    
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Show Home
function showHome() {
    currentView = 'home';
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('products-view').style.display = 'none';
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Get Product Image
function getProductImage(product) {
    const name = product.name.toLowerCase();
    if (name.includes('clipper')) {
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
    } else if (name.includes('trimmer')) {
        return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop';
    } else if (name.includes('shaver')) {
        return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=400&h=300&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
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
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartBadge();
    showNotification(`${product.name} added to cart!`);
    
    // Animate cart button
    const cartBtn = document.querySelector('.cart-badge');
    cartBtn.style.transform = 'scale(1.3)';
    setTimeout(() => cartBtn.style.transform = 'scale(1)', 300);
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
                <img src="${getProductImage(item)}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
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
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-badge').textContent = count;
    document.getElementById('cart-badge').style.display = count > 0 ? 'flex' : 'none';
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
        // Create line items for Stripe
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.brand,
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));
        
        // Call your backend to create checkout session
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lineItems: lineItems,
                successUrl: window.location.origin + '/success.html',
                cancelUrl: window.location.origin + '/index.html',
            }),
        });
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        hideLoading();
        showNotification('Checkout failed. Please try again.', 'error');
        
        // For demo: show what would be sent to Stripe
        alert('DEMO MODE:\n\nYour cart items:\n' + 
            cart.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n') +
            `\n\nTotal: $${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}\n\n` +
            'To enable real checkout:\n1. Add your Stripe keys\n2. Create backend endpoint\n3. Follow setup instructions'
        );
        hideLoading();
    }
}

// ==========================================
// SEARCH
// ==========================================

function openSearch() {
    document.getElementById('search-modal').classList.add('active');
    document.getElementById('search-input').focus();
}

function closeSearch() {
    document.getElementById('search-modal').classList.remove('active');
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    ).slice(0, 8);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">No results found</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(product => `
        <div class="product-card" onclick="addToCart(${product.id}); closeSearch();">
            <div class="product-image">
                <img src="${getProductImage(product)}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id}); closeSearch();">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// UTILITIES
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
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
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

console.log('🚀 Barber World initialized');
