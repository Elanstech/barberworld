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
// FLASH SALE BANNER
// ==========================================

class FlashSaleBanner {
    constructor() {
        this.banner = document.getElementById('flashSaleBanner');
        this.closeBtn = document.getElementById('flashCloseBtn');
        this.track = document.getElementById('flashProductsTrack');
        this.prevBtn = document.getElementById('flashPrev');
        this.nextBtn = document.getElementById('flashNext');
        this.addCartBtn = document.getElementById('flashAddCartBtn');
        
        this.hoursEl = document.getElementById('hoursValue');
        this.minutesEl = document.getElementById('minutesValue');
        this.secondsEl = document.getElementById('secondsValue');
        
        this.scrollAmount = 220;
        this.saleEndTime = this.getSaleEndTime();
        this.timerInterval = null;
        this.selectedProduct = null;
        
        this.flashProducts = [];
        
        this.init();
    }
    
    init() {
        if (!this.banner) return;
        
        console.log('⚡ Initializing Flash Sale Banner');
        
        this.loadFlashProducts();
        this.startTimer();
        this.attachEventListeners();
        
        console.log('✅ Flash Sale Banner initialized');
    }
    
    getSaleEndTime() {
        const now = new Date();
        const endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        return endTime;
    }
    
    startTimer() {
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const now = new Date();
        const difference = this.saleEndTime - now;
        
        if (difference <= 0) {
            this.hideBanner();
            clearInterval(this.timerInterval);
            return;
        }
        
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, '0');
        if (this.minutesEl) this.minutesEl.textContent = String(minutes).padStart(2, '0');
        if (this.secondsEl) this.secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    async loadFlashProducts() {
        if (!this.track) return;
        
        // Wait for allProducts to be loaded
        let attempts = 0;
        while (allProducts.length === 0 && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (allProducts.length > 0) {
            // Get random 6 products from all products
            const shuffled = shuffleArray([...allProducts]);
            this.flashProducts = shuffled.slice(0, 6).map(product => ({
                ...product,
                originalPrice: Math.round(product.price * 1.3), // 30% discount
                discount: 30
            }));
        } else {
            // Fallback to hardcoded products
            this.flashProducts = [
                {
                    id: 1,
                    name: 'Professional Clipper',
                    brand: 'StyleCraft',
                    originalPrice: 150,
                    price: 105,
                    discount: 30,
                    image: 'https://www.barberdepots.com/wp-content/uploads/2023/01/stylecraft-instinct-clipper-sc607m-blue-cover-on-stand.webp'
                },
                {
                    id: 2,
                    name: 'Trimmer Pro',
                    brand: 'BaBylissPRO',
                    originalPrice: 120,
                    price: 84,
                    discount: 30,
                    image: 'https://www.sallybeauty.com/dw/image/v2/BCSM_PRD/on/demandware.static/-/Sites-SBS-SallyBeautySupply/default/dw594b01df/images/large/SBS-008819.jpg?sw=750&sh=750&sfrm=png'
                },
                {
                    id: 3,
                    name: 'Shaver Elite',
                    brand: 'Wahl',
                    originalPrice: 100,
                    price: 70,
                    discount: 30,
                    image: 'https://salon-evo.com/wp-content/uploads/2023/10/Untitled-design-10.png'
                },
                {
                    id: 4,
                    name: 'Fresh Fade',
                    brand: 'JRL',
                    originalPrice: 180,
                    price: 126,
                    discount: 30,
                    image: 'https://m.media-amazon.com/images/I/51f7yv8H2-L._UF1000,1000_QL80_.jpg'
                },
                {
                    id: 5,
                    name: 'Power Clipper',
                    brand: 'Monster',
                    originalPrice: 140,
                    price: 98,
                    discount: 30,
                    image: 'https://uniquebarbersupplies.com/cdn/shop/files/Sintitulo-11_1080x.png?v=1754378536'
                },
                {
                    id: 6,
                    name: 'Premium Trimmer',
                    brand: 'W-Mark',
                    originalPrice: 110,
                    price: 77,
                    discount: 30,
                    image: 'https://ae01.alicdn.com/kf/Sb6617777eac647768f96d0c28a856251V.jpg'
                }
            ];
        }
        
        this.renderProducts();
    }
    
    renderProducts() {
        if (!this.track) return;
        
        this.track.innerHTML = '';
        
        this.flashProducts.forEach((product, index) => {
            const card = this.createProductCard(product, index);
            this.track.appendChild(card);
        });
        
        this.updateNavButtons();
    }
    
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'flash-product-card';
        card.setAttribute('data-product-index', index);
        
        const imageUrl = getProductImage(product);
        
        card.innerHTML = `
            <div class="flash-product-image">
                <img src="${imageUrl}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="flash-product-info">
                <h4 class="flash-product-name">${truncateText(product.name, 25)}</h4>
                <div class="flash-product-price">
                    <span class="flash-original-price">$${product.originalPrice || Math.round(product.price * 1.3)}</span>
                    <span class="flash-sale-price">$${product.price.toFixed(2)}</span>
                    <span class="flash-discount-badge">${product.discount || 30}% OFF</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.selectProduct(index);
        });
        
        return card;
    }
    
    selectProduct(index) {
        this.selectedProduct = this.flashProducts[index];
        
        // Remove previous selection
        const cards = this.track.querySelectorAll('.flash-product-card');
        cards.forEach(card => card.style.border = 'none');
        
        // Highlight selected card
        cards[index].style.border = '2px solid #D4AF37';
        
        console.log('Selected product:', this.selectedProduct);
    }
    
    attachEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hideBanner();
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.scrollProducts(-1);
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.scrollProducts(1);
            });
        }
        
        if (this.addCartBtn) {
            this.addCartBtn.addEventListener('click', () => {
                this.addSelectedToCart();
            });
        }
        
        if (this.track) {
            this.track.addEventListener('scroll', () => {
                this.updateNavButtons();
            });
        }
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateNavButtons();
            }, 250);
        });
    }
    
    scrollProducts(direction) {
        if (!this.track) return;
        
        const scrollAmount = this.scrollAmount * direction;
        this.track.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
    
    updateNavButtons() {
        if (!this.track || !this.prevBtn || !this.nextBtn) return;
        
        const isAtStart = this.track.scrollLeft <= 0;
        const isAtEnd = this.track.scrollLeft >= (this.track.scrollWidth - this.track.clientWidth - 5);
        
        this.prevBtn.disabled = isAtStart;
        this.nextBtn.disabled = isAtEnd;
    }
    
    async addSelectedToCart() {
        if (!this.selectedProduct) {
            // If no product selected, select the first one
            this.selectedProduct = this.flashProducts[0];
        }
        
        const product = this.selectedProduct;
        
        // Add to cart
        const existingItem = cart.find(item => item.id === product.id && item.brand === product.brand);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: getProductImage(product),
                brand: product.brand,
                quantity: 1
            });
        }
        
        saveCart();
        showNotification(`${truncateText(product.name, 40)} added to cart!`, 'success');
        
        // Visual feedback
        if (this.addCartBtn) {
            const originalText = this.addCartBtn.innerHTML;
            this.addCartBtn.innerHTML = '<i class="fas fa-check"></i> <span>Added!</span>';
            this.addCartBtn.style.background = '#2e7d32';
            
            setTimeout(() => {
                this.addCartBtn.innerHTML = originalText;
                this.addCartBtn.style.background = '';
            }, 2000);
        }
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
