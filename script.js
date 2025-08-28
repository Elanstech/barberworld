/* ========================================
   BARBER WORLD - COMPLETE WORKING APPLICATION
   Professional Equipment & Supplies
   ======================================== */

// Global variables
let cart = [];
let isSearchModalOpen = false;
let isMobileMenuOpen = false;

/* ========================================
   DOCUMENT READY INITIALIZATION
   ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Barber World Loading...');
    
    // Initialize all components
    initializeHeader();
    initializeMobileMenu();
    initializeSearch();
    initializeBrands();
    initializeCart();
    initializeScrollEffects();
    initializeAnimations();
    
    // Add welcome message
    setTimeout(() => {
        showNotification('Welcome to Barber World! ✂️', 'success');
    }, 500);
    
    console.log('✅ Barber World Initialized Successfully');
});

/* ========================================
   HEADER & NAVIGATION
   ======================================== */
function initializeHeader() {
    const header = document.getElementById('header');
    const navLogo = document.getElementById('nav-logo');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const megaMenuLinks = document.querySelectorAll('.mega-menu-links a[data-category]');
    const searchBtn = document.querySelector('.search-btn');
    const cartBtn = document.querySelector('.cart-btn');
    
    // Logo click - scroll to top
    if (navLogo) {
        navLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                smoothScrollTo(href);
                setActiveNavLink(link);
            }
        });
    });
    
    // Mega menu category links
    megaMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            const categoryName = getCategoryName(category);
            
            // Add click animation
            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = 'scale(1)';
            }, 100);
            
            // Show loading notification
            showNotification(`Loading ${categoryName}...`, 'loading');
            
            // Perform search after delay
            setTimeout(() => {
                performSearch(categoryName);
            }, 800);
        });
    });
    
    // Search button
    if (searchBtn) {
        searchBtn.addEventListener('click', openSearchModal);
    }
    
    // Cart button
    if (cartBtn) {
        cartBtn.addEventListener('click', showCart);
    }
    
    // Scroll effects
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        if (e.key === 'Escape' && isSearchModalOpen) {
            closeSearchModal();
        }
    });
}

function handleHeaderScroll() {
    const header = document.getElementById('header');
    const scrollY = window.pageYOffset;
    
    if (header) {
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Update scroll to top button
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
        if (scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
}

function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerHeight = 80;
        const elementPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

function setActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function getCategoryName(category) {
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
        'all': 'All Products',
        'new': 'New Arrivals',
        'bestsellers': 'Best Sellers'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/* ========================================
   MOBILE MENU
   ======================================== */
function initializeMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!toggle || !menu) return;
    
    // Toggle click
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMobileMenuOpen) {
                setTimeout(closeMobileMenu, 150);
            }
        });
    });
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobileMenuOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    if (isMobileMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-menu');
    
    if (!toggle || !menu) return;
    
    isMobileMenuOpen = true;
    document.body.classList.add('mobile-menu-open');
    toggle.classList.add('active');
    menu.classList.add('active');
    
    // Prevent body scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.dataset.scrollY = scrollY;
    
    // Create backdrop
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
    
    backdrop.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('nav-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    
    if (!toggle || !menu) return;
    
    isMobileMenuOpen = false;
    document.body.classList.remove('mobile-menu-open');
    toggle.classList.remove('active');
    menu.classList.remove('active');
    
    // Restore body scroll
    const scrollY = document.body.dataset.scrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0'));
    }
    
    // Remove backdrop
    if (backdrop) {
        backdrop.style.opacity = '0';
        setTimeout(() => backdrop.remove(), 300);
    }
}

/* ========================================
   SEARCH FUNCTIONALITY
   ======================================== */
function initializeSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input-main');
    const popularTags = document.querySelectorAll('.popular-search-tag');
    const backBtn = document.querySelector('.search-back-btn');
    const closeBtn = document.querySelector('.search-modal-close');
    
    if (!searchModal) return;
    
    // Popular search tags
    popularTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.query;
            performSearch(query);
            closeSearchModal();
        });
    });
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    performSearch(query);
                    closeSearchModal();
                }
            }
        });
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSearchModal);
    }
    
    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', closeSearchResults);
    }
    
    // Modal overlay click
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });
    
    // Filter selects
    const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
    filterSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', updateSearchResults);
        }
    });
}

function openSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input-main');
    
    if (searchModal) {
        isSearchModalOpen = true;
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on search input
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 300);
    }
}

function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input-main');
    
    if (searchModal) {
        isSearchModalOpen = false;
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear search input
        if (searchInput) {
            searchInput.value = '';
        }
    }
}

function performSearch(query) {
    console.log(`🔍 Searching for: ${query}`);
    
    // Show search results section
    const sectionsToHide = ['brands', 'about', 'why-choose-us'];
    sectionsToHide.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });
    
    const searchResultsSection = document.getElementById('search-results-section');
    if (searchResultsSection) {
        searchResultsSection.style.display = 'block';
    }
    
    // Update search results
    displaySearchResults(query);
    
    // Scroll to top of results
    window.scrollTo({ top: 80, behavior: 'smooth' });
}

function displaySearchResults(query) {
    const resultsTitle = document.getElementById('search-results-title');
    const resultsCount = document.getElementById('search-results-count');
    const productsGrid = document.getElementById('search-products-grid');
    const noResults = document.getElementById('no-search-results');
    const loadingState = document.getElementById('search-loading');
    
    // Show loading
    if (loadingState) {
        loadingState.style.display = 'block';
        if (productsGrid) productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
    }
    
    // Update title
    if (resultsTitle) {
        resultsTitle.textContent = query ? `Search Results for "${query}"` : 'All Products';
    }
    
    // Simulate search with sample data
    setTimeout(() => {
        const sampleProducts = getSampleProducts(query);
        
        if (loadingState) {
            loadingState.style.display = 'none';
        }
        
        if (resultsCount) {
            resultsCount.textContent = `${sampleProducts.length} product${sampleProducts.length !== 1 ? 's' : ''} found`;
        }
        
        if (sampleProducts.length === 0) {
            if (productsGrid) productsGrid.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
        } else {
            if (noResults) noResults.style.display = 'none';
            if (productsGrid) {
                productsGrid.style.display = 'grid';
                productsGrid.innerHTML = sampleProducts.map(product => createProductCard(product)).join('');
            }
        }
    }, 800);
}

function getSampleProducts(query) {
    const allProducts = [
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

function createProductCard(product) {
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
        <div class="search-product-card" onclick="showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <div class="search-product-image">
                <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
            </div>
            <div class="search-product-content">
                <div class="search-product-brand">${product.brand}</div>
                <h3 class="search-product-name">${product.name}</h3>
                <div class="search-product-price">$${product.price.toFixed(2)}</div>
                <div class="search-product-actions">
                    <button class="btn-secondary" onclick="event.stopPropagation(); showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        View Details
                    </button>
                    <button class="btn-primary-small" onclick="event.stopPropagation(); addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showProductDetails(product) {
    createModal({
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
            addToCart(product);
        },
        confirmText: `Add to Cart - $${product.price.toFixed(2)}`
    });
}

function updateSearchResults() {
    // This would re-run the search with current filters
    console.log('🔄 Updating search results with filters');
}

function closeSearchResults() {
    // Hide search results
    const searchResultsSection = document.getElementById('search-results-section');
    if (searchResultsSection) {
        searchResultsSection.style.display = 'none';
    }
    
    // Show main sections
    const sectionsToShow = ['brands', 'about', 'why-choose-us'];
    sectionsToShow.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'block';
    });
    
    // Scroll to brands section
    const brandsSection = document.getElementById('brands');
    if (brandsSection) {
        smoothScrollTo('#brands');
    }
}

// Global search functions
function searchAllProducts() {
    performSearch('All Products');
}

function searchByBrand(brand) {
    performSearch(brand);
}

function searchByCategory(category) {
    performSearch(category);
}

function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
        isSearchModalOpen = false;
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeSearchResults() {
    const searchResultsSection = document.getElementById('search-results-section');
    if (searchResultsSection) {
        searchResultsSection.style.display = 'none';
    }
    
    const sectionsToShow = ['brands', 'about', 'why-choose-us'];
    sectionsToShow.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'block';
    });
}

function clearAllSearchFilters() {
    const filterSelects = ['brand-filter', 'category-filter', 'price-filter', 'sort-filter'];
    filterSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) select.value = '';
    });
    updateSearchResults();
}

/* ========================================
   BRANDS SECTION
   ======================================== */
function initializeBrands() {
    const brandCards = document.querySelectorAll('.brand-card');
    
    brandCards.forEach(card => {
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            animateBrandCard(card, true);
        });
        
        card.addEventListener('mouseleave', () => {
            animateBrandCard(card, false);
        });
        
        // Click handler
        card.addEventListener('click', (e) => {
            handleBrandClick(card, e);
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
                handleBrandClick(card, e);
            }
        });
    });
}

function animateBrandCard(card, isHover) {
    const image = card.querySelector('.brand-image img');
    
    if (isHover) {
        if (card.classList.contains('featured-brand')) {
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

function handleBrandClick(card, event) {
    const brand = card.dataset.brand;
    const brandName = getCategoryName(brand);
    
    // Create ripple effect
    createRippleEffect(card, event);
    
    // Add click animation
    card.style.transform = 'scale(1.02)';
    setTimeout(() => {
        card.style.transform = '';
    }, 200);
    
    // Show loading notification
    showNotification(`Loading ${brandName} products...`, 'loading');
    
    // Perform search
    setTimeout(() => {
        performSearch(brandName);
        showNotification(`Showing ${brandName} products`, 'success');
    }, 1000);
    
    console.log(`🎯 Brand clicked: ${brandName}`);
}

function createRippleEffect(element, event) {
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

/* ========================================
   CART FUNCTIONALITY
   ======================================== */
function initializeCart() {
    updateCartDisplay();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartDisplay();
    animateCartIcon();
    showNotification(`${product.name} added to cart!`, 'success');
    
    console.log(`🛒 Added to cart: ${product.name}`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCountElement = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        if (totalItems > 0) {
            cartCountElement.classList.add('visible');
        } else {
            cartCountElement.classList.remove('visible');
        }
    }
}

function animateCartIcon() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        cartBtn.style.color = '#d4af37';
        
        setTimeout(() => {
            cartBtn.style.transform = '';
            cartBtn.style.color = '';
        }, 300);
    }
}

function showCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }
    
    const cartItems = cart.map(item => `
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
                <button onclick="removeFromCart(${item.id}); document.querySelector('.modal-overlay').remove(); showCart();" style="
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    createModal({
        title: `Shopping Cart (${cart.length} items)`,
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
            showNotification('Checkout functionality coming soon!', 'info');
        },
        confirmText: 'Checkout'
    });
}

/* ========================================
   ANIMATIONS & SCROLL EFFECTS
   ======================================== */
function initializeScrollEffects() {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(scrollBtn);
    
    // Handle scroll events
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
}

function initializeAnimations() {
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

        // Observe why choose cards
        const whyChooseCards = document.querySelectorAll('.why-choose-card');
        whyChooseCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s ease-out ${index * 0.2}s`;
            observer.observe(card);
        });
    }
}

/* ========================================
   UI UTILITIES
   ======================================== */
function createModal({ title, content, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) {
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

function showNotification(message, type = 'info') {
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
        background: ${getNotificationColor(type)};
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
            <i class="fas fa-${getNotificationIcon(type)}" style="font-size: 1.1rem;"></i>
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

function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        loading: 'linear-gradient(135deg, #d4af37, #b8941f)'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle',
        loading: 'hourglass-half'
    };
    return icons[type] || icons.info;
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* ========================================
   DYNAMIC STYLES
   ======================================== */
function addDynamicStyles() {
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
        .cart-count.visible {
            display: block;
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

// Initialize styles when DOM is ready
document.addEventListener('DOMContentLoaded', addDynamicStyles);

// Handle page load completion
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    console.log('🚀 Barber World fully loaded and ready!');
});

// Global scroll to section utility
window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
        smoothScrollTo(`#${sectionId}`);
    }
};
