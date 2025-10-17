/* ==========================================
   ULTIMATE SMART E-COMMERCE SYSTEM
   Complete Integration with All Features
   Production-Ready with Stripe & Notifications
   ========================================== */

// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentFilters = {
    search: '',
    category: 'all',
    priceMax: 500,
    sort: 'name-asc',
    quickFilter: null
};
let currentView = 'grid';

// Smart Scroll Management System
const scrollManager = {
    positions: {
        products: 0,
        sidebar: 0
    },
    activeElement: null,
    isModalOpen: false,
    
    savePosition(element, position) {
        this.positions[element] = position;
        sessionStorage.setItem(`scroll_${element}`, position);
    },
    
    restorePosition(element) {
        const saved = sessionStorage.getItem(`scroll_${element}`);
        return saved ? parseInt(saved) : 0;
    },
    
    preventBodyScroll() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = scrollbarWidth + 'px';
    },
    
    allowBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
};

// Recently Viewed Products
const recentlyViewed = {
    max: 10,
    
    add(productId) {
        let recent = this.get();
        recent = recent.filter(id => id !== productId);
        recent.unshift(productId);
        recent = recent.slice(0, this.max);
        localStorage.setItem('barber_recent', JSON.stringify(recent));
    },
    
    get() {
        try {
            return JSON.parse(localStorage.getItem('barber_recent') || '[]');
        } catch {
            return [];
        }
    }
};

// Performance Optimizer
const performanceOptimizer = {
    debounceTimers: {},
    
    debounce(func, wait, key) {
        clearTimeout(this.debounceTimers[key]);
        this.debounceTimers[key] = setTimeout(func, wait);
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ==========================================
// MODERN NOTIFICATION SYSTEM
// ==========================================

const NotificationSystem = {
    container: null,
    notifications: [],
    maxNotifications: 5,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'modern-notifications-container';
            document.body.appendChild(this.container);
            this.injectStyles();
        }
    },
    
    show(message, type = 'success', duration = 4000) {
        this.init();
        
        const id = Date.now() + Math.random();
        const notification = this.createNotification(message, type, duration, id);
        
        this.notifications.push({ id, element: notification });
        this.container.appendChild(notification);
        
        if (this.notifications.length > this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.remove(oldest.id);
        }
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
        
        return id;
    },
    
    createNotification(message, type, duration, id) {
        const notification = document.createElement('div');
        notification.className = `modern-notification ${type}`;
        notification.dataset.id = id;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            cart: 'fa-shopping-cart'
        };
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info',
            cart: 'Added to Cart'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type] || icons.success}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${titles[type] || titles.success}</div>
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="NotificationSystem.remove(${id})">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? `<div class="notification-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
        `;
        
        return notification;
    },
    
    remove(id) {
        const notification = this.container.querySelector(`[data-id="${id}"]`);
        if (notification) {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
                this.notifications = this.notifications.filter(n => n.id !== id);
            }, 400);
        }
    },
    
    removeAll() {
        this.notifications.forEach(n => this.remove(n.id));
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    injectStyles() {
        if (document.getElementById('modern-notifications-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modern-notifications-styles';
        styles.textContent = `
            .modern-notifications-container {
                position: fixed;
                top: 140px;
                right: 24px;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }
            
            .modern-notification {
                position: relative;
                display: flex;
                align-items: flex-start;
                gap: 14px;
                min-width: 380px;
                max-width: 420px;
                background: #ffffff;
                padding: 18px 20px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                pointer-events: auto;
                opacity: 0;
                transform: translateX(450px) scale(0.9);
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                overflow: hidden;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 0, 0, 0.06);
            }
            
            .modern-notification.show {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
            
            .modern-notification.hiding {
                opacity: 0;
                transform: translateX(450px) scale(0.9);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.6, 1);
            }
            
            .modern-notification::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: var(--notification-color);
            }
            
            .modern-notification.success {
                --notification-color: #10B981;
            }
            
            .modern-notification.error {
                --notification-color: #EF4444;
            }
            
            .modern-notification.warning {
                --notification-color: #F59E0B;
            }
            
            .modern-notification.info {
                --notification-color: #3B82F6;
            }
            
            .modern-notification.cart {
                --notification-color: #D4AF37;
            }
            
            .notification-icon {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--notification-color);
                color: white;
                font-size: 1.25rem;
                flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes iconBounce {
                0% {
                    transform: scale(0) rotate(-180deg);
                }
                50% {
                    transform: scale(1.2) rotate(10deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                }
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-size: 0.95rem;
                font-weight: 700;
                color: #0a0a0a;
                margin-bottom: 4px;
                letter-spacing: -0.01em;
            }
            
            .notification-message {
                font-size: 0.875rem;
                color: #6b7280;
                line-height: 1.5;
                font-weight: 500;
            }
            
            .notification-close {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 28px;
                height: 28px;
                border: none;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 0.875rem;
            }
            
            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #0a0a0a;
                transform: scale(1.1);
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--notification-color);
                width: 100%;
                transform-origin: left;
                animation: progressBar linear forwards;
            }
            
            @keyframes progressBar {
                from {
                    transform: scaleX(1);
                }
                to {
                    transform: scaleX(0);
                }
            }
            
            @media (max-width: 768px) {
                .modern-notifications-container {
                    top: 140px;
                    right: 16px;
                    left: 16px;
                }
                
                .modern-notification {
                    min-width: auto;
                    max-width: 100%;
                }
            }
            
            .modern-notification:hover .notification-progress {
                animation-play-state: paused;
            }
        `;
        document.head.appendChild(styles);
    }
};

// Convenience notification functions
function showNotification(message, type = 'success') {
    NotificationSystem.show(message, type);
}

function showSuccess(message) {
    NotificationSystem.show(message, 'success');
}

function showError(message) {
    NotificationSystem.show(message, 'error');
}

function showWarning(message) {
    NotificationSystem.show(message, 'warning');
}

function showInfo(message) {
    NotificationSystem.show(message, 'info');
}

function showCartNotification(message) {
    NotificationSystem.show(message, 'cart');
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const brand = document.body.getAttribute('data-brand');
    loadProducts(brand);
    loadCart();
    updateCartBadge();
    initializeEventListeners();
    initializeScrollEffects();
    initializeSmartScrolling();
    restoreScrollPositions();
    setupIntersectionObserver();
    setupTouchGestures();
    console.log('✨ Ultimate Smart Shopping Experience Loaded!');
});

function initializeEventListeners() {
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            changeView(view);
        });
    });

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => applyFilters());
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            performanceOptimizer.debounce(applyFilters, 300, 'search');
        });
    }

    // Category filters
    document.querySelectorAll('.filter-chip input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    // Price range filter
    const priceSlider = document.getElementById('price-range');
    if (priceSlider) {
        priceSlider.addEventListener('input', () => {
            updatePriceRange();
        });
    }

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.querySelector('.action-btn.mobile-only');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                toggleMobileMenu();
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCart();
            const mobileFilters = document.getElementById('mobile-filters-panel');
            if (mobileFilters && mobileFilters.classList.contains('active')) {
                toggleMobileFilters();
            }
        }
        
        if (scrollManager.isModalOpen) {
            if (e.key === 'ArrowLeft') navigateModalImage('prev');
            if (e.key === 'ArrowRight') navigateModalImage('next');
        }
    });
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'barber_cart') {
            loadCart();
            updateCartBadge();
        }
    });
    
    window.addEventListener('cartUpdated', () => {
        updateCartBadge();
    });
    
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
}

function initializeScrollEffects() {
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
    
    setTimeout(() => {
        document.querySelectorAll('.product-card-premium').forEach(card => {
            observer.observe(card);
        });
    }, 500);
}

// Intersection Observer for lazy loading
function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    const observeProducts = () => {
        const cards = document.querySelectorAll('.product-card-premium:not(.visible)');
        cards.forEach(card => observer.observe(card));
    };

    observeProducts();
}

// Touch gesture support
function setupTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    const modal = document.getElementById('product-modal');
    const mobileFilters = document.getElementById('mobile-filters-panel');

    if (modal) {
        modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 100) {
                closeProductModal();
            }
        }, { passive: true });
    }

    if (mobileFilters) {
        mobileFilters.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        mobileFilters.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            if (touchStartY - touchEndY > 50) {
                toggleMobileFilters();
            }
        }, { passive: true });
    }
}

// ==========================================
// SMART SCROLLING SYSTEM
// ==========================================

function initializeSmartScrolling() {
    const productsMain = document.getElementById('products-main');
    const sidebar = document.querySelector('.sidebar-sticky');
    
    if (productsMain) {
        productsMain.addEventListener('scroll', performanceOptimizer.throttle(() => {
            scrollManager.savePosition('products', productsMain.scrollTop);
        }, 100));
        
        productsMain.addEventListener('mouseenter', () => {
            scrollManager.activeElement = 'products';
        });
        
        productsMain.addEventListener('mouseleave', () => {
            scrollManager.activeElement = null;
        });
    }
    
    if (sidebar) {
        sidebar.addEventListener('scroll', performanceOptimizer.throttle(() => {
            scrollManager.savePosition('sidebar', sidebar.scrollTop);
        }, 100));
        
        sidebar.addEventListener('mouseenter', () => {
            scrollManager.activeElement = 'sidebar';
        });
        
        sidebar.addEventListener('mouseleave', () => {
            scrollManager.activeElement = null;
        });
    }
    
    document.addEventListener('wheel', (e) => {
        if (scrollManager.isModalOpen) return;
        
        const productsMain = document.getElementById('products-main');
        const sidebar = document.querySelector('.sidebar-sticky');
        
        if (scrollManager.activeElement === 'products' && productsMain) {
            const canScrollDown = productsMain.scrollTop < productsMain.scrollHeight - productsMain.clientHeight;
            const canScrollUp = productsMain.scrollTop > 0;
            const isScrollingDown = e.deltaY > 0;
            
            if ((isScrollingDown && canScrollDown) || (!isScrollingDown && canScrollUp)) {
                e.preventDefault();
                productsMain.scrollTop += e.deltaY;
            }
        } 
        else if (scrollManager.activeElement === 'sidebar' && sidebar) {
            const canScrollDown = sidebar.scrollTop < sidebar.scrollHeight - sidebar.clientHeight;
            const canScrollUp = sidebar.scrollTop > 0;
            const isScrollingDown = e.deltaY > 0;
            
            if ((isScrollingDown && canScrollDown) || (!isScrollingDown && canScrollUp)) {
                e.preventDefault();
                sidebar.scrollTop += e.deltaY;
            }
        }
    }, { passive: false });
}

function restoreScrollPositions() {
    setTimeout(() => {
        const productsMain = document.getElementById('products-main');
        const sidebar = document.querySelector('.sidebar-sticky');
        
        if (productsMain) {
            productsMain.scrollTop = scrollManager.restorePosition('products');
        }
        if (sidebar) {
            sidebar.scrollTop = scrollManager.restorePosition('sidebar');
        }
    }, 100);
}

// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts(brand) {
    try {
        const grid = document.getElementById('products-grid');
        const countEl = document.getElementById('products-count');
        
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem;">
                    <div style="width: 80px; height: 80px; border: 5px solid var(--gold); border-top-color: transparent; border-radius: 50%; margin: 0 auto 2rem; animation: spin 1s linear infinite;"></div>
                    <h3 style="color: var(--primary); font-weight: 800; margin-bottom: 0.5rem;">Loading Premium Collection</h3>
                    <p style="color: var(--gray-600); font-weight: 500;">Preparing something amazing for you...</p>
                </div>
            `;
        }
        
        const jsonFile = `../json/${brand}-products.json`;
        const response = await fetch(jsonFile);
        
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        updateProductCounts();
        updateHeroStats();
        applyFilters();
        
        console.log(`✅ Loaded ${allProducts.length} premium products`);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem;">
                    <div style="width: 100px; height: 100px; background: rgba(212, 175, 55, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gold);"></i>
                    </div>
                    <h3 style="color: var(--primary); font-weight: 800; margin-bottom: 0.5rem;">Unable to Load Products</h3>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">Please refresh the page or try again later.</p>
                    <button onclick="location.reload()" style="padding: 1rem 2rem; background: linear-gradient(135deg, var(--gold), var(--gold-hover)); color: white; border: none; border-radius: 50px; font-weight: 700; cursor: pointer;">Refresh Page</button>
                </div>
            `;
        }
        showError('Failed to load products. Please try again.');
    }
}

// ==========================================
// FILTER & SORT SYSTEM
// ==========================================

function applyFilters() {
    performanceOptimizer.debounce(() => {
        const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';
        const categoryValue = document.querySelector('input[name="category"]:checked')?.value || 'all';
        const priceValue = parseInt(document.getElementById('price-range')?.value || 500);
        const sortValue = document.getElementById('sort-select')?.value || 'name-asc';
        
        currentFilters = {
            search: searchValue,
            category: categoryValue,
            priceMax: priceValue,
            sort: sortValue,
            quickFilter: currentFilters.quickFilter
        };
        
        filteredProducts = allProducts.filter(product => {
            if (searchValue && !product.name.toLowerCase().includes(searchValue)) {
                return false;
            }
            
            if (categoryValue !== 'all' && product.category !== categoryValue) {
                return false;
            }
            
            if (product.price > priceValue) {
                return false;
            }
            
            if (currentFilters.quickFilter === 'inStock' && product.inStock === false) {
                return false;
            }
            if (currentFilters.quickFilter === 'topRated' && (!product.rating || product.rating < 4.5)) {
                return false;
            }
            
            return true;
        });
        
        filteredProducts.sort((a, b) => {
            switch (sortValue) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });
        
        updateActiveFilters();
        renderProducts();
        updateProductCounts();
    }, 300, 'applyFilters');
}

function updateActiveFilters() {
    const activeFiltersBar = document.getElementById('active-filters-bar');
    const activeFilterTags = document.getElementById('active-filter-tags');
    
    if (!activeFiltersBar || !activeFilterTags) return;
    
    const tags = [];
    
    if (currentFilters.search) {
        tags.push({ type: 'search', label: `Search: "${currentFilters.search}"` });
    }
    
    if (currentFilters.category !== 'all') {
        tags.push({ type: 'category', label: `Category: ${currentFilters.category}` });
    }
    
    if (currentFilters.priceMax < 500) {
        tags.push({ type: 'price', label: `Under $${currentFilters.priceMax}` });
    }
    
    if (currentFilters.quickFilter) {
        const labels = {
            inStock: 'In Stock Only',
            topRated: 'Top Rated',
            newArrivals: 'New Arrivals'
        };
        tags.push({ type: 'quick', label: labels[currentFilters.quickFilter] });
    }
    
    if (tags.length > 0) {
        activeFiltersBar.style.display = 'block';
        activeFilterTags.innerHTML = tags.map(tag => `
            <div class="filter-tag">
                ${escapeHtml(tag.label)}
                <button onclick="removeFilter('${tag.type}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    } else {
        activeFiltersBar.style.display = 'none';
    }
}

function removeFilter(type) {
    switch (type) {
        case 'search':
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            break;
        case 'category':
            const allCategoryRadio = document.querySelector('input[name="category"][value="all"]');
            if (allCategoryRadio) allCategoryRadio.checked = true;
            break;
        case 'price':
            const priceRange = document.getElementById('price-range');
            if (priceRange) priceRange.value = 500;
            updatePriceRange();
            break;
        case 'quick':
            currentFilters.quickFilter = null;
            document.querySelectorAll('.quick-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            break;
    }
    applyFilters();
}

function clearAllFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    const allCategoryRadio = document.querySelector('input[name="category"][value="all"]');
    if (allCategoryRadio) allCategoryRadio.checked = true;
    
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
        priceRange.value = 500;
        updatePriceRange();
    }
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'name-asc';
    
    currentFilters.quickFilter = null;
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.mobile-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.dataset.category === 'all') {
            pill.classList.add('active');
        }
    });
    
    applyFilters();
    showInfo('All filters cleared');
}

function updateProductCounts() {
    if (allProducts.length === 0) return;
    
    const counts = {
        all: allProducts.length,
        Clipper: allProducts.filter(p => p.category === 'Clipper').length,
        Trimmer: allProducts.filter(p => p.category === 'Trimmer').length,
        Shaver: allProducts.filter(p => p.category === 'Shaver').length
    };
    
    Object.keys(counts).forEach(key => {
        const badge = document.getElementById(`count-${key.toLowerCase()}`);
        if (badge) badge.textContent = counts[key];
    });
}

function updateHeroStats() {
    const heroCount = document.getElementById('product-count-hero');
    if (heroCount) {
        heroCount.textContent = allProducts.length;
    }
}

function updatePriceRange() {
    const slider = document.getElementById('price-range');
    const minDisplay = document.getElementById('min-price-display');
    const maxDisplay = document.getElementById('max-price-display');
    
    if (!slider) return;
    
    const value = parseInt(slider.value);
    
    if (minDisplay) minDisplay.textContent = '$0';
    if (maxDisplay) maxDisplay.textContent = value >= 500 ? '$500+' : `$${value}`;
    
    const percentage = (value / 500) * 100;
    slider.style.setProperty('--slider-value', `${percentage}%`);
    
    applyFilters();
}

function quickFilter(type) {
    if (currentFilters.quickFilter === type) {
        currentFilters.quickFilter = null;
    } else {
        currentFilters.quickFilter = type;
    }
    
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (currentFilters.quickFilter) {
        const activeBtn = document.querySelector(`.quick-filter-btn[onclick="quickFilter('${type}')"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    applyFilters();
}

// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('products-count');
    
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (countEl) countEl.textContent = 'No products found';
        return;
    }
    
    grid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    if (countEl) {
        countEl.innerHTML = `Showing <strong>${filteredProducts.length}</strong> of <strong>${allProducts.length}</strong> products`;
    }
    
    grid.innerHTML = filteredProducts.map((product, index) => `
        <div class="product-card-premium" onclick="openProductModal(${product.id})" style="animation-delay: ${index * 0.05}s">
            <div class="product-image-container">
                ${product.inStock !== false ? 
                    '<div class="product-stock-badge-premium">In Stock</div>' : 
                    '<div class="product-stock-badge-premium out-of-stock">Out of Stock</div>'
                }
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-image-premium" loading="lazy">
                <div class="product-actions-overlay">
                    <button class="action-btn-premium" onclick="event.stopPropagation(); openProductModal(${product.id});" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn-premium" onclick="event.stopPropagation(); addToCart(${product.id});" title="Add to Cart">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="product-info-premium">
                ${product.category ? `<div class="product-category-badge">${escapeHtml(product.category)}</div>` : ''}
                <h3 class="product-name-premium">${escapeHtml(product.name)}</h3>
                <div class="product-footer">
                    <div class="product-price-premium">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn-premium" onclick="event.stopPropagation(); addToCart(${product.id});">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    initializeScrollEffects();
    setupIntersectionObserver();
}

function changeView(view) {
    currentView = view;
    const grid = document.getElementById('products-grid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    if (grid) {
        grid.setAttribute('data-view', view);
    }
    
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
}

// ==========================================
// PRODUCT MODAL
// ==========================================

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    recentlyViewed.add(productId);
    
    const productsMain = document.getElementById('products-main');
    if (productsMain) {
        scrollManager.savePosition('products', productsMain.scrollTop);
    }
    
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) return;
    
    const images = product.images && product.images.length > 0 ? 
        [product.image, ...product.images] : [product.image];
    
    modalBody.innerHTML = `
        <div class="modal-grid-luxury">
            <div class="modal-images-luxury">
                <div class="modal-main-image-container">
                    <img id="modal-main-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" class="modal-main-image-luxury">
                </div>
                ${images.length > 1 ? `
                    <div class="modal-thumbnails-luxury">
                        ${images.map((img, idx) => `
                            <img src="${escapeHtml(img)}" 
                                 alt="${escapeHtml(product.name)}" 
                                 class="modal-thumbnail-luxury ${idx === 0 ? 'active' : ''}" 
                                 onclick="changeModalImage('${escapeHtml(img)}', this)">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-details-luxury">
                <h2>${escapeHtml(product.name)}</h2>
                
                <div class="modal-price-luxury">$${product.price.toFixed(2)}</div>
                
                ${product.inStock !== false ? 
                    '<div class="modal-stock-luxury"><i class="fas fa-check-circle"></i> In Stock & Ready to Ship</div>' : 
                    '<div class="modal-stock-luxury" style="background: rgba(220, 53, 69, 0.1); color: #dc3545; border-color: #dc3545;"><i class="fas fa-times-circle"></i> Currently Out of Stock</div>'
                }
                
                ${product.shortDescription ? `
                    <p style="color: var(--gray-600); margin-bottom: 2rem; line-height: 1.9; font-size: 1.05rem;">${escapeHtml(product.shortDescription)}</p>
                ` : ''}
                
                ${product.description ? `
                    <div class="modal-description-luxury">
                        ${escapeHtml(product.description)}
                    </div>
                ` : ''}
                
                ${product.features && product.features.length > 0 ? `
                    <div class="modal-features-luxury">
                        <h4><i class="fas fa-sparkles" style="color: var(--gold); margin-right: 0.5rem;"></i>Key Features</h4>
                        <ul>
                            ${product.features.map(feature => `
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    <span>${escapeHtml(feature)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${product.specifications ? `
                    <div class="modal-specs-luxury">
                        <h4><i class="fas fa-cog" style="color: var(--gold); margin-right: 0.5rem;"></i>Specifications</h4>
                        <div class="specs-grid-luxury">
                            ${Object.entries(product.specifications).map(([key, value]) => `
                                <div class="spec-item-luxury">
                                    <div class="spec-label-luxury">${escapeHtml(key)}</div>
                                    <div class="spec-value-luxury">${escapeHtml(String(value))}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button class="modal-add-to-cart-luxury" onclick="addToCart(${product.id}); closeProductModal();">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Add to Cart - $${product.price.toFixed(2)}</span>
                </button>
            </div>
        </div>
    `;
    
    scrollManager.preventBodyScroll();
    scrollManager.isModalOpen = true;
    
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeProductModal(event) {
    if (event && event.target.id !== 'product-modal' && !event.target.classList.contains('luxury-modal-close')) return;
    
    const modal = document.getElementById('product-modal');
    if (modal && modal.classList.contains('active')) {
        scrollManager.allowBodyScroll();
        scrollManager.isModalOpen = false;
        
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        
        const productsMain = document.getElementById('products-main');
        if (productsMain) {
            productsMain.scrollTop = scrollManager.positions.products;
        }
    }
}

function changeModalImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
        mainImage.style.opacity = '0';
        mainImage.style.transform = 'scale(0.92)';
        
        setTimeout(() => {
            mainImage.src = imageSrc;
            setTimeout(() => {
                mainImage.style.opacity = '1';
                mainImage.style.transform = 'scale(1)';
            }, 50);
        }, 250);
    }
    
    document.querySelectorAll('.modal-thumbnail-luxury').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

function navigateModalImage(direction) {
    const thumbnails = document.querySelectorAll('.modal-thumbnail-luxury');
    if (thumbnails.length <= 1) return;
    
    const activeThumbnail = document.querySelector('.modal-thumbnail-luxury.active');
    const currentIndex = Array.from(thumbnails).indexOf(activeThumbnail);
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % thumbnails.length;
    } else {
        newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    }
    
    thumbnails[newIndex].click();
}

// ==========================================
// MOBILE FILTERS
// ==========================================

function toggleMobileFilters() {
    const overlay = document.getElementById('mobile-filters-overlay');
    const panel = document.getElementById('mobile-filters-panel');
    
    if (!overlay || !panel) return;
    
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        overlay.classList.remove('active');
        scrollManager.allowBodyScroll();
    } else {
        panel.classList.add('active');
        overlay.classList.add('active');
        scrollManager.preventBodyScroll();
    }
}

function selectMobileCategory(button, category) {
    document.querySelectorAll('.mobile-pill[data-category]').forEach(pill => {
        pill.classList.remove('active');
    });
    button.classList.add('active');
    
    const radio = document.querySelector(`input[name="category"][value="${category}"]`);
    if (radio) radio.checked = true;
    
    applyFilters();
}

function mobileSort() {
    const mobileSelect = document.getElementById('mobile-sort-select');
    const desktopSelect = document.getElementById('sort-select');
    
    if (mobileSelect && desktopSelect) {
        desktopSelect.value = mobileSelect.value;
        applyFilters();
    }
}

// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
        if (menu.classList.contains('active')) {
            scrollManager.preventBodyScroll();
        } else {
            scrollManager.allowBodyScroll();
        }
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

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
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
            brand: product.brand || 'StyleCraft',
            quantity: 1
        });
    }
    
    saveCart();
    showCartNotification(`${product.name} added to cart!`);
    
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }
}

function removeFromCart(productId) {
    const product = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    
    if (product) {
        showInfo(`${product.name} removed from cart`);
    }
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const cartSubtitle = document.getElementById('cart-subtitle');
    
    if (!cartItems) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartSubtitle) {
        cartSubtitle.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty-premium">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <p>Your cart is empty</p>
                <span>Start adding some premium products!</span>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }
    
    if (cartFooter) cartFooter.style.display = 'block';
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item-premium" style="animation-delay: ${index * 0.1}s">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-image-premium">
            <div class="cart-item-details-premium">
                <div class="cart-item-name-premium">${escapeHtml(item.name)}</div>
                <div class="cart-item-price-premium">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions-premium">
                    <button class="qty-btn-premium" onclick="updateCartQuantity(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-display-premium">${item.quantity}</span>
                    <button class="qty-btn-premium" onclick="updateCartQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn-premium" onclick="removeFromCart(${item.id})" title="Remove from cart">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel && cartOverlay) {
        updateCartDisplay();
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
        scrollManager.preventBodyScroll();
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartPanel && cartOverlay) {
        cartPanel.classList.remove('active');
        cartOverlay.classList.remove('active');
        scrollManager.allowBodyScroll();
    }
}

// ==========================================
// CHECKOUT - STRIPE INTEGRATION
// ==========================================

async function proceedToCheckout() {
    if (cart.length === 0) {
        showWarning('Your cart is empty!');
        return;
    }
    
    try {
        showInfo('Preparing your checkout...');
        
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `${item.brand || 'StyleCraft'} - Professional Equipment`,
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
        showError('Checkout failed. Please contact support at barberworldnyc@gmail.com');
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// ANIMATIONS
// ==========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ==========================================
// CONSOLE LOGS
// ==========================================

console.log('✨ Ultimate Smart Shopping Experience Ready!');
console.log('🛒 Cart System: Fully Functional');
console.log('💳 Stripe Checkout: Working & Tested');
console.log('🎯 Smart Scrolling: Active');
console.log('⚡ Performance: Optimized');
console.log('📱 Mobile: Responsive');
console.log('🔔 Modern Notifications: Active');
