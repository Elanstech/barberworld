// Enhanced Barber World Homepage JavaScript - Complete Version with Stripe & Flash Sale

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

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    loadFeaturedProducts();
    initializeAnimations();
    initializeEventListeners();
    initializeWelcomeSection();
    initializeShippingBanner();
    initializeQuizModal();
    initializeBackToTop();
    initializeFlashSaleBanner();
    initializeFloatingButton();
    console.log('🚀 Barber World Enhanced Homepage Loaded');
});

function initializeEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeCart();
            closeFlashSaleModal();
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
// WELCOME SECTION ANIMATION
// ==========================================

function initializeWelcomeSection() {
    const welcomeSection = document.querySelector('.welcome-section');
    const handwrittenPath = document.querySelector('.handwritten-path');
    
    if (!welcomeSection || !handwrittenPath) return;

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                handwrittenPath.style.animation = 'none';
                void handwrittenPath.offsetWidth;
                handwrittenPath.style.animation = 'draw 3s ease-in-out forwards, fillTextGold 0.8s ease-in forwards 3.3s';
            }
        });
    }, observerOptions);

    observer.observe(welcomeSection);

    welcomeSection.style.opacity = '0';
    welcomeSection.style.transform = 'translateY(20px)';
    welcomeSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
        welcomeSection.style.opacity = '1';
        welcomeSection.style.transform = 'translateY(0)';
    }, 100);

    welcomeSection.addEventListener('click', function() {
        handwrittenPath.style.animation = 'none';
        void handwrittenPath.offsetWidth;
        handwrittenPath.style.animation = 'draw 3s ease-in-out forwards, fillTextGold 0.8s ease-in forwards 3.3s';
    });
}

window.addEventListener('scroll', function() {
    const welcomeSection = document.querySelector('.welcome-section');
    if (!welcomeSection) return;
    
    const scrollPosition = window.scrollY;
    const sectionTop = welcomeSection.offsetTop;
    
    if (scrollPosition > sectionTop + 200) {
        welcomeSection.style.opacity = '0.7';
    } else {
        welcomeSection.style.opacity = '1';
    }
});

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
// MOBILE MENU FUNCTIONALITY
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
// FEATURED PRODUCTS CAROUSEL
// ==========================================

async function loadFeaturedProducts() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    try {
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
        
        const response = await fetch('json/all-products-products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allProducts = await response.json();
        
        if (!Array.isArray(allProducts) || allProducts.length === 0) {
            throw new Error('No products found');
        }
        
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        carouselProducts = shuffled.slice(0, 12);
        
        renderCarousel();
        createCarouselIndicators();
        startCarouselAutoplay();
        
        await preloadCarouselImages();
        
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

function getProductImage(product) {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }
    return product.image || 'placeholder.jpg';
}

function escapeHtml(text) {
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
    const gap = 24;
    const offset = currentCarouselPage * productsPerPage * (cardWidth + gap);
    
    isCarouselAnimating = true;
    track.style.transform = `translateX(-${offset}px)`;
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentCarouselPage);
    });
    
    setTimeout(() => {
        isCarouselAnimating = false;
    }, 500);
}

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
// STRIPE CHECKOUT - COMPLETE INTEGRATION
// ==========================================

async function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    
    try {
        console.log('💳 Starting Stripe checkout process...');
        
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
        
        console.log('📦 Line items prepared:', lineItems);
        
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lineItems }),
        });
        
        console.log('📡 API Response status:', response.status);
        
        const data = await response.json();
        console.log('📥 API Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Checkout failed');
        }
        
        if (data.sessionId) {
            console.log('✅ Session ID received, redirecting to Stripe...');
            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });
            
            if (error) {
                throw new Error(error.message);
            }
        } else {
            throw new Error('No session ID received from server');
        }
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        showNotification(`Checkout failed: ${error.message}`, 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotification(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    const messageSpan = document.getElementById('notification-message');
    
    if (!toast || !messageSpan) return;
    
    messageSpan.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

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
// QUIZ MODAL - INTERACTIVE BRAND FINDER
// ==========================================

let quizState = {
    currentStep: 0,
    answers: {},
    totalSteps: 4
};

const quizQuestions = [
    {
        id: 'usage',
        question: 'What will you primarily use the equipment for?',
        options: [
            { value: 'professional', icon: 'fa-briefcase', title: 'Professional Barber', desc: 'For salon or barbershop use' },
            { value: 'personal', icon: 'fa-home', title: 'Personal Grooming', desc: 'For home use and personal care' },
            { value: 'both', icon: 'fa-users', title: 'Both', desc: 'Professional and personal use' }
        ]
    },
    {
        id: 'experience',
        question: 'What\'s your experience level?',
        options: [
            { value: 'beginner', icon: 'fa-seedling', title: 'Beginner', desc: 'Just getting started' },
            { value: 'intermediate', icon: 'fa-graduation-cap', title: 'Intermediate', desc: 'Some experience' },
            { value: 'expert', icon: 'fa-star', title: 'Expert', desc: 'Professional level skills' }
        ]
    },
    {
        id: 'budget',
        question: 'What\'s your budget range?',
        options: [
            { value: 'budget', icon: 'fa-dollar-sign', title: 'Budget-Friendly', desc: 'Under $100' },
            { value: 'mid', icon: 'fa-balance-scale', title: 'Mid-Range', desc: '$100 - $250' },
            { value: 'premium', icon: 'fa-gem', title: 'Premium', desc: 'Over $250' }
        ]
    },
    {
        id: 'priority',
        question: 'What matters most to you?',
        options: [
            { value: 'power', icon: 'fa-bolt', title: 'Power & Performance', desc: 'Strong motor and cutting ability' },
            { value: 'versatility', icon: 'fa-layer-group', title: 'Versatility', desc: 'Multiple attachments and uses' },
            { value: 'durability', icon: 'fa-shield-alt', title: 'Durability', desc: 'Long-lasting and reliable' },
            { value: 'design', icon: 'fa-paint-brush', title: 'Design & Style', desc: 'Modern look and feel' }
        ]
    }
];

const brandRecommendations = {
    'wahl': {
        name: 'Wahl Professional',
        page: 'brands/wahl.html',
        icon: 'fa-award',
        description: 'Industry-leading professional equipment with legendary reliability and power. Perfect for professionals who demand the best.',
        features: ['Professional Grade', 'Powerful Motors', 'Industry Standard', 'Proven Durability']
    },
    'stylecraft': {
        name: 'StyleCraft',
        page: 'brands/stylecraft.html',
        icon: 'fa-crown',
        description: 'Premium professional tools combining cutting-edge technology with sleek modern design. The choice of elite barbers.',
        features: ['Premium Quality', 'Modern Design', 'Advanced Technology', 'Pro Performance']
    },
    'vgr': {
        name: 'VGR Professional',
        page: 'brands/vgr.html',
        icon: 'fa-star',
        description: 'High-quality professional equipment offering exceptional value. Perfect balance of performance and affordability.',
        features: ['Great Value', 'Professional Quality', 'Versatile', 'Reliable Performance']
    },
    'ourbrand': {
        name: 'Our Brand',
        page: 'brands/ourbrand.html',
        icon: 'fa-heart',
        description: 'Carefully curated selection of quality grooming tools. Perfect for personal use and aspiring professionals.',
        features: ['Affordable Quality', 'Easy to Use', 'Great for Beginners', 'Versatile Options']
    }
};

function initializeQuizModal() {
    const quizOverlay = document.getElementById('quiz-modal-overlay');
    const quizModal = document.getElementById('quiz-modal');
    const closeQuizBtn = document.getElementById('close-quiz-modal');
    const dismissQuizBtn = document.getElementById('dismiss-quiz');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    
    if (!quizOverlay || !quizModal) return;
    
    const quizDismissed = sessionStorage.getItem('quizDismissed');
    
    if (!quizDismissed) {
        setTimeout(() => {
            showQuizModal();
        }, 3000);
    }
    
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', closeQuizModal);
    }
    
    if (dismissQuizBtn) {
        dismissQuizBtn.addEventListener('click', () => {
            closeQuizModal();
            sessionStorage.setItem('quizDismissed', 'true');
        });
    }
    
    quizOverlay.addEventListener('click', (e) => {
        if (e.target === quizOverlay) {
            closeQuizModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quizModal.classList.contains('active')) {
            closeQuizModal();
        }
    });
    
    setupQuizNavigation();
}

function startQuiz() {
    document.querySelector('.quiz-intro').classList.add('hidden');
    document.getElementById('quiz-progress').style.display = 'flex';
    document.querySelector('.quiz-buttons').style.display = 'flex';
    quizState.currentStep = 0;
    quizState.answers = {};
    renderQuizStep();
}

function setupQuizNavigation() {
    const backBtn = document.getElementById('quiz-back-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (quizState.currentStep > 0) {
                quizState.currentStep--;
                renderQuizStep();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentQuestion = quizQuestions[quizState.currentStep];
            if (quizState.answers[currentQuestion.id]) {
                if (quizState.currentStep < quizState.totalSteps - 1) {
                    quizState.currentStep++;
                    renderQuizStep();
                } else {
                    showQuizResult();
                }
            }
        });
    }
}

function renderQuizStep() {
    const currentQuestion = quizQuestions[quizState.currentStep];
    const quizStepsContainer = document.getElementById('quiz-steps');
    
    updateProgressDots();
    
    quizStepsContainer.innerHTML = `
        <div class="quiz-step active">
            <div class="quiz-question">${currentQuestion.question}</div>
            <div class="quiz-options">
                ${currentQuestion.options.map(option => `
                    <div class="quiz-option ${quizState.answers[currentQuestion.id] === option.value ? 'selected' : ''}" 
                         data-value="${option.value}">
                        <div class="option-icon">
                            <i class="fas ${option.icon}"></i>
                        </div>
                        <div class="option-text">
                            <div class="option-title">${option.title}</div>
                            <div class="option-desc">${option.desc}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            quizState.answers[currentQuestion.id] = value;
            
            document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            document.getElementById('quiz-next-btn').disabled = false;
        });
    });
    
    const backBtn = document.getElementById('quiz-back-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    
    if (backBtn) {
        backBtn.style.display = quizState.currentStep > 0 ? 'flex' : 'none';
    }
    
    if (nextBtn) {
        nextBtn.disabled = !quizState.answers[currentQuestion.id];
        nextBtn.innerHTML = quizState.currentStep === quizState.totalSteps - 1 
            ? '<span>See Results</span><i class="fas fa-check"></i>' 
            : '<span>Next</span><i class="fas fa-arrow-right"></i>';
    }
}

function updateProgressDots() {
    const progressContainer = document.getElementById('quiz-progress');
    progressContainer.innerHTML = '';
    
    for (let i = 0; i < quizState.totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        
        if (i < quizState.currentStep) {
            dot.classList.add('completed');
        } else if (i === quizState.currentStep) {
            dot.classList.add('active');
        }
        
        progressContainer.appendChild(dot);
    }
}

function determineBrand() {
    const { usage, experience, budget, priority } = quizState.answers;
    
    let scores = {
        wahl: 0,
        stylecraft: 0,
        vgr: 0,
        ourbrand: 0
    };
    
    if (usage === 'professional') {
        scores.wahl += 3;
        scores.stylecraft += 3;
        scores.vgr += 2;
    } else if (usage === 'personal') {
        scores.ourbrand += 3;
        scores.vgr += 2;
    } else {
        scores.vgr += 3;
        scores.stylecraft += 2;
    }
    
    if (experience === 'expert') {
        scores.wahl += 3;
        scores.stylecraft += 3;
    } else if (experience === 'intermediate') {
        scores.vgr += 3;
        scores.stylecraft += 2;
    } else {
        scores.ourbrand += 3;
        scores.vgr += 2;
    }
    
    if (budget === 'premium') {
        scores.stylecraft += 3;
        scores.wahl += 2;
    } else if (budget === 'mid') {
        scores.wahl += 3;
        scores.vgr += 2;
    } else {
        scores.vgr += 3;
        scores.ourbrand += 2;
    }
    
    if (priority === 'power') {
        scores.wahl += 2;
        scores.stylecraft += 2;
    } else if (priority === 'versatility') {
        scores.vgr += 2;
    } else if (priority === 'durability') {
        scores.wahl += 2;
    } else {
        scores.stylecraft += 2;
    }
    
    let recommendedBrand = 'vgr';
    let highestScore = 0;
    
    for (const [brand, score] of Object.entries(scores)) {
        if (score > highestScore) {
            highestScore = score;
            recommendedBrand = brand;
        }
    }
    
    return recommendedBrand;
}

function showQuizResult() {
    const recommendedBrand = determineBrand();
    const brand = brandRecommendations[recommendedBrand];
    
    const quizStepsContainer = document.getElementById('quiz-steps');
    const quizButtons = document.querySelector('.quiz-buttons');
    const progressContainer = document.getElementById('quiz-progress');
    
    if (quizButtons) quizButtons.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
    
    quizStepsContainer.innerHTML = `
        <div class="quiz-result active">
            <div class="result-brand-logo">
                <i class="fas ${brand.icon}"></i>
            </div>
            <div class="result-title">Perfect Match!</div>
            <div class="result-brand-name">${brand.name}</div>
            <div class="result-description">${brand.description}</div>
            <div class="result-features">
                ${brand.features.map(feature => `
                    <span class="result-feature-tag"><i class="fas fa-check"></i> ${feature}</span>
                `).join('')}
            </div>
            <div class="result-cta">
                <button class="result-btn-primary" onclick="goToBrandPage('${brand.page}')">
                    <span>View ${brand.name} Products</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button class="result-btn-secondary" onclick="restartQuiz()">
                    <i class="fas fa-redo"></i>
                    <span>Retake Quiz</span>
                </button>
            </div>
        </div>
    `;
}

function goToBrandPage(page) {
    window.location.href = page;
}

function restartQuiz() {
    quizState.currentStep = 0;
    quizState.answers = {};
    
    const quizButtons = document.querySelector('.quiz-buttons');
    const progressContainer = document.getElementById('quiz-progress');
    
    if (quizButtons) quizButtons.style.display = 'flex';
    if (progressContainer) progressContainer.style.display = 'flex';
    
    renderQuizStep();
}

function showQuizModal() {
    const quizOverlay = document.getElementById('quiz-modal-overlay');
    const quizModal = document.getElementById('quiz-modal');
    
    if (quizOverlay && quizModal) {
        quizOverlay.classList.add('active');
        setTimeout(() => {
            quizModal.classList.add('active');
        }, 100);
    }
}

function closeQuizModal() {
    const quizOverlay = document.getElementById('quiz-modal-overlay');
    const quizModal = document.getElementById('quiz-modal');
    
    if (quizOverlay && quizModal) {
        quizModal.classList.remove('active');
        setTimeout(() => {
            quizOverlay.classList.remove('active');
        }, 300);
    }
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
// FLASH SALE BANNER & MODAL
// ==========================================

function initializeFlashSaleBanner() {
    const flashBanner = document.getElementById('flashBanner');
    
    if (!flashBanner) return;
    
    const bannerClosed = localStorage.getItem('flashBannerClosed');
    if (bannerClosed === 'true') {
        flashBanner.style.display = 'none';
    }
    
    updateFlashSaleTimer();
    setInterval(updateFlashSaleTimer, 1000);
}

function initializeFloatingButton() {
    const floatBtn = document.getElementById('flashFloatBtn');
    
    if (!floatBtn) return;
    
    // Show button after banner is closed or after 5 seconds
    setTimeout(() => {
        const bannerClosed = localStorage.getItem('flashBannerClosed');
        if (bannerClosed === 'true') {
            floatBtn.style.display = 'flex';
        }
    }, 5000);
    
    // Also show when banner is manually closed
    window.addEventListener('flashBannerClosed', () => {
        setTimeout(() => {
            floatBtn.style.display = 'flex';
        }, 500);
    });
}

function updateFlashSaleTimer() {
    const now = new Date().getTime();
    const distance = FLASH_SALE_END_DATE - now;
    
    if (distance < 0) {
        const bannerTimer = document.getElementById('bannerTimer');
        const modalTimer = document.getElementById('modalTimer');
        
        if (bannerTimer) bannerTimer.textContent = 'SALE ENDED';
        if (modalTimer) modalTimer.textContent = 'SALE ENDED';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    const bannerTimer = document.getElementById('bannerTimer');
    const modalTimer = document.getElementById('modalTimer');
    
    if (bannerTimer) bannerTimer.textContent = timeString;
    if (modalTimer) modalTimer.textContent = timeString;
}

function closeBanner() {
    const banner = document.getElementById('flashBanner');
    if (!banner) return;
    
    banner.style.animation = 'slideDownCompact 0.3s ease reverse';
    setTimeout(() => {
        banner.style.display = 'none';
        localStorage.setItem('flashBannerClosed', 'true');
        window.dispatchEvent(new CustomEvent('flashBannerClosed'));
    }, 300);
}

function openFlashSaleModal() {
    const modal = document.getElementById('flashModal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeFlashSaleModal() {
    const modal = document.getElementById('flashModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

async function addFlashSaleToCart() {
    const flashSaleProduct = {
        id: 999999,
        name: 'INSTINCT-X PROFESSIONAL HAIR CLIPPER',
        brand: 'StyleCraft',
        price: 139.00,
        originalPrice: 199.00,
        image: 'https://stylecraftus.com/media/catalog/product/cache/b50be48194f54833666bd3e560bd3468/i/n/instinct_x_lids.jpg',
        quantity: 1
    };
    
    const existingItem = cart.find(item => item.id === flashSaleProduct.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(flashSaleProduct);
    }
    
    saveCart();
    showNotification(`${flashSaleProduct.name} added to cart!`, 'success');
    
    const addBtn = document.querySelector('.add-to-cart-btn');
    if (addBtn) {
        const originalHTML = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fas fa-check"></i> <span>ADDED TO CART</span>';
        addBtn.style.background = '#2e7d32';
        
        setTimeout(() => {
            addBtn.innerHTML = originalHTML;
            addBtn.style.background = '#1a1a1a';
        }, 2000);
    }
    
    setTimeout(() => {
        closeFlashSaleModal();
    }, 1500);
}

function buyNowFlashSale() {
    addFlashSaleToCart();
    setTimeout(() => {
        openCart();
    }, 1000);
}
