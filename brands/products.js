// ==========================================
// ULTRA-MODERN PRODUCTS PAGE 2025
// Barber World NYC - Complete Functionality
// ==========================================

// Initialize Stripe
const stripe = Stripe('pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA');

// Global Variables
let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentView = 'grid';
let currentSort = 'featured';
let currentFilters = {
    categories: [],
    minPrice: 0,
    maxPrice: Infinity,
    inStockOnly: true
};
let currentModalProduct = null;
let autoScrollInterval = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadProducts();
    updateCartCount();
    setupEventListeners();
    setupFiltersPanel();
    initializeAnimations();
});

// ==========================================
// CART PERSISTENCE
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

// ==========================================
// PRODUCT LOADING
// ==========================================

async function loadProducts() {
    try {
        showLoading(true);
        
        // Get brand from body data attribute
        const brand = document.body.dataset.brand || 'Babyliss';
        
        // Define all brand JSON files
        const brandJsonFiles = [
            '../json/babyliss-products.json',
            '../json/stylecraft-products.json',
            '../json/jrl-products.json',
            '../json/wahl-products.json',
            '../json/wmark-products.json',
            '../json/vgr-products.json',
            '../json/monster-products.json',
            '../json/barberworld-products.json'
        ];
        
        // Check if this is a category page or all products page
        if (brand === 'clippers' || brand === 'trimmers' || brand === 'shavers' || brand === 'All Products') {
            // Load all brand files for category/all products pages
            const fetchPromises = brandJsonFiles.map(file => 
                fetch(file)
                    .then(res => res.json())
                    .catch(err => {
                        console.warn(`Could not load ${file}:`, err);
                        return [];
                    })
            );
            
            const allBrandProducts = await Promise.all(fetchPromises);
            products = allBrandProducts.flat();
            
            // Filter by category if needed
            if (brand === 'clippers') {
                products = products.filter(p => p.category === 'Clipper');
            } else if (brand === 'trimmers') {
                products = products.filter(p => p.category === 'Trimmer');
            } else if (brand === 'shavers') {
                products = products.filter(p => p.category === 'Shaver');
            }
        } else {
            // Load brand-specific JSON
            let jsonFile;
            switch(brand.toLowerCase()) {
                case 'babyliss':
                    jsonFile = '../json/babyliss-products.json';
                    break;
                case 'stylecraft':
                    jsonFile = '../json/stylecraft-products.json';
                    break;
                case 'jrl':
                    jsonFile = '../json/jrl-products.json';
                    break;
                case 'wahl':
                    jsonFile = '../json/wahl-products.json';
                    break;
                case 'wmark':
                    jsonFile = '../json/wmark-products.json';
                    break;
                case 'vgr':
                    jsonFile = '../json/vgr-products.json';
                    break;
                case 'monster':
                    jsonFile = '../json/monster-products.json';
                    break;
                case 'barber world':
                case 'ourbrand':
                    jsonFile = '../json/barberworld-products.json';
                    break;
                case 'combos':
                    jsonFile = '../json/combosets-products.json';
                    break;
                default:
                    // Default to babyliss if brand not recognized
                    jsonFile = '../json/babyliss-products.json';
            }
            
            const response = await fetch(jsonFile);
            products = await response.json();
        }
        
        // Initialize filtered products
        filteredProducts = [...products];
        
        // Apply initial filters and sort
        applyFilters();
        sortProducts(currentSort);
        
        // Update UI
        updateProductCount();
        updateFilterCounts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ==========================================
// PRODUCT RENDERING
// ==========================================

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    grid.className = `products-grid ${currentView === 'list' ? 'list-view' : ''}`;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-600); margin-bottom: 1rem; display: block;"></i>
                <h3>No products found</h3>
                <p style="color: var(--gray-600); margin-top: 0.5rem;">Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach((product, index) => {
        const card = createProductCard(product, index);
        grid.appendChild(card);
    });
    
    // Animate cards on load
    animateProductCards();
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const discount = product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    // Get the brand name from the product
    const productBrand = product.brand || 'BaBylissPRO';
    
    card.innerHTML = `
        ${discount > 0 ? `<div class="product-badge">-${discount}%</div>` : ''}
        <div class="product-quickview" onclick="openModal(${product.id})">
            <i class="fas fa-eye"></i>
        </div>
        <div class="product-image-wrapper" onclick="openModal(${product.id})">
            <img src="${product.image || '../images/placeholder.jpg'}" 
                 alt="${product.name}" 
                 class="product-image"
                 loading="lazy"
                 onerror="this.src='../images/placeholder.jpg'">
        </div>
        <div class="product-details">
            <div class="product-brand">${productBrand.toUpperCase()}</div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating">
                <div class="stars">
                    ${generateStars(product.rating || 4.5)}
                </div>
                <span class="rating-count">(${product.reviewCount || 0})</span>
            </div>
            <div class="product-footer">
                <div class="product-price">${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id}, event)">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Add</span>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt star"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star star empty"></i>';
    }
    return stars;
}

// ==========================================
// MODAL FUNCTIONALITY
// ==========================================

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentModalProduct = product;
    const modal = document.getElementById('productModal');
    
    // Update modal content
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = product.price.toFixed(2);
    document.getElementById('modalDescription').textContent = product.description || 
        'Professional-grade equipment designed for excellence.';
    document.getElementById('modalStars').innerHTML = generateStars(product.rating || 4.5);
    document.getElementById('modalReviews').textContent = `(${product.reviewCount || 0} reviews)`;
    
    // Update main image
    const mainImage = document.getElementById('modalMainImage');
    mainImage.src = product.image || '../images/placeholder.jpg';
    mainImage.alt = product.name;
    mainImage.onerror = function() { this.src = '../images/placeholder.jpg'; };
    
    // Create thumbnail carousel with auto-scroll on hover
    const images = [product.image, ...(product.images || [])].filter(Boolean);
    const carousel = document.getElementById('thumbnailCarousel');
    carousel.innerHTML = '';
    
    images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${img}" alt="${product.name}">`;
        thumb.onclick = () => {
            mainImage.src = img;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };
        
        // Auto-scroll on hover
        thumb.onmouseenter = () => {
            if (images.length > 1) {
                startAutoScroll(images, mainImage);
            }
        };
        
        thumb.onmouseleave = () => {
            stopAutoScroll();
        };
        
        carousel.appendChild(thumb);
    });
    
    // Update features
    const featuresList = document.getElementById('featuresList');
    const features = product.features || [
        'Professional-grade motor',
        'Precision cutting blades',
        'Ergonomic design',
        'Full manufacturer warranty'
    ];
    
    featuresList.innerHTML = features.map(f => `<li>${f}</li>`).join('');
    
    // Reset quantity
    document.getElementById('modalQty').value = 1;
    
    // Update add to cart button
    document.getElementById('modalAddToCart').onclick = () => {
        const qty = parseInt(document.getElementById('modalQty').value);
        for (let i = 0; i < qty; i++) {
            addToCart(productId);
        }
        closeModal();
    };
    
    // Show modal
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    stopAutoScroll();
    currentModalProduct = null;
}

function startAutoScroll(images, mainImage) {
    let currentIndex = 0;
    stopAutoScroll();
    
    autoScrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        mainImage.src = images[currentIndex];
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach((t, i) => {
            t.classList.toggle('active', i === currentIndex);
        });
    }, 2000);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

function increaseQty() {
    const input = document.getElementById('modalQty');
    input.value = parseInt(input.value) + 1;
}

function decreaseQty() {
    const input = document.getElementById('modalQty');
    const current = parseInt(input.value);
    if (current > 1) {
        input.value = current - 1;
    }
}

// ==========================================
// CART MANAGEMENT
// ==========================================

function addToCart(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const product = products.find(p => p.id === productId);
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
            quantity: 1,
            brand: product.brand || 'BaBylissPRO'
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart`);
    
    // Animate the button
    if (event) {
        const button = event.currentTarget;
        button.classList.add('added');
        setTimeout(() => button.classList.remove('added'), 600);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
    } else {
        cartItems.style.display = 'block';
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='../images/placeholder.jpg'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="cart-remove" onclick="removeFromCart(${item.id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    }
}

function openCart() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.add('active');
    document.body.classList.add('no-scroll');
    updateCartDisplay();
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ==========================================
// STRIPE CHECKOUT
// ==========================================

async function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalHTML = checkoutBtn.innerHTML;
    
    try {
        // Update button state
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Prepare line items for Stripe
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.brand || 'Professional Equipment',
                    images: item.image ? [item.image] : []
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));
        
        // Call your API endpoint
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                lineItems: lineItems,
                successUrl: `${window.location.origin}/success.html`,
                cancelUrl: `${window.location.origin}/`
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create checkout session');
        }
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.sessionId || session.id
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Checkout failed. Please try again.');
        
        // Restore button
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalHTML;
    }
}

// ==========================================
// FILTERS & SORTING
// ==========================================

function setupFiltersPanel() {
    // Category checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.value) {
                if (checkbox.checked) {
                    currentFilters.categories.push(checkbox.value);
                } else {
                    currentFilters.categories = currentFilters.categories.filter(c => c !== checkbox.value);
                }
            }
            applyFilters();
        });
    });
    
    // Price range
    document.querySelector('.apply-price')?.addEventListener('click', () => {
        const minInput = document.getElementById('priceMin');
        const maxInput = document.getElementById('priceMax');
        
        currentFilters.minPrice = parseFloat(minInput.value) || 0;
        currentFilters.maxPrice = parseFloat(maxInput.value) || Infinity;
        
        applyFilters();
    });
    
    // Clear filters
    document.querySelector('.clear-filters')?.addEventListener('click', () => {
        currentFilters = {
            categories: [],
            minPrice: 0,
            maxPrice: Infinity,
            inStockOnly: true
        };
        
        // Reset UI
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.id === 'inStockOnly';
        });
        document.getElementById('priceMin').value = '';
        document.getElementById('priceMax').value = '';
        
        applyFilters();
    });
}

function applyFilters() {
    filteredProducts = products.filter(product => {
        // Category filter
        if (currentFilters.categories.length > 0) {
            const productCategory = product.category?.toLowerCase() || '';
            const matchesCategory = currentFilters.categories.some(cat => 
                productCategory.includes(cat)
            );
            if (!matchesCategory) return false;
        }
        
        // Price filter
        if (product.price < currentFilters.minPrice || product.price > currentFilters.maxPrice) {
            return false;
        }
        
        // Stock filter
        if (currentFilters.inStockOnly && product.inStock === false) {
            return false;
        }
        
        return true;
    });
    
    renderProducts();
    updateProductCount();
}

function sortProducts(sortBy) {
    currentSort = sortBy;
    
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
        case 'rating':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    
    renderProducts();
}

function setView(view) {
    currentView = view;
    
    // Update buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.view-btn').classList.add('active');
    
    renderProducts();
}

function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    panel.classList.toggle('hidden');
    
    // On mobile, add overlay
    if (window.innerWidth <= 768) {
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            const overlay = document.createElement('div');
            overlay.className = 'filters-overlay';
            overlay.onclick = toggleFilters;
            document.body.appendChild(overlay);
            document.body.classList.add('no-scroll');
        } else {
            document.querySelector('.filters-overlay')?.remove();
            document.body.classList.remove('no-scroll');
        }
    }
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    overlay.classList.toggle('active');
    
    if (overlay.classList.contains('active')) {
        document.getElementById('searchInput').focus();
    }
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query.length > 2) {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );
        renderProducts();
    } else if (query.length === 0) {
        applyFilters();
    }
});

// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
    
    if (menu.classList.contains('active')) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

// ==========================================
// UI HELPERS
// ==========================================

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.toggle('active', show);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
}

function showError(message) {
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem; display: block;"></i>
                <h3>Oops! Something went wrong</h3>
                <p style="color: var(--gray-600); margin-top: 0.5rem;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 2rem; background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

function updateProductCount() {
    const count = document.getElementById('resultCount');
    const productCount = document.getElementById('productCount');
    
    if (count) count.textContent = filteredProducts.length;
    if (productCount) productCount.textContent = products.length;
}

function updateFilterCounts() {
    // Update category counts
    const categories = ['clipper', 'trimmer', 'shaver'];
    categories.forEach(cat => {
        const count = products.filter(p => 
            p.category?.toLowerCase().includes(cat)
        ).length;
        
        const label = document.querySelector(`input[value="${cat}"]`)?.parentElement.querySelector('.count');
        if (label) {
            label.textContent = `(${count})`;
        }
    });
}

// ==========================================
// ANIMATIONS
// ==========================================

function animateProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Modal close on overlay click
    document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
    
    // Cart close on overlay click
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    
    // Escape key handlers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeCart();
            toggleSearch();
        }
    });
    
    // Scroll to top on logo click
    document.querySelector('.site-logo')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Prevent form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => e.preventDefault());
    });
}

// ==========================================
// INITIALIZATION COMPLETE
// ==========================================

console.log('Barber World Products Page - Ready');
