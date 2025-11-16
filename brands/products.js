// ==========================================
// BARBER WORLD - MODERN PRODUCTS PAGE JS
// Complete Redesign with Enhanced Features
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentView = 'grid';

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
    animateHeroStats();
    
    console.log(`🚀 Modern ${brandName} Products Page Loaded`);
});

function initializeEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeMobileMenu();
            closeFilters();
            closeCart();
        }
    });
    
    // Storage sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'barber_cart') {
            loadCart();
            updateCartUI();
        }
    });
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
        
        // Map brand names to JSON file names
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
        updateHeroProductImage();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState();
    } finally {
        if (loadingState) loadingState.style.display = 'none';
    }
}

// ==========================================
// PRODUCT RENDERING
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
    
    productsGrid.innerHTML = filteredProducts.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.05}s;" onclick="openProductModal(${product.id})">
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
                    <span class="stock-badge ${product.inStock ? '' : 'out-of-stock'}">
                        <i class="fas ${product.inStock ? 'fa-check' : 'fa-times'}"></i>
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (productsGrid) productsGrid.innerHTML = '';
}

// ==========================================
// FILTERS
// ==========================================

function applyFilters() {
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
    const inStockOnly = document.getElementById('in-stock-only')?.checked || false;
    const sortBy = document.getElementById('sort-select')?.value || 'featured';
    
    // Get selected categories
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[value="Clipper"], .filter-option input[value="Trimmer"], .filter-option input[value="Shaver"]');
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        // Search filter
        const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery) ||
            (product.description && product.description.toLowerCase().includes(searchQuery)) ||
            (product.shortDescription && product.shortDescription.toLowerCase().includes(searchQuery));
        
        // Price filter
        const matchesPrice = product.price >= priceMin && product.price <= priceMax;
        
        // Stock filter
        const matchesStock = !inStockOnly || product.inStock;
        
        // Category filter
        const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(product.category);
        
        return matchesSearch && matchesPrice && matchesStock && matchesCategory;
    });
    
    // Sort products
    sortProducts(sortBy);
    
    // Update UI
    renderProducts();
    updateResultsCount();
    updateActiveFilters();
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
            // Keep original order
            break;
    }
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const count = filteredProducts.length;
        resultsCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
    
    // Update hero stats
    const heroCount = document.getElementById('product-count-hero');
    if (heroCount) {
        animateNumber(heroCount.querySelector('.count-up'), allProducts.length);
    }
}

function updateActiveFilters() {
    const activeFiltersDiv = document.getElementById('active-filters');
    const filterPillsDiv = document.getElementById('filter-pills');
    
    if (!activeFiltersDiv || !filterPillsDiv) return;
    
    const filters = [];
    
    // Search filter
    const searchQuery = document.getElementById('search-input')?.value;
    if (searchQuery) {
        filters.push({ type: 'search', label: `Search: ${searchQuery}`, clear: () => {
            document.getElementById('search-input').value = '';
            applyFilters();
        }});
    }
    
    // Category filters
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[value="Clipper"], .filter-option input[value="Trimmer"], .filter-option input[value="Shaver"]');
    categoryCheckboxes.forEach(cb => {
        if (cb.checked) {
            filters.push({ type: 'category', label: cb.value + 's', clear: () => {
                cb.checked = false;
                applyFilters();
            }});
        }
    });
    
    // Price filter
    const priceMin = document.getElementById('price-min')?.value;
    const priceMax = document.getElementById('price-max')?.value;
    if (priceMin || priceMax) {
        const label = `Price: $${priceMin || '0'} - $${priceMax || '∞'}`;
        filters.push({ type: 'price', label, clear: () => {
            if (document.getElementById('price-min')) document.getElementById('price-min').value = '';
            if (document.getElementById('price-max')) document.getElementById('price-max').value = '';
            applyFilters();
        }});
    }
    
    // Stock filter
    if (document.getElementById('in-stock-only')?.checked) {
        filters.push({ type: 'stock', label: 'In Stock Only', clear: () => {
            document.getElementById('in-stock-only').checked = false;
            applyFilters();
        }});
    }
    
    // Update display
    if (filters.length > 0) {
        activeFiltersDiv.style.display = 'block';
        filterPillsDiv.innerHTML = filters.map(filter => `
            <div class="filter-pill">
                <span>${escapeHtml(filter.label)}</span>
                <button onclick="event.stopPropagation(); (${filter.clear.toString()})()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    } else {
        activeFiltersDiv.style.display = 'none';
    }
}

function clearAllFilters() {
    // Clear all inputs
    if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
    if (document.getElementById('price-min')) document.getElementById('price-min').value = '';
    if (document.getElementById('price-max')) document.getElementById('price-max').value = '';
    if (document.getElementById('in-stock-only')) document.getElementById('in-stock-only').checked = false;
    
    // Uncheck all category checkboxes
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => cb.checked = false);
    
    // Reset sort
    if (document.getElementById('sort-select')) document.getElementById('sort-select').value = 'featured';
    
    // Reapply filters
    applyFilters();
}

function toggleFilterGroup(header) {
    header.classList.toggle('collapsed');
}

function toggleFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function closeFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
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
// PRODUCT MODAL
// ==========================================

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) return;
    
    // Get all product images
    const images = product.images && product.images.length > 0 
        ? [product.image, ...product.images] 
        : [product.image];
    
    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="modal-images">
                <div class="modal-main-image-container">
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
            
            <div class="modal-details">
                <h2>${escapeHtml(product.name)}</h2>
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                <div class="modal-stock ${product.inStock ? '' : 'out-of-stock'}">
                    <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
                
                ${product.description ? `
                    <p class="modal-description">${escapeHtml(product.description)}</p>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features">
                        <h4><i class="fas fa-star"></i> Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li>${escapeHtml(feature)}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${product.specifications ? `
                    <div class="modal-specs">
                        <h4><i class="fas fa-cog"></i> Specifications</h4>
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
                
                <button class="modal-add-to-cart" onclick="addToCartFromModal(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Add to Cart - $${product.price.toFixed(2)}</span>
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function changeModalImage(imageSrc, thumbnail) {
    const mainImg = document.getElementById('modal-main-img');
    if (mainImg) {
        mainImg.src = imageSrc;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

function addToCartFromModal(productId) {
    quickAddToCart(productId);
    // Optional: close modal after adding
    // closeModal();
}

// ==========================================
// CART FUNCTIONS
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
        showToast(`${truncateText(product.name, 30)} removed from cart`);
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
    
    if (cartPanel) {
        cartPanel.classList.remove('active');
    }
    if (cartOverlay) {
        cartOverlay.classList.remove('active');
    }
    document.body.classList.remove('no-scroll');
}

async function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lineItems: lineItems,
                successUrl: `${window.location.origin}/success.html`,
                cancelUrl: window.location.href
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Checkout error:', error);
        showToast(error.message || 'Checkout failed. Please try again.', 'error');

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
    if (menu) {
        menu.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.remove('active');
    }
}

// ==========================================
// HERO ANIMATIONS
// ==========================================

function animateHeroStats() {
    const heroCount = document.getElementById('product-count-hero');
    if (heroCount) {
        const countUp = heroCount.querySelector('.count-up');
        if (countUp) {
            animateNumber(countUp, allProducts.length || 15);
        }
    }
}

function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function updateHeroProductImage() {
    const heroImg = document.getElementById('hero-product-img');
    if (heroImg && allProducts.length > 0) {
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        heroImg.src = getProductImage(randomProduct);
    }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    // Remove any existing classes
    toast.classList.remove('show', 'hiding');
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.classList.remove('show', 'hiding');
        }, 500);
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

// ==========================================
// CONSOLE STYLING
// ==========================================

console.log('%c🚀 Barber World NYC - Modern Products Page', 'color: #d4af37; font-size: 18px; font-weight: bold;');
console.log('%c✨ Enhanced with Premium Features', 'color: #666; font-size: 12px;');
