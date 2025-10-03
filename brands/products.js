// ==========================================
// PRODUCTS PAGE - COMPLETE JAVASCRIPT
// Clean, Modern, Professional
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentBrand = '';
let activeFilters = {
    search: '',
    category: '',
    priceRange: '',
    sort: 'name-asc'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    currentBrand = document.body.getAttribute('data-brand') || 'babyliss';
    loadCart();
    updateCartBadge();
    loadProducts();
    console.log(`🚀 ${currentBrand} products page initialized`);
});

// ==========================================
// LOAD PRODUCTS
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
        
        console.log(`✅ Loaded ${allProducts.length} products`);
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
            <p>Please try refreshing the page</p>
            <button onclick="location.reload()" class="empty-state-btn">
                <i class="fas fa-redo"></i> Refresh
            </button>
        </div>
    `;
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================
function displayProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters</p>
                <button onclick="clearAllFilters()" class="empty-state-btn">
                    Clear Filters
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
    
    animateProducts();
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${getProductImage(product)}" alt="${escapeHtml(product.name)}" class="product-image" loading="lazy">
            <button class="add-product-btn" onclick="openProductModal(${product.id})" aria-label="View Product">
                <i class="fas fa-plus"></i>
            </button>
        </div>
        <div class="product-info">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
    `;
    
    return card;
}

function getProductImage(product) {
    if (product.image) return product.image;
    if (product.images && product.images[0]) return product.images[0];
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop';
}

function animateProducts() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 30);
    });
}

// ==========================================
// PRODUCT MODAL
// ==========================================
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (!modal || !overlay) {
        createProductModal();
        setTimeout(() => openProductModal(productId), 100);
        return;
    }
    
    // Populate modal
    document.getElementById('modal-category').textContent = product.category || 'Product';
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-description').textContent = product.description || product.shortDescription || '';
    
    // Main image
    const mainImage = document.getElementById('modal-main-image');
    mainImage.src = getProductImage(product);
    
    // Thumbnails
    const thumbnailGrid = document.getElementById('thumbnail-grid');
    thumbnailGrid.innerHTML = '';
    
    const images = [product.image, ...(product.images || [])].filter(Boolean);
    images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${img}" alt="View ${index + 1}">`;
        thumb.onclick = () => {
            mainImage.src = img;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };
        thumbnailGrid.appendChild(thumb);
    });
    
    // Add to cart button
    const addBtn = document.getElementById('modal-add-to-cart');
    addBtn.onclick = () => {
        addToCart(productId);
        closeProductModal();
    };
    
    // Show modal
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function createProductModal() {
    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay" onclick="if(event.target === this) closeProductModal()">
            <div class="product-modal" id="product-modal">
                <button class="modal-close" onclick="closeProductModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-content">
                    <div class="modal-gallery">
                        <div class="main-image-container">
                            <img id="modal-main-image" class="modal-main-image" src="" alt="Product">
                        </div>
                        <div class="thumbnail-grid" id="thumbnail-grid"></div>
                    </div>
                    <div class="modal-details">
                        <div class="modal-category" id="modal-category">Product</div>
                        <h2 class="modal-title" id="modal-title"></h2>
                        <div class="modal-price" id="modal-price"></div>
                        <p class="modal-description" id="modal-description"></p>
                        <div class="modal-actions">
                            <button class="modal-add-to-cart" id="modal-add-to-cart">
                                <i class="fas fa-shopping-bag"></i>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ==========================================
// FILTERING
// ==========================================
function filterProducts() {
    // Get filter values
    const searchDesktop = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const searchMobile = document.getElementById('mobile-search')?.value.toLowerCase() || '';
    const search = searchDesktop || searchMobile;
    
    const categoryDesktop = document.getElementById('filter-category')?.value || '';
    const categoryMobile = document.getElementById('mobile-category')?.value || '';
    const category = categoryDesktop || categoryMobile;
    
    const priceDesktop = document.getElementById('filter-price')?.value || '';
    const priceMobile = document.getElementById('mobile-price')?.value || '';
    const priceRange = priceDesktop || priceMobile;
    
    const sortDesktop = document.getElementById('filter-sort')?.value || 'name-asc';
    const sortMobile = document.getElementById('mobile-sort')?.value || 'name-asc';
    const sort = sortDesktop || sortMobile;
    
    // Update active filters
    activeFilters = { search, category, priceRange, sort };
    
    // Sync values
    syncFilterValues();
    
    // Apply filters
    filteredProducts = [...allProducts];
    
    // Search filter
    if (search) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.description && p.description.toLowerCase().includes(search)) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(search)) ||
            (p.category && p.category.toLowerCase().includes(search))
        );
    }
    
    // Category filter
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Price filter
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    // Sort
    filteredProducts.sort((a, b) => {
        switch (sort) {
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
    displayActiveFilters();
}

function syncFilterValues() {
    // Desktop
    const desktopSearch = document.getElementById('filter-search');
    const desktopCategory = document.getElementById('filter-category');
    const desktopPrice = document.getElementById('filter-price');
    const desktopSort = document.getElementById('filter-sort');
    
    if (desktopSearch) desktopSearch.value = activeFilters.search;
    if (desktopCategory) desktopCategory.value = activeFilters.category;
    if (desktopPrice) desktopPrice.value = activeFilters.priceRange;
    if (desktopSort) desktopSort.value = activeFilters.sort;
    
    // Mobile
    const mobileSearch = document.getElementById('mobile-search');
    const mobileCategory = document.getElementById('mobile-category');
    const mobilePrice = document.getElementById('mobile-price');
    const mobileSort = document.getElementById('mobile-sort');
    
    if (mobileSearch) mobileSearch.value = activeFilters.search;
    if (mobileCategory) mobileCategory.value = activeFilters.category;
    if (mobilePrice) mobilePrice.value = activeFilters.priceRange;
    if (mobileSort) mobileSort.value = activeFilters.sort;
}

function displayActiveFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filters = [];
    
    if (activeFilters.search) {
        filters.push({ label: `Search: ${activeFilters.search}`, key: 'search' });
    }
    if (activeFilters.category) {
        filters.push({ label: activeFilters.category, key: 'category' });
    }
    if (activeFilters.priceRange) {
        const [min, max] = activeFilters.priceRange.split('-');
        filters.push({ label: `$${min} - $${max}`, key: 'priceRange' });
    }
    
    filters.forEach(filter => {
        const chip = document.createElement('div');
        chip.className = 'filter-chip';
        chip.innerHTML = `
            ${filter.label}
            <i class="fas fa-times"></i>
        `;
        chip.onclick = () => removeFilter(filter.key);
        container.appendChild(chip);
    });
    
    if (filters.length > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-all-btn';
        clearBtn.innerHTML = 'Clear All';
        clearBtn.onclick = clearAllFilters;
        container.appendChild(clearBtn);
    }
}

function removeFilter(key) {
    activeFilters[key] = '';
    syncFilterValues();
    filterProducts();
}

function clearAllFilters() {
    activeFilters = {
        search: '',
        category: '',
        priceRange: '',
        sort: 'name-asc'
    };
    syncFilterValues();
    filterProducts();
}

function updateProductCount() {
    const countElement = document.querySelector('.products-count');
    if (countElement) {
        countElement.innerHTML = `Showing <strong>${filteredProducts.length}</strong> of <strong>${allProducts.length}</strong> products`;
    }
}

// ==========================================
// MOBILE FILTERS
// ==========================================
function openMobileFilters() {
    const panel = document.getElementById('mobile-filters-panel');
    const overlay = document.getElementById('modal-overlay');
    if (panel) {
        panel.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileFilters() {
    const panel = document.getElementById('mobile-filters-panel');
    if (panel) {
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function applyMobileFilters() {
    filterProducts();
    closeMobileFilters();
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
    showNotification(`${product.name} added to cart!`, 'success');
    
    // Visual feedback on button
    const btns = document.querySelectorAll('.add-product-btn');
    btns.forEach(btn => {
        if (btn.closest('.product-card')) {
            const card = btn.closest('.product-card');
            const cardProduct = filteredProducts.find(p => getProductImage(p) === card.querySelector('.product-image')?.src);
            if (cardProduct && cardProduct.id === productId) {
                btn.classList.add('added');
                const icon = btn.querySelector('i');
                icon.className = 'fas fa-check';
                setTimeout(() => {
                    btn.classList.remove('added');
                    icon.className = 'fas fa-plus';
                }, 1500);
            }
        }
    });
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
                <div class="cart-item-name">${escapeHtml(truncateText(item.name, 50))}</div>
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
// UTILITY FUNCTIONS
// ==========================================
function openSearch() {
    const searchInput = document.getElementById('filter-search') || document.getElementById('mobile-search');
    if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'info' ? 'info-circle' : 'check-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => notification.remove(), 300);
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
// EVENT LISTENERS
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCart();
        closeProductModal();
        closeMobileFilters();
    }
});

console.log('✨ Products page ready');
