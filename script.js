// Enhanced Barber World Homepage JavaScript - Complete Working Version

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let cart = [];
let carouselProducts = [];
let allProducts = [];
let currentCarouselPage = 0;
let carouselAutoplayInterval = null;
let isCarouselAnimating = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    initializeAnimations();
    initializeEventListeners();
    console.log('🚀 Barber World Enhanced Homepage Loaded');
});

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeCart();
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
// FEATURED PRODUCTS CAROUSEL - IMPROVED
// ==========================================

async function loadFeaturedProducts() {
    try {
        const response = await fetch('json/all-products-products.json');
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        allProducts = await response.json();
        
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        carouselProducts = shuffled.slice(0, 30);
        
        renderCarousel();
        await waitForImagesToLoad();
        createCarouselIndicators();
        
        setTimeout(() => {
            startCarouselAutoplay();
        }, 1000);
        
        console.log(`✅ Loaded ${allProducts.length} total products`);
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
        showCarouselError();
    }
}

function waitForImagesToLoad() {
    return new Promise((resolve) => {
        const track = document.getElementById('carousel-track-new');
        if (!track) {
            resolve();
            return;
        }
        
        const images = track.querySelectorAll('img');
        if (images.length === 0) {
            resolve();
            return;
        }
        
        let loadedCount = 0;
        const totalImages = images.length;
        
        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount >= totalImages) {
                resolve();
            }
        };
        
        images.forEach(img => {
            if (img.complete) {
                checkAllLoaded();
            } else {
                img.addEventListener('load', checkAllLoaded);
                img.addEventListener('error', checkAllLoaded);
            }
        });
        
        setTimeout(resolve, 3000);
    });
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
                <button class="carousel-add-btn" onclick="event.stopPropagation(); addToCart(${product.id}, '${escapeHtml(product.brand)}')">
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
    // Mobile: 2 products, Desktop: 3 products
    return window.innerWidth <= 768 ? 2 : 3;
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
    const containerWidth = track.parentElement.offsetWidth;
    const gap = 24; // 1.5rem
    const cardWidth = (containerWidth - (gap * (productsPerPage - 1))) / productsPerPage;
    const offset = currentCarouselPage * productsPerPage * (cardWidth + gap);
    
    requestAnimationFrame(() => {
        track.style.transform = `translateX(-${offset}px)`;
    });
    
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
            <div style="width: 100%; padding: 4rem; text-align: center; color: #999;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <h3 style="color: #666; margin-bottom: 0.5rem;">Failed to load products</h3>
                <p>Please refresh the page to try again</p>
            </div>
        `;
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
    updateCartDisplay();
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

async function addToCart(productId, brandName) {
    try {
        const response = await fetch('json/all-products-products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const products = await response.json();
        const product = products.find(p => p.id === productId && p.brand === brandName);
        
        if (!product) {
            console.error('Product not found');
            showNotification('Product not found', 'error');
            return;
        }
        
        const existingItem = cart.find(item => item.id === productId && item.brand === brandName);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const productImages = product.images && product.images.length > 0 ? 
                [product.image, ...product.images] : [product.image];
            
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: productImages[0],
                brand: product.brand || brandName,
                quantity: 1
            });
        }
        
        saveCart();
        showNotification(`${truncateText(product.name, 40)} added to cart!`, 'success');
        
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

function removeFromCart(productId, brandName) {
    const product = cart.find(item => item.id === productId && item.brand === brandName);
    cart = cart.filter(item => !(item.id === productId && item.brand === brandName));
    saveCart();
    
    if (product) {
        showNotification(`${truncateText(product.name, 30)} removed from cart`, 'success');
    }
}

function updateCartQuantity(productId, brandName, change) {
    const item = cart.find(i => i.id === productId && i.brand === brandName);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId, brandName);
        return;
    }
    
    saveCart();
}

function clearAllCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear all items from your cart?')) {
        cart = [];
        saveCart();
        showNotification('Cart cleared', 'success');
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateCartDisplay() {
    const cartBody = document.getElementById('cart-body');
    const cartEmpty = document.getElementById('cart-empty');
    const cartItems = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartBody || !cartEmpty || !cartItems || !cartFooter) return;
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'flex';
        cartItems.style.display = 'none';
        cartFooter.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartItems.style.display = 'flex';
    cartFooter.style.display = 'block';
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="animation: slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both;">
            <div class="cart-item-image">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-brand">${escapeHtml(item.brand)}</div>
                <div class="cart-item-name">${truncateText(item.name, 50)}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${escapeHtml(item.brand)}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${escapeHtml(item.brand)}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id}, '${escapeHtml(item.brand)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

function openCart() {
    updateCartDisplay();
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

// ==========================================
// STRIPE CHECKOUT - FIXED
// ==========================================

async function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Show contact information modal instead of API call
    showCheckoutModal();
}

function showCheckoutModal() {
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10003;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        ">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
                ">
                    <i class="fas fa-shopping-bag" style="font-size: 2rem; color: white;"></i>
                </div>
                <h2 style="font-size: 1.8rem; font-weight: 800; color: #0a0a0a; margin-bottom: 0.5rem;">
                    Complete Your Order
                </h2>
                <p style="color: #6c757d; font-size: 1rem;">
                    ${itemCount} item${itemCount > 1 ? 's' : ''} • Total: <strong style="color: #d4af37;">${cartTotal.toFixed(2)}</strong>
                </p>
            </div>
            
            <div style="
                background: #f8f9fa;
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            ">
                <p style="
                    color: #0a0a0a;
                    font-size: 1.05rem;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                ">
                    To complete your purchase, please contact us directly:
                </p>
                <a href="mailto:barberworldnyc@gmail.com?subject=Order Inquiry - Cart Total ${cartTotal.toFixed(2)}" 
                   style="
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    color: white;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
                    margin-bottom: 1rem;
                " 
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(212, 175, 55, 0.5)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(212, 175, 55, 0.3)'">
                    <i class="fas fa-envelope" style="font-size: 1.2rem;"></i>
                    <span>Email: barberworldnyc@gmail.com</span>
                </a>
                <p style="
                    color: #6c757d;
                    font-size: 0.9rem;
                    text-align: center;
                    margin-top: 1rem;
                ">
                    We'll respond within 24 hours with payment options
                </p>
            </div>
            
            <button onclick="this.closest('div').parentElement.remove()" style="
                width: 100%;
                padding: 1rem;
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                color: #6c757d;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            "
            onmouseover="this.style.borderColor='#d4af37'; this.style.color='#d4af37'"
            onmouseout="this.style.borderColor='#e9ecef'; this.style.color='#6c757d'">
                Continue Shopping
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getProductImage(product) {
    if (product.images && product.images.length > 0) {
        return product.images[0];
    }
    if (product.image) {
        return product.image;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showNotification(message, type = 'success') {
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: ${type === 'error' ? '#dc3545' : 'linear-gradient(135deg, #d4af37, #b8941f)'};
        color: white;
        padding: 1.25rem 1.75rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px ${type === 'error' ? 'rgba(220, 53, 69, 0.4)' : 'rgba(212, 175, 55, 0.4)'};
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}" style="font-size: 1.3rem;"></i>
        <span style="flex: 1;">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.6, 1)';
        setTimeout(() => notification.remove(), 400);
    }, type === 'error' ? 5000 : 3000);
}

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

window.modernHeader = {
    toggleMobileMenu,
    closeMobileMenu,
    updateCartBadge,
    openCart
};

console.log('✅ Barber World Enhanced System Ready');
console.log('🎨 Categories: Now redirect to respective pages');
console.log('📱 Mobile: 2 products | 🖥️ Desktop: 3 products');
console.log('✉️ Checkout: Email contact system active');
