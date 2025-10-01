// Enhanced Barber World Homepage - Smart & Snappy

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let cart = [];
let megaMenuTimer = null;
let carouselInterval = null;
let currentSlide = 0;
let featuredProducts = [];
let touchStartX = 0;
let touchEndX = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    initializeAnimations();
    setupTouchHandlers();
    console.log('🚀 Barber World Enhanced - Ready!');
});

// ==========================================
// SCROLL LOCKING
// ==========================================

function lockScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('no-scroll');
}

function unlockScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

// ==========================================
// MEGA MENU
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
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const isActive = mobileMenu.classList.contains('active');
    
    if (isActive) {
        mobileMenu.classList.remove('active');
        unlockScroll();
    } else {
        mobileMenu.classList.add('active');
        lockScroll();
    }
}

// ==========================================
// ENHANCED SEARCH PANEL
// ==========================================

function openSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.add('active');
    lockScroll();
    
    setTimeout(() => {
        document.getElementById('search-input-main').focus();
    }, 100);
}

function closeSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.remove('active');
    unlockScroll();
    
    document.getElementById('search-input-main').value = '';
    document.getElementById('search-results-panel').innerHTML = '';
    document.querySelector('.clear-search').style.display = 'none';
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
    
    clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    try {
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
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
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
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// CAROUSEL - SNAPPY & FAST
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
        
        // Shuffle and get 12 products
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        featuredProducts = shuffled.slice(0, 12);
        
        displayCarousel();
        startAutoPlay();
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
    }
}

function displayCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (!track || !dotsContainer) return;
    
    // Determine items per slide based on screen size
    const itemsPerSlide = window.innerWidth > 1024 ? 4 : window.innerWidth > 768 ? 2 : 1;
    const totalSlides = Math.ceil(featuredProducts.length / itemsPerSlide);
    
    // Build carousel slides
    let slidesHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const slideProducts = featuredProducts.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide);
        slidesHTML += `
            <div class="carousel-item">
                ${slideProducts.map(product => `
                    <div class="product-card" onclick="addToCart(${product.id}, '${product.brand}')">
                        <div class="product-image">
                            <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
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
                `).join('')}
            </div>
        `;
    }
    
    track.innerHTML = slidesHTML;
    
    // Build dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
    
    currentSlide = 0;
}

function moveCarousel(direction) {
    const track = document.getElementById('carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const totalSlides = dots.length;
    
    if (totalSlides === 0) return;
    
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetAutoPlay();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!track || dots.length === 0) return;
    
    // Smooth transform
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoPlay() {
    stopAutoPlay();
    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// Touch/Swipe support for carousel
function setupTouchHandlers() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left
            moveCarousel(1);
        } else {
            // Swiped right
            moveCarousel(-1);
        }
    }
}

// Pause carousel on hover (desktop)
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    if (track) {
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);
    }
});

// Rebuild carousel on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (featuredProducts.length > 0) {
            displayCarousel();
        }
    }, 250);
});

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
    lockScroll();
}

function closeCart() {
    document.getElementById('cart-modal').classList.remove('active');
    unlockScroll();
}

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
`;
document.head.appendChild(style);

console.log('✅ Barber World - All Systems Ready!');
console.log('🎠 Carousel: Auto-play with touch support');
console.log('🔒 Scroll Lock: Active on modals');
console.log('📱 Mobile: Fully optimized');
console.log('💳 Stripe: Integrated');
