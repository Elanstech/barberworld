// Barber World - Modern JavaScript Implementation with Real Search
// Enhanced UX with smooth animations and professional interactions

class BarberWorld {
    constructor() {
        this.cart = [];
        this.mobileMenuOpen = false;
        this.lastScrollY = 0;
        this.ticking = false;
        this.allProducts = [];
        this.brandsData = {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupPerformanceOptimizations();
        this.updateCartDisplay();
        
        // Load product data
        await this.loadProductData();
        
        console.log('🔥 Barber World initialized - Premium Experience Ready');
        console.log(`📦 Loaded ${this.allProducts.length} products from 4 brands`);
    }

    async loadProductData() {
        try {
            // Load all products from JSON file
            const response = await fetch('all-products.json');
            this.allProducts = await response.json();
            
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
            { id: 2, name: "StyleCraft Instinct Clipper", price: 269, brand: "StyleCraft", slug: "stylecraft-instinct-clipper" },
            { id: 3, name: "Wahl Magic Clip Cordless", price: 150, brand: "Wahl", slug: "wahl-magic-clip-cordless" },
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

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        mobileMenuToggle?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Logo click - scroll to top
        const navLogo = document.getElementById('nav-logo');
        navLogo?.addEventListener('click', () => {
            this.scrollToTop();
        });

        // Brand cards
        const brandCards = document.querySelectorAll('.brand-card');
        brandCards.forEach(card => {
            this.setupBrandCard(card);
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
                }
            });
        });

        // Mega menu links
        const megaMenuLinks = document.querySelectorAll('.mega-menu-links a[data-category]');
        megaMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.handleCategoryClick(category);
                this.closeMobileMenu();
            });
        });

        // Search functionality
        const searchBtn = document.querySelector('.search-btn');
        searchBtn?.addEventListener('click', () => {
            this.handleSearch();
        });

        // Cart functionality
        const cartBtn = document.querySelector('.cart-btn');
        cartBtn?.addEventListener('click', () => {
            this.showCart();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));

        // Touch events for better mobile experience
        this.setupTouchEvents();
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

        // Show brand products
        setTimeout(() => {
            this.showBrandProducts(brandName, brandProducts);
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

    showBrandProducts(brandName, products) {
        if (products.length === 0) {
            this.showNotification(`No products found for ${brandName}`, 'warning');
            return;
        }

        const productsList = products.slice(0, 8).map(product => `
            <div class="product-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border: 1px solid #e9ecef;
                border-radius: 0.5rem;
                margin-bottom: 0.75rem;
                background: #f8f9fa;
                transition: all 0.2s ease;
            " onmouseover="this.style.backgroundColor='#e9ecef'" onmouseout="this.style.backgroundColor='#f8f9fa'">
                <div>
                    <h4 style="margin: 0; color: #0a0a0a; font-size: 0.95rem;">${product.name}</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 0.8rem;">Product ID: ${product.id}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 600; color: #d4af37; font-size: 1.1rem;">${product.price.toFixed(2)}</span>
                    <button onclick="window.barberWorld.addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}})" style="
                        padding: 0.5rem 1rem;
                        background: linear-gradient(135deg, #d4af37, #b8941f);
                        color: white;
                        border: none;
                        border-radius: 0.25rem;
                        cursor: pointer;
                        font-size: 0.8rem;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        this.createModal({
            title: `${brandName} Products (${products.length} items)`,
            content: `
                <div style="max-height: 400px; overflow-y: auto;">
                    ${productsList}
                    ${products.length > 8 ? `<p style="text-align: center; color: #6c757d; margin: 1rem 0;">And ${products.length - 8} more products...</p>` : ''}
                </div>
            `,
            onConfirm: () => {
                this.showNotification(`Browse more ${brandName} products on our full catalog!`, 'info');
            },
            confirmText: 'View All Products'
        });

        this.showNotification(`Found ${products.length} ${brandName} products!`, 'success');
    }

    handleCategoryClick(category) {
        const categoryName = this.getCategoryName(category);
        const categoryProducts = this.getCategoryProducts(category);
        
        this.showNotification(`Exploring ${categoryName}...`, 'loading');
        
        setTimeout(() => {
            if (categoryProducts.length > 0) {
                this.showBrandProducts(categoryName, categoryProducts);
            } else {
                this.showNotification(`${categoryName} coming soon!`, 'info');
            }
        }, 800);

        this.trackEvent('category_click', { category: category, category_name: categoryName });
    }

    getCategoryProducts(category) {
        switch (category) {
            case 'clippers':
                return this.allProducts.filter(p => 
                    p.name.toLowerCase().includes('clipper') && 
                    !p.name.toLowerCase().includes('trimmer')
                );
            case 'trimmers':
                return this.allProducts.filter(p => 
                    p.name.toLowerCase().includes('trimmer')
                );
            case 'accessories':
                return this.allProducts.filter(p => 
                    p.name.toLowerCase().includes('blade') || 
                    p.name.toLowerCase().includes('guard') || 
                    p.name.toLowerCase().includes('oil') ||
                    p.name.toLowerCase().includes('mat') ||
                    p.name.toLowerCase().includes('case')
                );
            case 'all':
                return this.allProducts;
            default:
                return this.getBrandProducts(category);
        }
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

    // Mobile Menu Management
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        if (this.mobileMenuOpen) {
            this.openMobileMenu(navMenu, mobileMenuToggle);
        } else {
            this.closeMobileMenu(navMenu, mobileMenuToggle);
        }
    }

    openMobileMenu(navMenu, toggle) {
        navMenu?.classList.add('active');
        toggle?.classList.add('active');
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
            this.closeMobileMenu();
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

    // Scroll Effects and Navigation
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
    }

    // Enhanced Search and Cart Functionality
    handleSearch() {
        this.showSearchModal();
    }

    showSearchModal() {
        const brands = Object.keys(this.brandsData);
        const modal = this.createModal({
            title: 'Search Products',
            content: `
                <div style="margin-bottom: 1.5rem;">
                    <input 
                        type="text" 
                        id="search-input" 
                        placeholder="Search for brands, products, or categories..."
                        style="
                            width: 100%;
                            padding: 1rem;
                            border: 2px solid #e9ecef;
                            border-radius: 0.5rem;
                            font-size: 1rem;
                            transition: border-color 0.2s ease;
                        "
                    >
                    <div style="margin-top: 0.5rem;">
                        <select id="brand-filter" style="
                            padding: 0.5rem;
                            border: 1px solid #e9ecef;
                            border-radius: 0.25rem;
                            background: white;
                        ">
                            <option value="">All Brands</option>
                            ${brands.map(brand => `<option value="${brand}">${brand}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div id="search-results" style="max-height: 300px; overflow-y: auto; display: none;">
                    <!-- Search results will appear here -->
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;" id="popular-searches">
                    <span style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.5rem;">Popular searches:</span>
                    ${['Wahl', 'Andis', 'StyleCraft', 'JRL', 'Babyliss', 'clipper', 'trimmer'].map(term => 
                        `<button class="search-tag" onclick="document.getElementById('search-input').value='${term}'; window.barberWorld.performRealTimeSearch('${term}')" style="
                            padding: 0.3rem 0.8rem;
                            background: #f8f9fa;
                            border: 1px solid #e9ecef;
                            border-radius: 1rem;
                            font-size: 0.8rem;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.backgroundColor='#e9ecef'" onmouseout="this.style.backgroundColor='#f8f9fa'">${term}</button>`
                    ).join('')}
                </div>
            `,
            onConfirm: () => {
                const query = document.getElementById('search-input').value;
                const brand = document.getElementById('brand-filter').value;
                this.performSearch(query, brand);
            },
            confirmText: 'Search'
        });

        // Focus on input after modal opens
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            searchInput?.focus();
            
            // Real-time search
            searchInput?.addEventListener('input', (e) => {
                const query = e.target.value;
                const brand = document.getElementById('brand-filter').value;
                if (query.length >= 2) {
                    this.performRealTimeSearch(query, brand);
                } else {
                    this.hideSearchResults();
                }
            });
            
            // Brand filter change
            document.getElementById('brand-filter')?.addEventListener('change', (e) => {
                const query = document.getElementById('search-input').value;
                const brand = e.target.value;
                if (query.length >= 2) {
                    this.performRealTimeSearch(query, brand);
                }
            });
        }, 100);

        // Enter key search
        document.getElementById('search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                const brand = document.getElementById('brand-filter').value;
                this.performSearch(query, brand);
                modal.remove();
            }
        });
    }

    performRealTimeSearch(query, brandFilter = '') {
        const results = this.searchProducts(query, brandFilter);
        this.displaySearchResults(results.slice(0, 5)); // Show top 5 results
    }

    searchProducts(query, brandFilter = '') {
        if (!query || query.length < 2) return [];
        
        const searchTerm = query.toLowerCase();
        let products = this.allProducts;
        
        // Filter by brand if specified
        if (brandFilter) {
            products = products.filter(product => product.brand === brandFilter);
        }
        
        // Search in product names and brands
        const results = products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const brandMatch = product.brand.toLowerCase().includes(searchTerm);
            const slugMatch = product.slug.includes(searchTerm);
            return nameMatch || brandMatch || slugMatch;
        });
        
        // Sort by relevance (exact matches first, then partial matches)
        return results.sort((a, b) => {
            const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
            const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
            return bExact - aExact;
        });
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        const popularSearches = document.getElementById('popular-searches');
        
        if (results.length === 0) {
            resultsContainer.style.display = 'none';
            popularSearches.style.display = 'block';
            return;
        }
        
        popularSearches.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = results.map(product => `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                border: 1px solid #e9ecef;
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                background: #f8f9fa;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.backgroundColor='#e9ecef'" onmouseout="this.style.backgroundColor='#f8f9fa'" onclick="window.barberWorld.selectSearchResult(${product.id})">
                <div>
                    <strong style="color: #0a0a0a; font-size: 0.9rem;">${product.name}</strong>
                    <div style="color: #6c757d; font-size: 0.8rem;">${product.brand} • ${product.price.toFixed(2)}</div>
                </div>
                <i class="fas fa-arrow-right" style="color: #d4af37;"></i>
            </div>
        `).join('');
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        const popularSearches = document.getElementById('popular-searches');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            popularSearches.style.display = 'block';
        }
    }

    selectSearchResult(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product) {
            // Close search modal
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => modal.remove());
            
            // Show product details
            this.showProductDetails(product);
        }
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
                        ">${product.price.toFixed(2)}</div>
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
                        Add to Cart - ${product.price.toFixed(2)}
                    </button>
                </div>
            `,
            onConfirm: () => {
                this.showNotification(`Learn more about ${product.name}!`, 'info');
            },
            confirmText: 'View Details'
        });
    }

    performSearch(query, brandFilter = '') {
        if (!query || !query.trim()) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        const results = this.searchProducts(query, brandFilter);
        
        if (results.length === 0) {
            this.showNotification(`No products found for "${query}"`, 'warning');
            return;
        }

        this.showNotification(`Found ${results.length} products for "${query}"!`, 'success');
        this.showSearchResults(query, results);
        this.trackEvent('search', { query: query, brand_filter: brandFilter, results_count: results.length });
    }

    showSearchResults(query, results) {
        const resultsList = results.slice(0, 10).map(product => `
            <div class="search-result-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border: 1px solid #e9ecef;
                border-radius: 0.5rem;
                margin-bottom: 0.75rem;
                background: #f8f9fa;
                transition: all 0.2s ease;
            " onmouseover="this.style.backgroundColor='#e9ecef'" onmouseout="this.style.backgroundColor='#f8f9fa'">
                <div>
                    <h4 style="margin: 0; color: #0a0a0a; font-size: 0.95rem;">${product.name}</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 0.8rem;">${product.brand} • Product ID: ${product.id}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 600; color: #d4af37; font-size: 1.1rem;">${product.price.toFixed(2)}</span>
                    <button onclick="window.barberWorld.addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}})" style="
                        padding: 0.5rem 1rem;
                        background: linear-gradient(135deg, #d4af37, #b8941f);
                        color: white;
                        border: none;
                        border-radius: 0.25rem;
                        cursor: pointer;
                        font-size: 0.8rem;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        this.createModal({
            title: `Search Results for "${query}" (${results.length} found)`,
            content: `
                <div style="max-height: 400px; overflow-y: auto;">
                    ${resultsList}
                    ${results.length > 10 ? `<p style="text-align: center; color: #6c757d; margin: 1rem 0;">And ${results.length - 10} more products...</p>` : ''}
                </div>
            `,
            onConfirm: () => {
                this.showNotification(`Browse more search results in our full catalog!`, 'info');
            },
            confirmText: 'View All Results'
        });
    }

    // Cart Management
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
                    <span style="font-weight: 600; color: #d4af37;">${(item.price * item.quantity).toFixed(2)}</span>
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
                        Total: <span style="color: #d4af37;">${total.toFixed(2)}</span>
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

    // Animations and Effects
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

    // Utility Functions
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

    handleKeyboardShortcuts(e) {
        // Escape key - close modals/menus
        if (e.key === 'Escape') {
            this.closeMobileMenu();
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => modal.remove());
        }
        
        // Ctrl/Cmd + K - Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.handleSearch();
        }
    }

    // Modal System
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

    // Notification System
    showNotification(message, type = 'info') {
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

    // Analytics and Tracking
    trackEvent(eventName, data = {}) {
        // Mock analytics tracking
        console.log(`📊 Event tracked: ${eventName}`, data);
        
        // In a real app, you'd send this to your analytics service
        // gtag('event', eventName, data);
        // or analytics.track(eventName, data);
    }

    // Utility Methods
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

// Global utility functions
window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && window.barberWorld) {
        window.barberWorld.smoothScrollTo(`#${sectionId}`);
    }
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarberWorld;
}

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        mobileMenuToggle?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Logo click - scroll to top
        const navLogo = document.getElementById('nav-logo');
        navLogo?.addEventListener('click', () => {
            this.scrollToTop();
        });

        // Brand cards
        const brandCards = document.querySelectorAll('.brand-card');
        brandCards.forEach(card => {
            this.setupBrandCard(card);
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
                }
            });
        });

        // Mega menu links
        const megaMenuLinks = document.querySelectorAll('.mega-menu-links a[data-category]');
        megaMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.handleCategoryClick(category);
                this.closeMobileMenu();
            });
        });

        // Search functionality
        const searchBtn = document.querySelector('.search-btn');
        searchBtn?.addEventListener('click', () => {
            this.handleSearch();
        });

        // Cart functionality
        const cartBtn = document.querySelector('.cart-btn');
        cartBtn?.addEventListener('click', () => {
            this.showCart();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));

        // Touch events for better mobile experience
        this.setupTouchEvents();
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

    handleBrandClick(brand, card) {
        const brandName = this.getBrandName(brand);
        
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

        // Simulate navigation
        setTimeout(() => {
            this.showNotification(`Browsing ${brandName} collection`, 'success');
        }, 1000);

        // Analytics tracking
        this.trackEvent('brand_click', { brand: brand, brand_name: brandName });
    }

    handleCategoryClick(category) {
        const categoryName = this.getCategoryName(category);
        this.showNotification(`Exploring ${categoryName}...`, 'loading');
        
        setTimeout(() => {
            this.showNotification(`${categoryName} loaded successfully!`, 'success');
        }, 800);

        this.trackEvent('category_click', { category: category, category_name: categoryName });
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

    // Mobile Menu Management
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        if (this.mobileMenuOpen) {
            this.openMobileMenu(navMenu, mobileMenuToggle);
        } else {
            this.closeMobileMenu(navMenu, mobileMenuToggle);
        }
    }

    openMobileMenu(navMenu, toggle) {
        navMenu?.classList.add('active');
        toggle?.classList.add('active');
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
            this.closeMobileMenu();
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

    // Scroll Effects and Navigation
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
    }

    // Search and Cart Functionality
    handleSearch() {
        this.showSearchModal();
    }

    showSearchModal() {
        const modal = this.createModal({
            title: 'Search Products',
            content: `
                <div style="margin-bottom: 1.5rem;">
                    <input 
                        type="text" 
                        id="search-input" 
                        placeholder="Search for brands, products, or categories..."
                        style="
                            width: 100%;
                            padding: 1rem;
                            border: 2px solid #e9ecef;
                            border-radius: 0.5rem;
                            font-size: 1rem;
                            transition: border-color 0.2s ease;
                        "
                    >
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <span style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.5rem;">Popular searches:</span>
                    ${['Wahl', 'Andis', 'StyleCraft', 'JRL', 'Babyliss'].map(term => 
                        `<button class="search-tag" onclick="document.getElementById('search-input').value='${term}'" style="
                            padding: 0.3rem 0.8rem;
                            background: #f8f9fa;
                            border: 1px solid #e9ecef;
                            border-radius: 1rem;
                            font-size: 0.8rem;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">${term}</button>`
                    ).join('')}
                </div>
            `,
            onConfirm: () => {
                const query = document.getElementById('search-input').value;
                this.performSearch(query);
            },
            confirmText: 'Search'
        });

        // Focus on input after modal opens
        setTimeout(() => {
            document.getElementById('search-input')?.focus();
        }, 100);

        // Enter key search
        document.getElementById('search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                this.performSearch(query);
                modal.remove();
            }
        });
    }

    performSearch(query) {
        if (!query || !query.trim()) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        this.showNotification(`Searching for "${query}"...`, 'loading');
        
        setTimeout(() => {
            this.showNotification(`Found results for "${query}"!`, 'success');
        }, 1000);

        this.trackEvent('search', { query: query });
    }

    // Cart Management
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
                <div style="font-weight: 600; color: #d4af37;">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        this.createModal({
            title: 'Shopping Cart',
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
                setTimeout(() => {
                    this.showNotification('Checkout functionality coming soon!', 'info');
                }, 1000);
            },
            confirmText: 'Checkout'
        });
    }

    // Animations and Effects
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

    // Utility Functions
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
        // Prefetch common brand pages
        const importantLinks = [
            '/barber-world-products',
            '/wahl-products',
            '/andis-products',
            '/stylecraft-products',
            '/specials'
        ];

        importantLinks.forEach(link => {
            const linkEl = document.createElement('link');
            linkEl.rel = 'prefetch';
            linkEl.href = link;
            document.head.appendChild(linkEl);
        });
    }

    handleKeyboardShortcuts(e) {
        // Escape key - close modals/menus
        if (e.key === 'Escape') {
            this.closeMobileMenu();
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => modal.remove());
        }
        
        // Ctrl/Cmd + K - Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.handleSearch();
        }
    }

    // Modal System
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
                max-width: 500px;
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

    // Notification System
    showNotification(message, type = 'info') {
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

    // Analytics and Tracking
    trackEvent(eventName, data = {}) {
        // Mock analytics tracking
        console.log(`📊 Event tracked: ${eventName}`, data);
        
        // In a real app, you'd send this to your analytics service
        // gtag('event', eventName, data);
        // or analytics.track(eventName, data);
    }

    // Utility Methods
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

// Global utility functions
window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && window.barberWorld) {
        window.barberWorld.smoothScrollTo(`#${sectionId}`);
    }
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarberWorld;
}
