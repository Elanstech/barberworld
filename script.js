/* ========================================
   BARBER WORLD - COMPLETE APPLICATION
   Professional Equipment & Supplies
   ======================================== */

/* ========================================
   HEADER & NAVIGATION SECTION
   ======================================== */
class BarberWorldHeader {
    constructor() {
        this.header = document.getElementById('header');
        this.navLogo = document.getElementById('nav-logo');
        this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        this.megaMenuLinks = document.querySelectorAll('.mega-menu-links a[data-category]');
        this.searchBtn = document.querySelector('.search-btn');
        this.cartBtn = document.querySelector('.cart-btn');
        this.lastScrollY = 0;
        this.ticking = false;
        
        if (this.header) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.setupScrollHandler();
        this.setupIntersectionObserver();
        this.setupMegaMenuEffects();
    }

    bindEvents() {
        // Logo click - scroll to top
        this.navLogo?.addEventListener('click', () => {
            this.scrollToTop();
        });

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    this.smoothScrollTo(href);
                    this.setActiveNavLink(link);
                }
            });
        });

        // Mega menu links
        this.megaMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.handleCategoryClick(category, link);
            });
        });

        // Header action buttons
        this.searchBtn?.addEventListener('click', () => {
            if (window.barberWorldApp) {
                window.barberWorldApp.getComponent('search').openModal();
            }
        });

        this.cartBtn?.addEventListener('click', () => {
            if (window.barberWorldApp) {
                window.barberWorldApp.getComponent('cart').show();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupScrollHandler() {
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }

    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        if (sections.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const correspondingLink = document.querySelector(`a[href="#${sectionId}"]`);
                    if (correspondingLink) {
                        this.setActiveNavLink(correspondingLink);
                    }
                }
            });
        }, { rootMargin: '-20% 0px -80% 0px', threshold: 0 });

        sections.forEach(section => observer.observe(section));
    }

    setupMegaMenuEffects() {
        const megaMenuSections = document.querySelectorAll('.mega-menu-section');
        
        megaMenuSections.forEach((section, index) => {
            section.addEventListener('mouseenter', () => {
                section.style.animationDelay = `${index * 0.1}s`;
                section.classList.add('hover-animate');
            });

            section.addEventListener('mouseleave', () => {
                section.classList.remove('hover-animate');
            });
        });
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // Header effects
        if (scrollY > 50) {
            this.header?.classList.add('scrolled');
        } else {
            this.header?.classList.remove('scrolled');
        }

        // Update active navigation
        this.updateActiveNavOnScroll(scrollY);

        this.lastScrollY = scrollY;
    }

    updateActiveNavOnScroll(scrollY) {
        const sections = document.querySelectorAll('section[id], main[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    handleCategoryClick(category, linkElement) {
        const categoryName = this.getCategoryName(category);
        
        // Add click animation
        this.addClickAnimation(linkElement);
        
        // Show notification
        if (window.barberWorldApp) {
            window.barberWorldApp.getComponent('ui').showNotification(`Loading ${categoryName}...`, 'loading');
        }
        
        // Perform search
        setTimeout(() => {
            if (window.barberWorldApp) {
                window.barberWorldApp.getComponent('search').performSearch(categoryName);
            }
        }, 800);

        // Analytics tracking
        this.trackEvent('category_click', { category, category_name: categoryName });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K - Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (window.barberWorldApp) {
                window.barberWorldApp.getComponent('search').openModal();
            }
        }
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = this.header?.offsetHeight || 80;
            const elementPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setActiveNavLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    addClickAnimation(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }

    getCategoryName(category) {
        const categoryNames = {
            'barber-world': 'Barber World',
            'stylecraft': 'StyleCraft',
            'wahl': 'Wahl',
            'andis': 'Andis',
            'babyliss': 'Babyliss',
            'jrl': 'JRL Professional',
            'vgr': 'VGR',
            'specials': 'Special Offers',
            'clippers': 'Hair Clippers',
            'trimmers': 'Trimmers',
            'combos': 'Professional Combos',
            'accessories': 'Accessories',
            'all': 'All Products'
        };
        return categoryNames[category] || category;
    }

    trackEvent(eventName, data = {}) {
        console.log(`📊 Event tracked: ${eventName}`, data);
    }
}

/* ========================================
   MOBILE MENU SECTION
   ======================================== */
class BarberWorldMobileMenu {
    constructor() {
        this.toggle = document.getElementById('mobile-menu-toggle');
        this.menu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        this.body = document.body;
        
        if (this.toggle && this.menu) {
            this.init();
        }
    }

    init() {
        this.setupInitialState();
        this.bindEvents();
        window.barberWorldMobileMenu = this;
    }

    setupInitialState() {
        this.menu.classList.remove('active');
        this.toggle.classList.remove('active');
        this.body.classList.remove('mobile-menu-open');
        this.isOpen = false;
    }

    bindEvents() {
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) {
                    setTimeout(() => this.close(), 150);
                }
            });
        });

        // Close menu on window resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        }, 250));

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.body.classList.add('mobile-menu-open');
        this.toggle.classList.add('active');
        this.menu.classList.add('active');
        
        // Add backdrop
        this.createBackdrop();
        
        // Animate menu items
        this.animateMenuItems('in');
        
        // Prevent body scroll
        this.preventBodyScroll(true);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.body.classList.remove('mobile-menu-open');
        this.toggle.classList.remove('active');
        this.menu.classList.remove('active');
        
        // Remove backdrop
        this.removeBackdrop();
        
        // Animate menu items out
        this.animateMenuItems('out');
        
        // Restore body scroll
        this.preventBodyScroll(false);
    }

    createBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.id = 'mobile-menu-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(backdrop);
        
        setTimeout(() => {
            backdrop.style.opacity = '1';
        }, 10);

        backdrop.addEventListener('click', () => {
            this.close();
        });
    }

    removeBackdrop() {
        const backdrop = document.getElementById('mobile-menu-backdrop');
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => backdrop.remove(), 300);
        }
    }

    animateMenuItems(direction) {
        const menuItems = this.menu.querySelectorAll('.nav-link') || [];
        
        menuItems.forEach((item, index) => {
            if (direction === 'in') {
                item.style.transform = 'translateX(50px)';
                item.style.opacity = '0';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    item.style.transform = 'translateX(0)';
                    item.style.opacity = '1';
                }, index * 50);
            } else {
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.transform = 'translateX(50px)';
                    item.style.opacity = '0';
                }, index * 30);
                
                setTimeout(() => {
                    item.style.transition = '';
                    item.style.transform = '';
                    item.style.opacity = '';
                }, 500);
            }
        });
    }

    preventBodyScroll(isLocked) {
        if (isLocked) {
            const scrollY = window.scrollY;
            this.body.style.position = 'fixed';
            this.body.style.top = `-${scrollY}px`;
            this.body.style.width = '100%';
            this.body.dataset.scrollY = scrollY;
        } else {
            const scrollY = this.body.dataset.scrollY;
            this.body.style.position = '';
            this.body.style.top = '';
            this.body.style.width = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0'));
            }
        }
    }

    debounce(func, wait) {
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
}

/* ========================================
   SEARCH SECTION
   ======================================== */
class BarberWorldSearch {
    constructor() {
        this.searchModal = document.getElementById('search-modal');
        this.searchInput = document.getElementById('search-input-main');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.popularSearches = document.getElementById('popular-searches');
        this.searchResultsSection = document.getElementById('search-results-section');
        this.searchProductsGrid = document.getElementById('search-products-grid');
        
        this.currentSearchQuery = '';
        this.searchFilters = {
            brand: '',
            category: '',
            price: '',
            sort: 'relevance'
        };
        
        if (this.searchModal) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.setupSearchFilters();
        this.setupPopularTags();
    }

    bindEvents() {
        // Search input events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                const query = e.target.value;
                if (query.length >= 2) {
                    this.showSearchSuggestions(query);
                } else {
                    this.hideSearchSuggestions();
                }
            }, 300));

            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                        this.closeModal();
                    }
                }
            });
        }

        // Modal close events
        const modalClose = document.querySelector('.search-modal-close');
        modalClose?.addEventListener('click', () => this.closeModal());

        // Overlay click to close
        this.searchModal?.addEventListener('click', (e) => {
            if (e.target === this.searchModal) {
                this.closeModal();
            }
        });

        // Search results back button
        const backBtn = document.querySelector('.search-back-btn');
        backBtn?.addEventListener('click', () => this.closeSearchResults());
    }

    setupSearchFilters() {
        const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
        
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => {
                    this.updateSearchFilters();
                });
            }
        });
    }

    setupPopularTags() {
        const popularTags = document.querySelectorAll('.popular-search-tag');
        popularTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.dataset.query;
                this.performSearch(query);
                this.closeModal();
            });
        });
    }

    openModal() {
        if (this.searchModal) {
            this.searchModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on search input
            setTimeout(() => {
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }, 300);
        }
    }

    closeModal() {
        if (this.searchModal) {
            this.searchModal.classList.remove('active');
            document.body.style.overflow = '';
            this.hideSearchSuggestions();
            
            // Clear search input
            if (this.searchInput) {
                this.searchInput.value = '';
            }
        }
    }

    showSearchSuggestions(query) {
        if (!window.barberWorldApp) return;
        
        const products = window.barberWorldApp.getComponent('products');
        if (!products) return;
        
        const suggestions = products.searchProducts(query).slice(0, 5);
        
        if (suggestions.length > 0 && this.searchSuggestions) {
            this.searchSuggestions.style.display = 'block';
            this.popularSearches.style.display = 'none';
            
            this.searchSuggestions.innerHTML = suggestions.map(product => `
                <div class="search-suggestion-item" onclick="window.barberWorldApp.getComponent('search').selectSuggestion(${product.id})">
                    <div>
                        <div class="suggestion-product-name">${product.name}</div>
                        <div class="suggestion-brand">${product.brand}</div>
                    </div>
                    <div class="suggestion-price">$${product.price.toFixed(2)}</div>
                </div>
            `).join('');
        } else {
            this.hideSearchSuggestions();
        }
    }

    hideSearchSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.style.display = 'none';
            this.popularSearches.style.display = 'block';
        }
    }

    selectSuggestion(productId) {
        if (!window.barberWorldApp) return;
        
        const products = window.barberWorldApp.getComponent('products');
        const product = products.findProductById(productId);
        
        if (product) {
            this.closeModal();
            products.showProductDetails(product);
        }
    }

    performSearch(query) {
        if (!window.barberWorldApp) return;
        
        this.currentSearchQuery = query;
        const products = window.barberWorldApp.getComponent('products');
        const results = products.searchProducts(query, this.searchFilters);
        
        // Show search results section
        this.showSearchResults();
        this.displaySearchResults(results, query);
        
        // Scroll to top of results
        window.scrollTo({ top: 80, behavior: 'smooth' });
        
        this.trackEvent('search_performed', { query: query, results_count: results.length });
    }

    showSearchResults() {
        // Hide main sections
        const sectionsToHide = ['brands', 'about', 'why-choose-us'];
        sectionsToHide.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'none';
        });
        
        // Show search results
        if (this.searchResultsSection) {
            this.searchResultsSection.style.display = 'block';
        }
    }

    closeSearchResults() {
        // Hide search results
        if (this.searchResultsSection) {
            this.searchResultsSection.style.display = 'none';
        }
        
        // Show main sections
        const sectionsToShow = ['brands', 'about', 'why-choose-us'];
        sectionsToShow.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'block';
        });
        
        // Clear search state
        this.currentSearchQuery = '';
        this.searchFilters = {
            brand: '',
            category: '',
            price: '',
            sort: 'relevance'
        };
        
        // Reset filter selects
        const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.value = '';
            }
        });
        
        // Scroll to brands section
        const brandsSection = document.getElementById('brands');
        if (brandsSection) {
            const headerHeight = 80;
            const elementPosition = brandsSection.offsetTop - headerHeight - 20;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    displaySearchResults(results, query) {
        const resultsTitle = document.getElementById('search-results-title');
        const resultsCount = document.getElementById('search-results-count');
        const noResults = document.getElementById('no-search-results');
        const loadingState = document.getElementById('search-loading');
        
        // Show loading first
        if (loadingState) {
            loadingState.style.display = 'block';
            this.searchProductsGrid.style.display = 'none';
            noResults.style.display = 'none';
        }
        
        // Update title and count
        if (resultsTitle) {
            resultsTitle.textContent = query ? `Search Results for "${query}"` : 'All Products';
        }
        if (resultsCount) {
            resultsCount.textContent = `${results.length} product${results.length !== 1 ? 's' : ''} found`;
        }
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            
            if (results.length === 0) {
                this.searchProductsGrid.style.display = 'none';
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
                this.searchProductsGrid.style.display = 'grid';
                
                if (window.barberWorldApp) {
                    const products = window.barberWorldApp.getComponent('products');
                    this.searchProductsGrid.innerHTML = results.map(product => 
                        products.createProductCard(product)
                    ).join('');
                }
            }
        }, 800);
    }

    updateSearchFilters() {
        // Get current filter values
        this.searchFilters.brand = document.getElementById('brand-filter')?.value || '';
        this.searchFilters.category = document.getElementById('category-filter')?.value || '';
        this.searchFilters.price = document.getElementById('price-filter')?.value || '';
        this.searchFilters.sort = document.getElementById('sort-filter')?.value || 'relevance';
        
        // Re-run search with new filters
        if (this.currentSearchQuery && window.barberWorldApp) {
            const products = window.barberWorldApp.getComponent('products');
            const results = products.searchProducts(this.currentSearchQuery, this.searchFilters);
            this.displaySearchResults(results, this.currentSearchQuery);
        }
    }

    clearAllSearchFilters() {
        // Reset filter values
        this.searchFilters = {
            brand: '',
            category: '',
            price: '',
            sort: 'relevance'
        };
        
        // Reset UI
        const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.value = '';
            }
        });
        
        // Re-run search if there's a current query
        if (this.currentSearchQuery && window.barberWorldApp) {
            const products = window.barberWorldApp.getComponent('products');
            const results = products.searchProducts(this.currentSearchQuery, this.searchFilters);
            this.displaySearchResults(results, this.currentSearchQuery);
        }
    }

    trackEvent(eventName, data = {}) {
        console.log(`📊 Event tracked: ${eventName}`, data);
    }

    debounce(func, wait) {
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
}

/* ========================================
   PRODUCTS & BRANDS SECTION
   ======================================== */
class BarberWorldProducts {
    constructor() {
        this.allProducts = [];
        this.brandsData = {};
        this.brandCards = document.querySelectorAll('.brand-card');
        
        this.init();
    }

    async init() {
        await this.loadProductData();
        this.bindEvents();
        this.setupBrandCards();
    }

    async loadProductData() {
        try {
            const response = await fetch('all-products.json');
            if (response.ok) {
                this.allProducts = await response.json();
            } else {
                throw new Error('Could not load products');
            }
            
            // Group products by brand
            this.brandsData = this.allProducts.reduce((acc, product) => {
                if (!acc[product.brand]) {
                    acc[product.brand] = [];
                }
                acc[product.brand].push(product);
                return acc;
            }, {});
            
            console.log('✅ Product data loaded successfully');
        } catch (error) {
            console.warn('⚠️ Could not load product data from JSON file:', error);
            this.loadSampleData();
        }
    }

    loadSampleData() {
        this.allProducts = [
            { id: 1, name: "JRL Onyx Clipper 2020C-B", price: 225, brand: "JRL", slug: "jrl-onyx-clipper-2020c-b" },
            { id: 2, name: "StyleCraft Instinct Clipper SC607M", price: 269, brand: "StyleCraft", slug: "stylecraft-instinct-clipper-sc607m" },
            { id: 3, name: "Wahl Magic Clip Cordless 8148", price: 150, brand: "Wahl", slug: "wahl-magic-clip-cordless-8148" },
            { id: 4, name: "BaByliss FXONE Clipper", price: 229, brand: "Babyliss", slug: "babyliss-fxone-clipper" }
        ];
        
        this.brandsData = this.allProducts.reduce((acc, product) => {
            if (!acc[product.brand]) {
                acc[product.brand] = [];
            }
            acc[product.brand].push(product);
            return acc;
        }, {});
        
        console.log('📝 Sample product data loaded');
    }

    bindEvents() {
        // Brand card interactions will be set up in setupBrandCards
    }

    setupBrandCards() {
        this.brandCards.forEach(card => {
            const brand = card.dataset.brand;
            
            // Enhanced hover effects
            card.addEventListener('mouseenter', () => {
                this.animateBrandCard(card, true);
            });

            card.addEventListener('mouseleave', () => {
                this.animateBrandCard(card, false);
            });

            // Click handler with ripple effect
            card.addEventListener('click', (e) => {
                this.createRippleEffect(card, e);
                setTimeout(() => {
                    this.handleBrandClick(brand, card);
                }, 150);
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
        });
    }

    animateBrandCard(card, isHover) {
        const image = card.querySelector('.brand-image img');
        
        if (isHover) {
            if (card.classList.contains('featured-brand')) {
                card.style.transform = 'translateY(-12px)';
            } else {
                card.style.transform = 'translateY(-8px)';
            }
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
            if (image) {
                image.style.transform = 'scale(1)';
            }
        }
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

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

    handleBrandClick(brand, card) {
        const brandName = this.getBrandName(brand);
        
        // Show loading state
        if (window.barberWorldApp) {
            window.barberWorldApp.getComponent('ui').showNotification(`Loading ${brandName} products...`, 'loading');
        }
        
        // Animate card
        card.style.transform = 'scale(1.02)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);

        // Perform search
        setTimeout(() => {
            if (window.barberWorldApp) {
                window.barberWorldApp.getComponent('search').performSearch(brandName);
            }
        }, 1000);

        // Analytics tracking
        this.trackEvent('brand_click', { brand, brand_name: brandName });
    }

    searchProducts(query, filters = null) {
        if (!query || query.length < 1) return [];
        
        const searchTerm = query.toLowerCase();
        let products = [...this.allProducts];
        
        // Apply filters
        const currentFilters = filters || {
            brand: '',
            category: '',
            price: '',
            sort: 'relevance'
        };
        
        // Filter by brand
        if (currentFilters.brand) {
            products = products.filter(product => product.brand === currentFilters.brand);
        }
        
        // Filter by category
        if (currentFilters.category) {
            products = products.filter(product => {
                const name = product.name.toLowerCase();
                switch (currentFilters.category) {
                    case 'clipper':
                        return name.includes('clipper') && !name.includes('trimmer');
                    case 'trimmer':
                        return name.includes('trimmer');
                    case 'shaver':
                        return name.includes('shaver') || name.includes('foil');
                    case 'accessory':
                        return name.includes('guard') || name.includes('blade') || name.includes('oil');
                    case 'dryer':
                        return name.includes('dryer') || name.includes('blow');
                    default:
                        return true;
                }
            });
        }
        
        // Filter by price range
        if (currentFilters.price) {
            const [min, max] = currentFilters.price.split('-').map(Number);
            products = products.filter(product => {
                return product.price >= min && (max === undefined || product.price <= max);
            });
        }
        
        // Search in product names and brands
        const results = products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const brandMatch = product.brand.toLowerCase().includes(searchTerm);
            return nameMatch || brandMatch;
        });
        
        // Sort results
        return this.sortSearchResults(results, currentFilters.sort, searchTerm);
    }

    sortSearchResults(results, sortBy, searchTerm) {
        switch (sortBy) {
            case 'name-asc':
                return results.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return results.sort((a, b) => b.name.localeCompare(a.name));
            case 'price-asc':
                return results.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return results.sort((a, b) => b.price - a.price);
            case 'relevance':
            default:
                return results.sort((a, b) => {
                    const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
                    const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
                    return bExact - aExact;
                });
        }
    }

    createProductCard(product) {
        const getProductImage = (product) => {
            const name = product.name.toLowerCase();
            if (name.includes('clipper')) {
                return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop';
            } else if (name.includes('trimmer')) {
                return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=200&fit=crop';
            } else if (name.includes('shaver')) {
                return 'https://images.unsplash.com/photo-1617224088016-bc8b34ee3be7?w=300&h=200&fit=crop';
            } else {
                return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=300&h=200&fit=crop';
            }
        };

        return `
            <div class="search-product-card" onclick="window.barberWorldApp.getComponent('products').showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="search-product-image">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="search-product-content">
                    <div class="search-product-brand">${product.brand}</div>
                    <h3 class="search-product-name">${product.name}</h3>
                    <div class="search-product-price">$${product.price.toFixed(2)}</div>
                    <div class="search-product-actions">
                        <button class="btn-secondary" onclick="event.stopPropagation(); window.barberWorldApp.getComponent('products').showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            View Details
                        </button>
                        <button class="btn-primary-small" onclick="event.stopPropagation(); window.barberWorldApp.getComponent('cart').addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showProductDetails(product) {
        if (window.barberWorldApp) {
            const ui = window.barberWorldApp.getComponent('ui');
            ui.createModal({
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
                        <button onclick="window.barberWorldApp.getComponent('cart').addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}}); document.querySelector('.modal-overlay').remove();" style="
                            width: 100%;
                            padding: 1rem;
                            background: linear-gradient(135deg, #d4af37, #b8941f);
                            color: white;
                            border: none;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            font-size: 1.1rem;
                            font-weight: 600;
                            transition: all 0.2s ease;
                            margin-bottom: 1rem;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            Add to Cart - $${product.price.toFixed(2)}
                        </button>
                    </div>
                `,
                onConfirm: () => {
                    if (window.barberWorldApp) {
                        window.barberWorldApp.getComponent('ui').showNotification(`Learn more about ${product.name}!`, 'info');
                    }
                },
                confirmText: 'View Full Details'
            });
        }
    }

    findProductById(productId) {
        return this.allProducts.find(p => p.id === productId);
    }

    getBrandName(brand) {
        const brandNames = {
            'barber-world': 'Barber World',
            'stylecraft': 'StyleCraft',
            'wahl': 'Wahl',
            'andis': 'Andis',
            'babyliss': 'Babyliss',
            'jrl': 'JRL Professional',
            'specials': 'Special Offers',
            'vgr': 'VGR'
        };
        return brandNames[brand] || brand;
    }

    trackEvent(eventName, data = {}) {
        console.log(`📊 Event tracked: ${eventName}`, data);
    }
}

/* ========================================
   CART SECTION
   ======================================== */
class BarberWorldCart {
    constructor() {
        this.cart = [];
        this.cartCountElement = document.getElementById('cart-count');
        
        this.init();
    }

    init() {
        this.updateDisplay();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.updateDisplay();
        this.animateCartIcon();
        
        if (window.barberWorldApp) {
            window.barberWorldApp.getComponent('ui').showNotification(`${product.name} added to cart!`, 'success');
        }
        
        this.trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price });
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateDisplay();
    }

    updateDisplay() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCountElement) {
            this.cartCountElement.textContent = totalItems;
            if (totalItems > 0) {
                this.cartCountElement.classList.add('visible');
            } else {
                this.cartCountElement.classList.remove('visible');
            }
        }
    }

    animateCartIcon() {
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.style.transform = 'scale(1.2)';
            cartBtn.style.color = '#d4af37';
            
            setTimeout(() => {
                cartBtn.style.transform = 'scale(1)';
                cartBtn.style.color = '';
            }, 300);
        }
    }

    show() {
        if (this.cart.length === 0) {
            if (window.barberWorldApp) {
                window.barberWorldApp.getComponent('ui').showNotification('Your cart is empty', 'info');
            }
            return;
        }
        
        const cartItems = this.cart.map(item => `
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
                    <button onclick="window.barberWorldApp.getComponent('cart').removeFromCart(${item.id}); document.querySelector('.modal-overlay').remove(); window.barberWorldApp.getComponent('cart').show();" style="
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
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (window.barberWorldApp) {
            const ui = window.barberWorldApp.getComponent('ui');
            ui.createModal({
                title: `Shopping Cart (${this.cart.length} items)`,
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
                    ui.showNotification('Redirecting to checkout...', 'loading');
                    this.trackEvent('checkout_initiated', { cart_total: total, item_count: this.cart.length });
                    setTimeout(() => {
                        ui.showNotification('Checkout functionality coming soon!', 'info');
                    }, 1000);
                },
                confirmText: 'Checkout'
            });
        }
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.updateDisplay();
    }

    trackEvent(eventName, data = {}) {
        console.log(`📊 Event tracked: ${eventName}`, data);
    }
}

/* ========================================
   UI & ANIMATIONS SECTION
   ======================================== */
class BarberWorldUI {
    constructor() {
        this.scrollToTopBtn = null;
        this.lastScrollY = 0;
        this.ticking = false;
        
        this.init();
    }

    init() {
        this.createScrollToTopButton();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupPerformanceOptimizations();
    }

    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // Scroll to top button
        if (scrollY > 300) {
            this.scrollToTopBtn?.classList.add('visible');
        } else {
            this.scrollToTopBtn?.classList.remove('visible');
        }

        this.lastScrollY = scrollY;
    }

    createScrollToTopButton() {
        this.scrollToTopBtn = document.createElement('button');
        this.scrollToTopBtn.className = 'scroll-to-top';
        this.scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        this.scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        
        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        document.body.appendChild(this.scrollToTopBtn);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                    }
                });
            }, observerOptions);

            // Observe brand cards for staggered animation
            const brandCards = document.querySelectorAll('.brand-card');
            brandCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.style.animationPlayState = 'paused';
                observer.observe(card);
            });

            // Observe other elements
            const whyChooseCards = document.querySelectorAll('.why-choose-card');
            whyChooseCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.2}s`;
                observer.observe(card);
            });
        }
    }

    setupPerformanceOptimizations() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
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
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

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
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove (unless it's a loading notification)
        if (type !== 'loading') {
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 400);
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

/* ========================================
   MAIN APPLICATION CLASS
   ======================================== */
class BarberWorldApp {
    constructor() {
        this.components = new Map();
        this.isMobile = window.innerWidth <= 768;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
        
        this.setupGlobalEvents();
    }

    initializeComponents() {
        try {
            // Initialize components in order
            this.components.set('ui', new BarberWorldUI());
            this.components.set('mobileMenu', new BarberWorldMobileMenu());
            this.components.set('header', new BarberWorldHeader());
            this.components.set('products', new BarberWorldProducts());
            this.components.set('search', new BarberWorldSearch());
            this.components.set('cart', new BarberWorldCart());
            
            this.isInitialized = true;
            
            // Set global references
            window.barberWorldApp = this;
            window.barberWorldMobileMenu = this.components.get('mobileMenu');
            
            console.log('🔥 Barber World initialized - Premium Experience Ready');
            
            // Show welcome notification
            setTimeout(() => {
                this.components.get('ui').showNotification('Welcome to Barber World! ✂️', 'success');
            }, 500);
            
        } catch (error) {
            console.error('Error initializing components:', error);
            this.handleInitializationError();
        }
    }

    handleInitializationError() {
        try {
            // Fallback initialization
            window.barberWorldMobileMenu = new BarberWorldMobileMenu();
            window.barberWorldProducts = new BarberWorldProducts();
            window.barberWorldUI = new BarberWorldUI();
            
            console.log('Fallback initialization completed');
        } catch (fallbackError) {
            console.error('Fallback initialization failed:', fallbackError);
        }
    }

    setupGlobalEvents() {
        // Window resize handling
        window.addEventListener('resize', this.debounce(() => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.handleScreenSizeChange();
            }
        }, 250));

        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Refresh any necessary components
                console.log('Orientation changed, refreshing layout');
            }, 500);
        });
    }

    handleScreenSizeChange() {
        // Close mobile menu if switching to desktop
        const mobileMenu = this.components.get('mobileMenu');
        if (mobileMenu && !this.isMobile && mobileMenu.isOpen) {
            mobileMenu.close();
        }
    }

    getComponent(name) {
        return this.components.get(name);
    }

    debounce(func, wait) {
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
}

/* ========================================
   GLOBAL FUNCTIONS AND INITIALIZATION
   ======================================== */

// Global utility functions
function searchAllProducts() {
    if (window.barberWorldApp) {
        window.barberWorldApp.getComponent('search').performSearch('');
    }
}

function searchByBrand(brand) {
    if (window.barberWorldApp) {
        window.barberWorldApp.getComponent('search').performSearch(brand);
    }
}

function searchByCategory(category) {
    if (window.barberWorldApp) {
        window.barberWorldApp.getComponent('search').performSearch(category);
    }
}

function closeSearchModal() {
    if (window.barberWorldApp) {
        window.barberWorldApp.getComponent('search').closeModal();
    }
}

function closeSearchResults() {
    if (window.barberWorldApp) {
        window.barberWorldApp.getComponent('search').closeSearchResults();
    }
}

function clearAllSearchFilters() {
    if (window.barberWorldApp) {
        window.barberWorldApp.getComponent('search').clearAllSearchFilters();
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Global scroll to section utility
window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && window.barberWorldApp) {
        const header = window.barberWorldApp.getComponent('header');
        if (header) {
            header.smoothScrollTo(`#${sectionId}`);
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Add loading completion effect
    document.body.classList.add('loaded');
    
    // Initialize the main app
    new BarberWorldApp();
});

// Add dynamic CSS animations and styles
const addGlobalStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Ripple animation for clicks */
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }

        /* Brand card animations */
        .brand-card {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .brand-card:hover .brand-image img {
            filter: brightness(1.1);
        }

        /* Focus states for accessibility */
        .brand-card:focus,
        .nav-btn:focus,
        .btn:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.4);
        }

        /* Mobile menu enhanced animations */
        .nav-menu.active {
            animation: mobileMenuSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes mobileMenuSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Scroll to top button */
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--accent-gold);
            color: var(--white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-normal);
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            cursor: pointer;
            border: none;
        }

        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        .scroll-to-top:hover {
            background: var(--accent-gold-hover);
            transform: translateY(-5px);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--light-gray);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--accent-gold);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-gold-hover);
        }

        /* Selection */
        ::selection {
            background: var(--accent-gold);
            color: var(--white);
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Loading state */
        .loaded {
            transition: opacity 0.5s ease;
        }

        /* Enhanced mobile styles */
        @media (max-width: 768px) {
            .brand-card {
                transform: none !important;
            }
            
            .brand-card:active {
                transform: scale(0.98) !important;
            }
        }
    `;
    
    document.head.appendChild(style);
};

// Initialize styles when DOM is ready
document.addEventListener('DOMContentLoaded', addGlobalStyles);

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarberWorldApp;
}
