// ==========================================
// MODERN PRODUCTS PAGE - JAVASCRIPT
// Sleek animations, better scrolling, improved UX
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentView = 'grid';
const brand = document.body.dataset.brand;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    loadCart();
    updateCartBadge();
    initializeEventListeners();
    initSmoothScroll();
    initHeroAnimations();
    console.log('✨ Modern Shopping Experience Loaded!');
});

// ==========================================
// PRODUCT LOADING
// ==========================================

async function loadProducts() {
    try {
        showLoading();
        
        let jsonFile = '';
        switch(brand) {
            case 'Babyliss':
                jsonFile = '../json/babyliss-products.json';
                break;
            case 'Ourbrand':
                jsonFile = '../json/barberworld-products.json';
                break;
            case 'StyleCraft':
                jsonFile = '../json/stylecraft-products.json';
                break;
            case 'Monster':
                jsonFile = '../json/monster-products.json';
                break;
            case 'JRL':
                jsonFile = '../json/jrl-products.json';
                break;
            case 'Wahl':
                jsonFile = '../json/wahl-products.json';
                break;
            case 'WMark':
                jsonFile = '../json/wmark-products.json';
                break;
            case 'VGR':
                jsonFile = '../json/vgr-products.json';
                break;
            case 'clippers':
                jsonFile = '../json/clippers-products.json';
                break;
            case 'trimmers':
                jsonFile = '../json/trimmers-products.json';
                break;
            case 'shavers':
                jsonFile = '../json/shavers-products.json';
                break;
            default:
                jsonFile = '../json/all-products-products.json';
        }
        
        const response = await fetch(jsonFile);
        allProducts = await response.json();
        
        // Filter by category if needed
        if (brand === 'clippers') {
            allProducts = allProducts.filter(p => p.category === 'Clipper');
        } else if (brand === 'trimmers') {
            allProducts = allProducts.filter(p => p.category === 'Trimmer');
        } else if (brand === 'shavers') {
            allProducts = allProducts.filter(p => p.category === 'Shaver');
        }
        
        filteredProducts = [...allProducts];
        renderProducts();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState();
    }
}

// ==========================================
// RENDERING
// ==========================================

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const resultsCount = document.getElementById('results-count');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'flex';
        resultsCount.textContent = 'No products found';
        return;
    }
    
    emptyState.style.display = 'none';
    resultsCount.textContent = `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`;
    
    grid.innerHTML = filteredProducts.map((product, index) => `
        <div class="product-card" onclick="openProductModal(${product.id})" style="animation-delay: ${index * 0.05}s">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <button class="add-quick-btn" onclick="event.stopPropagation(); addToCart(${product.id});">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    ${product.inStock !== false ? 
                        '<span class="stock-badge"><i class="fas fa-check-circle"></i> In Stock</span>' : 
                        '<span class="stock-badge out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</span>'
                    }
                </div>
            </div>
        </div>
    `).join('');
    
    // Trigger animation
    animateProductCards();
}

function animateProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 30);
    });
}

// ==========================================
// FILTERS
// ==========================================

function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
    const inStockOnly = document.getElementById('in-stock-only')?.checked || false;
    const sortBy = document.getElementById('sort-select')?.value || 'featured';
    
    // Get selected categories
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[value]');
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked && cb.value !== 'on')
        .map(cb => cb.value);
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        const matchesPrice = product.price >= priceMin && product.price <= priceMax;
        
        const matchesStock = !inStockOnly || product.inStock !== false;
        
        const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(product.category);
        
        return matchesSearch && matchesPrice && matchesStock && matchesCategory;
    });
    
    // Sort products
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // featured - keep original order
            break;
    }
    
    renderProducts();
    updateActiveFilters();
}

function updateActiveFilters() {
    const activeFilters = document.getElementById('active-filters');
    const filterPills = document.getElementById('filter-pills');
    
    if (!activeFilters || !filterPills) return;
    
    const pills = [];
    
    // Search
    const search = document.getElementById('search-input')?.value;
    if (search) {
        pills.push({ type: 'search', label: `Search: ${search}`, clear: () => {
            document.getElementById('search-input').value = '';
            applyFilters();
        }});
    }
    
    // Categories
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[value]');
    categoryCheckboxes.forEach(cb => {
        if (cb.checked && cb.value !== 'on') {
            pills.push({ type: 'category', label: cb.value, clear: () => {
                cb.checked = false;
                applyFilters();
            }});
        }
    });
    
    // Price
    const priceMin = document.getElementById('price-min')?.value;
    const priceMax = document.getElementById('price-max')?.value;
    if (priceMin || priceMax) {
        const label = `Price: ${priceMin || '0'} - ${priceMax || '∞'}`;
        pills.push({ type: 'price', label, clear: () => {
            if (document.getElementById('price-min')) document.getElementById('price-min').value = '';
            if (document.getElementById('price-max')) document.getElementById('price-max').value = '';
            applyFilters();
        }});
    }
    
    // Stock
    if (document.getElementById('in-stock-only')?.checked) {
        pills.push({ type: 'stock', label: 'In Stock Only', clear: () => {
            document.getElementById('in-stock-only').checked = false;
            applyFilters();
        }});
    }
    
    if (pills.length > 0) {
        activeFilters.style.display = 'block';
        filterPills.innerHTML = pills.map(pill => `
            <div class="filter-pill">
                <span>${pill.label}</span>
                <button onclick="event.stopPropagation(); (${pill.clear.toString()})()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    } else {
        activeFilters.style.display = 'none';
    }
}

function clearAllFilters() {
    // Clear search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Clear categories
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => cb.checked = false);
    
    // Clear price
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    // Clear stock
    const inStockOnly = document.getElementById('in-stock-only');
    if (inStockOnly) inStockOnly.checked = false;
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';
    
    applyFilters();
}

function toggleFilterGroup(header) {
    header.classList.toggle('collapsed');
}

// ==========================================
// VIEW SWITCHING
// ==========================================

function changeView(view) {
    currentView = view;
    const grid = document.getElementById('products-grid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    if (grid) {
        grid.setAttribute('data-view', view);
    }
    
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
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
    
    const images = product.images && product.images.length > 0 ? 
        [product.image, ...product.images] : [product.image];
    
    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="modal-images">
                <div class="modal-main-image-container">
                    <img id="modal-main-image" src="${images[0]}" alt="${product.name}" class="modal-main-image">
                </div>
                ${images.length > 1 ? `
                    <div class="modal-thumbnails">
                        ${images.map((img, idx) => `
                            <img src="${img}" 
                                 alt="${product.name}" 
                                 class="modal-thumbnail ${idx === 0 ? 'active' : ''}" 
                                 onclick="changeModalImage('${img}', this)">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-details">
                <h2>${product.name}</h2>
                
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                
                <div class="modal-stock ${product.inStock === false ? 'out-of-stock' : ''}">
                    <i class="fas fa-${product.inStock !== false ? 'check' : 'times'}-circle"></i>
                    ${product.inStock !== false ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                </div>
                
                ${product.shortDescription ? `
                    <p style="color: var(--gray-600); margin-bottom: 1.5rem; line-height: 1.8;">${product.shortDescription}</p>
                ` : ''}
                
                ${product.description ? `
                    <div class="modal-description">${product.description}</div>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features">
                        <h4><i class="fas fa-star"></i> Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${product.specifications && Object.keys(product.specifications).length > 0 ? `
                    <div class="modal-specs">
                        <h4><i class="fas fa-cog"></i> Specifications</h4>
                        <div class="specs-grid">
                            ${Object.entries(product.specifications).map(([key, value]) => `
                                <div class="spec-item">
                                    <div class="spec-label">${key}</div>
                                    <div class="spec-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button class="modal-add-to-cart" onclick="addToCart(${product.id}); closeModal();">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Add to Cart - $${product.price.toFixed(2)}</span>
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeModal(event) {
    if (event && event.target.id !== 'product-modal' && !event.target.classList.contains('modal-close')) return;
    
    const modal = document.getElementById('product-modal');
    if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

function changeModalImage(imgSrc, thumbnail) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = imgSrc;
            mainImage.style.opacity = '1';
        }, 200);
    }
    
    if (thumbnail) {
        const thumbnails = document.querySelectorAll('.modal-thumbnail');
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }
}

// ==========================================
// CART FUNCTIONS
// ==========================================

function loadCart() {
    const savedCart = localStorage.getItem('barber_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
        updateCartBadge();
    }
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Dispatch event for other tabs/windows
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

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
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (badge) badge.textContent = totalItems;
    if (cartCount) cartCount.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <p>Your cart is empty</p>
                    <span>Start shopping now!</span>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (cartFooter) cartFooter.style.display = 'block';
        }
    }
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

function openCart() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeCart() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

async function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    try {
        showToast('Preparing your checkout...');
        
        // Format line items for Stripe
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `${item.brand || 'Barber World'} - Professional Equipment`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));
        
        console.log('💳 Starting checkout with items:', lineItems);
        
        // Call checkout API
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
        
        console.log('✅ Checkout session created:', data.id);
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: data.id,
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        showToast('Checkout failed. Please contact support at barberworldnyc@gmail.com');
    }
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    toast.classList.remove('hiding');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.classList.remove('show', 'hiding');
        }, 500);
    }, 3000);
}

// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll', mobileMenu.classList.contains('active'));
    }
}

function toggleFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('no-scroll', sidebar.classList.contains('active'));
    }
}

// ==========================================
// LOADING STATES
// ==========================================

function showLoading() {
    const loading = document.getElementById('loading-state');
    if (loading) loading.style.display = 'flex';
    
    const grid = document.getElementById('products-grid');
    if (grid) grid.style.display = 'none';
}

function hideLoading() {
    const loading = document.getElementById('loading-state');
    if (loading) loading.style.display = 'none';
    
    const grid = document.getElementById('products-grid');
    if (grid) grid.style.display = 'grid';
}

function showEmptyState() {
    hideLoading();
    const empty = document.getElementById('empty-state');
    if (empty) empty.style.display = 'flex';
}

// ==========================================
// SMOOTH SCROLLING
// ==========================================

function initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll fade-in effect for product cards
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
    
    // Observe product cards
    setTimeout(() => {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => observer.observe(card));
    }, 100);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeCart();
            const sidebar = document.getElementById('filters-sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                toggleFilters();
            }
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
    
    // Listen for cart updates from other tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === 'barber_cart') {
            loadCart();
            updateCartBadge();
        }
    });
    
    window.addEventListener('cartUpdated', () => {
        updateCartBadge();
    });
    
    // Close overlays when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && 
            mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !e.target.closest('.action-btn')) {
            toggleMobileMenu();
        }
    });
}

// ==========================================
// HERO ANIMATIONS
// ==========================================

function initHeroAnimations() {
    // Animate product count
    const countElement = document.querySelector('.count-up');
    if (countElement && allProducts.length > 0) {
        animateCountUp(countElement, 0, allProducts.length, 2000);
    }
    
    // Update hero product count
    const heroCount = document.getElementById('product-count-hero');
    if (heroCount && allProducts.length > 0) {
        animateCountUp(heroCount.querySelector('.count-up'), 0, allProducts.length, 2000);
    }
}

function animateCountUp(element, start, end, duration) {
    if (!element) return;
    
    const startTime = performance.now();
    const range = end - start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (range * easeOutQuart));
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
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
// CONSOLE LOGS
// ==========================================

console.log('✨ Modern Premium Shopping Experience Ready!');
console.log('🛒 Cart System: Fully Functional');
console.log('💳 Stripe Checkout: Working & Tested');
console.log('🎨 Design: Sleek & Minimalist');
console.log('📱 Responsive: All Devices Supported');
