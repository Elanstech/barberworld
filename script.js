// Modern Hero Slider & Barber World Interactive Features
// Clean ES6+ Implementation

class HeroSlider {
    constructor(container, options = {}) {
        this.container = container;
        this.slides = container.querySelectorAll('.hero-slide');
        this.dots = container.querySelectorAll('.hero-dot');
        this.prevBtn = container.querySelector('.hero-control.prev');
        this.nextBtn = container.querySelector('.hero-control.next');
        this.progressBar = container.querySelector('.progress-bar');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isAutoPlay = options.autoPlay !== false;
        this.interval = options.interval || 8000;
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        
        this.init();
    }
    
    init() {
        if (this.totalSlides === 0) return;
        
        this.setupSlides();
        this.bindEvents();
        this.startAutoPlay();
        this.setupCountdown();
        console.log('🎬 Hero Slider initialized');
    }
    
    setupSlides() {
        this.slides.forEach((slide, index) => {
            slide.style.opacity = index === 0 ? '1' : '0';
            slide.style.visibility = index === 0 ? 'visible' : 'hidden';
            slide.style.transform = index === 0 ? 'translateX(0)' : 'translateX(100%)';
        });
        
        this.updateDots();
        this.updateProgress();
    }
    
    bindEvents() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.previousSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        
        // Dots navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch events
        this.setupTouchEvents();
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            document.hidden ? this.pauseAutoPlay() : this.resumeAutoPlay();
        });
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.pauseAutoPlay();
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
            
            this.resumeAutoPlay();
        }, { passive: true });
    }
    
    goToSlide(index) {
        if (index === this.currentSlide || this.isTransitioning) return;
        
        this.isTransitioning = true;
        const currentSlide = this.slides[this.currentSlide];
        const nextSlide = this.slides[index];
        const direction = index > this.currentSlide ? 'next' : 'prev';
        
        // Animate out current slide
        currentSlide.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
        currentSlide.style.opacity = '0';
        
        // Prepare next slide
        nextSlide.style.visibility = 'visible';
        nextSlide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
        nextSlide.style.opacity = '0';
        
        // Animate in next slide
        setTimeout(() => {
            nextSlide.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            nextSlide.style.transform = 'translateX(0)';
            nextSlide.style.opacity = '1';
            
            setTimeout(() => {
                currentSlide.style.visibility = 'hidden';
                currentSlide.style.transition = '';
                nextSlide.style.transition = '';
                this.currentSlide = index;
                this.isTransitioning = false;
                
                this.updateDots();
                this.updateProgress();
                this.animateSlideContent(nextSlide);
            }, 800);
        }, 50);
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    }
    
    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    updateProgress() {
        if (this.progressBar) {
            const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }
    
    animateSlideContent(slide) {
        const elements = slide.querySelectorAll('.hero-badge, .title-line, .hero-subtitle, .hero-actions, .hero-stats, .product-showcase-card, .offer-card');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100 + 200);
        });
    }
    
    startAutoPlay() {
        if (!this.isAutoPlay) return;
        
        this.autoPlayTimer = setInterval(() => {
            if (!this.isTransitioning) {
                this.nextSlide();
            }
        }, this.interval);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    resumeAutoPlay() {
        if (this.isAutoPlay && !this.autoPlayTimer) {
            this.startAutoPlay();
        }
    }
    
    handleKeyboard(e) {
        if (!this.container.matches(':hover')) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.isAutoPlay ? this.pauseAutoPlay() : this.resumeAutoPlay();
                this.isAutoPlay = !this.isAutoPlay;
                break;
        }
    }
    
    setupCountdown() {
        const countdownElements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes')
        };
        
        if (!countdownElements.days) return;
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;
            
            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                
                if (countdownElements.days) countdownElements.days.textContent = days.toString().padStart(2, '0');
                if (countdownElements.hours) countdownElements.hours.textContent = hours.toString().padStart(2, '0');
                if (countdownElements.minutes) countdownElements.minutes.textContent = minutes.toString().padStart(2, '0');
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
}

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.megaMenu = document.querySelector('.mega-menu');
        this.brandsDropdown = document.querySelector('.brands-dropdown');
        this.searchTrigger = document.querySelector('.search-trigger');
        this.searchDropdown = document.querySelector('.search-dropdown');
        
        this.isMenuOpen = false;
        this.isMegaMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupScrollEffect();
        console.log('🧭 Navigation initialized');
    }
    
    bindEvents() {
        // Mobile menu toggle
        this.hamburger?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Mega menu
        this.setupMegaMenu();
        
        // Search dropdown
        this.setupSearch();
        
        // Smooth scroll for nav links
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    this.closeMobileMenu();
                }
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navMenu?.contains(e.target) && !this.hamburger?.contains(e.target)) {
                this.closeMobileMenu();
            }
            
            if (!this.megaMenu?.contains(e.target) && !this.brandsDropdown?.contains(e.target)) {
                this.closeMegaMenu();
            }
            
            if (!this.searchDropdown?.contains(e.target) && !this.searchTrigger?.contains(e.target)) {
                this.closeSearch();
            }
        });
    }
    
    setupScrollEffect() {
        let lastScrollY = 0;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (this.navbar) {
                if (currentScrollY > 100) {
                    this.navbar.classList.add('scrolled');
                } else {
                    this.navbar.classList.remove('scrolled');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.hamburger?.classList.toggle('active');
        this.navMenu?.classList.toggle('active');
        
        if (this.isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.isMenuOpen = false;
            this.hamburger?.classList.remove('active');
            this.navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    setupMegaMenu() {
        if (!this.brandsDropdown || !this.megaMenu) return;
        
        let hoverTimeout;
        
        this.brandsDropdown.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            this.showMegaMenu();
        });
        
        this.brandsDropdown.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => this.closeMegaMenu(), 300);
        });
        
        this.megaMenu.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
        });
        
        this.megaMenu.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => this.closeMegaMenu(), 300);
        });
    }
    
    showMegaMenu() {
        if (this.isMegaMenuOpen) return;
        
        this.isMegaMenuOpen = true;
        this.brandsDropdown?.classList.add('active');
        
        if (this.megaMenu) {
            this.megaMenu.style.visibility = 'visible';
            this.megaMenu.style.opacity = '1';
            this.megaMenu.style.transform = 'translateX(-50%) translateY(0)';
        }
    }
    
    closeMegaMenu() {
        if (!this.isMegaMenuOpen) return;
        
        this.isMegaMenuOpen = false;
        this.brandsDropdown?.classList.remove('active');
        
        if (this.megaMenu) {
            this.megaMenu.style.opacity = '0';
            this.megaMenu.style.transform = 'translateX(-50%) translateY(-10px)';
            
            setTimeout(() => {
                this.megaMenu.style.visibility = 'hidden';
            }, 300);
        }
    }
    
    setupSearch() {
        this.searchTrigger?.addEventListener('click', () => this.toggleSearch());
        
        const searchInput = this.searchDropdown?.querySelector('input');
        const searchBtn = this.searchDropdown?.querySelector('button');
        
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });
        
        searchBtn?.addEventListener('click', () => {
            this.performSearch(searchInput?.value || '');
        });
    }
    
    toggleSearch() {
        if (this.searchDropdown) {
            const isVisible = this.searchDropdown.style.opacity === '1';
            
            if (isVisible) {
                this.closeSearch();
            } else {
                this.showSearch();
            }
        }
    }
    
    showSearch() {
        if (this.searchDropdown) {
            this.searchDropdown.style.visibility = 'visible';
            this.searchDropdown.style.opacity = '1';
            this.searchDropdown.style.transform = 'translateY(0)';
            
            const input = this.searchDropdown.querySelector('input');
            setTimeout(() => input?.focus(), 100);
        }
    }
    
    closeSearch() {
        if (this.searchDropdown) {
            this.searchDropdown.style.opacity = '0';
            this.searchDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                this.searchDropdown.style.visibility = 'hidden';
            }, 300);
        }
    }
    
    performSearch(query) {
        if (!query.trim()) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }
        
        this.showNotification(`Searching for "${query}"...`, 'info');
        this.closeSearch();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #28a745, #34ce57)',
            error: 'linear-gradient(135deg, #dc3545, #e85563)',
            warning: 'linear-gradient(135deg, #ffc107, #ffcd39)',
            info: 'linear-gradient(135deg, #d4af37, #e6c866)'
        };
        return colors[type] || colors.info;
    }
}

class ProductManager {
    constructor() {
        this.cart = [];
        this.wishlist = [];
        this.cartBadge = document.querySelector('.cart-badge');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateCartBadge();
        console.log('🛒 Product manager initialized');
    }
    
    bindEvents() {
        // Product cards
        document.querySelectorAll('.product-card').forEach(card => {
            this.setupProductCard(card);
        });
        
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAction(btn);
            });
        });
        
        // Cart icon
        document.querySelector('.fa-shopping-cart')?.addEventListener('click', () => {
            this.showCartModal();
        });
        
        // Hero buttons
        document.querySelectorAll('.btn-hero').forEach(btn => {
            btn.addEventListener('click', () => this.handleHeroButton(btn));
        });
    }
    
    setupProductCard(card) {
        const actions = card.querySelector('.product-actions');
        
        card.addEventListener('mouseenter', () => {
            this.animateCard(card, true);
            this.showActions(actions);
        });
        
        card.addEventListener('mouseleave', () => {
            this.animateCard(card, false);
            this.hideActions(actions);
        });
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.product-actions')) {
                this.showProductModal(card);
            }
        });
    }
    
    animateCard(card, isHover) {
        const image = card.querySelector('.product-image img');
        
        if (isHover) {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            if (image) image.style.transform = 'scale(1.1)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
            if (image) image.style.transform = 'scale(1)';
        }
    }
    
    showActions(actions) {
        if (!actions) return;
        
        const buttons = actions.querySelectorAll('.action-btn');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }
    
    hideActions(actions) {
        if (!actions) return;
        
        const buttons = actions.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateX(20px)';
        });
    }
    
    handleAction(btn) {
        const action = btn.dataset.action;
        const productCard = btn.closest('.product-card');
        const productId = productCard?.dataset.product || 'unknown';
        
        switch (action) {
            case 'add-cart':
                this.addToCart(productId);
                break;
            case 'wishlist':
                this.toggleWishlist(productId);
                break;
            case 'quick-view':
                this.showProductModal(productCard);
                break;
        }
    }
    
    addToCart(productId) {
        const product = this.getProductData(productId);
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ id: productId, ...product, quantity: 1 });
        }
        
        this.updateCartBadge();
        this.showNotification(`${product.name} added to cart!`, 'success');
        this.animateCartIcon();
    }
    
    toggleWishlist(productId) {
        const product = this.getProductData(productId);
        const index = this.wishlist.indexOf(productId);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showNotification(`${product.name} removed from wishlist`, 'info');
        } else {
            this.wishlist.push(productId);
            this.showNotification(`${product.name} added to wishlist!`, 'success');
        }
    }
    
    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (this.cartBadge) {
            this.cartBadge.textContent = totalItems;
            this.cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
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
    
    showProductModal(productCard) {
        const productId = productCard.dataset.product;
        const product = this.getProductData(productId);
        
        this.createModal({
            title: product.name,
            content: `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 12px;">
                    <div>
                        <div style="color: #d4af37; font-weight: 600; margin-bottom: 0.5rem;">${product.brand}</div>
                        <h4 style="margin-bottom: 1rem; color: #1a1a1a;">${product.name}</h4>
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a;">$${product.price}</span>
                            <span style="text-decoration: line-through; color: #6a6a6a; margin-left: 0.5rem;">$${product.originalPrice}</span>
                        </div>
                        <p style="color: #6a6a6a; line-height: 1.6;">Professional-grade tools designed for superior performance and durability.</p>
                    </div>
                </div>
            `,
            onConfirm: () => this.addToCart(productId)
        });
    }
    
    showCartModal() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'info');
            return;
        }
        
        const cartItems = this.cart.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e5e5;">
                <div>
                    <strong>${item.name}</strong>
                    <div style="color: #6a6a6a; font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                </div>
                <div style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
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
            onConfirm: () => this.showNotification('Checkout coming soon!', 'info')
        });
    }
    
    handleHeroButton(btn) {
        const text = btn.textContent.trim();
        
        switch (text) {
            case 'Explore Collection':
                document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'Add to Cart':
                this.addToCart('wahl-magic-clip');
                break;
            case 'Shop Now & Save':
                this.showNotification('Redirecting to deals...', 'success');
                break;
            default:
                this.showNotification('Button clicked!', 'info');
        }
    }
    
    getProductData(productId) {
        const products = {
            'wahl-magic-clip': {
                name: 'Wahl Magic Clip Cordless',
                brand: 'Wahl',
                price: 89.99,
                originalPrice: 149.99,
                image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop'
            },
            'babyliss-fx8700': {
                name: 'Babyliss FX8700 GoldFX',
                brand: 'Babyliss',
                price: 199.99,
                originalPrice: 279.99,
                image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop'
            },
            'jrl-2020c': {
                name: 'JRL 2020C Clipper',
                brand: 'JRL',
                price: 299.99,
                originalPrice: 399.99,
                image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop'
            }
        };
        
        return products[productId] || { name: 'Unknown Product', brand: 'Unknown', price: 0, originalPrice: 0, image: '' };
    }
    
    createModal({ title, content, onConfirm }) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-cancel">Cancel</button>
                    <button class="btn-primary modal-confirm">Confirm</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
        
        const closeModal = () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    showNotification(message, type = 'info') {
        // Reuse the notification system from NavigationManager
        const nav = new NavigationManager();
        nav.showNotification(message, type);
    }
}

class NewsletterManager {
    constructor() {
        this.form = document.querySelector('.newsletter-form');
        this.emailInput = document.querySelector('#newsletter-email');
        this.submitBtn = document.querySelector('#newsletter-submit');
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.bindEvents();
        console.log('📧 Newsletter manager initialized');
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        this.submitBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }
    
    handleSubmit() {
        const email = this.emailInput?.value || '';
        
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        this.setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            this.emailInput.value = '';
            this.setLoading(false);
        }, 1500);
    }
    
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    setLoading(isLoading) {
        if (!this.submitBtn) return;
        
        if (isLoading) {
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.innerHTML = '<span>Subscribe</span><i class="fas fa-arrow-right"></i>';
            this.submitBtn.disabled = false;
        }
    }
    
    showNotification(message, type) {
        const nav = new NavigationManager();
        nav.showNotification(message, type);
    }
}

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.scroll-animate, .product-card, .feature-card, .category-card');
        this.observer = null;
        
        this.init();
    }
    
    init() {
        this.setupObserver();
        this.observeElements();
        console.log('✨ Scroll animations initialized');
    }
    
    setupObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }
    
    observeElements() {
        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            this.observer.observe(el);
        });
    }
    
    animateElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Stagger animation for grid children
        if (element.classList.contains('products-grid') || element.classList.contains('categories-grid')) {
            this.staggerChildren(element);
        }
    }
    
    staggerChildren(parent) {
        const children = Array.from(parent.children);
        children.forEach((child, index) => {
            child.style.animationDelay = `${index * 0.1}s`;
            child.classList.add('stagger-animate');
        });
    }
}

class UIEffects {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupRippleEffects();
        this.setupHoverEffects();
        this.setupParallax();
        console.log('🎨 UI effects initialized');
    }
    
    setupRippleEffects() {
        const buttons = document.querySelectorAll('.btn, .btn-hero, .action-btn, .hero-dot');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(btn, e);
            });
        });
    }
    
    createRipple(element, event) {
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
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        // Ensure parent has relative position
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    setupHoverEffects() {
        // Brand cards
        document.querySelectorAll('.brand-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateBrandCard(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateBrandCard(card, false);
            });
        });
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCategoryCard(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateCategoryCard(card, false);
            });
        });
        
        // Feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateFeatureCard(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateFeatureCard(card, false);
            });
        });
    }
    
    animateBrandCard(card, isHover) {
        const image = card.querySelector('.brand-image img');
        
        if (isHover) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.25)';
            if (image) image.style.transform = 'scale(1.1)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
            if (image) image.style.transform = 'scale(1)';
        }
    }
    
    animateCategoryCard(card, isHover) {
        const image = card.querySelector('.category-image img');
        
        if (isHover) {
            card.style.transform = 'translateY(-8px)';
            if (image) image.style.transform = 'scale(1.1)';
        } else {
            card.style.transform = 'translateY(0)';
            if (image) image.style.transform = 'scale(1)';
        }
    }
    
    animateFeatureCard(card, isHover) {
        if (isHover) {
            card.style.transform = 'translateY(-5px)';
            card.style.borderColor = '#d4af37';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.borderColor = 'rgba(212, 175, 55, 0.2)';
        }
    }
    
    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroSlider = document.querySelector('.hero-slider');
            
            if (heroSlider && scrolled < window.innerHeight) {
                const parallaxSpeed = scrolled * 0.5;
                
                // Apply subtle parallax to hero background
                const heroImages = document.querySelectorAll('.hero-image img');
                heroImages.forEach(img => {
                    img.style.transform = `translateY(${parallaxSpeed * 0.3}px) scale(1.05)`;
                });
            }
        });
    }
}

class Performance {
    constructor() {
        this.init();
    }
    
    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.setupServiceWorker();
        console.log('⚡ Performance optimizations applied');
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
    
    preloadCriticalResources() {
        const criticalImages = [
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1920&h=1080&fit=crop'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
}

class BarberWorldApp {
    constructor() {
        this.heroSlider = null;
        this.navigation = null;
        this.productManager = null;
        this.newsletter = null;
        this.scrollAnimations = null;
        this.uiEffects = null;
        this.performance = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        try {
            // Initialize hero slider
            const heroContainer = document.querySelector('.hero-slider');
            if (heroContainer) {
                this.heroSlider = new HeroSlider(heroContainer, {
                    autoPlay: true,
                    interval: 8000
                });
            }
            
            // Initialize other components
            this.navigation = new NavigationManager();
            this.productManager = new ProductManager();
            this.newsletter = new NewsletterManager();
            this.scrollAnimations = new ScrollAnimations();
            this.uiEffects = new UIEffects();
            this.performance = new Performance();
            
            // Add global styles
            this.addGlobalStyles();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            console.log('🚀 Barber World App fully initialized!');
            
            // Show welcome message
            setTimeout(() => {
                this.showWelcomeNotification();
            }, 1000);
            
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
    
    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            @keyframes stagger-animate {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .stagger-animate {
                animation: stagger-animate 0.6s ease forwards;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e5e5;
            }
            
            .modal-header h3 {
                color: #d4af37;
                margin: 0;
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6a6a6a;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: #f5f5f5;
                color: #1a1a1a;
            }
            
            .modal-footer {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e5e5;
            }
            
            .btn-primary, .btn-secondary {
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                font-size: 0.9rem;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #d4af37, #e6c866);
                color: #1a1a1a;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
            }
            
            .btn-secondary {
                background: transparent;
                color: #1a1a1a;
                border: 2px solid #e5e5e5;
            }
            
            .btn-secondary:hover {
                border-color: #d4af37;
                color: #d4af37;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            /* Smooth scrolling for all elements */
            * {
                scroll-behavior: smooth;
            }
            
            /* Loading animation */
            .loading {
                opacity: 0;
                animation: fadeIn 0.8s ease forwards;
            }
            
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            
            /* Focus styles for accessibility */
            button:focus,
            input:focus,
            .nav-link:focus {
                outline: 2px solid #d4af37;
                outline-offset: 2px;
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupGlobalEvents() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals/menus
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.navigation?.closeMobileMenu();
                this.navigation?.closeMegaMenu();
                this.navigation?.closeSearch();
            }
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.heroSlider?.pauseAutoPlay();
            } else {
                this.heroSlider?.resumeAutoPlay();
            }
        });
        
        // Smooth scroll to top on logo click
        document.querySelector('.nav-logo')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
    }
    
    showWelcomeNotification() {
        this.navigation?.showNotification('Welcome to Barber World! 🔥', 'success');
    }
    
    // Public API methods
    getHeroSlider() {
        return this.heroSlider;
    }
    
    getNavigation() {
        return this.navigation;
    }
    
    getProductManager() {
        return this.productManager;
    }
    
    // Utility methods
    static smoothScrollTo(element) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    static throttle(func, limit) {
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
    
    static debounce(func, wait, immediate) {
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
}

// Initialize the application
const app = new BarberWorldApp();

// Expose API for external access
window.BarberWorld = {
    app: app,
    HeroSlider: HeroSlider,
    NavigationManager: NavigationManager,
    ProductManager: ProductManager,
    
    // Quick access methods
    goToSlide: (index) => app.getHeroSlider()?.goToSlide(index),
    nextSlide: () => app.getHeroSlider()?.nextSlide(),
    previousSlide: () => app.getHeroSlider()?.previousSlide(),
    toggleAutoPlay: () => {
        const slider = app.getHeroSlider();
        if (slider) {
            slider.isAutoPlay ? slider.pauseAutoPlay() : slider.resumeAutoPlay();
            slider.isAutoPlay = !slider.isAutoPlay;
        }
    },
    
    // Utility functions
    smoothScrollTo: BarberWorldApp.smoothScrollTo,
    throttle: BarberWorldApp.throttle,
    debounce: BarberWorldApp.debounce
};

// Development helpers (remove in production)
if (process?.env?.NODE_ENV === 'development') {
    window.debug = {
        heroSlider: () => app.getHeroSlider(),
        navigation: () => app.getNavigation(),
        productManager: () => app.getProductManager(),
        testNotification: (message, type = 'info') => {
            app.getNavigation()?.showNotification(message, type);
        }
    };
}
