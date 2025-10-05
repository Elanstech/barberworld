// ==========================================
// PRODUCTS PAGE - ENHANCED JAVASCRIPT
// Image Carousel, Smart Filters, Detailed Modal
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
let currentImageIndices = {};

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
        
        // Initialize image indices
        allProducts.forEach(p => {
            currentImageIndices[p.id] = 0;
        });
        
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
// DISPLAY PRODUCTS WITH IMAGE CAROUSEL
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
    
    // Get all product images
    const images = getProductImages(product);
    const imageIndex = currentImageIndices[product.id] || 0;
    
    card.innerHTML = `
        <div class="product-image-container">
            ${images.map((img, i) => `
                <img src="${img}" 
                     alt="${escapeHtml(product.name)}" 
                     class="product-image" 
                     style="opacity: ${i === imageIndex ? 1 : 0}; position: ${i === 0 ? 'absolute' : 'absolute'};"
                     loading="lazy">
            `).join('')}
            
            <div class="product-actions">
                <button class="action-btn quick-view" onclick="openProductModal(${product.id})" aria-label="Quick View" title="Quick View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn quick-add" onclick="quickAddToCart(${product.id}, event)" aria-label="Add to Cart" title="Quick Add">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            ${images.length > 1 ? `
                <div class="image-nav">
                    ${images.map((_, i) => `
                        <div class="image-dot ${i === imageIndex ? 'active' : ''}" 
                             onclick="changeProductImage(${product.id}, ${i})"></div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
    `;
    
    // Add hover effect for image carousel
    if (images.length > 1) {
        setupImageCarousel(card, product.id, images.length);
    }
    
    return card;
}

function getProductImages(product) {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
            if (img && !images.includes(img)) images.push(img);
        });
    }
    return images.length > 0 ? images : ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop'];
}

function setupImageCarousel(card, productId, imageCount) {
    const container = card.querySelector('.product-image-container');
    const images = container.querySelectorAll('.product-image');
    const dots = container.querySelectorAll('.image-dot');
    let hoverInterval = null;
    
    container.addEventListener('mouseenter', () => {
        let currentIndex = currentImageIndices[productId] || 0;
        
        hoverInterval = setInterval(() => {
            // Hide current image
            images[currentIndex].style.opacity = '0';
            dots[currentIndex]?.classList.remove('active');
            
            // Move to next image
            currentIndex = (currentIndex + 1) % imageCount;
            currentImageIndices[productId] = currentIndex;
            
            // Show next image
            images[currentIndex].style.opacity = '1';
            dots[currentIndex]?.classList.add('active');
        }, 1000); // Change image every 1 second
    });
    
    container.addEventListener('mouseleave', () => {
        if (hoverInterval) {
            clearInterval(hoverInterval);
        }
    });
}

function changeProductImage(productId, imageIndex) {
    currentImageIndices[productId] = imageIndex;
    
    // Find the product card
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const images = card.querySelectorAll('.product-image');
        const dots = card.querySelectorAll('.image-dot');
        
        // Check if this is the right card by checking if it has the correct number of images
        if (images.length > imageIndex) {
            images.forEach((img, i) => {
                img.style.opacity = i === imageIndex ? '1' : '0';
            });
            dots.forEach((dot, i) => {
                if (i === imageIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    });
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
// QUICK ADD TO CART
// ==========================================
function quickAddToCart(productId, event) {
    event.stopPropagation();
    
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
            image: product.image || (product.images && product.images[0]),
            brand: product.brand,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    displayCart();
    showNotification(`${product.name} added to cart!`, 'success');
    
    // Visual feedback
    const btn = event.currentTarget;
    btn.classList.add('added');
    const icon = btn.querySelector('i');
    const originalIcon = icon.className;
    icon.className = 'fas fa-check';
    
    setTimeout(() => {
        btn.classList.remove('added');
        icon.className = originalIcon;
    }, 1500);
}

// ==========================================
// ENHANCED PRODUCT MODAL
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
    
    // Populate modal with ALL product details
    document.getElementById('modal-category').textContent = product.category || 'Product';
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
    
    // Brand info
    const brandElement = document.getElementById('modal-brand');
    if (brandElement) {
        brandElement.innerHTML = `<strong>Brand:</strong> ${product.brand || currentBrand}`;
    }
    
    // Description
    const descElement = document.getElementById('modal-description');
    if (descElement) {
        descElement.textContent = product.description || product.shortDescription || 'Professional quality grooming equipment.';
    }
    
    // Main image
    const mainImage = document.getElementById('modal-main-image');
    const images = getProductImages(product);
    mainImage.src = images[0];
    
    // Thumbnails
    const thumbnailGrid = document.getElementById('thumbnail-grid');
    thumbnailGrid.innerHTML = '';
    
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
    
    // Specifications
    const specsList = document.getElementById('specs-list');
    if (specsList) {
        specsList.innerHTML = '';
        
        const specs = [
            { icon: 'fa-tag', text: `Category: ${product.category || 'Professional Tool'}` },
            { icon: 'fa-dollar-sign', text: `Price: $${product.price.toFixed(2)}` },
            { icon: 'fa-star', text: product.rating ? `Rating: ${product.rating}/5` : 'Professional Quality' },
            { icon: 'fa-box', text: product.inStock !== false ? 'In Stock' : 'Limited Stock' }
        ];
        
        if (product.warranty) {
            specs.push({ icon: 'fa-shield-alt', text: `Warranty: ${product.warranty}` });
        }
        
        specs.forEach(spec => {
            const item = document.createElement('div');
            item.className = 'spec-item';
            item.innerHTML = `
                <i class="fas ${spec.icon}"></i>
                <span>${spec.text}</span>
            `;
            specsList.appendChild(item);
        });
    }
    
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
                        <div class="modal-brand" id="modal-brand"></div>
                        <p class="modal-description" id="modal-description"></p>
                        <div class="modal-specs">
                            <h4>Product Details</h4>
                            <div class="specs-list" id="specs-list"></div>
                        </div>
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
// SMART FILTERING SYSTEM
// ==========================================
function filterBySearch(event) {
    activeFilters.search = event.target.value.toLowerCase();
    applyFilters();
}

function filterByCategory(category) {
    // Toggle category
    if (activeFilters.category === category) {
        activeFilters.category = '';
    } else {
        activeFilters.category = category;
    }
    
    // Update UI
    document.querySelectorAll('.category-pill').forEach(pill => {
        if (pill.dataset.category === category) {
            pill.classList.toggle('active');
        } else {
            pill.classList.remove('active');
        }
    });
    
    applyFilters();
}

function filterByPrice(priceRange) {
    // Toggle price range
    if (activeFilters.priceRange === priceRange) {
        activeFilters.priceRange = '';
    } else {
        activeFilters.priceRange = priceRange;
    }
    
    // Update UI
    document.querySelectorAll('.price-btn').forEach(btn => {
        if (btn.dataset.price === priceRange) {
            btn.classList.toggle('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    applyFilters();
}

function filterBySort(event) {
    activeFilters.sort = event.target.value;
    applyFilters();
}

function applyFilters() {
    filteredProducts = [...allProducts];
    
    // Search filter
    if (activeFilters.search) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(activeFilters.search) ||
            (p.description && p.description.toLowerCase().includes(activeFilters.search)) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(activeFilters.search)) ||
            (p.category && p.category.toLowerCase().includes(activeFilters.search))
        );
    }
    
    // Category filter
    if (activeFilters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === activeFilters.category);
    }
    
    // Price filter
    if (activeFilters.priceRange) {
        const [min, max] = activeFilters.priceRange.split('-').map(Number);
        filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
    }
    
    // Sort
    filteredProducts.sort((a, b) => {
        switch (activeFilters.sort) {
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

function displayActiveFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    container.innerHTML = '';
    const filters = [];
    
    if (activeFilters.search) {
        filters.push({ label: `"${activeFilters.search}"`, key: 'search' });
    }
    if (activeFilters.category) {
        filters.push({ label: activeFilters.category, key: 'category' });
    }
    if (activeFilters.priceRange) {
        const [min, max] = activeFilters.priceRange.split('-');
        const label = max === '999' ? `$${min}+` : `$${min}-$${max}`;
        filters.push({ label, key: 'priceRange' });
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
    
    // Update UI
    if (key === 'category') {
        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.classList.remove('active');
        });
    } else if (key === 'priceRange') {
        document.querySelectorAll('.price-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    } else if (key === 'search') {
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => input.value = '');
    }
    
    applyFilters();
}

function clearAllFilters() {
    activeFilters = {
        search: '',
        category: '',
        priceRange: '',
        sort: 'name-asc'
    };
    
    // Reset UI
    document.querySelectorAll('.search-input').forEach(input => input.value = '');
    document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
    document.querySelectorAll('.price-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.sort-select').forEach(select => select.value = 'name-asc');
    
    applyFilters();
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
    const overlay = document.getElementById('modal-overlay');
    if (panel) {
        panel.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function applyMobileFilters() {
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
            image: product.image || (product.images && product.images[0]),
            brand: product.brand,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    displayCart();
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
    const searchInput = document.querySelector('.search-input');
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

console.log('✨ Enhanced products page ready');
