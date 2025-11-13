// ==========================================
// MODERN PRODUCTS PAGE - JAVASCRIPT
// Sleek animations, better scrolling, improved UX
// ==========================================

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// All brand JSON file paths
const ALL_BRAND_JSON_FILES = [
    '../json/babyliss-products.json',
    '../json/stylecraft-products.json',
    '../json/jrl-products.json',
    '../json/wahl-products.json',
    '../json/wmark-products.json',
    '../json/vgr-products.json',
    '../json/monster-products.json',
    '../json/barberworld-products.json'
];

// Global State
let allProducts = []; // This should ALWAYS contain ALL products
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
    console.log('✨ Modern Shopping Experience Loaded!');
});

// ==========================================
// PRODUCT LOADING - LOADS FROM ALL JSON FILES
// ==========================================

async function loadProducts() {
    try {
        showLoading();
        
        // Determine if we need to load from all JSON files or just one
        const needsAllProducts = ['clippers', 'trimmers', 'shavers', 'All Products'].includes(brand);
        
        if (needsAllProducts) {
            // Load from ALL brand JSON files (like the homepage carousel does)
            console.log('📦 Loading products from all brand JSON files...');
            
            const fetchPromises = ALL_BRAND_JSON_FILES.map(file => 
                fetch(file)
                    .then(res => res.ok ? res.json() : [])
                    .catch(err => {
                        console.warn(`Could not load ${file}:`, err);
                        return [];
                    })
            );
            
            const allBrandProducts = await Promise.all(fetchPromises);
            
            // Combine all products from all brands
            allProducts = allBrandProducts.flat();
            
            console.log(`✅ Loaded ${allProducts.length} total products from all brands`);
            
            // Filter based on the page type
            if (brand === 'clippers') {
                filteredProducts = allProducts.filter(p => p.category === 'Clipper');
                console.log(`🔧 Filtered to ${filteredProducts.length} clippers`);
            } else if (brand === 'trimmers') {
                filteredProducts = allProducts.filter(p => p.category === 'Trimmer');
                console.log(`✂️ Filtered to ${filteredProducts.length} trimmers`);
            } else if (brand === 'shavers') {
                filteredProducts = allProducts.filter(p => p.category === 'Shaver');
                console.log(`🪒 Filtered to ${filteredProducts.length} shavers`);
            } else {
                // All Products page - show everything
                filteredProducts = [...allProducts];
                console.log(`📋 Showing all ${filteredProducts.length} products`);
            }
            
        } else {
            // Load from single brand JSON file or combos
            let jsonFile = '';
            switch(brand) {
                case 'Babyliss':
                    jsonFile = '../json/babyliss-products.json';
                    break;
                case 'StyleCraft':
                    jsonFile = '../json/stylecraft-products.json';
                    break;
                case 'ourbrand':
                    jsonFile = '../json/barberworld-products.json';
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
                case 'combos':
                    jsonFile = '../json/combosets-products.json';
                    break;
                default:
                    jsonFile = '../json/babyliss-products.json';
            }
            
            console.log(`📦 Loading products from ${jsonFile}...`);
            const response = await fetch(jsonFile);
            allProducts = await response.json();
            filteredProducts = [...allProducts];
            console.log(`✅ Loaded ${allProducts.length} products from ${brand}`);
        }
        
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
    
    // Update hero product count - use filteredProducts count for display
    const heroCount = document.getElementById('product-count-hero');
    if (heroCount) {
        const countUpSpan = heroCount.querySelector('.count-up');
        if (countUpSpan) {
            countUpSpan.textContent = filteredProducts.length;
        }
    }
    
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        if (resultsCount) resultsCount.textContent = 'No products found';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (resultsCount) resultsCount.textContent = `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`;
    
    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const inStock = product.inStock !== false;
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                ${!inStock ? '<div class="stock-badge out-of-stock">Out of Stock</div>' : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onclick="openProductModal(${product.id})">
                <div class="product-quick-actions">
                    <button class="quick-action-btn" onclick="openProductModal(${product.id})" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-name" onclick="openProductModal(${product.id})">${product.name}</h3>
                ${product.shortDescription ? `<p class="product-description">${product.shortDescription}</p>` : ''}
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})" ${!inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        <span>${inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// FILTERING - NOW RESPECTS INITIAL CATEGORY FILTER
// ==========================================

function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
    const inStockOnly = document.getElementById('in-stock-only')?.checked || false;
    const sortSelect = document.getElementById('sort-select');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const sortBy = sortSelect ? sortSelect.value : 'featured';
    
    // Get selected categories from filter checkboxes
    const categoryCheckboxes = document.querySelectorAll('.filter-option input[value]');
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Start with the appropriate base products (respects the page we're on)
    let baseProducts;
    if (brand === 'clippers') {
        // For clippers page, always start with only clippers
        baseProducts = allProducts.filter(p => p.category === 'Clipper');
    } else if (brand === 'trimmers') {
        // For trimmers page, always start with only trimmers
        baseProducts = allProducts.filter(p => p.category === 'Trimmer');
    } else if (brand === 'shavers') {
        // For shavers page, always start with only shavers
        baseProducts = allProducts.filter(p => p.category === 'Shaver');
    } else {
        // For All Products or brand pages, start with all products
        baseProducts = [...allProducts];
    }
    
    // Apply filters to base products
    filteredProducts = baseProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        const matchesPrice = product.price >= priceMin && product.price <= priceMax;
        
        const matchesStock = !inStockOnly || product.inStock !== false;
        
        // Only apply category filter if categories are selected AND we're on All Products page
        const matchesCategory = selectedCategories.length === 0 || 
            brand !== 'All Products' || // Don't apply category filter on specific category pages
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
    
    // Categories (only show on All Products page)
    if (brand === 'All Products') {
        const categoryCheckboxes = document.querySelectorAll('.filter-option input[value]');
        categoryCheckboxes.forEach(cb => {
            if (cb.checked && cb.value) {
                pills.push({ type: 'category', label: cb.value, clear: () => {
                    cb.checked = false;
                    applyFilters();
                }});
            }
        });
    }
    
    // Price
    const priceMin = document.getElementById('price-min')?.value;
    const priceMax = document.getElementById('price-max')?.value;
    if (priceMin || priceMax) {
        const label = `Price: $${priceMin || '0'} - $${priceMax || '∞'}`;
        pills.push({ type: 'price', label, clear: () => {
            if (document.getElementById('price-min')) document.getElementById('price-min').value = '';
            if (document.getElementById('price-max')) document.getElementById('price-max').value = '';
            applyFilters();
        }});
    }
    
    // Stock
    const inStockOnly = document.getElementById('in-stock-only');
    if (inStockOnly?.checked) {
        pills.push({ type: 'stock', label: 'In Stock Only', clear: () => {
            inStockOnly.checked = false;
            applyFilters();
        }});
    }
    
    if (pills.length > 0) {
        activeFilters.style.display = 'flex';
        filterPills.innerHTML = pills.map(pill => `
            <div class="filter-pill">
                <span>${pill.label}</span>
                <button onclick='${pill.clear.toString().replace(/^[^{]*{|}[^}]*$/g, '')}' class="remove-filter">
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
                                    <span class="spec-label">${key}:</span>
                                    <span class="spec-value">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button class="btn-add-cart-modal" onclick="addToCart(${product.id}); closeProductModal();" ${product.inStock === false ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    <span>${product.inStock !== false ? 'Add to Cart' : 'Out of Stock'}</span>
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

function changeModalImage(src, thumbnail) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
        mainImage.src = src;
    }
    
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

// ==========================================
// LOADING STATES
// ==========================================

function showLoading() {
    const loading = document.getElementById('loading-state');
    const grid = document.getElementById('products-grid');
    
    if (loading) loading.style.display = 'flex';
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
    // Mobile filter toggle
    const filterToggle = document.getElementById('filter-toggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilters);
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
            toggleFilters(false);
        }
    });
    
    // Close modal on overlay click
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
}

function toggleFilters(forceState) {
    const sidebar = document.getElementById('filters-sidebar');
    if (!sidebar) return;
    
    if (forceState !== undefined) {
        sidebar.classList.toggle('active', forceState);
    } else {
        sidebar.classList.toggle('active');
    }
}

// ==========================================
// CART MANAGEMENT
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
    updateCartBadge();
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
            brand: product.brand,
            quantity: 1
        });
    }
    
    saveCart();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
}

function updateCartUI() {
    updateCartBadge();
    // Cart UI update logic if needed
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==========================================
// CHECKOUT
// ==========================================

async function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: cart })
        });
        
        const session = await response.json();
        
        if (session.id) {
            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                showToast(result.error.message);
            }
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Checkout failed. Please try again.');
    }
}
