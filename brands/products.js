/* ==========================================
   PREMIUM SHOPPING EXPERIENCE ENGINE
   Production-Ready, Smooth, Professional
   ========================================== */

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

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const brand = document.body.getAttribute('data-brand');
    loadProducts(brand);
    loadCart();
    updateCartBadge();
    initializeEventListeners();
    console.log('🎯 Premium Shopping Experience Loaded!');
});

function initializeEventListeners() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.querySelector('.action-btn.mobile-only');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMobileMenu();
            }
        }
    });
}

// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================

async function loadProducts(brand) {
    try {
        const grid = document.getElementById('products-grid');
        const countEl = document.getElementById('products-count');
        
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <div style="width: 60px; height: 60px; border: 4px solid var(--gold); border-top-color: transparent; border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite;"></div>
                <p style="color: var(--gray-600); font-weight: 600;">Loading premium products...</p>
            </div>
        `;
        
        const jsonFile = `../json/${brand}-products.json`;
        const response = await fetch(jsonFile);
        
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        applyFilters();
        
        console.log(`✅ Loaded ${allProducts.length} products`);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        const grid = document.getElementById('products-grid');
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--gray-600);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gold); margin-bottom: 1rem;"></i>
                <h3>Oops! Unable to load products</h3>
                <p style="margin-top: 0.5rem;">Please refresh the page or try again later.</p>
            </div>
        `;
    }
}

// ==========================================
// FILTER & SORT SYSTEM
// ==========================================

function applyFilters() {
    // Get filter values
    const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoryValue = document.querySelector('input[name="category"]:checked')?.value || 'all';
    const priceValue = document.querySelector('input[name="price"]:checked')?.value || 'all';
    const sortValue = document.getElementById('sort-select')?.value || 'name-asc';
    
    currentFilters = {
        search: searchValue,
        category: categoryValue,
        price: priceValue,
        sort: sortValue
    };
    
    // Apply filters
    filteredProducts = allProducts.filter(product => {
        // Search filter
        if (searchValue && !product.name.toLowerCase().includes(searchValue)) {
            return false;
        }
        
        // Category filter
        if (categoryValue !== 'all' && product.category !== categoryValue) {
            return false;
        }
        
        // Price filter
        if (priceValue !== 'all') {
            const [min, max] = priceValue.split('-').map(Number);
            if (product.price < min || product.price > max) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });
    
    renderProducts();
}

function clearAllFilters() {
    // Reset search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Reset category
    const allCategoryRadio = document.querySelector('input[name="category"][value="all"]');
    if (allCategoryRadio) allCategoryRadio.checked = true;
    
    // Reset price
    const allPriceRadio = document.querySelector('input[name="price"][value="all"]');
    if (allPriceRadio) allPriceRadio.checked = true;
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'name-asc';
    
    // Reset mobile filters
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.dataset.category === 'all' || pill.dataset.price === 'all') {
            pill.classList.add('active');
        }
    });
    
    applyFilters();
}

// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('products-count');
    
    if (filteredProducts.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        if (countEl) countEl.textContent = 'No products found';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    if (countEl) {
        countEl.innerHTML = `Showing <strong>${filteredProducts.length}</strong> ${filteredProducts.length === 1 ? 'product' : 'products'}`;
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image-wrapper">
                ${product.inStock !== false ? 
                    '<div class="product-stock-badge">In Stock</div>' : 
                    '<div class="product-stock-badge out-of-stock">Out of Stock</div>'
                }
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-image" loading="lazy">
                <button class="product-quick-add" onclick="event.stopPropagation(); addToCart(${product.id});">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                ${product.rating ? `
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStars(product.rating)}
                        </div>
                        ${product.reviewCount ? `<span class="review-count">(${product.reviewCount})</span>` : ''}
                    </div>
                ` : ''}
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fas fa-star star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt star"></i>';
        } else {
            starsHTML += '<i class="far fa-star star empty"></i>';
        }
    }
    
    return starsHTML;
}

// ==========================================
// PRODUCT MODAL
// ==========================================

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    const images = product.images && product.images.length > 0 ? 
        [product.image, ...product.images] : [product.image];
    
    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="modal-images">
                <img id="modal-main-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" class="modal-main-image">
                ${images.length > 1 ? `
                    <div class="modal-thumbnails">
                        ${images.map((img, idx) => `
                            <img src="${escapeHtml(img)}" 
                                 alt="${escapeHtml(product.name)}" 
                                 class="modal-thumbnail ${idx === 0 ? 'active' : ''}" 
                                 onclick="changeModalImage('${escapeHtml(img)}', this)">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-details">
                <h2>${escapeHtml(product.name)}</h2>
                
                ${product.rating ? `
                    <div class="product-rating" style="margin-bottom: 1rem;">
                        <div class="stars">
                            ${generateStars(product.rating)}
                        </div>
                        ${product.reviewCount ? `<span class="review-count">(${product.reviewCount} reviews)</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                
                ${product.inStock !== false ? 
                    '<div class="modal-stock"><i class="fas fa-check-circle"></i> In Stock</div>' : 
                    '<div class="modal-stock" style="background: rgba(220, 53, 69, 0.1); color: #dc3545;"><i class="fas fa-times-circle"></i> Out of Stock</div>'
                }
                
                ${product.shortDescription ? `
                    <p style="color: var(--gray-600); margin-bottom: 2rem; line-height: 1.8;">${escapeHtml(product.shortDescription)}</p>
                ` : ''}
                
                ${product.description ? `
                    <div class="modal-description">
                        ${escapeHtml(product.description)}
                    </div>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features">
                        <h4>Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    <span>${escapeHtml(feature)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${product.specifications ? `
                    <div class="modal-specs">
                        <h4>Specifications</h4>
                        <div class="specs-grid">
                            ${Object.entries(product.specifications).map(([key, value]) => `
                                <div class="spec-item">
                                    <div class="spec-label">${escapeHtml(key)}</div>
                                    <div class="spec-value">${escapeHtml(String(value))}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button class="modal-add-to-cart" onclick="addToCart(${product.id}); closeProductModal();">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart - $${product.price.toFixed(2)}
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeProductModal(event) {
    if (event && event.target.id !== 'product-modal') return;
    
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function changeModalImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = imageSrc;
            mainImage.style.opacity = '1';
        }, 150);
    }
    
    document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

// ==========================================
// MOBILE FILTERS
// ==========================================

function toggleMobileFilters() {
    const overlay = document.getElementById('mobile-filters-overlay');
    const panel = document.getElementById('mobile-filters-panel');
    
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    } else {
        panel.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

function selectMobileCategory(button, category) {
    // Update visual state
    document.querySelectorAll('.filter-pill[data-category]').forEach(pill => {
        pill.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update desktop radio
    const radio = document.querySelector(`input[name="category"][value="${category}"]`);
    if (radio) radio.checked = true;
    
    applyFilters();
}

function selectMobilePrice(button, price) {
    // Update visual state
    document.querySelectorAll('.filter-pill[data-price]').forEach(pill => {
        pill.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update desktop radio
    const radio = document.querySelector(`input[name="price"][value="${price}"]`);
    if (radio) radio.checked = true;
    
    applyFilters();
}

// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
        if (menu.classList.contains('active')) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
}

// ==========================================
// CART MANAGEMENT
// ==========================================

function loadCart() {
    const savedCart = localStorage.getItem('barberworld_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('barberworld_cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartBadge();
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        const productImages = product.images && product.images.length > 0 ? 
            [product.image, ...product.images] : [product.image];
        
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: productImages[0],
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showNotification('Item removed from cart');
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
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
    const cartFooter = document.getElementById('cart-footer');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }
    
    if (cartFooter) cartFooter.style.display = 'block';
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel && cartOverlay) {
        updateCartDisplay();
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel && cartOverlay) {
        cartPanel.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// ==========================================
// CHECKOUT
// ==========================================

async function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    try {
        showNotification('Processing checkout...');
        
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : []
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));
        
        const response = await fetch('https://barber-world-stripe.vercel.app/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lineItems })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Checkout failed');
        }
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL received');
        }
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        showNotification('Checkout failed. Please try again.');
    }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    const messageEl = document.getElementById('notification-message');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// ADD SPIN ANIMATION FOR LOADING
// ==========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('✨ Premium Shopping Experience Ready!');
