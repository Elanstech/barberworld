// Enhanced Barber World Homepage JavaScript

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let cart = [];
let carouselProducts = [];
let currentCarouselPage = 0;
let carouselAutoplayInterval = null;
let isCarouselAnimating = false;

// Modern Header Variables
let allProductsData = [];
let searchTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    loadProductsData();
    setupSearchListeners();
    initializeAnimations();
    console.log('🚀 Barber World Enhanced Homepage Loaded');
});

// ==========================================
// MODERN HEADER - SEARCH FUNCTIONALITY
// ==========================================

// Load products data for search
async function loadProductsData() {
    try {
        const response = await fetch('json/all-products-products.json');
        if (response.ok) {
            allProductsData = await response.json();
            console.log('✅ Loaded', allProductsData.length, 'products for search');
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
    }
}

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('smartSearchInput');
    
    if (!overlay || !input) return;
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        input.focus();
    }, 300);
}

function toggleMobileSearch() {
    toggleSearch();
}

function closeSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('smartSearchInput');
    
    if (!overlay || !input) return;
    
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    input.value = '';
    clearSearchInput();
}

function clearSearchInput() {
    const input = document.getElementById('smartSearchInput');
    if (!input) return;
    
    const clearBtn = input.nextElementSibling;
    
    input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    showSearchPlaceholder();
}

function showSearchPlaceholder() {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="search-placeholder">
            <i class="fas fa-search"></i>
            <p>Start typing to search products...</p>
            <div class="popular-searches">
                <span class="popular-tag" onclick="quickSearch('clippers')">Clippers</span>
                <span class="popular-tag" onclick="quickSearch('trimmers')">Trimmers</span>
                <span class="popular-tag" onclick="quickSearch('shavers')">Shavers</span>
                <span class="popular-tag" onclick="quickSearch('combo')">Combo Sets</span>
            </div>
        </div>
    `;
}

function quickSearch(term) {
    const input = document.getElementById('smartSearchInput');
    if (!input) return;
    
    input.value = term;
    performSmartSearch(term);
}

function setupSearchListeners() {
    const input = document.getElementById('smartSearchInput');
    if (!input) return;
    
    const clearBtn = input.nextElementSibling;
    
    input.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        
        if (clearBtn) {
            clearBtn.style.display = value ? 'block' : 'none';
        }
        
        clearTimeout(searchTimeout);
        
        if (value.length === 0) {
            showSearchPlaceholder();
            return;
        }
        
        if (value.length < 2) return;
        
        searchTimeout = setTimeout(() => {
            performSmartSearch(value);
        }, 300);
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });
    
    // Close on overlay click
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'searchOverlay') {
                closeSearch();
            }
        });
    }
}

function performSmartSearch(query) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    if (!allProductsData.length) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Loading products...</p>
            </div>
        `;
        return;
    }
    
    const searchTerm = query.toLowerCase();
    
    // Smart search: search in name, brand, category, description
    const results = allProductsData.filter(product => {
        const name = product.name?.toLowerCase() || '';
        const brand = product.brand?.toLowerCase() || '';
        const category = product.category?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const shortDesc = product.shortDescription?.toLowerCase() || '';
        
        return name.includes(searchTerm) ||
               brand.includes(searchTerm) ||
               category.includes(searchTerm) ||
               description.includes(searchTerm) ||
               shortDesc.includes(searchTerm);
    });
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No products found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    // Group results by category
    const groupedResults = {};
    results.forEach(product => {
        const category = product.category || 'Other';
        if (!groupedResults[category]) {
            groupedResults[category] = [];
        }
        groupedResults[category].push(product);
    });
    
    // Display results
    let html = '';
    
    Object.keys(groupedResults).forEach(category => {
        const products = groupedResults[category].slice(0, 5);
        
        html += `
            <div class="search-category">
                <div class="category-title">${category}s (${groupedResults[category].length})</div>
                <div class="search-items">
                    ${products.map(product => `
                        <div class="search-item" onclick="goToProduct('${product.slug}', '${product.category}')">
                            <img src="${product.image || product.images?.[0] || 'https://via.placeholder.com/50'}" 
                                 alt="${product.name}" 
                                 class="search-item-image"
                                 onerror="this.src='https://via.placeholder.com/50'">
                            <div class="search-item-info">
                                <div class="search-item-name">${product.name}</div>
                                <div class="search-item-brand">${product.brand}</div>
                            </div>
                            <div class="search-item-price">$${product.price.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

function goToProduct(slug, category) {
    let page = 'allproducts.html';
    
    if (category === 'Clipper') {
        page = 'clippers.html';
    } else if (category === 'Trimmer') {
        page = 'trimmers.html';
    } else if (category === 'Shaver') {
        page = 'shavers.html';
    } else if (category === 'Combo') {
        page = 'combos.html';
    }
    
    closeSearch();
    window.location.href = `brands/${page}`;
}

// ==========================================
// MOBILE MENU FUNCTIONALITY
// ==========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    
    mobileMenu.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
    }
    
    // Escape to close any open overlay
    if (e.key === 'Escape') {
        closeSearch();
        closeMobileMenu();
        const cartPanel = document.getElementById('cart-panel');
        if (cartPanel && cartPanel.classList.contains('active')) {
            closeCart();
        }
    }
});

// ==========================================
// SCROLL BEHAVIOR
// ==========================================

let lastScroll = 0;
const header = document.querySelector('.modern-header');

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// ==========================================
// SMOOTH SCROLLING
// ==========================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.modern-header')?.offsetHeight || 0;
        const sectionTop = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// ==========================================
// ANIMATIONS ON SCROLL
// ==========================================

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// FEATURED PRODUCTS CAROUSEL
// ==========================================

async function loadFeaturedProducts() {
    try {
        const brands = ['babyliss', 'stylecraft', 'jrl', 'wahl'];
        const promises = brands.map(brand => 
            fetch(`json/${brand}-products.json`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        const allProducts = results.flat();
        
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        carouselProducts = shuffled.slice(0, 24);
        
        renderCarousel();
        createCarouselIndicators();
        startCarouselAutoplay();
        
        console.log(`✅ Loaded ${carouselProducts.length} featured products`);
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
        showCarouselError();
    }
}

function renderCarousel() {
    const track = document.getElementById('carousel-track-new');
    if (!track) return;
    
    track.innerHTML = carouselProducts.map((product, index) => `
        <div class="carousel-product-card" style="animation-delay: ${index * 0.05}s;">
            <div class="carousel-product-image">
                <img src="${getProductImage(product)}" alt="${escapeHtml(product.name)}" loading="lazy">
            </div>
            <div class="carousel-product-info">
                <span class="carousel-product-brand">${escapeHtml(product.brand)}</span>
                <h3 class="carousel-product-name">${truncateText(product.name, 60)}</h3>
                <div class="carousel-product-price">$${product.price.toFixed(2)}</div>
                <button class="carousel-add-btn" onclick="event.stopPropagation(); addToCartFromCarousel(${product.id}, '${product.brand}')">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function createCarouselIndicators() {
    const container = document.getElementById('carousel-indicators');
    if (!container) return;
    
    const productsPerPage = getProductsPerPage();
    const totalPages = Math.ceil(carouselProducts.length / productsPerPage);
    
    container.innerHTML = Array.from({ length: totalPages }, (_, i) => 
        `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" 
                onclick="goToCarouselPage(${i})" 
                aria-label="Go to page ${i + 1}"></button>`
    ).join('');
}

function getProductsPerPage() {
    const width = window.innerWidth;
    if (width > 1200) return 5;
    if (width > 1024) return 4;
    if (width > 768) return 3;
    if (width > 480) return 2;
    return 1;
}

function carouselNext() {
    if (isCarouselAnimating) return;
    
    const productsPerPage = getProductsPerPage();
    const maxPage = Math.ceil(carouselProducts.length / productsPerPage) - 1;
    
    currentCarouselPage = currentCarouselPage >= maxPage ? 0 : currentCarouselPage + 1;
    updateCarouselPosition();
}

function carouselPrev() {
    if (isCarouselAnimating) return;
    
    const productsPerPage = getProductsPerPage();
    const maxPage = Math.ceil(carouselProducts.length / productsPerPage) - 1;
    
    currentCarouselPage = currentCarouselPage <= 0 ? maxPage : currentCarouselPage - 1;
    updateCarouselPosition();
}

function goToCarouselPage(page) {
    if (isCarouselAnimating) return;
    
    currentCarouselPage = page;
    updateCarouselPosition();
    resetCarouselAutoplay();
}

function updateCarouselPosition() {
    const track = document.getElementById('carousel-track-new');
    if (!track) return;
    
    isCarouselAnimating = true;
    
    const productsPerPage = getProductsPerPage();
    const cardWidth = 260;
    const gap = 24;
    const offset = currentCarouselPage * productsPerPage * (cardWidth + gap);
    
    track.style.transform = `translateX(-${offset}px)`;
    
    document.querySelectorAll('.carousel-indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentCarouselPage);
    });
    
    setTimeout(() => {
        isCarouselAnimating = false;
    }, 600);
}

function startCarouselAutoplay() {
    stopCarouselAutoplay();
    carouselAutoplayInterval = setInterval(() => {
        carouselNext();
    }, 5000);
}

function stopCarouselAutoplay() {
    if (carouselAutoplayInterval) {
        clearInterval(carouselAutoplayInterval);
        carouselAutoplayInterval = null;
    }
}

function resetCarouselAutoplay() {
    stopCarouselAutoplay();
    startCarouselAutoplay();
}

const carousel = document.getElementById('products-carousel');
if (carousel) {
    carousel.addEventListener('mouseenter', stopCarouselAutoplay);
    carousel.addEventListener('mouseleave', startCarouselAutoplay);
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        createCarouselIndicators();
        updateCarouselPosition();
    }, 250);
});

function showCarouselError() {
    const track = document.getElementById('carousel-track-new');
    if (track) {
        track.innerHTML = `
            <div style="
                width: 100%;
                padding: 4rem;
                text-align: center;
                color: #999;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <h3 style="color: #666; margin-bottom: 0.5rem;">Failed to load products</h3>
                <p>Please refresh the page to try again</p>
            </div>
        `;
    }
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================

async function addToCartFromCarousel(productId, brandName) {
    try {
        const brand = brandName.toLowerCase();
        const response = await fetch(`json/${brand}-products.json`);
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found');
            showNotification('Product not found', 'error');
            return;
        }
        
        const existingItem = cart.find(item => item.id === productId && item.brand === brandName);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({...product, quantity: 1});
        }
        
        saveCart();
        updateCartBadge();
        showNotification(`${truncateText(product.name, 40)} added to cart!`);
        
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.style.transform = 'scale(1.5)';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 300);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
    }
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

function clearAllCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear all items from your cart?')) {
        cart = [];
        saveCart();
        displayCart();
        updateCartBadge();
        showNotification('Cart cleared successfully');
    }
}

function displayCart() {
    const container = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
        if (footerEl) footerEl.style.display = 'none';
        return;
    }
    
    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${getProductImage(item)}" alt="${escapeHtml(item.name)}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${truncateText(item.name, 40)}</div>
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
    const totalEl = document.getElementById('cart-total');
    if (totalEl) {
        totalEl.textContent = `$${total.toFixed(2)}`;
    }
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
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
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel) {
        cartPanel.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel) {
        cartPanel.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

document.addEventListener('click', (e) => {
    const cartPanel = document.getElementById('cart-panel');
    
    if (cartPanel && cartPanel.classList.contains('active')) {
        if (e.target === cartPanel) {
            closeCart();
        }
    }
});

window.addEventListener('storage', (e) => {
    if (e.key === 'barber_cart') {
        loadCart();
        updateCartBadge();
    }
});

window.addEventListener('cartUpdated', () => {
    updateCartBadge();
});

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
        showNotification('Checkout failed. Please contact support at barberworldnyc@gmail.com', 'error');
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getProductImage(product) {
    if (product.image) return product.image;
    if (product.images && product.images[0]) return product.images[0];
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop';
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
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 1.2rem 1.8rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        max-width: 380px;
        font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem;">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}" style="font-size: 1.3rem;"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'error' ? 5000 : 3000);
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('active');
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('active');
}

// ==========================================
// ANIMATIONS
// ==========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { 
            transform: translateX(100%); 
            opacity: 0; 
        }
        to { 
            transform: translateX(0); 
            opacity: 1; 
        }
    }
    
    @keyframes slideOutRight {
        from { 
            transform: translateX(0); 
            opacity: 1; 
        }
        to { 
            transform: translateX(100%); 
            opacity: 0; 
        }
    }
`;
document.head.appendChild(style);

// Export functions for external use
window.modernHeader = {
    toggleSearch,
    closeSearch,
    toggleMobileMenu,
    closeMobileMenu,
    updateCartBadge,
    openCart
};

console.log('✅ Barber World Enhanced System Ready');
console.log('🎨 Features: Modern Header, Elegant Carousel, Advanced Search');
console.log('🛒 Cart System: Fully Functional');
console.log('💳 Payment: Stripe Integration Active');
