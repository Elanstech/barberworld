// Barber World - Complete JavaScript Implementation
// Organized by sections for better maintainability

class BarberWorld {
    constructor() {
        this.cart = [];
        this.mobileMenuOpen = false;
        this.lastScrollY = 0;
        this.ticking = false;
        this.allProducts = [];
        this.brandsData = {};
        this.searchModal = null;
        this.currentSearchQuery = '';
        this.searchFilters = {
            brand: '',
            category: '',
            price: '',
            sort: 'relevance'
        };
        
        this.init();
    }

    async init() {
        this.setupHeaderEventListeners();
        this.setupSearchEventListeners();
        this.setupBrandEventListeners();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupPerformanceOptimizations();
        this.updateCartDisplay();
        
        // Load product data
        await this.loadProductData();
        
        console.log('🔥 Barber World initialized - Premium Experience Ready');
        console.log(`📦 Loaded ${this.allProducts.length} products from ${Object.keys(this.brandsData).length} brands`);
        
        // Initialize search modal
        this.initializeSearchModal();
    }

    // ============================================================================
    // HEADER SECTION - Navigation, Mobile Menu, Logo, Actions
    // ============================================================================

    setupHeaderEventListeners() {
        // Mobile menu toggle - Fixed functionality
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile menu toggle clicked'); // Debug log
                this.toggleMobileMenu();
            });
        } else {
            console.warn('Mobile menu toggle not found');
        }

        // Logo click - scroll to top
        const navLogo = document.getElementById('nav-logo');
        navLogo?.addEventListener('click', () => {
            this.scrollToTop();
        });

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    this.smoothScrollTo(href);
                    this.closeMobileMenu();
                    this.setActiveNavLink(link);
                }
            });
        });

        // Mega menu links
        const megaMenuLinks = document.querySelectorAll('.mega-menu-links a[data-category]');
        megaMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.handleCategoryClick(category, link);
                this.closeMobileMenu();
            });
        });

        // Header actions
        const searchBtn = document.querySelector('.search-btn');
        searchBtn?.addEventListener('click', () => {
            this.openSearchModal();
        });

        const cartBtn = document.querySelector('.cart-btn');
        cartBtn?.addEventListener('click', () => {
            this.showCart();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize handling
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));

        // Mega menu hover effects
        this.setupMegaMenuEffects();
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

    // Mobile Menu Management - Fixed functionality
    toggleMobileMenu() {
        console.log('toggleMobileMenu called, current state:', this.mobileMenuOpen); // Debug log
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        console.log('Menu elements found:', { navMenu: !!navMenu, toggle: !!mobileMenuToggle }); // Debug log

        if (this.mobileMenuOpen) {
            this.openMobileMenu(navMenu, mobileMenuToggle);
        } else {
            this.closeMobileMenu(navMenu, mobileMenuToggle);
        }
    }

    openMobileMenu(navMenu, toggle) {
        console.log('Opening mobile menu'); // Debug log
        
        if (navMenu) {
            navMenu.classList.add('active');
            console.log('Added active class to nav menu'); // Debug log
        }
        
        if (toggle) {
            toggle.classList.add('active');
            console.log('Added active class to toggle'); // Debug log
        }
        
        document.body.style.overflow = 'hidden';
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'mobile-menu-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 998;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
        `;
        document.body.appendChild(backdrop);
        
        setTimeout(() => {
            backdrop.style.opacity = '1';
        }, 10);

        backdrop.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Animate menu items
        this.animateMobileMenuItems();
    }

    animateMobileMenuItems() {
        const menuItems = document.querySelectorAll('.nav-menu.active .nav-link, .nav-menu.active .mega-menu-section');
        
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50 + 100);
        });
    }

    closeMobileMenu(navMenu = null, toggle = null) {
        if (!this.mobileMenuOpen) return;

        this.mobileMenuOpen = false;
        const menu = navMenu || document.getElementById('nav-menu');
        const menuToggle = toggle || document.getElementById('mobile-menu-toggle');
        const backdrop = document.getElementById('mobile-menu-backdrop');
        
        menu?.classList.remove('active');
        menuToggle?.classList.remove('active');
        document.body.style.overflow = '';
        
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => backdrop.remove(), 300);
        }
    }

    // Navigation helpers
    setActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    updateActiveNavOnScroll(scrollY) {
        const sections = document.querySelectorAll('section[id], main[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
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
        this.showNotification(`Loading ${categoryName}...`, 'loading');
        
        // Perform search
        setTimeout(() => {
            this.performSearch(categoryName);
        }, 800);

        // Analytics tracking
        this.trackEvent('category_click', { 
            category: category, 
            category_name: categoryName 
        });
    }

    addClickAnimation(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }

    handleKeyboardShortcuts(e) {
        // Escape key - close modals/menus
        if (e.key === 'Escape') {
            this.closeMobileMenu();
            this.closeSearchModal();
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => modal.remove());
        }
        
        // Ctrl/Cmd + K - Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openSearchModal();
        }

        // Ctrl/Cmd + / - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.openSearchModal();
        }

        // Alt + M - Toggle mobile menu (for accessibility)
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            this.toggleMobileMenu();
        }
    }

    // ============================================================================
    // SEARCH SECTION - Search Modal, Suggestions, Results, Filters
    // ============================================================================

    setupSearchEventListeners() {
        // Touch events for better mobile experience
        this.setupTouchEvents();
    }

    initializeSearchModal() {
        this.searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input-main');
        
        if (searchInput) {
            // Real-time search as user types
            searchInput.addEventListener('input', this.debounce((e) => {
                const query = e.target.value;
                if (query.length >= 2) {
                    this.showSearchSuggestions(query);
                } else {
                    this.hideSearchSuggestions();
                }
            }, 300));

            // Enter key to search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                        this.closeSearchModal();
                    }
                }
            });
        }

        // Popular search tags
        const popularTags = document.querySelectorAll('.popular-search-tag');
        popularTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.dataset.query;
                this.performSearch(query);
                this.closeSearchModal();
            });
        });

        // Setup search filters after DOM is ready
        setTimeout(() => {
            this.setupSearchFilters();
        }, 100);
    }

    openSearchModal() {
        if (this.searchModal) {
            this.searchModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on search input
            setTimeout(() => {
                const searchInput = document.getElementById('search-input-main');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 300);
        }
    }

    closeSearchModal() {
        if (this.searchModal) {
            this.searchModal.classList.remove('active');
            document.body.style.overflow = '';
            this.hideSearchSuggestions();
            
            // Clear search input
            const searchInput = document.getElementById('search-input-main');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }

    showSearchSuggestions(query) {
        const suggestions = this.searchProducts(query).slice(0, 5);
        const suggestionsContainer = document.getElementById('search-suggestions');
        const popularSearches = document.getElementById('popular-searches');
        
        if (suggestions.length > 0) {
            suggestionsContainer.style.display = 'block';
            popularSearches.style.display = 'none';
            
            suggestionsContainer.innerHTML = suggestions.map(product => `
                <div class="search-suggestion-item" onclick="window.barberWorld.selectSuggestion(${product.id})">
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
        const suggestionsContainer = document.getElementById('search-suggestions');
        const popularSearches = document.getElementById('popular-searches');
        
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            popularSearches.style.display = 'block';
        }
    }

    selectSuggestion(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product) {
            this.closeSearchModal();
            this.showProductDetails(product);
        }
    }

    performSearch(query) {
        this.currentSearchQuery = query;
        const results = this.searchProducts(query);
        
        // Show search results section
        document.getElementById('brands').style.display = 'none';
        document.getElementById('about').style.display = 'none';
        document.getElementById('why-choose-us').style.display = 'none';
        document.getElementById('search-results-section').style.display = 'block';
        
        // Update search results
        this.displaySearchResults(results, query);
        
        // Scroll to top of results
        window.scrollTo({ top: 80, behavior: 'smooth' });
        
        this.trackEvent('search_performed', { query: query, results_count: results.length });
    }

    searchProducts(query, filters = null) {
        if (!query || query.length < 1) return [];
        
        const searchTerm = query.toLowerCase();
        let products = [...this.allProducts];
        
        // Apply current filters if no specific filters provided
        const currentFilters = filters || this.searchFilters;
        
        // Filter by brand
        if (currentFilters.brand) {
            products = products.filter(product => product.brand === currentFilters.brand);
        }
        
        // Filter by category (basic categorization based on product name)
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
                        return name.includes('guard') || name.includes('blade') || name.includes('oil') || 
                               name.includes('mat') || name.includes('case') || name.includes('comb');
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
            const slugMatch = product.slug && product.slug.includes(searchTerm);
            return nameMatch || brandMatch || slugMatch;
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
                // Sort by relevance (exact matches first, then partial matches)
                return results.sort((a, b) => {
                    const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
                    const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
                    return bExact - aExact;
                });
        }
    }

    displaySearchResults(results, query) {
        const resultsTitle = document.getElementById('search-results-title');
        const resultsCount = document.getElementById('search-results-count');
        const resultsGrid = document.getElementById('search-products-grid');
        const noResults = document.getElementById('no-search-results');
        const loadingState = document.getElementById('search-loading');
        
        // Show loading first
        if (loadingState) {
            loadingState.style.display = 'block';
            resultsGrid.style.display = 'none';
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
                resultsGrid.style.display = 'none';
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
                resultsGrid.style.display = 'grid';
                
                resultsGrid.innerHTML = results.map(product => this.createProductCard(product)).join('');
            }
        }, 800);
    }

    closeSearchResults() {
        // Hide search results and show main sections
        document.getElementById('search-results-section').style.display = 'none';
        document.getElementById('brands').style.display = 'block';
        document.getElementById('why-choose-us').style.display = 'block';
        document.getElementById('about').style.display = 'block';
        
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
        this.smoothScrollTo('#brands');
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

    updateSearchFilters() {
        // Get current filter values
        this.searchFilters.brand = document.getElementById('brand-filter')?.value || '';
        this.searchFilters.category = document.getElementById('category-filter')?.value || '';
        this.searchFilters.price = document.getElementById('price-filter')?.value || '';
        this.searchFilters.sort = document.getElementById('sort-filter')?.value || 'relevance';
        
        // Re-run search with new filters
        if (this.currentSearchQuery) {
            const results = this.searchProducts(this.currentSearchQuery);
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
        if (this.currentSearchQuery) {
            const results = this.searchProducts(this.currentSearchQuery);
            this.displaySearchResults(results, this.currentSearchQuery);
        }
    }

    // ============================================================================
    // PRODUCTS AND BRANDS SECTION - Data Loading, Brand Interactions, Product Display
    // ============================================================================

    async loadProductData() {
        try {
            // Try to load all products from JSON file
            const response = await fetch('all-products.json');
            if (response.ok) {
                this.allProducts = await response.json();
            } else {
                throw new Error('Could not load products');
            }
            
            // Group products by brand for easy access
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
            // Fallback - use sample data if JSON files aren't available
            this.loadSampleData();
        }
    }

    loadSampleData() {
        // Sample data for demonstration when JSON files aren't available
        this.allProducts = [
            { id: 1, name: "JRL Onyx Clipper 2020C-B", price: 225, brand: "JRL", slug: "jrl-onyx-clipper-2020c-b" },
            { id: 2, name: "StyleCraft Instinct Clipper SC607M", price: 269, brand: "StyleCraft", slug: "stylecraft-instinct-clipper-sc607m" },
            { id: 3, name: "Wahl Magic Clip Cordless 8148", price: 150, brand: "Wahl", slug: "wahl-magic-clip-cordless-8148" },
            { id: 4, name: "BaByliss FXONE Clipper", price: 229, brand: "Babyliss", slug: "babyliss-fxone-clipper" },
            { id: 5, name: "JRL Professional Onyx SF Pro Foil Shaver SH2301", price: 89.95, brand: "JRL", slug: "jrl-professional-onyx-sf-pro-foil-shaver-sh2301" },
            { id: 6, name: "StyleCraft Rebel Trimmer SC409M", price: 159.99, brand: "StyleCraft", slug: "stylecraft-rebel-trimmer-sc409m" },
            { id: 7, name: "Wahl Detailer Cordless 08171", price: 139.99, brand: "Wahl", slug: "wahl-detailer-cordless-08171" },
            { id: 8, name: "BaByliss Influencer Clipper FX870RI", price: 250, brand: "Babyliss", slug: "babyliss-influencer-clipper-fx870ri" }
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

    setupBrandEventListeners() {
        // Brand cards
        const brandCards = document.querySelectorAll('.brand-card');
        brandCards.forEach(card => {
            this.setupBrandCard(card);
        });
    }

    setupBrandCard(card) {
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

    handleBrandClick(brand, card) {
        const brandName = this.getBrandName(brand);
        
        // Get products for this brand
        const brandProducts = this.getBrandProducts(brand);
        
        // Show loading state
        this.showNotification(`Loading ${brandName} products...`, 'loading');
        
        // Animate card
        if (card.classList.contains('featured-brand')) {
            card.style.transform = 'scale(1.02)';
        } else {
            card.style.transform = 'scale(1.02)';
        }
        
        setTimeout(() => {
            card.style.transform = '';
        }, 200);

        // Show brand products by performing a search
        setTimeout(() => {
            this.performSearch(brandName);
        }, 1000);

        // Analytics tracking
        this.trackEvent('brand_click', { brand: brand, brand_name: brandName, product_count: brandProducts.length });
    }

    getBrandProducts(brandSlug) {
        const brandMap = {
            'barber-world': 'Barber World',
            'stylecraft': 'StyleCraft',
            'wahl': 'Wahl',
            'andis': 'Andis',
            'babyliss': 'Babyliss',
            'jrl': 'JRL',
            'vgr': 'VGR'
        };
        
        const brandName = brandMap[brandSlug];
        return brandName ? (this.brandsData[brandName] || []) : [];
    }

    createProductCard(product) {
        // Generate a placeholder image based on product type
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
            <div class="search-product-card" onclick="window.barberWorld.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="search-product-image">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="search-product-content">
                    <div class="search-product-brand">${product.brand}</div>
                    <h3 class="search-product-name">${product.name}</h3>
                    <div class="search-product-price">$${product.price.toFixed(2)}</div>
                    <div class="search-product-actions">
                        <button class="btn-secondary" onclick="event.stopPropagation(); window.barberWorld.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            View Details
                        </button>
                        <button class="btn-primary-small" onclick="event.stopPropagation(); window.barberWorld.addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showProductDetails(product) {
        this.createModal({
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
                    <button onclick="window.barberWorld.addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}}); document.querySelector('.modal-overlay').remove();" style="
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
                this.showNotification(`Learn more about ${product.name}!`, 'info');
            },
            confirmText: 'View Full Details'
        });
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
            'deals': 'Current Deals',
            'new': 'New Arrivals',
            'bestsellers': 'Best Sellers',
            'all': 'All Products'
        };
        return categoryNames[category] || category;
    }

    // ============================================================================
    // CART SECTION - Cart Management, Display, Checkout
    // ============================================================================

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.updateCartDisplay();
        this.showNotification(`${product.name} added to cart!`, 'success');
        this.animateCartIcon();
        this.trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price });
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            if (totalItems > 0) {
                cartCount.classList.add('visible');
            } else {
                cartCount.classList.remove('visible');
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

    showCart() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'info');
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
                    <button onclick="window.barberWorld.removeFromCart(${item.id}); document.querySelector('.modal-overlay').remove(); window.barberWorld.showCart();" style="
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
        
        this.createModal({
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
                this.showNotification('Redirecting to checkout...', 'loading');
                this.trackEvent('checkout_initiated', { cart_total: total, item_count: this.cart.length });
                setTimeout(() => {
                    this.showNotification('Checkout functionality coming soon!', 'info');
                }, 1000);
            },
            confirmText: 'Checkout'
        });
    }

    // ============================================================================
    // UI AND ANIMATIONS SECTION - Scroll Effects, Animations, Touch Events, Modals
    // ============================================================================

    setupScrollEffects() {
        const header = document.getElementById('header');
        
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll(header);
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });

        // Create scroll to top button
        this.createScrollToTopButton();
    }

    handleScroll(header) {
        const scrollY = window.pageYOffset;
        
        // Header effects
        if (scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        // Update active navigation based on scroll position
        this.updateActiveNavOnScroll(scrollY);

        // Scroll to top button
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (scrollY > 300) {
            scrollBtn?.classList.add('visible');
        } else {
            scrollBtn?.classList.remove('visible');
        }

        this.lastScrollY = scrollY;
    }

    createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        
        scrollBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        document.body.appendChild(scrollBtn);
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const elementPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Update active nav link
        const homeLink = document.querySelector('.nav-link[href="#home"]');
        if (homeLink) {
            this.setActiveNavLink(homeLink);
        }
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

            // Observe why choose us cards
            const whyChooseCards = document.querySelectorAll('.why-choose-card');
            whyChooseCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.2}s`;
                observer.observe(card);
            });
        }
    }

    setupTouchEvents() {
        // Enhanced touch interactions for mobile
        const brandCards = document.querySelectorAll('.brand-card');
        
        brandCards.forEach(card => {
            let touchStartTime;
            let touchStartPos;
            
            card.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartPos = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }, { passive: true });
            
            card.addEventListener('touchend', (e) => {
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                
                if (touchDuration < 200) {
                    // Quick tap - trigger click
                    const brand = card.dataset.brand;
                    this.handleBrandClick(brand, card);
                }
            }, { passive: true });
        });
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

        // Ensure parent has relative position
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        // Add ripple animation
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => ripple.remove(), 600);
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
        
        // Hover effects for buttons
        const cancelBtn = modal.querySelector('.modal-cancel');
        const confirmBtn = modal.querySelector('.modal-confirm');
        
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.borderColor = '#d4af37';
            cancelBtn.style.color = '#d4af37';
        });
        
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.borderColor = '#e9ecef';
            cancelBtn.style.color = '#6c757d';
        });
        
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.transform = 'translateY(-1px)';
            confirmBtn.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        });
        
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
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

    // ============================================================================
    // UTILITY FUNCTIONS SECTION - Performance, Analytics, Helper Methods
    // ============================================================================

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

        // Prefetch important resources
        this.prefetchResources();
    }

    prefetchResources() {
        // Prefetch JSON files
        const jsonFiles = [
            'jrl-products.json',
            'stylecraft-products.json', 
            'wahl-products.json',
            'babyliss-products.json'
        ];

        jsonFiles.forEach(file => {
            const linkEl = document.createElement('link');
            linkEl.rel = 'prefetch';
            linkEl.href = file;
            document.head.appendChild(linkEl);
        });
    }

    trackEvent(eventName, data = {}) {
        console.log(`📊 Event tracked: ${eventName}`, data);
        // In a real app, you'd send this to your analytics service
        // gtag('event', eventName, data);
        // or analytics.track(eventName, data);
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
}

// ============================================================================
// GLOBAL FUNCTIONS AND INITIALIZATION
// ============================================================================

// Global functions for footer and external calls
function searchAllProducts() {
    if (window.barberWorld) {
        window.barberWorld.performSearch('');
    }
}

function searchByBrand(brand) {
    if (window.barberWorld) {
        window.barberWorld.performSearch(brand);
    }
}

function searchByCategory(category) {
    if (window.barberWorld) {
        window.barberWorld.performSearch(category);
    }
}

function closeSearchModal() {
    if (window.barberWorld) {
        window.barberWorld.closeSearchModal();
    }
}

function closeSearchResults() {
    if (window.barberWorld) {
        window.barberWorld.closeSearchResults();
    }
}

function clearAllSearchFilters() {
    if (window.barberWorld) {
        window.barberWorld.clearAllSearchFilters();
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Global utility functions
window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && window.barberWorld) {
        window.barberWorld.smoothScrollTo(`#${sectionId}`);
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.barberWorld = new BarberWorld();
    
    // Add loading completion effect
    document.body.classList.add('loaded');
    
    // Welcome message
    setTimeout(() => {
        if (window.barberWorld) {
            window.barberWorld.showNotification('Welcome to Barber World! ✂️', 'success');
        }
    }, 500);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarberWorld;
}
