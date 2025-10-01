// Enhanced Barber World Homepage JavaScript

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let cart = [];
let megaMenuTimer = null;
let carouselProducts = [];
let currentSlide = 0;
let carouselInterval = null;
let carouselTouchStartX = 0;
let carouselTouchEndX = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    initializeAnimations();
    console.log('🚀 Barber World Enhanced Homepage Loaded');
});

// ==========================================
// MEGA MENU FUNCTIONALITY
// ==========================================

function openMegaMenu() {
    clearTimeout(megaMenuTimer);
    document.getElementById('mega-menu').classList.add('active');
}

function keepMegaMenuOpen() {
    clearTimeout(megaMenuTimer);
}

function closeMegaMenuDelayed() {
    megaMenuTimer = setTimeout(() => {
        document.getElementById('mega-menu').classList.remove('active');
    }, 300);
}

function closeMegaMenu() {
    megaMenuTimer = setTimeout(() => {
        document.getElementById('mega-menu').classList.remove('active');
    }, 200);
}

// ==========================================
// MOBILE MENU FUNCTIONALITY
// ==========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const isActive = mobileMenu.classList.contains('active');
    
    if (isActive) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    } else {
        mobileMenu.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenu.classList.contains('active') && 
        !mobileMenu.contains(e.target) && 
        !menuBtn.contains(e.target)) {
        toggleMobileMenu();
    }
});

// ==========================================
// ENHANCED SEARCH PANEL
// ==========================================

function openSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.add('active');
    document.body.classList.add('no-scroll');
    
    setTimeout(() => {
        document.getElementById('search-input-main').focus();
    }, 100);
}

function closeSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.remove('active');
    document.body.classList.remove('no-scroll');
    
    // Clear search
    document.getElementById('search-input-main').value = '';
    document.getElementById('search-results-panel').innerHTML = '';
    const clearBtn = document.querySelector('.clear-search');
    if (clearBtn) clearBtn.style.display = 'none';
}

function clearSearch() {
    document.getElementById('search-input-main').value = '';
    document.getElementById('search-results-panel').innerHTML = '';
    document.querySelector('.clear-search').style.display = 'none';
    document.getElementById('search-input-main').focus();
}

function quickSearch(term) {
    document.getElementById('search-input-main').value = term;
    performSearch({ target: { value: term } });
}

async function performSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results-panel');
    const clearBtn = document.querySelector('.clear-search');
    
    // Show/hide clear button
    clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    try {
        // Show loading
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Searching...</p>
            </div>
        `;
        
        const brands = ['babyliss', 'stylecraft', 'jrl', 'wahl'];
        const promises = brands.map(brand => 
            fetch(`json/${brand}-products.json`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        const allProducts = results.flat();
        
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(query))
        ).slice(0, 12);
        
        if (filtered.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #999;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: #666;">No results found</h3>
                    <p>Try searching for a different brand or product type</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div style="padding: 1rem; background: var(--gray-light); border-radius: 12px; margin-bottom: 1rem; font-weight: 600;">
                Found ${filtered.length} product${filtered.length === 1 ? '' : 's'}
            </div>
            <div style="display: grid; gap: 1rem;">
                ${filtered.map(product => `
                    <div class="search-result-item" onclick="closeSearchPanel(); window.location.href='brands/${product.brand.toLowerCase()}.html';" style="
                        display: flex;
                        gap: 1rem;
                        padding: 1rem;
                        background: var(--white);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateX(5px)'; this.style.borderColor='var(--gold)';" onmouseout="this.style.transform='translateX(0)'; this.style.borderColor='var(--border)';">
                        <div style="
                            width: 80px;
                            height: 80px;
                            background: var(--gray-light);
                            border-radius: 8px;
                            overflow: hidden;
                            flex-shrink: 0;
                        ">
                            <img src="${getProductImage(product)}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="
                                display: inline-block;
                                background: var(--gold);
                                color: var(--white);
                                padding: 0.25rem 0.6rem;
                                border-radius: 4px;
                                font-size: 0.7rem;
                                font-weight: 700;
                                margin-bottom: 0.5rem;
                            ">${product.brand}</div>
                            <div style="
                                font-weight: 700;
                                font-size: 0.95rem;
                                margin-bottom: 0.35rem;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            ">${product.name}</div>
                            <div style="
                                font-size: 1.2rem;
                                font-weight: 800;
                                color: var(--gold);
                            ">$${product.price.toFixed(2)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #dc3545;">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>An error occurred while searching</p>
            </div>
        `;
    }
}

// Close search panel with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const searchPanel = document.getElementById('search-panel');
        if (searchPanel.classList.contains('active')) {
            closeSearchPanel();
        }
        const cartModal = document.getElementById('cart-modal');
        if (cartModal.classList.contains('active')) {
            closeCart();
        }
    }
});

// ==========================================
// SMOOTH SCROLLING
// ==========================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
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
    
    // Observe all elements with data-aos attribute
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
        
        // Shuffle and get products
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        carouselProducts = shuffled.slice(0, 12);
        
        displayCarousel();
        initializeCarousel();
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
    }
}

function displayCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    
    track.innerHTML = carouselProducts.map(product => `
        <div class="carousel-slide">
            <div class="product-card" onclick="addToCart(${product.id}, '${product.brand}')">
                <div class="product-image">
                    <img src="${getProductImage(product)}" 
                         alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h3 class="product-name">${truncateText(product.name, 50)}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation();">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    createCarouselDots();
}

function createCarouselDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer) return;
    
    const slidesPerView = getSlidesPerView();
    const totalPages = Math.ceil(carouselProducts.length / slidesPerView);
    
    dotsContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => 
        `<button class="carousel-dot ${i === 0 ? 'active' : ''}" 
                onclick="goToSlide(${i})" 
                aria-label="Go to slide ${i + 1}"></button>`
    ).join('');
}

function getSlidesPerView() {
    const width = window.innerWidth;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
}

function initializeCarousel() {
    const wrapper = document.getElementById('featured-carousel');
    if (!wrapper) return;
    
    // Auto-play
    startAutoPlay();
    
    // Touch events for mobile
    wrapper.addEventListener('touchstart', (e) => {
        carouselTouchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });
    
    wrapper.addEventListener('touchend', (e) => {
        carouselTouchEndX = e.changedTouches[0].screenX;
        handleCarouselSwipe();
        startAutoPlay();
    });
    
    // Pause on hover
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);
    
    // Update on resize
    window.addEventListener('resize', debounce(() => {
        goToSlide(currentSlide);
        createCarouselDots();
    }, 250));
}

function handleCarouselSwipe() {
    const swipeThreshold = 50;
    const diff = carouselTouchStartX - carouselTouchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            carouselNext();
        } else {
            carouselPrev();
        }
    }
}

function carouselNext() {
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(carouselProducts.length / slidesPerView) - 1;
    
    currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
    updateCarousel();
}

function carouselPrev() {
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(carouselProducts.length / slidesPerView) - 1;
    
    currentSlide = currentSlide <= 0 ? maxSlide : currentSlide - 1;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const slidesPerView = getSlidesPerView();
    const slideWidth = 100 / slidesPerView;
    const offset = currentSlide * slideWidth;
    
    track.style.transform = `translateX(-${offset}%)`;
    
    // Update dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function startAutoPlay() {
    stopAutoPlay();
    carouselInterval = setInterval(carouselNext, 5000);
}

function stopAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

function getProductImage(product) {
    if (product.image) return product.image;
    if (product.images && product.images[0]) return product.images[0];
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop';
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================

async function addToCart(productId, brandName) {
    try {
        const brand = brandName.toLowerCase();
        const response = await fetch(`json/${brand}-products.json`);
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found');
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
        showNotification(`${product.name} added to cart!`);
        
        // Animate badge
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.style.transform = 'scale(1.4)';
            setTimeout(() => badge.style.transform = 'scale(1)', 400);
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
    
    if (cart.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'flex';
        footerEl.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${getProductImage(item)}" alt="${item.name}">
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
}

function loadCart() {
    const saved = localStorage.getItem('barber_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function openCart() {
    displayCart();
    document.getElementById('cart-modal').classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeCart() {
    document.getElementById('cart-modal').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    const cartModal = document.getElementById('cart-modal');
    
    if (cartModal && cartModal.classList.contains('active')) {
        if (e.target === cartModal) {
            closeCart();
        }
    }
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// HEADER SCROLL EFFECT
// ==========================================

let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
    
    lastScroll = currentScroll;
});

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
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

console.log('✅ Barber World Enhanced System Ready');
console.log('🎨 Features: Mega Menu, Advanced Search, Carousel, Smooth Animations');
console.log('🛒 Cart System: Fully Functional with Clear All');
console.log('💳 Payment: Stripe Integration Active');
