/* ========================================
   BARBER WORLD - MODERN CLASS-BASED ARCHITECTURE
   Professional Equipment & Supplies
   ======================================== */

/**
 * Main Application Controller
 * Orchestrates all components and manages the application lifecycle
 */
class BarberWorld {
    constructor() {
        this.components = {};
        this.state = {
            isInitialized: false,
            currentSection: 'home'
        };
        
        console.log('🔥 Barber World Loading...');
        this.init();
    }

    async init() {
        try {
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
            
            // Welcome message
            setTimeout(() => {
                this.components.ui.showNotification('Welcome to Barber World! ✂️', 'success');
            }, 500);
            
            console.log('✅ Barber World Initialized Successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Barber World:', error);
        }
    }

    setupGlobalEvents() {
        // Page load completion
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            console.log('🚀 Barber World fully loaded and ready!');
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Page hidden');
            } else {
                console.log('📱 Page visible');
            }
        });
    }

    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Ripple animation */
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            /* Animate in class */
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }

            /* Scroll to top button */
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

            /* Cart count visibility */
            .cart-count.visible,
            .cart-badge.visible {
                opacity: 1;
                transform: scale(1);
            }

            /* Loading state */
            .loaded {
                transition: opacity 0.5s ease;
            }

            /* Enhanced mobile styles */
            @media (max-width: 768px) {
                .brand-card:active {
                    transform: scale(0.98) !important;
                }
                
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

    // Public API methods
    getComponent(name) {
        return this.components[name];
    }

    updateState(key, value) {
        this.state[key] = value;
    }

    getState(key) {
        return this.state[key];
    }
}

/**
 * Modern Header Controller
 * Handles all header functionality including navigation and mobile menu
 */
class ModernHeader {
    constructor() {
        this.header = document.getElementById('header');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        this.mobileOverlay = document.getElementById('mobile-overlay');
        this.cartCount = document.getElementById('cart-count');
        this.mobileCartCount = document.getElementById('mobile-cart-count');
        this.isMobileMenuOpen = false;
        this.lastScrollY = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupMobileDropdowns();
        this.setupNavigation();
        this.updateCartDisplay();
        
        console.log('🎯 Modern Header initialized');
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Mobile overlay
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Logo click
        const logoSection = document.querySelector('.logo-section');
        if (logoSection) {
            logoSection.addEventListener('click', () => {
                this.scrollToTop();
            });
        }

        // Escape key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        this.setupNavigationLinks();
    }

    setupScrollEffects() {
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.pageYOffset;
            
            // Add scrolled class
            if (scrollY > 50) {
                this.header?.classList.add('scrolled');
            } else {
                this.header?.classList.remove('scrolled');
            }

            // Hide header on scroll down, show on scroll up
            if (scrollY > this.lastScrollY && scrollY > 100) {
                this.header?.style.setProperty('transform', 'translateY(-100%)');
            } else {
                this.header?.style.setProperty('transform', 'translateY(0)');
            }

            this.lastScrollY = scrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    setupMobileDropdowns() {
        const dropdownTriggers = document.querySelectorAll('.mobile-dropdown-trigger');
        
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = trigger.closest('.mobile-dropdown');
                this.toggleMobileDropdown(dropdown);
            });
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Handle hash links
                if (href && href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    this.scrollToSection(href);
                    this.setActiveLink(link);
                }
            });
        });

        // Set active link based on current section
        this.updateActiveNavigation();
        window.addEventListener('scroll', () => {
            this.updateActiveNavigation();
        }, { passive: true });
    }

    setupNavigationLinks() {
        // Desktop navigation active states
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.animateNavLink(link, true);
            });
            
            link.addEventListener('mouseleave', () => {
                this.animateNavLink(link, false);
            });
        });

        // Mobile navigation
        const mobileLinks = document.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.mobileToggle?.classList.add('active');
        this.mobileNav?.classList.add('active');
        this.mobileOverlay?.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Animate menu items
        this.animateMobileMenuItems(true);
        
        console.log('📱 Mobile menu opened');
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.mobileToggle?.classList.remove('active');
        this.mobileNav?.classList.remove('active');
        this.mobileOverlay?.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Close all mobile dropdowns
        const openDropdowns = document.querySelectorAll('.mobile-dropdown.active');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        
        console.log('📱 Mobile menu closed');
    }

    toggleMobileDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');
        
        // Close all other dropdowns
        const allDropdowns = document.querySelectorAll('.mobile-dropdown');
        allDropdowns.forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('active');
            }
        });
        
        // Toggle current dropdown
        if (isActive) {
            dropdown.classList.remove('active');
        } else {
            dropdown.classList.add('active');
        }
    }

    animateMobileMenuItems(show) {
        const items = document.querySelectorAll('.mobile-link, .mobile-dropdown-trigger');
        
        items.forEach((item, index) => {
            if (show) {
                setTimeout(() => {
                    item.style.animation = 'fadeInUp 0.4s ease forwards';
                }, index * 50);
            } else {
                item.style.animation = '';
            }
        });
    }

    animateNavLink(link, hover) {
        const underline = link.querySelector('.nav-underline');
        if (!underline) return;

        if (hover && !link.classList.contains('active')) {
            underline.style.width = '100%';
            underline.style.background = 'rgba(212, 175, 55, 0.5)';
        } else if (!hover && !link.classList.contains('active')) {
            underline.style.width = '0%';
        }
    }

    scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const headerHeight = this.header?.offsetHeight || 85;
        const elementPosition = element.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });

        console.log(`🎯 Scrolled to section: ${selector}`);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log('⬆️ Scrolled to top');
    }

    setActiveLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const underline = link.querySelector('.nav-underline');
            if (underline && link !== activeLink) {
                underline.style.width = '0%';
            }
        });
        
        activeLink.classList.add('active');
        const activeUnderline = activeLink.querySelector('.nav-underline');
        if (activeUnderline) {
            activeUnderline.style.width = '100%';
            activeUnderline.style.background = 'linear-gradient(90deg, #d4af37, #b8941f)';
        }
    }

    updateActiveNavigation() {
        const sections = ['home', 'brands', 'about', 'contact'];
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let activeSection = 'home';
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element && scrollPosition >= element.offsetTop) {
                activeSection = sectionId;
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeSection}`) {
                this.setActiveLink(link);
            }
        });
    }

    updateCartDisplay() {
        const cartData = this.getCartData();
        const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
        
        [this.cartCount, this.mobileCartCount].forEach(element => {
            if (element) {
                element.textContent = totalItems;
                if (totalItems > 0) {
                    element.classList.add('visible');
                } else {
                    element.classList.remove('visible');
                }
            }
        });
    }

    getCartData() {
        return window.barberWorld?.components?.cart?.getItems() || [];
    }

    animateCartIcon() {
        const cartBtn = document.querySelector('.cart-btn');
        if (!cartBtn) return;

        cartBtn.style.transform = 'scale(1.1)';
        cartBtn.style.color = '#d4af37';
        
        setTimeout(() => {
            cartBtn.style.transform = '';
            cartBtn.style.color = '';
        }, 300);
        
        this.updateCartDisplay();
    }
}

/**
 * Cart Management System
 * Handles all shopping cart functionality
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
        
        console.log(`🛒 Added to cart: ${product.name}`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateDisplay();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(productId);
            } else {
                this.saveCartToStorage();
                this.updateDisplay();
            }
        }
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

    clear() {
        this.items = [];
        this.saveCartToStorage();
        this.updateDisplay();
    }

    updateDisplay() {
        // Update header cart counts
        window.barberWorld?.components?.header?.updateCartDisplay();
        
        // Update any cart displays on the page
        const cartDisplays = document.querySelectorAll('[data-cart-count]');
        cartDisplays.forEach(display => {
            display.textContent = this.getTotalItems();
            display.style.display = this.getTotalItems() > 0 ? 'block' : 'none';
        });
    }

    animateCartIcon() {
        window.barberWorld?.components?.header?.animateCartIcon();
    }

    saveCartToStorage() {
        try {
            localStorage.setItem('barberworld_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('Could not save cart to localStorage:', error);
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
            console.warn('Could not load cart from localStorage:', error);
        }
    }

    showCart() {
        if (this.items.length === 0) {
            window.barberWorld?.components?.ui?.showNotification('Your cart is empty', 'info');
            return;
        }
        
        const cartItems = this.items.map(item => `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid #e9ecef;
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                background: #f8f9fa;
            ">
                <div>
                    <strong style="color: #0a0a0a;">${item.name}</strong>
                    <div style="color: #6c757d; font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 600; color: #d4af37;">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="window.barberWorld.components.cart.removeItem(${item.id}); document.querySelector('.modal-overlay').remove(); window.barberWorld.components.cart.showCart();" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 0.25rem 0.5rem;
                        border-radius: 0.25rem;
                        cursor: pointer;
                        font-size: 0.8rem;
                    ">Remove</button>
                </div>
            </div>
        `).join('');
        
        const total = this.getTotalPrice();
        
        window.barberWorld?.components?.ui?.createModal({
            title: `Shopping Cart (${this.items.length} items)`,
            content: `
                <div>
                    ${cartItems}
                    <div style="
                        text-align: right;
                        padding: 1.5rem 1rem;
                        font-size: 1.3rem;
                        font-weight: 700;
                        color: #0a0a0a;
                        border-top: 2px solid #d4af37;
                        margin-top: 1rem;
                    ">
                        Total: <span style="color: #d4af37;">$${total.toFixed(2)}</span>
                    </div>
                </div>
            `,
            onConfirm: () => {
                window.barberWorld?.components?.ui?.showNotification('Checkout functionality coming soon!', 'info');
            },
            confirmText: 'Checkout'
        });
    }
}

/**
 * Search Management System
 * Handles all search functionality
 */
class SearchManager {
    constructor() {
        this.isModalOpen = false;
        this.searchResults = [];
        this.init();
    }

    init() {
        this.setupSearchModal();
        this.setupSearchFunctionality();
        console.log('🔍 Search Manager initialized');
    }

    setupSearchModal() {
        const searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        const closeBtn = document.querySelector('.search-modal-close');
        
        if (!searchModal) return;
        
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Modal overlay click
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                this.closeModal();
            }
        });
        
        // Search input
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                        this.closeModal();
                    }
                }
            });
        }
        
        // Popular search tags
        const popularTags = document.querySelectorAll('.search-tag');
        popularTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.textContent.trim();
                this.performSearch(query);
                this.closeModal();
            });
        });
    }

    setupSearchFunctionality() {
        // Filter selects
        const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => this.updateSearchResults());
            }
        });
    }

    openModal() {
        const searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        
        if (searchModal) {
            this.isModalOpen = true;
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on search input
            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                }
            }, 300);
        }
        
        console.log('🔍 Search modal opened');
    }

    closeModal() {
        const searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        
        if (searchModal) {
            this.isModalOpen = false;
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Clear search input
            if (searchInput) {
                searchInput.value = '';
            }
        }
        
        console.log('🔍 Search modal closed');
    }

    performSearch(query) {
        console.log(`🔍 Searching for: ${query}`);
        
        // Show search results section
        this.showResultsSection();
        
        // Update search results
        this.displaySearchResults(query);
        
        // Scroll to top of results
        window.scrollTo({ top: 80, behavior: 'smooth' });
        
        window.barberWorld?.components?.ui?.showNotification(`Searching for: ${query}`, 'info');
    }

    showResultsSection() {
        const sectionsToHide = ['brands', 'about'];
        sectionsToHide.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'none';
        });
        
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.style.display = 'block';
        }
    }

    hideResultsSection() {
        const sectionsToShow = ['brands', 'about'];
        sectionsToShow.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'block';
        });
        
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.style.display = 'none';
        }
    }

    displaySearchResults(query) {
        // Use the existing data from the documents
        this.searchResults = this.getSampleProducts(query);
        
        // Update UI elements
        const productsTitle = document.getElementById('products-title');
        const productsCount = document.getElementById('products-count');
        const productsGrid = document.getElementById('products-grid');
        const noProducts = document.getElementById('no-products');
        
        if (productsTitle) {
            productsTitle.textContent = query ? `${query} Products` : 'All Products';
        }
        
        if (productsCount) {
            productsCount.textContent = `${this.searchResults.length} product${this.searchResults.length !== 1 ? 's' : ''}`;
        }
        
        if (this.searchResults.length === 0) {
            if (productsGrid) productsGrid.style.display = 'none';
            if (noProducts) noProducts.style.display = 'block';
        } else {
            if (noProducts) noProducts.style.display = 'none';
            if (productsGrid) {
                productsGrid.style.display = 'grid';
                productsGrid.innerHTML = this.searchResults.map(product => this.createProductCard(product)).join('');
            }
        }
    }

    getSampleProducts(query) {
        // Load from the provided JSON data
        const allProducts = window.productsData || [
            { id: 1, name: "JRL Onyx Clipper 2020C-B", price: 225, brand: "JRL" },
            { id: 2, name: "StyleCraft Instinct Clipper", price: 269, brand: "StyleCraft" },
            { id: 3, name: "Wahl Magic Clip Cordless", price: 150, brand: "Wahl" },
            { id: 4, name: "BaByliss FXONE Clipper", price: 229, brand: "Babyliss" },
            { id: 5, name: "Andis GTX T-Outliner", price: 119, brand: "Andis" },
            { id: 6, name: "VGR Professional Trimmer", price: 89, brand: "VGR" },
            { id: 7, name: "Wahl Detailer Cordless", price: 139, brand: "Wahl" },
            { id: 8, name: "StyleCraft Rebel Trimmer", price: 159, brand: "StyleCraft" }
        ];
        
        if (!query || query.toLowerCase() === 'all products') {
            return allProducts;
        }
        
        const searchTerm = query.toLowerCase();
        return allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm)
        );
    }

    createProductCard(product) {
        const getProductImage = (product) => {
            const name = product.name.toLowerCase();
            if (name.includes('clipper')) {
                return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop';
            } else if (name.includes('trimmer')) {
                return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=200&fit=crop';
            } else {
                return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=300&h=200&fit=crop';
            }
        };

        return `
            <div class="product-card" onclick="window.barberWorld.components.search.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="product-image">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-content">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn-secondary" onclick="event.stopPropagation(); window.barberWorld.components.search.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            View Details
                        </button>
                        <button class="btn-primary" onclick="event.stopPropagation(); window.barberWorld.components.cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showProductDetails(product) {
        window.barberWorld?.components?.ui?.createModal({
            title: product.name,
            content: `
                <div style="text-align: center;">
                    <div style="
                        background: #f8f9fa;
                        padding: 2rem;
                        border-radius: 0.75rem;
                        margin-bottom: 1.5rem;
                        border: 2px solid #e9ecef;
                    ">
                        <div style="
                            display: inline-block;
                            background: linear-gradient(135deg, #d4af37, #b8941f);
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 2rem;
                            font-size: 0.8rem;
                            font-weight: 600;
                            margin-bottom: 1rem;
                        ">${product.brand}</div>
                        <h3 style="margin: 0 0 1rem 0; color: #0a0a0a;">${product.name}</h3>
                        <div style="
                            font-size: 2rem;
                            font-weight: 700;
                            color: #d4af37;
                            margin-bottom: 1rem;
                        ">$${product.price.toFixed(2)}</div>
                        <div style="color: #6c757d; font-size: 0.9rem;">Product ID: ${product.id}</div>
                    </div>
                </div>
            `,
            onConfirm: () => {
                window.barberWorld?.components?.cart?.addItem(product);
            },
            confirmText: `Add to Cart - $${product.price.toFixed(2)}`
        });
    }

    updateSearchResults() {
        console.log('🔄 Updating search results with filters');
        // This would re-run the search with current filters
    }

    clearFilters() {
        const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) select.value = '';
        });
        this.updateSearchResults();
    }
}

/**
 * Brands Management System
 * Handles brand card interactions and animations
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
            // Enhanced hover effects
            card.addEventListener('mouseenter', () => {
                this.animateBrandCard(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateBrandCard(card, false);
            });
            
            // Click handler
            card.addEventListener('click', (e) => {
                this.handleBrandClick(card, e);
            });
            
            // Touch feedback for mobile
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }, { passive: true });
            
            // Keyboard navigation
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleBrandClick(card, e);
                }
            });
        });
    }

    animateBrandCard(card, isHover) {
        const image = card.querySelector('.brand-image img');
        
        if (isHover) {
            if (card.classList.contains('featured')) {
                card.style.transform = 'translateY(-12px)';
            } else {
                card.style.transform = 'translateY(-8px)';
            }
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15)';
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        } else {
            card.style.transform = '';
            card.style.boxShadow = '';
            if (image) {
                image.style.transform = '';
            }
        }
    }

    handleBrandClick(card, event) {
        const brandName = card.getAttribute('onclick')?.match(/filterProducts\('([^']+)'\)/)?.[1] ||
                         card.querySelector('.brand-content h3')?.textContent ||
                         'Brand';
        
        // Create ripple effect
        this.createRippleEffect(card, event);
        
        // Add click animation
        card.style.transform = 'scale(1.02)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
        
        // Show loading notification
        window.barberWorld?.components?.ui?.showNotification(`Loading ${brandName} products...`, 'loading');
        
        // Perform search
        setTimeout(() => {
            window.barberWorld?.components?.search?.performSearch(brandName);
        }, 800);
        
        console.log(`🎯 Brand clicked: ${brandName}`);
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        let x, y;
        if (event.clientX) {
            x = event.clientX - rect.left - size / 2;
            y = event.clientY - rect.top - size / 2;
        } else {
            x = rect.width / 2 - size / 2;
            y = rect.height / 2 - size / 2;
        }

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
}

/**
 * UI Management System
 * Handles modals, notifications, and other UI components
 */
class UIManager {
    constructor() {
        this.activeNotifications = [];
        this.init();
    }

    init() {
        console.log('🎨 UI Manager initialized');
    }

    createModal({ title, content, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e9ecef;
                ">
                    <h2 style="margin: 0; color: #0a0a0a; font-size: 1.5rem; font-weight: 700;">${title}</h2>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #6c757d;
                        padding: 0.5rem;
                        border-radius: 50%;
                        transition: all 0.2s ease;
                        line-height: 1;
                    ">&times;</button>
                </div>
                <div style="margin-bottom: 2rem;">
                    ${content}
                </div>
                <div style="
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding-top: 1rem;
                    border-top: 1px solid #e9ecef;
                ">
                    <button class="modal-cancel" style="
                        padding: 0.75rem 1.5rem;
                        border: 2px solid #e9ecef;
                        background: white;
                        color: #6c757d;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">${cancelText}</button>
                    <button class="modal-confirm" style="
                        padding: 0.75rem 1.5rem;
                        background: linear-gradient(135deg, #d4af37, #b8941f);
                        color: white;
                        border: none;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    ">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
        
        // Event listeners
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            if (onCancel) onCancel();
            closeModal();
        });
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        return modal;
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications of the same type
        this.activeNotifications.forEach(notification => {
            if (notification.type === type) {
                notification.element.remove();
            }
        });

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
            max-width: 350px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-${this.getNotificationIcon(type)}" style="font-size: 1.1rem;"></i>
                <span style="flex: 1;">${message}</span>
                ${type === 'loading' ? '<i class="fas fa-spinner fa-spin"></i>' : ''}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        const notificationData = { element: notification, type };
        this.activeNotifications.push(notificationData);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove (unless it's a loading notification)
        if (type !== 'loading') {
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                    this.activeNotifications = this.activeNotifications.filter(n => n !== notificationData);
                }, 400);
            }, 3000);
        }
        
        return notification;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            loading: 'linear-gradient(135deg, #d4af37, #b8941f)'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            loading: 'hourglass-half'
        };
        return icons[type] || icons.info;
    }
}

/**
 * Scroll Management System
 * Handles scroll effects and scroll-to-top functionality
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
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        document.body.appendChild(scrollBtn);
    }

    setupScrollEffects() {
        let ticking = false;

        const handleScroll = () => {
            const scrollY = window.pageYOffset;
            
            // Update scroll to top button
            const scrollBtn = document.querySelector('.scroll-to-top');
            if (scrollBtn) {
                if (scrollY > 300) {
                    scrollBtn.classList.add('visible');
                } else {
                    scrollBtn.classList.remove('visible');
                }
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }, { passive: true });
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = 85;
            const elementPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }
}

/**
 * Animation Management System
 * Handles scroll animations and page interactions
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
        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, { 
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe brand cards
            const brandCards = document.querySelectorAll('.brand-card');
            brandCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
                observer.observe(card);
            });

            // Observe other animated elements
            const animatedElements = document.querySelectorAll('.feature, .about-text, .about-image');
            animatedElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = `all 0.6s ease-out ${index * 0.2}s`;
                observer.observe(element);
            });
        }
    }
}

// Global Functions for HTML compatibility
window.openSearchModal = function() {
    window.barberWorld?.components?.search?.openModal();
};

window.closeSearchModal = function() {
    window.barberWorld?.components?.search?.closeModal();
};

window.showCart = function() {
    window.barberWorld?.components?.cart?.showCart();
};

window.filterProducts = function(brand) {
    window.barberWorld?.components?.search?.performSearch(brand);
};

window.filterByCategory = function(category) {
    const categoryNames = {
        'clipper': 'Clippers',
        'trimmer': 'Trimmers', 
        'shaver': 'Shavers',
        'accessories': 'Accessories'
    };
    const searchTerm = categoryNames[category] || category;
    window.barberWorld?.components?.search?.performSearch(searchTerm);
};

window.showSpecials = function() {
    window.barberWorld?.components?.search?.performSearch('Specials');
};

window.showAllProducts = function() {
    window.barberWorld?.components?.search?.performSearch('All Products');
};

window.showNewArrivals = function() {
    window.barberWorld?.components?.search?.performSearch('New Arrivals');
};

window.showBestSellers = function() {
    window.barberWorld?.components?.search?.performSearch('Best Sellers');
};

window.hideProducts = function() {
    window.barberWorld?.components?.search?.hideResultsSection();
};

window.applySorting = function() {
    window.barberWorld?.components?.search?.updateSearchResults();
};

window.applyFilters = function() {
    window.barberWorld?.components?.search?.updateSearchResults();
};

window.clearFilters = function() {
    window.barberWorld?.components?.search?.clearFilters();
};

window.scrollToTop = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

window.scrollToSection = function(sectionId) {
    window.barberWorld?.components?.scroll?.scrollToSection(sectionId);
};

window.handleSearchKeypress = function(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            window.barberWorld?.components?.search?.performSearch(query);
            window.barberWorld?.components?.search?.closeModal();
        }
    }
};

window.performSearch = function(query) {
    window.barberWorld?.components?.search?.performSearch(query);
};

window.closeMobileMenu = function() {
    window.barberWorld?.components?.header?.closeMobileMenu();
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.barberWorld = new BarberWorld();
});
