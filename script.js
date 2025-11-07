// ==========================================
// BARBER WORLD - COMPLETE SCRIPT.JS
// With Flash Sale Banner Integration
// ==========================================

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

// Flash Sale Configuration
const FLASH_SALE_END_DATE = new Date('2025-11-12T23:59:59').getTime();

// All brand JSON file paths
const ALL_BRAND_JSON_FILES = [
    'json/babyliss-products.json',
    'json/stylecraft-products.json',
    'json/jrl-products.json',
    'json/wahl-products.json',
    'json/wmark-products.json',
    'json/vgr-products.json',
    'json/monster-products.json',
    'json/barberworld-products.json'
];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    initializeAnimations();
    initializeEventListeners();
    initializeShippingBanner();
    initializeBackToTop();
    initializeFlashSaleBanner();
    console.log('🚀 Barber World Enhanced Homepage Loaded');
});

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
        updateCartDisplay();
        updateCartBadge();
    });
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (carouselProducts.length > 0) {
                createCarouselIndicators();
                updateCarouselPosition();
            }
        }, 250);
    });
}

// ==========================================
// SLIM FLASH SALE BANNER + MODAL
// ==========================================

class FlashSaleBanner {
    constructor() {
        this.banner = document.getElementById('flashSaleBanner');
        this.closeBtn = document.getElementById('flashCloseBtn');
        this.viewDetailsBtn = document.getElementById('flashViewDetailsBtn');
        this.addCartBtn = document.getElementById('flashAddCartBtn');
        this.modal = document.getElementById('flashModal');
        this.modalAddCartBtn = document.getElementById('flashModalAddCartBtn');
        
        this.daysEl = document.getElementById('daysValue');
        this.hoursEl = document.getElementById('hoursValue');
        this.minutesEl = document.getElementById('minutesValue');
        this.secondsEl = document.getElementById('secondsValue');
        
        // Sale ends Nov 12, 2025 at 11:59 PM
        this.saleEndTime = new Date('2025-11-12T23:59:59').getTime();
        this.timerInterval = null;
        
        // Featured Product Details
        this.featuredProduct = {
            id: 99999,
            name: 'StyleCraft Professional Instinct-X Cordless Clipper',
            brand: 'StyleCraft',
            price: 130.00,
            originalPrice: 185.00,
            image: 'https://stylecraftus.com/media/catalog/product/cache/b50be48194f54833666bd3e560bd3e68/i/n/instinct_x_lids.jpg'
        };
        
        this.init();
    }
    
    init() {
        if (!this.banner) return;
        
        console.log('⚡ Initializing Flash Sale Banner');
        
        this.startTimer();
        this.attachEventListeners();
        
        console.log('✅ Flash Sale Banner initialized');
    }
    
    startTimer() {
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const now = new Date().getTime();
        const difference = this.saleEndTime - now;
        
        if (difference <= 0) {
            this.hideBanner();
            clearInterval(this.timerInterval);
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (this.daysEl) this.daysEl.textContent = String(days);
        if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, '0');
        if (this.minutesEl) this.minutesEl.textContent = String(minutes).padStart(2, '0');
        if (this.secondsEl) this.secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    attachEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hideBanner();
            });
        }
        
        if (this.viewDetailsBtn) {
            this.viewDetailsBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        
        if (this.addCartBtn) {
            this.addCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
        
        if (this.modalAddCartBtn) {
            this.modalAddCartBtn.addEventListener('click', () => {
                this.addToCart();
                this.closeModal();
            });
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
    
    addToCart() {
        const product = this.featuredProduct;
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === product.id);
        
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
        showNotification(`${product.name} added to cart!`, 'success');
        
        // Visual feedback on button
        const buttons = [this.addCartBtn, this.modalAddCartBtn].filter(btn => btn);
        buttons.forEach(btn => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Added!</span>';
            btn.style.background = 'linear-gradient(135deg, #2e7d32, #43a047)';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        });
    }
    
    hideBanner() {
        if (this.banner) {
            this.banner.classList.add('hidden');
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            
            setTimeout(() => {
                this.banner.style.display = 'none';
            }, 300);
        }
    }
}

// Global functions for modal
function closeFlashModal() {
    const modal = document.getElementById('flashModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

function initializeFlashSaleBanner() {
    new FlashSaleBanner();
}

// ==========================================
// CAROUSEL - LOADS FROM ALL JSON FILES
// ==========================================

async function loadFeaturedProducts() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    try {
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
        
        // Fetch all brand JSON files in parallel
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
        
        if (!Array.isArray(allProducts) || allProducts.length === 0) {
            throw new Error('No products found');
        }
        
        // Randomize and select 12 products for carousel
        const shuffled = shuffleArray(allProducts);
        carouselProducts = shuffled.slice(0, 12);
        
        renderCarousel();
        createCarouselIndicators();
        
        await preloadCarouselImages();
        
        updateCarouselPosition();
        startCarouselAutoplay();
        setupCarouselEventListeners();
        
        console.log('✨ Carousel loaded with', carouselProducts.length, 'random products from all brands!');
        
    } catch (error) {
        console.error('Error loading products:', error);
        showCarouselError();
    } finally {
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 500);
        }
    }
}

// ==========================================
// CAROUSEL UTILITY FUNCTIONS
// ==========================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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

async function preloadCarouselImages() {
    const images = document.querySelectorAll('.carousel-product-card img');
    const totalImages = images.length;
    let loadedCount = 0;
    
    return new Promise((resolve) => {
        if (totalImages === 0) {
            resolve();
            return;
        }
        
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

// ==========================================
// CAROUSEL RENDERING
// ==========================================

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
                <div class="carousel-product-price">${product.price.toFixed(2)}</div>
                <button class="carousel-add-btn" onclick="event.stopPropagation(); addToCart(${product.id}, '${escapeHtml(product.brand)}')">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Add to Cart</span>
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
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// ==========================================
// CAROUSEL NAVIGATION
// ==========================================

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

function goToCarouselPage(pageIndex) {
    if (isCarouselAnimating) return;
    currentCarouselPage = pageIndex;
    updateCarouselPosition();
    resetCarouselAutoplay();
}

function updateCarouselPosition() {
    const track = document.getElementById('carousel-track-new');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (!track) return;
    
    const productsPerPage = getProductsPerPage();
    const cardWidth = track.querySelector('.carousel-product-card')?.offsetWidth || 0;
    const gap = window.innerWidth <= 768 ? 16 : 32;
    const offset = currentCarouselPage * productsPerPage * (cardWidth + gap);
    
    isCarouselAnimating = true;
    track.style.transform = `translateX(-${offset}px)`;
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentCarouselPage);
    });
    
    setTimeout(() => {
        isCarouselAnimating = false;
    }, 700);
}

// ==========================================
// CAROUSEL AUTOPLAY
// ==========================================

function startCarouselAutoplay() {
    if (carouselAutoplayInterval) return;
    
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

function setupCarouselEventListeners() {
    const carousel = document.getElementById('products-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarouselAutoplay);
        carousel.addEventListener('mouseleave', startCarouselAutoplay);
    }
}

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
        // Find product in allProducts array
        let product = allProducts.find(p => p.id === productId && p.brand === brandName);
        
        // If not found in allProducts, try loading from the legacy file
        if (!product) {
            const response = await fetch('json/all-products-products.json');
            if (response.ok) {
                const products = await response.json();
                product = products.find(p => p.id === productId && p.brand === brandName);
            }
        }
        
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
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
                <span>Add some products to get started!</span>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <div class="cart-item-details">
                <h4>${truncateText(item.name, 45)}</h4>
                <p class="cart-item-brand">${escapeHtml(item.brand)}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
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
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel) {
        cartPanel.classList.add('active');
        if (cartOverlay) {
            cartOverlay.classList.add('active');
        }
        document.body.classList.add('no-scroll');
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel) {
        cartPanel.classList.remove('active');
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
        }
        document.body.classList.remove('no-scroll');
    }
}

// ==========================================
// STRIPE CHECKOUT
// ==========================================

async function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
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

        const response = await fetch('https://barberworld-stripe-backend.onrender.com/create-checkout-session', {
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

        const { sessionId } = await response.json();

        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Checkout error:', error);
        showNotification(error.message || 'Checkout failed. Please try again.', 'error');

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Checkout';
        }
    }
}

// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menu) {
        menu.classList.toggle('active');
        
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        if (menu.classList.contains('active')) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menu) {
        menu.classList.remove('active');
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.classList.remove('no-scroll');
    }
}

// ==========================================
// SHIPPING BANNER
// ==========================================

function initializeShippingBanner() {
    const closeBannerBtn = document.querySelector('.close-banner');
    const shippingBanner = document.querySelector('.shipping-banner');
    
    if (!closeBannerBtn || !shippingBanner) return;
    
    const bannerClosed = localStorage.getItem('shippingBannerClosed');
    if (bannerClosed === 'true') {
        shippingBanner.classList.add('hidden');
    }
    
    closeBannerBtn.addEventListener('click', function() {
        shippingBanner.classList.add('hidden');
        localStorage.setItem('shippingBannerClosed', 'true');
    });
}

// ==========================================
// BACK TO TOP BUTTON
// ==========================================

function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 100));
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// ANIMATIONS & UTILITIES
// ==========================================

function initializeAnimations() {
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

    document.querySelectorAll('.fade-in-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function showNotification(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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
// CONSOLE STYLING
// ==========================================

console.log('%c🚀 Barber World NYC', 'color: #d4af37; font-size: 24px; font-weight: bold;');
console.log('%c✨ Enhanced with Flash Sale Banner', 'color: #666; font-size: 14px;');
