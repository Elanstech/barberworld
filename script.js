// Barber World Main Page JavaScript
// Clean, minimal implementation focused on core functionality

class BarberWorld {
    constructor() {
        this.cart = [];
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupScrollEffects();
        this.updateCartDisplay();
        console.log('Barber World initialized');
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');

        mobileMenuBtn?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.handleCategoryClick(category);
            });
        });

        // Special cards
        const specialCards = document.querySelectorAll('.special-card');
        specialCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleSpecialClick(card);
            });
        });

        // Mega menu links
        const megaMenuLinks = document.querySelectorAll('.mega-menu a[data-category]');
        megaMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.handleCategoryClick(category);
            });
        });

        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
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

        // Search functionality
        const searchBtn = document.querySelector('.search-btn');
        searchBtn?.addEventListener('click', () => {
            this.handleSearch();
        });

        // Cart button
        const cartBtn = document.querySelector('.cart-btn');
        cartBtn?.addEventListener('click', () => {
            this.showCart();
        });

        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    // Mobile Menu Methods
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');

        if (this.mobileMenuOpen) {
            navMenu?.classList.add('active');
            mobileMenuBtn?.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            navMenu?.classList.remove('active');
            mobileMenuBtn?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.mobileMenuOpen = false;
            const navMenu = document.getElementById('nav-menu');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            
            navMenu?.classList.remove('active');
            mobileMenuBtn?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Navigation Methods
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const elementPosition = element.offsetTop - headerHeight;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    // Category Handling
    handleCategoryClick(category) {
        console.log(`Navigating to category: ${category}`);
        this.showNotification(`Loading ${this.getCategoryName(category)} products...`);
        
        // Close mobile menu if open
        this.closeMobileMenu();
        
        // In a real app, this would navigate to the category page
        // For now, we'll simulate loading
        setTimeout(() => {
            this.showNotification(`${this.getCategoryName(category)} products loaded!`, 'success');
        }, 1000);
    }

    handleSpecialClick(card) {
        const title = card.querySelector('h3')?.textContent || 'Product';
        console.log(`Viewing special: ${title}`);
        this.showProductModal(card);
    }

    getCategoryName(category) {
        const categoryNames = {
            'barber-world': 'Barber World',
            'wahl': 'Wahl',
            'andis': 'Andis',
            'stylecraft': 'StyleCraft',
            'babyliss': 'Babyliss',
            'jrl': 'JRL',
            'vgr': 'VGR',
            'cocco': 'Cocco',
            'clippers': 'Clippers',
            'trimmers': 'Trimmers',
            'combos': 'Combos',
            'accessories': 'Accessories',
            'build-combo': 'Build Your Own Combo',
            'specials': 'Special Deals',
            'all': 'All Products',
            'new': 'New Arrivals',
            'best-sellers': 'Best Sellers'
        };
        
        return categoryNames[category] || category;
    }

    // Search Methods
    handleSearch() {
        const query = prompt('Search for products:');
        if (query && query.trim()) {
            console.log(`Searching for: ${query}`);
            this.showNotification(`Searching for "${query}"...`);
            
            // Simulate search
            setTimeout(() => {
                this.showNotification(`Found results for "${query}"!`, 'success');
            }, 1000);
        }
    }

    // Cart Methods
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.updateCartDisplay();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    showCart() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty');
            return;
        }
        
        const cartItems = this.cart.map(item => 
            `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        alert(`Cart Items:\n${cartItems}\n\nTotal: $${total.toFixed(2)}`);
    }

    // Modal Methods
    showProductModal(card) {
        const title = card.querySelector('h3')?.textContent || 'Product';
        const currentPrice = card.querySelector('.current-price')?.textContent || '$0.00';
        const originalPrice = card.querySelector('.original-price')?.textContent || '';
        const image = card.querySelector('img');
        
        const modal = this.createModal({
            title: title,
            content: `
                <div style="display: flex; gap: 2rem; align-items: center;">
                    ${image ? `<img src="${image.src}" alt="${title}" style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px;">` : ''}
                    <div>
                        <h3 style="margin-bottom: 1rem;">${title}</h3>
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${currentPrice}</span>
                            ${originalPrice ? `<span style="text-decoration: line-through; color: #666; margin-left: 0.5rem;">${originalPrice}</span>` : ''}
                        </div>
                        <p style="color: #666;">Professional quality barber equipment. Perfect for salon and personal use.</p>
                    </div>
                </div>
            `,
            onConfirm: () => {
                const product = {
                    id: Date.now().toString(),
                    name: title,
                    price: parseFloat(currentPrice.replace('$', ''))
                };
                this.addToCart(product);
            },
            confirmText: 'Add to Cart'
        });
    }

    createModal({ title, content, onConfirm, confirmText = 'OK' }) {
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
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: #1a1a1a;">${title}</h2>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #666;
                        padding: 0.5rem;
                        border-radius: 50%;
                        transition: background 0.2s ease;
                    ">&times;</button>
                </div>
                <div style="margin-bottom: 2rem;">
                    ${content}
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="modal-cancel" style="
                        padding: 0.75rem 1.5rem;
                        border: 2px solid #ddd;
                        background: white;
                        color: #666;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">Cancel</button>
                    <button class="modal-confirm" style="
                        padding: 0.75rem 1.5rem;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
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
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        return modal;
    }

    // Notification Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 500;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    // Scroll Effects
    setupScrollEffects() {
        // Scroll to top button
        const scrollToTop = document.createElement('button');
        scrollToTop.className = 'scroll-to-top';
        scrollToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollToTop.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollToTop);

        // Handle scroll events
        let ticking = false;
        
        const handleScroll = () => {
            const scrollY = window.pageYOffset;
            const header = document.querySelector('.header');
            
            // Header shadow effect
            if (header) {
                if (scrollY > 50) {
                    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }
            }
            
            // Scroll to top button visibility
            if (scrollY > 300) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
            
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Scroll to top functionality
        scrollToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Intersection Observer for animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe elements for animation
            const animateElements = document.querySelectorAll('.category-card, .special-card, .feature');
            animateElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'all 0.6s ease';
                observer.observe(el);
            });
        }
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
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarberWorld;
}
