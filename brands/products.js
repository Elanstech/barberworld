// ==========================================
// ULTRA-MODERN BABYLISSPRO REDESIGN 2025
// Barber World NYC - Complete Functionality
// ==========================================

// Initialize Stripe
const stripe = Stripe('pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA');

// Global Variables
let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('barber_cart')) || [];
let currentView = 'grid';
let currentSort = 'featured';
let currentFilters = {
    categories: [],
    minPrice: 0,
    maxPrice: Infinity,
    inStockOnly: true
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initTypedJS();
    loadProducts();
    updateCartCount();
    setupEventListeners();
});

// ==========================================
// TYPED.JS INITIALIZATION
// ==========================================

function initTypedJS() {
    new Typed('#typed-text', {
        strings: ['BaBylissPRO', 'Professional Excellence', 'Factory Sealed', 'Barber Quality'],
        typeSpeed: 80,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// ==========================================
// PRODUCT LOADING
// ==========================================

async function loadProducts() {
    try {
        showLoading(true);
        
        const brand = document.body.dataset.brand || 'babyliss';
        
        const response = await fetch(`https://www.barberworldnyc.com/brands/products/${brand}.json`);
        
        if (!response.ok) throw new Error('Failed to load products');
        
        products = await response.json();
        filteredProducts = [...products];
        
        renderProducts();
        updateResultCount();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState();
        showLoading(false);
    }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productsGrid');
    
    if (spinner) spinner.style.display = show ? 'flex' : 'none';
    if (grid) grid.style.display = show ? 'none' : 'grid';
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('productsGrid');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (grid) grid.style.display = 'none';
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('productsGrid');
    
    if (emptyState) emptyState.style.display = 'none';
    if (grid) grid.style.display = 'grid';
}

// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.stock > 0 ? 
                '<div class="stock-badge">In Stock</div>' : 
                '<div class="stock-badge out-of-stock">Out of Stock</div>'
            }
            
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='../images/placeholder.jpg'">
                <button class="add-to-cart-plus" onclick="addToCart(${product.id}, event)" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            <div class="product-details">
                <div class="product-brand">BaBylissPRO</div>
                <h3 class="product-name">${product.name}</h3>
                
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.rating || 5)}
                    </div>
                    <span class="review-count">(${product.reviews || 0} reviews)</span>
                </div>
                
                <div class="product-price">
                    <span class="currency">$</span>${product.price.toFixed(2)}
                </div>
                
                <button class="view-more-btn" onclick="openProductModal(${product.id})">
                    <i class="fas fa-eye"></i>
                    <span>View More</span>
                </button>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function updateResultCount() {
    const countElement = document.getElementById('resultCount');
    if (countElement) {
        countElement.textContent = filteredProducts.length;
    }
}

// ==========================================
// PRODUCT MODAL
// ==========================================

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    const images = product.images || [product.image];
    
    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
            <!-- Product Images -->
            <div>
                <div style="margin-bottom: 1rem; background: var(--gray-50); border-radius: var(--radius-lg); overflow: hidden;">
                    <img id="modalMainImage" src="${images[0]}" alt="${product.name}" 
                         style="width: 100%; height: 500px; object-fit: contain; padding: 2rem;">
                </div>
                ${images.length > 1 ? `
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${images.map((img, index) => `
                            <img src="${img}" alt="Thumbnail ${index + 1}" 
                                 onclick="changeModalImage('${img}')"
                                 style="width: 80px; height: 80px; object-fit: contain; border: 2px solid var(--border); 
                                        border-radius: var(--radius-sm); cursor: pointer; padding: 0.5rem; background: var(--gray-50);
                                        transition: all 0.3s;"
                                 onmouseover="this.style.borderColor='var(--gold)'"
                                 onmouseout="this.style.borderColor='var(--border)'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <!-- Product Info -->
            <div style="max-height: 600px; overflow-y: auto; padding-right: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <span style="display: inline-block; padding: 0.5rem 1rem; background: rgba(212, 175, 55, 0.1); 
                                 color: var(--gold); border-radius: var(--radius-xl); font-size: 0.85rem; 
                                 font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        BaBylissPRO
                    </span>
                </div>
                
                <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.3;">
                    ${product.name}
                </h2>
                
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="stars" style="display: flex; gap: 0.25rem;">
                        ${generateStars(product.rating || 5)}
                    </div>
                    <span style="color: var(--gray-600); font-size: 0.95rem;">
                        (${product.reviews || 0} reviews)
                    </span>
                </div>
                
                <div style="font-size: 2.5rem; font-weight: 900; color: var(--primary); margin-bottom: 2rem;">
                    <span style="font-size: 1.5rem; color: var(--gray-600);">$</span>${product.price.toFixed(2)}
                </div>
                
                <div style="margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 2px solid var(--border);">
                    <p style="color: var(--gray-600); line-height: 1.8; font-size: 1rem;">
                        ${product.description || 'Premium professional barber equipment designed for excellence. Factory sealed and authentic.'}
                    </p>
                </div>
                
                ${product.features ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; 
                                   text-transform: uppercase; letter-spacing: 0.5px;">
                            Key Features
                        </h3>
                        <ul style="list-style: none; padding: 0;">
                            ${product.features.map(feature => `
                                <li style="display: flex; align-items: flex-start; gap: 0.75rem; 
                                           margin-bottom: 1rem; padding: 1rem; background: var(--gray-50); 
                                           border-radius: var(--radius-sm);">
                                    <i class="fas fa-check-circle" style="color: var(--gold); font-size: 1.25rem; 
                                                                           flex-shrink: 0; margin-top: 0.15rem;"></i>
                                    <span style="font-size: 0.95rem; line-height: 1.6;">${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                    <label style="font-weight: 600;">Quantity:</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem; border: 2px solid var(--border); 
                                border-radius: var(--radius-sm); padding: 0.5rem;">
                        <button onclick="decreaseModalQty()" 
                                style="width: 40px; height: 40px; background: none; border: none; 
                                       font-size: 1.25rem; cursor: pointer; font-weight: 700;">-</button>
                        <input type="number" id="modalQty" value="1" min="1" max="${product.stock}" 
                               style="width: 60px; text-align: center; border: none; font-size: 1.25rem; 
                                      font-weight: 700; outline: none;">
                        <button onclick="increaseModalQty(${product.stock})" 
                                style="width: 40px; height: 40px; background: none; border: none; 
                                       font-size: 1.25rem; cursor: pointer; font-weight: 700;">+</button>
                    </div>
                </div>
                
                <button onclick="addToCartFromModal(${product.id})" 
                        ${product.stock === 0 ? 'disabled' : ''}
                        style="width: 100%; padding: 1.5rem; background: linear-gradient(135deg, var(--gold), var(--gold-hover)); 
                               color: var(--white); border: none; border-radius: var(--radius-sm); 
                               font-size: 1.25rem; font-weight: 700; cursor: pointer; transition: all 0.3s;
                               display: flex; align-items: center; justify-content: center; gap: 1rem;
                               ${product.stock === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                        onmouseover="if(${product.stock} > 0) this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-shopping-cart"></i>
                    <span>${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
                
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid var(--border);">
                    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-shield-alt" style="color: var(--gold);"></i>
                            <span style="font-size: 0.9rem; font-weight: 600;">100% Authentic</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-certificate" style="color: var(--gold);"></i>
                            <span style="font-size: 0.9rem; font-weight: 600;">Factory Sealed</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-truck" style="color: var(--gold);"></i>
                            <span style="font-size: 0.9rem; font-weight: 600;">Free Shipping $100+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function changeModalImage(imageSrc) {
    const mainImage = document.getElementById('modalMainImage');
    if (mainImage) {
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = imageSrc;
            mainImage.style.opacity = '1';
        }, 150);
    }
}

function increaseModalQty(maxStock) {
    const input = document.getElementById('modalQty');
    if (input && parseInt(input.value) < maxStock) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseModalQty() {
    const input = document.getElementById('modalQty');
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addToCartFromModal(productId) {
    const qtyInput = document.getElementById('modalQty');
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            brand: 'BaBylissPRO'
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart`);
    closeModal();
}

function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ==========================================
// CART MANAGEMENT
// ==========================================

function addToCart(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    
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
            brand: 'BaBylissPRO'
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart`);
    
    if (event) {
        const button = event.currentTarget;
        button.style.transform = 'scale(1.3) rotate(180deg)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 300);
    }
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const countElements = document.querySelectorAll('.cart-count, #cart-count');
    
    countElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'flex' : 'none';
    });
}

function openCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');
    
    if (overlay) overlay.classList.add('active');
    if (sidebar) sidebar.classList.add('active');
    document.body.classList.add('no-scroll');
    
    updateCartDisplay();
}

function closeCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');
    
    if (overlay) overlay.classList.remove('active');
    if (sidebar) sidebar.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        if (cartItems) cartItems.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'flex';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (cartItems) {
            cartItems.style.display = 'block';
            cartItems.innerHTML = cart.map(item => `
                <div style="display: flex; gap: 1rem; background: var(--gray-50); border-radius: var(--radius); 
                            padding: 1rem; margin-bottom: 1rem;">
                    <div style="width: 80px; height: 80px; border-radius: var(--radius-sm); overflow: hidden; 
                                flex-shrink: 0; background: var(--white);">
                        <img src="${item.image}" alt="${item.name}" 
                             style="width: 100%; height: 100%; object-fit: contain; padding: 0.5rem;">
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem; 
                                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${item.name}
                        </div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                            $${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--border); 
                                        border-radius: var(--radius-sm); padding: 0.25rem;">
                                <button onclick="updateCartQuantity(${item.id}, -1)" 
                                        style="width: 24px; height: 24px; background: none; border: none; 
                                               cursor: pointer; font-weight: 700;">-</button>
                                <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                                <button onclick="updateCartQuantity(${item.id}, 1)" 
                                        style="width: 24px; height: 24px; background: none; border: none; 
                                               cursor: pointer; font-weight: 700;">+</button>
                            </div>
                            <button onclick="removeFromCart(${item.id})" 
                                    style="background: none; border: none; color: var(--danger); cursor: pointer; 
                                           font-size: 0.85rem; font-weight: 600;">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';
        
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const subtotalElement = document.getElementById('cartSubtotal');
        const totalElement = document.getElementById('cartTotal');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
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

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

async function proceedToCheckout() {
    if (cart.length === 0) return;
    
    try {
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));
        
        const response = await fetch('https://www.barberworldnyc.com/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lineItems })
        });
        
        const session = await response.json();
        
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            console.error(result.error.message);
            showToast('Checkout error. Please try again.');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Checkout error. Please try again.');
    }
}

// ==========================================
// FILTERS & SORTING
// ==========================================

function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function applyFilters() {
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    const categories = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.value && checkbox.value !== 'on') {
            categories.push(checkbox.value);
        }
    });
    
    currentFilters.categories = categories;
    
    filterProducts();
}

function applyPriceFilter() {
    const minPrice = parseFloat(document.getElementById('priceMin')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
    
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
    
    filterProducts();
}

function filterProducts() {
    filteredProducts = products.filter(product => {
        const categoryMatch = currentFilters.categories.length === 0 || 
                            currentFilters.categories.includes(product.category?.toLowerCase());
        
        const priceMatch = product.price >= currentFilters.minPrice && 
                          product.price <= currentFilters.maxPrice;
        
        const stockMatch = !currentFilters.inStockOnly || product.stock > 0;
        
        return categoryMatch && priceMatch && stockMatch;
    });
    
    sortProducts(currentSort);
}

function sortProducts(sortType) {
    currentSort = sortType;
    
    switch(sortType) {
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
        default:
            filteredProducts.sort((a, b) => (b.featured || 0) - (a.featured || 0));
    }
    
    renderProducts();
    updateResultCount();
}

function clearAllFilters() {
    currentFilters = {
        categories: [],
        minPrice: 0,
        maxPrice: Infinity,
        inStockOnly: true
    };
    
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.value && checkbox.value !== 'on') {
            checkbox.checked = false;
        }
    });
    
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    filteredProducts = [...products];
    renderProducts();
    updateResultCount();
}

function setView(view) {
    currentView = view;
    const grid = document.getElementById('productsGrid');
    const buttons = document.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if (grid) {
        if (view === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    }
}

// ==========================================
// NAVIGATION & UI
// ==========================================

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
        overlay.classList.toggle('active');
        if (overlay.classList.contains('active')) {
            const input = document.getElementById('searchInput');
            setTimeout(() => input?.focus(), 100);
        }
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('active');
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

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeCart();
            const searchOverlay = document.getElementById('searchOverlay');
            if (searchOverlay?.classList.contains('active')) {
                toggleSearch();
            }
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query === '') {
                filteredProducts = [...products];
            } else {
                filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(query) ||
                    (product.description && product.description.toLowerCase().includes(query))
                );
            }
            
            renderProducts();
            updateResultCount();
        });
    }
}
