// Barber World - Premium Interactive JavaScript
// Modern ES6+ Implementation with Advanced Features

class BarberWorld {
    constructor() {
        this.state = {
            cart: [],
            wishlist: [],
            isMenuOpen: false,
            isMegaMenuOpen: false,
            scrollPosition: 0,
            isLoading: true
        };
        
        this.init();
    }

    // Initialize Application
    init() {
        this.bindEvents();
        this.setupAnimations();
        this.setupNavigation();
        this.setupMegaMenu();
        this.setupScrollEffects();
        this.setupProductInteractions();
        this.setupCart();
        this.setupNewsletter();
        this.setupSearch();
        this.initializeLoading();
        this.optimizePerformance();
        
        console.log('%c🔥 Barber World Initialized! 🔥', 
            'color: #d4af37; font-size: 18px; font-weight: bold; text-shadow: 2px 2px 0px #1a1a1a;');
    }

    // Event Bindings
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => this.handleDOMReady());
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16));
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // DOM Ready Handler
    handleDOMReady() {
        this.elements = {
            navbar: document.querySelector('.navbar'),
            megaMenu: document.querySelector('.mega-menu'),
            brandsDropdown: document.querySelector('.brands-dropdown'),
            hamburger: document.querySelector('.hamburger'),
            navMenu: document.querySelector('.nav-menu'),
            cartBadge: document.querySelector('.cart-badge'),
            searchTrigger: document.querySelector('.search-trigger'),
            searchDropdown: document.querySelector('.search-dropdown'),
            newsletterForm: document.querySelector('.newsletter-form'),
            productCards: document.querySelectorAll('.product-card'),
            categoryCards: document.querySelectorAll('.category-card'),
            brandCards: document.querySelectorAll('.brand-card'),
            actionBtns: document.querySelectorAll('.action-btn'),
            scrollAnimateElements: document.querySelectorAll('.scroll-animate, .product-card, .feature-card, .category-card')
        };

        this.setupElementInteractions();
        this.state.isLoading = false;
        document.body.classList.add('loaded');
    }

    // Navigation Setup
    setupNavigation() {
        // Smooth scroll for navigation links
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    this.smoothScrollTo(targetElement.offsetTop - 80);
                    this.closeMobileMenu();
                }
            });
        });

        // Mobile menu toggle
        if (this.elements.hamburger) {
            this.elements.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.elements.navMenu.contains(e.target) && 
                !this.elements.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    // Mega Menu Setup
    setupMegaMenu() {
        if (!this.elements.brandsDropdown || !this.elements.megaMenu) return;

        let hoverTimeout;

        // Mouse enter
        this.elements.brandsDropdown.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            this.showMegaMenu();
        });

        // Mouse leave
        this.elements.brandsDropdown.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                this.hideMegaMenu();
            }, 300);
        });

        // Mega menu hover
        this.elements.megaMenu.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
        });

        this.elements.megaMenu.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                this.hideMegaMenu();
            }, 300);
        });

        // Brand card interactions
        this.elements.brandCards.forEach(card => {
            card.addEventListener('click', () => {
                const brand = card.dataset.brand;
                this.handleBrandSelection(brand);
            });

            // Hover effects
            card.addEventListener('mouseenter', () => {
                this.createRippleEffect(card);
                this.animateBrandCard(card, true);
            });

            card.addEventListener('mouseleave', () => {
                this.animateBrandCard(card, false);
            });
        });

        // View all brands button
        const viewAllBtn = document.querySelector('.view-all-brands');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.handleViewAllBrands();
                this.hideMegaMenu();
            });
        }
    }

    // Show Mega Menu
    showMegaMenu() {
        if (this.state.isMegaMenuOpen) return;
        
        this.state.isMegaMenuOpen = true;
        this.elements.brandsDropdown.classList.add('active');
        this.elements.megaMenu.style.visibility = 'visible';
        this.elements.megaMenu.style.opacity = '0';
        this.elements.megaMenu.style.transform = 'translateX(-50%) translateY(-10px)';

        // Animate in
        requestAnimationFrame(() => {
            this.elements.megaMenu.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            this.elements.megaMenu.style.opacity = '1';
            this.elements.megaMenu.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Animate brand cards
        this.elements.brandCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    // Hide Mega Menu
    hideMegaMenu() {
        if (!this.state.isMegaMenuOpen) return;
        
        this.state.isMegaMenuOpen = false;
        this.elements.brandsDropdown.classList.remove('active');
        
        this.elements.megaMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        this.elements.megaMenu.style.opacity = '0';
        this.elements.megaMenu.style.transform = 'translateX(-50%) translateY(-10px)';

        setTimeout(() => {
            this.elements.megaMenu.style.visibility = 'hidden';
        }, 300);
    }

    // Brand Card Animation
    animateBrandCard(card, isHover) {
        const image = card.querySelector('.brand-image img');
        const info = card.querySelector('.brand-info');
        
        if (isHover) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.25)';
            if (image) image.style.transform = 'scale(1.1)';
            if (info) info.style.transform = 'translateY(-2px)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
            if (image) image.style.transform = 'scale(1)';
            if (info) info.style.transform = 'translateY(0)';
        }
    }

    // Handle Brand Selection
    handleBrandSelection(brand) {
        this.showNotification(`Exploring ${this.getBrandName(brand)} collection...`, 'info');
        
        // Simulate navigation
        setTimeout(() => {
            this.showBrandModal(brand);
        }, 500);
        
        this.hideMegaMenu();
    }

    // Show Brand Modal
    showBrandModal(brand) {
        const modal = this.createModal({
            title: this.getBrandName(brand),
            content: `
                <div class="brand-modal-content">
                    <img src="${this.getBrandImage(brand)}" alt="${this.getBrandName(brand)}" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem;">
                    <p style="color: #6a6a6a; margin-bottom: 1.5rem; line-height: 1.6;">
                        Discover our premium ${this.getBrandName(brand)} collection. Professional-grade tools 
                        trusted by barbers worldwide at unbeatable prices.
                    </p>
                    <div class="brand-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div style="text-align: center; padding: 1rem; background: #f8f8f7; border-radius: 8px;">
                            <strong style="display: block; font-size: 1.5rem; color: #d4af37;">${this.getBrandProductCount(brand)}</strong>
                            <span style="font-size: 0.8rem; color: #6a6a6a;">Products</span>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: #f8f8f7; border-radius: 8px;">
                            <strong style="display: block; font-size: 1.5rem; color: #d4af37;">4.8★</strong>
                            <span style="font-size: 0.8rem; color: #6a6a6a;">Rating</span>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: #f8f8f7; border-radius: 8px;">
                            <strong style="display: block; font-size: 1.5rem; color: #d4af37;">45%</strong>
                            <span style="font-size: 0.8rem; color: #6a6a6a;">Avg. Savings</span>
                        </div>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Shop Collection',
                    class: 'btn-primary',
                    action: () => this.navigateToBrand(brand)
                },
                {
                    text: 'Close',
                    class: 'btn-secondary',
                    action: () => this.closeModal()
                }
            ]
        });
    }

    // Mobile Menu Toggle
    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        
        this.elements.hamburger.classList.toggle('active');
        this.elements.navMenu.classList.toggle('active');
        
        if (this.state.isMenuOpen) {
            this.showMobileMenu();
        } else {
            this.hideMobileMenu();
        }
    }

    // Show Mobile Menu
    showMobileMenu() {
        // Create mobile menu styles if not exists
        if (!document.querySelector('#mobile-menu-styles')) {
            const mobileStyles = document.createElement('style');
            mobileStyles.id = 'mobile-menu-styles';
            mobileStyles.textContent = `
                @media (max-width: 1024px) {
                    .nav-menu {
                        position: fixed;
                        top: 80px;
                        left: -100%;
                        width: 100%;
                        height: calc(100vh - 80px);
                        background: rgba(26, 26, 26, 0.98);
                        backdrop-filter: blur(20px);
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: center;
                        padding-top: 3rem;
                        gap: 2rem;
                        transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 9999;
                        overflow-y: auto;
                    }
                    
                    .nav-menu.active {
                        left: 0;
                    }
                    
                    .nav-link {
                        font-size: 1.3rem;
                        padding: 1rem;
                        opacity: 0;
                        transform: translateY(20px);
                        animation: slideInUp 0.3s ease forwards;
                    }
                    
                    .nav-link:nth-child(1) { animation-delay: 0.1s; }
                    .nav-link:nth-child(2) { animation-delay: 0.15s; }
                    .nav-link:nth-child(3) { animation-delay: 0.2s; }
                    .nav-link:nth-child(4) { animation-delay: 0.25s; }
                    .nav-link:nth-child(5) { animation-delay: 0.3s; }
                    
                    .brands-dropdown .mega-menu {
                        position: relative;
                        width: 90%;
                        max-width: 600px;
                        margin-top: 1rem;
                        transform: none;
                        opacity: 1;
                        visibility: visible;
                    }
                    
                    @keyframes slideInUp {
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                }
            `;
            document.head.appendChild(mobileStyles);
        }
        
        document.body.style.overflow = 'hidden';
    }

    // Hide Mobile Menu
    hideMobileMenu() {
        document.body.style.overflow = '';
    }

    // Close Mobile Menu
    closeMobileMenu() {
        if (this.state.isMenuOpen) {
            this.state.isMenuOpen = false;
            this.elements.hamburger.classList.remove('active');
            this.elements.navMenu.classList.remove('active');
            this.hideMobileMenu();
        }
    }

    // Scroll Effects
    setupScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // Add stagger animation for grids
                    if (entry.target.classList.contains('products-grid') || 
                        entry.target.classList.contains('categories-grid')) {
                        this.staggerChildrenAnimation(entry.target);
                    }
                }
            });
        }, observerOptions);

        this.elements.scrollAnimateElements.forEach(el => {
            el.classList.add('scroll-animate');
            observer.observe(el);
        });
    }

    // Handle Scroll
    handleScroll() {
        const scrollTop = window.pageYOffset;
        this.state.scrollPosition = scrollTop;

        // Navbar scroll effect
        if (this.elements.navbar) {
            if (scrollTop > 100) {
                this.elements.navbar.classList.add('scrolled');
            } else {
                this.elements.navbar.classList.remove('scrolled');
            }
        }

        // Parallax effects
        this.handleParallax(scrollTop);
    }

    // Parallax Effects
    handleParallax(scrollTop) {
        const hero = document.querySelector('.hero');
        const geometricElements = document.querySelectorAll('.floating-shape');
        
        if (hero && scrollTop < window.innerHeight) {
            const parallaxSpeed = scrollTop * 0.5;
            geometricElements.forEach((element, index) => {
                const speed = (index + 1) * 0.3;
                element.style.transform = `translateY(${parallaxSpeed * speed}px) rotate(${scrollTop * 0.05}deg)`;
            });
        }
    }

    // Stagger Children Animation
    staggerChildrenAnimation(parent) {
        const children = parent.children;
        Array.from(children).forEach((child, index) => {
            child.style.animationDelay = `${index * 0.1}s`;
            child.classList.add('stagger-animate');
        });
    }

    // Product Interactions
    setupProductInteractions() {
        this.elements.productCards.forEach(card => {
            this.setupProductCard(card);
        });

        this.elements.categoryCards.forEach(card => {
            this.setupCategoryCard(card);
        });

        this.elements.actionBtns.forEach(btn => {
            this.setupActionButton(btn);
        });
    }

    // Setup Product Card
    setupProductCard(card) {
        const actions = card.querySelector('.product-actions');
        
        card.addEventListener('mouseenter', () => {
            this.animateProductCard(card, true);
            if (actions) {
                this.showProductActions(actions);
            }
        });

        card.addEventListener('mouseleave', () => {
            this.animateProductCard(card, false);
            if (actions) {
                this.hideProductActions(actions);
            }
        });

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.product-actions')) {
                this.showProductQuickView(card);
            }
        });
    }

    // Animate Product Card
    animateProductCard(card, isHover) {
        const image = card.querySelector('.product-image img');
        const info = card.querySelector('.product-info');
        
        if (isHover) {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 20px 40px rgba(26, 26, 26, 0.15)';
            if (image) image.style.transform = 'scale(1.1)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
            if (image) image.style.transform = 'scale(1)';
        }
    }

    // Show Product Actions
    showProductActions(actions) {
        const buttons = actions.querySelectorAll('.action-btn');
        buttons.forEach((btn, index) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                btn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                btn.style.opacity = '1';
                btn.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }

    // Hide Product Actions
    hideProductActions(actions) {
        const buttons = actions.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateX(20px)';
        });
    }

    // Setup Action Button
    setupActionButton(btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const productCard = btn.closest('.product-card');
            
            this.createRippleEffect(btn, e);
            this.handleProductAction(action, productCard);
        });
    }

    // Handle Product Action
    handleProductAction(action, productCard) {
        const productId = productCard?.dataset.product || 'unknown';
        
        switch (action) {
            case 'add-cart':
                this.addToCart(productId);
                break;
            case 'wishlist':
                this.toggleWishlist(productId);
                break;
            case 'quick-view':
                this.showProductQuickView(productCard);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    // Cart Functionality
    setupCart() {
        this.updateCartBadge();
        
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.showCartModal());
        }
    }

    // Add to Cart
    addToCart(productId) {
        const product = this.getProductData(productId);
        
        const existingItem = this.state.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push({
                id: productId,
                ...product,
                quantity: 1
            });
        }
        
        this.updateCartBadge();
        this.showNotification(`${product.name} added to cart!`, 'success');
        this.animateCartIcon();
    }

    // Update Cart Badge
    updateCartBadge() {
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (this.elements.cartBadge) {
            this.elements.cartBadge.textContent = totalItems;
            this.elements.cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Animate Cart Icon
    animateCartIcon() {
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            cartIcon.style.color = '#d4af37';
            
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
                cartIcon.style.color = '';
            }, 300);
        }
    }

    // Toggle Wishlist
    toggleWishlist(productId) {
        const index = this.state.wishlist.indexOf(productId);
        const product = this.getProductData(productId);
        
        if (index > -1) {
            this.state.wishlist.splice(index, 1);
            this.showNotification(`${product.name} removed from wishlist`, 'info');
        } else {
            this.state.wishlist.push(productId);
            this.showNotification(`${product.name} added to wishlist!`, 'success');
        }
    }

    // Newsletter Setup
    setupNewsletter() {
        const newsletterForm = this.elements.newsletterForm;
        const emailInput = document.querySelector('#newsletter-email');
        const submitBtn = document.querySelector('#newsletter-submit');

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(emailInput.value);
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(emailInput.value);
            });
        }
    }

    // Handle Newsletter Submit
    handleNewsletterSubmit(email) {
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#newsletter-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            document.querySelector('#newsletter-email').value = '';
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    // Search Setup
    setupSearch() {
        const searchTrigger = this.elements.searchTrigger;
        const searchDropdown = this.elements.searchDropdown;
        const searchInput = searchDropdown?.querySelector('input');
        const searchBtn = searchDropdown?.querySelector('button');

        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => {
                this.toggleSearchDropdown();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }
    }

    // Toggle Search Dropdown
    toggleSearchDropdown() {
        const searchDropdown = this.elements.searchDropdown;
        if (searchDropdown) {
            const isVisible = searchDropdown.style.opacity === '1';
            
            if (isVisible) {
                this.hideSearchDropdown();
            } else {
                this.showSearchDropdown();
            }
        }
    }

    // Show Search Dropdown
    showSearchDropdown() {
        const searchDropdown = this.elements.searchDropdown;
        if (searchDropdown) {
            searchDropdown.style.visibility = 'visible';
            searchDropdown.style.opacity = '1';
            searchDropdown.style.transform = 'translateY(0)';
            
            const input = searchDropdown.querySelector('input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    // Hide Search Dropdown
    hideSearchDropdown() {
        const searchDropdown = this.elements.searchDropdown;
        if (searchDropdown) {
            searchDropdown.style.opacity = '0';
            searchDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                searchDropdown.style.visibility = 'hidden';
            }, 300);
        }
    }

    // Perform Search
    performSearch(query) {
        if (!query.trim()) {
            this.showNotification('Please enter a search term', 'error');
            return;
        }

        this.showNotification(`Searching for "${query}"...`, 'info');
        this.hideSearchDropdown();
        
        // Simulate search
        setTimeout(() => {
            this.showSearchResults(query);
        }, 1000);
    }

    // Utility Functions
    createRippleEffect(element, event = null) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        let x, y;
        if (event) {
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
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;

        if (!document.querySelector('#ripple-styles')) {
            const rippleStyles = document.createElement('style');
            rippleStyles.id = 'ripple-styles';
            rippleStyles.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(rippleStyles);
        }

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // Show Notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'linear-gradient(135deg, #28a745, #34ce57)',
            error: 'linear-gradient(135deg, #dc3545, #e85563)',
            info: 'linear-gradient(135deg, #d4af37, #e6c866)',
            warning: 'linear-gradient(135deg, #ffc107, #ffcd39)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colors[type]};
            color: ${type === 'info' || type === 'warning' ? '#1a1a1a' : '#ffffff'};
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    // Get Notification Icon
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    // Create Modal
    createModal({ title, content, buttons = [] }) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #ffffff;
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid #d4af37;
            text-align: left;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        modalContent.innerHTML = `
            <h3 style="color: #d4af37; margin-bottom: 1rem; font-size: 1.8rem; font-weight: 700;">
                ${title}
            </h3>
            <div style="margin-bottom: 2rem;">
                ${content}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap;">
                ${buttons.map(btn => `
                    <button class="modal-btn ${btn.class}" style="
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s ease;
                        border: none;
                        ${btn.class === 'btn-primary' ? 
                            'background: linear-gradient(135deg, #d4af37, #e6c866); color: #1a1a1a;' : 
                            'background: transparent; color: #1a1a1a; border: 2px solid #1a1a1a;'
                        }
                    ">${btn.text}</button>
                `).join('')}
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);

        // Button event listeners
        buttons.forEach((btn, index) => {
            const btnElement = modalContent.querySelectorAll('.modal-btn')[index];
            btnElement.addEventListener('click', () => {
                if (btn.action) btn.action();
                this.closeModal(modal);
            });
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        this.currentModal = modal;
        return modal;
    }

    // Close Modal
    closeModal(modal = this.currentModal) {
        if (!modal) return;
        
        const modalContent = modal.querySelector('div');
        modal.style.opacity = '0';
        if (modalContent) modalContent.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 300);
    }

    // Smooth Scroll To
    smoothScrollTo(targetPosition, duration = 800) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    // Easing function
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // Handle Keyboard Events
    handleKeyboard(e) {
        switch (e.key) {
            case 'Escape':
                this.closeModal();
                this.closeMobileMenu();
                this.hideSearchDropdown();
                if (this.state.isMegaMenuOpen) this.hideMegaMenu();
                break;
            case 'Enter':
                if (e.target.classList.contains('btn')) {
                    e.target.click();
                }
                break;
        }
    }

    // Handle Resize
    handleResize() {
        // Close mobile elements on resize
        if (window.innerWidth > 1024) {
            this.closeMobileMenu();
        }
    }

    // Performance Optimization
    optimizePerformance() {
        // Lazy load images
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Preload critical resources
        this.preloadCriticalResources();
    }

    // Preload Critical Resources
    preloadCriticalResources() {
        const criticalImages = [
            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
            'https://images.unsplash.com/photo-1621605815971-fbc98d665033'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Initialize Loading
    initializeLoading() {
        const elements = document.querySelectorAll('.hero-content > *, .product-card, .feature-card, .category-card');
        
        elements.forEach((el, index) => {
            el.classList.add('loading');
            el.style.animationDelay = `${index * 0.1}s`;
        });

        // Remove loading state after animations
        setTimeout(() => {
            elements.forEach(el => el.classList.remove('loading'));
        }, 2000);
    }

    // Utility Methods
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

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Data Methods
    getBrandName(brand) {
        const brands = {
            'wahl': 'Wahl',
            'babyliss': 'Babyliss',
            'jrl': 'JRL Professional',
            'stylecraft': 'StyleCraft Gamma',
            'cocco': 'Cocco',
            'our-brand': 'Barber World'
        };
        return brands[brand] || brand;
    }

    getBrandImage(brand) {
        const images = {
            'wahl': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=200&fit=crop',
            'babyliss': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=200&fit=crop',
            'jrl': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=200&fit=crop',
            'stylecraft': 'https://images.unsplash.com/photo-1586244583413-17d0ad0b6a09?w=400&h=200&fit=crop',
            'cocco': 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=200&fit=crop',
            'our-brand': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop'
        };
        return images[brand] || images['our-brand'];
    }

    getBrandProductCount(brand) {
        const counts = {
            'wahl': '24+',
            'babyliss': '18+',
            'jrl': '15+',
            'stylecraft': '21+',
            'cocco': '12+',
            'our-brand': '8+'
        };
        return counts[brand] || '10+';
    }

    getProductData(productId) {
        const products = {
            'wahl-magic-clip': {
                name: 'Wahl Magic Clip Cordless',
                brand: 'Wahl',
                price: 89.99,
                originalPrice: 149.99,
                image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91'
            },
            'babyliss-fx8700': {
                name: 'Babyliss FX8700 GoldFX',
                brand: 'Babyliss',
                price: 199.99,
                originalPrice: 279.99,
                image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'
            },
            'jrl-2020c': {
                name: 'JRL 2020C Clipper',
                brand: 'JRL',
                price: 299.99,
                originalPrice: 399.99,
                image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033'
            }
        };
        return products[productId] || { name: 'Unknown Product', brand: 'Unknown', price: 0 };
    }

    // Element Setup Methods
    setupElementInteractions() {
        // Setup any additional element interactions here
        this.setupHoverEffects();
        this.setupButtonAnimations();
    }

    setupHoverEffects() {
        const hoverElements = document.querySelectorAll('.btn, .nav-link, .social-link');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = el.classList.contains('btn') ? 'translateY(-2px)' : 'translateY(-1px)';
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translateY(0)';
            });
        });
    }

    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRippleEffect(btn, e);
            });
        });
    }

    // Additional Handler Methods
    setupCategoryCard(card) {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            this.showNotification(`Exploring ${category} category...`, 'info');
        });
    }

    showProductQuickView(productCard) {
        const productId = productCard.dataset.product;
        const product = this.getProductData(productId);
        
        this.createModal({
            title: product.name,
            content: `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 100%; border-radius: 12px;">
                    <div>
                        <div style="color: #d4af37; font-weight: 600; margin-bottom: 0.5rem;">${product.brand}</div>
                        <h4 style="margin-bottom: 1rem; color: #1a1a1a;">${product.name}</h4>
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a;">$${product.price}</span>
                            <span style="text-decoration: line-through; color: #6a6a6a; margin-left: 0.5rem;">$${product.originalPrice}</span>
                        </div>
                        <p style="color: #6a6a6a; line-height: 1.6;">
                            Professional-grade clipper designed for superior performance and durability. 
                            Perfect for professional barbers and home use.
                        </p>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Add to Cart',
                    class: 'btn-primary',
                    action: () => this.addToCart(productId)
                },
                {
                    text: 'Close',
                    class: 'btn-secondary',
                    action: () => {}
                }
            ]
        });
    }

    showCartModal() {
        if (this.state.cart.length === 0) {
            this.showNotification('Your cart is empty', 'info');
            return;
        }

        const cartItems = this.state.cart.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e5e5;">
                <div>
                    <strong>${item.name}</strong>
                    <div style="color: #6a6a6a; font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                </div>
                <div style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        const total = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        this.createModal({
            title: 'Shopping Cart',
            content: `
                <div>
                    ${cartItems}
                    <div style="text-align: right; padding: 1rem; font-size: 1.2rem; font-weight: 700;">
                        Total: $${total.toFixed(2)}
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Checkout',
                    class: 'btn-primary',
                    action: () => this.showNotification('Checkout functionality coming soon!', 'info')
                },
                {
                    text: 'Continue Shopping',
                    class: 'btn-secondary',
                    action: () => {}
                }
            ]
        });
    }

    handleViewAllBrands() {
        this.showNotification('Redirecting to brands page...', 'info');
    }

    navigateToBrand(brand) {
        this.showNotification(`Opening ${this.getBrandName(brand)} collection...`, 'info');
    }

    handleSearchInput(query) {
        // Real-time search suggestions could go here
        if (query.length > 2) {
            // Simulate search suggestions
            console.log('Search suggestions for:', query);
        }
    }

    showSearchResults(query) {
        this.showNotification(`Found ${Math.floor(Math.random() * 50) + 10} results for "${query}"`, 'success');
    }
}

// Initialize the application
const barberWorld = new BarberWorld();
