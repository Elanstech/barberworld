/* ========================================
   BARBER WORLD - MODERN CLASS-BASED ARCHITECTURE
   Professional Equipment & Supplies
   ======================================== */

/**
 * Main Application Controller
 */
class BarberWorld {
    constructor() {
        this.components = {};
        this.state = {
            isInitialized: false,
            currentSection: 'home',
            allProducts: []
        };
        
        console.log('🔥 Barber World Loading...');
        this.init();
    }

    async init() {
        try {
            // Load products first
            await this.loadProducts();
            
            // Initialize all components
            this.components.header = new ModernHeader();
            this.components.cart = new CartManager();
            this.components.search = new SearchManager();
            this.components.brands = new BrandsManager();
            this.components.ui = new UIManager();
            this.components.scroll = new ScrollManager();
            this.components.animation = new AnimationManager();

            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Add dynamic styles
            this.addDynamicStyles();
            
            // Mark as initialized
            this.state.isInitialized = true;
            
            console.log('✅ Barber World Initialized Successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Barber World:', error);
        }
    }

    async loadProducts() {
        try {
            const responses = await Promise.all([
                fetch('babyliss-products.json').catch(() => ({ ok: false })),
                fetch('stylecraft-products.json').catch(() => ({ ok: false })),
                fetch('jrl-products.json').catch(() => ({ ok: false })),
                fetch('wahl-products.json').catch(() => ({ ok: false }))
            ]);

            const data = await Promise.all(
                responses.map(res => res.ok ? res.json() : [])
            );

            this.state.allProducts = data.flat();
            console.log(`📦 Loaded ${this.state.allProducts.length} products`);
        } catch (error) {
            console.error('Error loading products:', error);
            this.state.allProducts = this.getSampleProducts();
        }
    }

    getSampleProducts() {
        return [
            { id: 1, name: "JRL Onyx Clipper 2020C-B", price: 225, brand: "JRL" },
            { id: 2, name: "StyleCraft Instinct Clipper", price: 269, brand: "StyleCraft" },
            { id: 3, name: "Wahl Magic Clip Cordless", price: 150, brand: "Wahl" },
            { id: 4, name: "BaByliss FXONE Clipper", price: 229, brand: "Babyliss" },
            { id: 5, name: "JRL Ghost Trimmer", price: 145, brand: "JRL" },
            { id: 6, name: "StyleCraft Rebel Trimmer", price: 159, brand: "StyleCraft" },
            { id: 7, name: "Wahl Detailer Cordless", price: 139, brand: "Wahl" },
            { id: 8, name: "Babyliss Lo Pro FX Trimmer", price: 130, brand: "Babyliss" }
        ];
    }

    setupGlobalEvents() {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            console.log('🚀 Barber World fully loaded!');
        });
    }

    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to { transform: scale(2); opacity: 0; }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            .scroll-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #d4af37;
                color: white;
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                cursor: pointer;
            }
            .scroll-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
            .scroll-to-top:hover {
                background: #b8941f;
                transform: translateY(-5px);
            }
            @media (max-width: 768px) {
                .scroll-to-top {
                    width: 45px;
                    height: 45px;
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    getComponent(name) {
        return this.components[name];
    }
}

/**
 * Modern Header Controller
 */
class ModernHeader {
    constructor() {
        this.header = document.getElementById('header');
        this.cartCount = document.getElementById('cart-count');
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.updateCartDisplay();
        console.log('🎯 Header initialized');
    }

    setupEventListeners() {
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    setupScrollEffects() {
        let ticking = false;
        const updateHeader = () => {
            const scrollY = window.pageYOffset;
            if (scrollY > 50) {
                this.header?.classList.add('scrolled');
            } else {
                this.header?.classList.remove('scrolled');
            }
            this.lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    updateCartDisplay() {
        const cartData = window.barberWorld?.components?.cart?.getItems() || [];
        const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            if (totalItems > 0) {
                this.cartCount.classList.add('visible');
            } else {
                this.cartCount.classList.remove('visible');
            }
        }
    }

    animateCartIcon() {
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.style.transform = 'scale(1.1)';
            setTimeout(() => { cartBtn.style.transform = ''; }, 300);
        }
        this.updateCartDisplay();
    }
}

/**
 * Cart Management System
 */
class CartManager {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        console.log('🛒 Cart Manager initialized');
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCartToStorage();
        this.updateDisplay();
        this.animateCartIcon();
        window.barberWorld?.components?.ui?.showNotification(`${product.name} added to cart!`, 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateDisplay();
    }

    getItems() {
        return this.items;
    }

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateDisplay() {
        window.barberWorld?.components?.header?.updateCartDisplay();
    }

    animateCartIcon() {
        window.barberWorld?.components?.header?.animateCartIcon();
    }

    saveCartToStorage() {
        try {
            localStorage.setItem('barberworld_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('Could not save cart:', error);
        }
    }

    loadCartFromStorage() {
        try {
            const saved = localStorage.getItem('barberworld_cart');
            if (saved) {
                this.items = JSON.parse(saved);
                this.updateDisplay();
            }
        } catch (error) {
            console.warn('Could not load cart:', error);
        }
    }

    showCart() {
        if (this.items.length === 0) {
            window.barberWorld?.components?.ui?.showNotification('Your cart is empty', 'error');
            return;
        }
        
        const total = this.getTotalPrice();
        const getProductImage = (item) => {
            const name = item.name.toLowerCase();
            if (name.includes('clipper')) return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60&h=60&fit=crop';
            if (name.includes('trimmer')) return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=60&h=60&fit=crop';
            return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=60&h=60&fit=crop';
        };

        const cartItems = this.items.map(item => `
            <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid #e9ecef; align-items: center;">
                <img src="${getProductImage(item)}" style="width: 60px; height: 60px; border-radius: 0.5rem; object-fit: cover;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">${item.name}</div>
                    <div style="color: #6c757d; font-size: 0.75rem;">Qty: ${item.quantity}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 700; color: #d4af37; font-size: 0.875rem;">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="window.barberWorld.components.cart.removeItem(${item.id}); document.querySelector('.modal-overlay').remove(); window.barberWorld.components.cart.showCart();" 
                        style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">Remove</button>
                </div>
            </div>
        `).join('');

        window.barberWorld?.components?.ui?.createModal({
            title: `Shopping Cart (${this.items.length})`,
            content: `
                <div>${cartItems}
                    <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; margin-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 1.25rem; font-weight: 700;">Total:</span>
                            <span style="font-size: 1.5rem; font-weight: 700; color: #d4af37;">$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `,
            onConfirm: () => {
                window.barberWorld?.components?.ui?.showNotification('Checkout coming soon!', 'success');
            },
            confirmText: 'Checkout'
        });
    }
}

/**
 * Search Management System
 */
class SearchManager {
    constructor() {
        this.isModalOpen = false;
        this.init();
    }

    init() {
        this.setupSearchOverlay();
        console.log('🔍 Search Manager initialized');
    }

    setupSearchOverlay() {
        const searchBtn = document.getElementById('search-btn');
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.getElementById('search-close');
        const searchInput = document.getElementById('search-input');

        if (searchBtn && searchOverlay) {
            searchBtn.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                setTimeout(() => searchInput?.focus(), 300);
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchOverlay?.classList.remove('active');
                if (searchInput) searchInput.value = '';
                document.getElementById('search-results')?.classList.remove('active');
            });
        }

        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.remove('active');
                    if (searchInput) searchInput.value = '';
                    document.getElementById('search-results')?.classList.remove('active');
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.showSearchResults(query);
                        searchOverlay?.classList.remove('active');
                        searchInput.value = '';
                        document.getElementById('search-results')?.classList.remove('active');
                    }
                }
            });
        }
    }

    handleSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        if (!query.trim()) {
            resultsContainer?.classList.remove('active');
            return;
        }

        const allProducts = window.barberWorld?.state?.allProducts || [];
        const searchTerm = query.toLowerCase();
        const results = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm)
        ).slice(0, 8);

        if (results.length > 0 && resultsContainer) {
            resultsContainer.innerHTML = results.map(p => this.createSearchResultItem(p)).join('');
            resultsContainer.classList.add('active');
        }
    }

    createSearchResultItem(product) {
        const getProductImage = (p) => {
            const name = p.name.toLowerCase();
            if (name.includes('clipper')) return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60&h=60&fit=crop';
            if (name.includes('trimmer')) return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=60&h=60&fit=crop';
            return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=60&h=60&fit=crop';
        };

        return `
            <div class="search-result-item" onclick="window.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <img src="${getProductImage(product)}" alt="${product.name}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-name">${product.name}</div>
                    <div class="search-result-brand">${product.brand}</div>
                </div>
                <div class="search-result-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
    }

    showSearchResults(query) {
        const allProducts = window.barberWorld?.state?.allProducts || [];
        const searchTerm = query.toLowerCase();
        const products = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm)
        );

        this.displayProducts(products, `Search: "${query}"`);
    }

    displayProducts(products, title) {
        const brandsSection = document.getElementById('brands');
        const productsSection = document.getElementById('products');
        const productsGrid = document.getElementById('products-grid');
        const noProducts = document.getElementById('no-products');
        const productsTitle = document.getElementById('products-title');
        const productsCount = document.getElementById('products-count');

        if (brandsSection) brandsSection.style.display = 'none';
        if (productsSection) productsSection.style.display = 'block';
        if (productsTitle) productsTitle.textContent = title;
        if (productsCount) productsCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

        if (products.length === 0) {
            if (productsGrid) productsGrid.style.display = 'none';
            if (noProducts) noProducts.style.display = 'block';
        } else {
            if (noProducts) noProducts.style.display = 'none';
            if (productsGrid) {
                productsGrid.style.display = 'grid';
                productsGrid.innerHTML = products.map(p => this.createProductCard(p)).join('');
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    createProductCard(product) {
        const getProductImage = (p) => {
            const name = p.name.toLowerCase();
            if (name.includes('clipper')) return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop';
            if (name.includes('trimmer')) return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=300&fit=crop';
            return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=300&h=300&fit=crop';
        };

        return `
            <div class="product-card" onclick="window.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="product-image">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-content">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn-primary" onclick="event.stopPropagation(); window.barberWorld.components.cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Brands Management System
 */
class BrandsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupBrandCards();
        console.log('🏷️ Brands Manager initialized');
    }

    setupBrandCards() {
        const brandCards = document.querySelectorAll('.brand-card');
        brandCards.forEach(card => {
            card.addEventListener('click', () => {
                const brandName = card.dataset.brand || card.querySelector('.brand-name')?.textContent || 'Brand';
                this.handleBrandClick(brandName);
            });
        });
    }

    handleBrandClick(brandName) {
        const allProducts = window.barberWorld?.state?.allProducts || [];
        const products = allProducts.filter(p => 
            p.brand.toLowerCase() === brandName.toLowerCase() ||
            brandName.toLowerCase().includes(p.brand.toLowerCase())
        );

        window.barberWorld?.components?.search?.displayProducts(products, brandName);
    }
}

/**
 * UI Management System
 */
class UIManager {
    constructor() {
        this.activeNotifications = [];
        console.log('🎨 UI Manager initialized');
    }

    createModal({ title, content, onConfirm, confirmText = 'OK', cancelText = 'Close' }) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 4000; padding: 1rem;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 1rem; padding: 1.5rem; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">${title}</h2>
                <div style="margin-bottom: 1.5rem;">${content}</div>
                <div style="display: flex; gap: 0.75rem;">
                    <button class="modal-cancel" style="flex: 1; padding: 0.875rem; background: #f8f9fa; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">${cancelText}</button>
                    <button class="modal-confirm" style="flex: 1; padding: 0.875rem; background: #d4af37; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        return modal;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed; top: 80px; right: 1rem; padding: 0.75rem 1rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white; border-radius: 0.75rem; z-index: 3000;
            transform: translateX(100%); transition: transform 0.3s ease;
            font-weight: 500; font-size: 0.875rem; max-width: 300px;
        `;
        notification.innerHTML = `<div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>`;

        document.body.appendChild(notification);
        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 10);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

/**
 * Scroll Management System
 */
class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.createScrollToTopButton();
        this.setupScrollEffects();
        console.log('📜 Scroll Manager initialized');
    }

    createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(scrollBtn);
    }

    setupScrollEffects() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollBtn = document.querySelector('.scroll-to-top');
                    if (scrollBtn) {
                        scrollBtn.classList.toggle('visible', window.pageYOffset > 300);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

/**
 * Animation Management System
 */
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        console.log('🎭 Animation Manager initialized');
    }

    setupScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

            const brandCards = document.querySelectorAll('.brand-card');
            brandCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
                observer.observe(card);
            });
        }
    }
}

// Global Functions
window.showProductDetails = function(product) {
    const getProductImage = (p) => {
        const name = p.name.toLowerCase();
        if (name.includes('clipper')) return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop';
        if (name.includes('trimmer')) return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=300&fit=crop';
        return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=300&h=300&fit=crop';
    };

    window.barberWorld?.components?.ui?.createModal({
        title: product.name,
        content: `
            <div style="text-align: center;">
                <img src="${getProductImage(product)}" alt="${product.name}" style="width: 100%; max-width: 300px; border-radius: 0.75rem; margin: 0 auto 1rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: inline-block; background: #d4af37; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; margin-bottom: 0.75rem;">${product.brand}</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #d4af37; margin-bottom: 0.5rem;">$${product.price.toFixed(2)}</div>
                </div>
            </div>
        `,
        onConfirm: () => window.barberWorld?.components?.cart?.addItem(product),
        confirmText: 'Add to Cart'
    });
};

window.showCart = function() {
    window.barberWorld?.components?.cart?.showCart();
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.barberWorld = new BarberWorld();
    
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('products').style.display = 'none';
            document.getElementById('brands').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => window.showCart());
    }
});
