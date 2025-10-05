// ==========================================
// ULTIMATE SHOPPING EXPERIENCE ENGINE
// Modern, Fast, Beautiful
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
    updateCartDisplay();
});

// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================
async function loadProducts(brand) {
    try {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading amazing products...</p>
            </div>
        `;
        
        const jsonFile = brand === 'allproducts' ? '../json/all-products.json' : `../json/${brand}-products.json`;
        const response = await fetch(jsonFile);
        
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        updateProductCount();
        updateBrandTitle(brand);
        
        console.log(`✅ Loaded ${allProducts.length} premium products`);
    } catch (error) {
        console.error('❌ Error:', error);
        showErrorState();
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
    
    const titleEl = document.getElementById('brand-title');
    if (titleEl && titles[brand]) {
        titleEl.textContent = titles[brand];
    }
}

// ==========================================
// DISPLAY PRODUCTS WITH ANIMATIONS
// ==========================================
function displayProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.add('show');
        return;
    }
    
    if (emptyState) emptyState.classList.remove('show');
    
    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : 
                      product.image || 'https://via.placeholder.com/400';
    
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    const inStock = product.inStock !== false;
    
    const stars = generateStars(rating);
    
    return `
        <div class="product-card" onclick="openProductModal('${product.id}')">
            <div class="product-image-wrapper">
                <img src="${mainImage}" 
                     alt="${escapeHtml(product.name)}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/400'">
                
                ${inStock ? '<div class="in-stock-badge">In Stock</div>' : ''}
                
                <button class="add-to-cart-btn" 
                        onclick="event.stopPropagation(); addToCart('${product.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                
                ${rating > 0 ? `
                    <div class="product-rating">
                        <div class="stars">${stars}</div>
                        <span class="review-count">(${reviewCount})</span>
                    </div>
                ` : ''}
                
                <div class="product-price-wrapper">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// ==========================================
// FILTERS - SMART & FAST
// ==========================================
function handleSearch(value) {
    currentFilters.search = value.toLowerCase();
    applyFilters();
    
    const desktopSearch = document.getElementById('desktop-search');
    const mobileSearch = document.getElementById('mobile-search');
    if (desktopSearch) desktopSearch.value = value;
    if (mobileSearch) mobileSearch.value = value;
}

function handleCategoryFilter(category) {
    currentFilters.category = category;
    applyFilters();
    
    const allRadios = document.querySelectorAll('input[name="category"], input[name="mobile-category"]');
    allRadios.forEach(radio => {
        radio.checked = radio.value === category;
    });
}

function handlePriceFilter(range) {
    currentFilters.price = range;
    applyFilters();
    
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
            const searchLower = currentFilters.search;
            const matchesSearch = 
                product.name.toLowerCase().includes(searchLower) ||
                (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
                (product.description && product.description.toLowerCase().includes(searchLower)) ||
                (product.category && product.category.toLowerCase().includes(searchLower));
            
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
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
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
        if (clearAllBtn) clearAllBtn.classList.add('active');
    } else {
        if (filterCountEl) filterCountEl.style.display = 'none';
        if (clearAllBtn) clearAllBtn.classList.remove('active');
    }
}

// ==========================================
// PRODUCT MODAL - STUNNING!
// ==========================================
function openProductModal(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    
    if (!modal || !modalContent) return;
    
    // Get all images
    const images = product.images && product.images.length > 0 ? product.images : 
                   product.image ? [product.image] : ['https://via.placeholder.com/600'];
    
    const mainImage = images[0];
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    
    modalContent.innerHTML = `
        <div class="modal-grid">
            <div class="modal-image-section">
                <img src="${mainImage}" 
                     alt="${escapeHtml(product.name)}" 
                     class="modal-main-image" 
                     id="modal-main-image"
                     onerror="this.src='https://via.placeholder.com/600'">
                
                ${images.length > 1 ? `
                    <div class="modal-thumbnails">
                        ${images.map((img, index) => `
                            <img src="${img}" 
                                 alt="${escapeHtml(product.name)}" 
                                 class="modal-thumbnail ${index === 0 ? 'active' : ''}"
                                 onclick="changeModalImage('${img}', this)"
                                 onerror="this.src='https://via.placeholder.com/80'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-info-section">
                <div class="modal-brand">${escapeHtml(product.brand || 'Professional')}</div>
                <h2>${escapeHtml(product.name)}</h2>
                
                ${rating > 0 ? `
                    <div class="modal-rating">
                        <div class="modal-stars">${generateStars(rating)}</div>
                        <span class="modal-review-count">${reviewCount} reviews</span>
                    </div>
                ` : ''}
                
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                
                ${product.shortDescription ? `
                    <p class="modal-description"><strong>${escapeHtml(product.shortDescription)}</strong></p>
                ` : ''}
                
                ${product.description ? `
                    <p class="modal-description">${escapeHtml(product.description)}</p>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features">
                        <h4>Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    ${escapeHtml(feature)}
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
                                    <div class="spec-value">${escapeHtml(value)}</div>
                                </div>
                            `).join('')}
                        </div>
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
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = imageSrc;
            mainImage.style.opacity = '1';
        }, 150);
    }
    
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// ==========================================
// CART MANAGEMENT (From script.js)
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
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images && product.images[0] ? product.images[0] : product.image,
            brand: product.brand,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    updateCartDisplay();
    showNotification(`${truncateText(product.name, 30)} added to cart!`);
    
    // Animate cart badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id == productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    updateCartBadge();
    updateCartDisplay();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartBadge();
    updateCartDisplay();
    showNotification('Item removed from cart');
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    
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
            <img src="${item.image || 'https://via.placeholder.com/80'}" 
                 alt="${escapeHtml(item.name)}" 
                 class="cart-item-image"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="cart-item-details">
                <div class="cart-item-name">${truncateText(item.name, 35)}</div>
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
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
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
        
        // Replace with your server endpoint
        const response = await fetch('YOUR_SERVER_URL/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineItems })
        });
        
        const session = await response.json();
        await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Checkout error. Please try again.');
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

function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    const messageEl = document.getElementById('notification-message');
    
    if (!toast || !messageEl) return;
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showErrorState() {
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="empty-state show">
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

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcuts
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

// Export functions
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.changeModalImage = changeModalImage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
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
