// Barber World - Interactive JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupScrollAnimations();
    setupProductCards();
    setupCart();
    setupNewsletter();
    setupMobileMenu();
    addLoadingAnimations();
}

// Navigation Functionality
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.borderBottom = '1px solid #d4af37';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.borderBottom = '1px solid #2a2a2a';
        }
    });
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            closeMobileMenu();
        });
    });
}

// Mobile Menu Functionality
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Add mobile menu styles if not already added
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
                    background: rgba(10, 10, 10, 0.98);
                    backdrop-filter: blur(20px);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding-top: 2rem;
                    gap: 2rem;
                    transition: left 0.3s ease;
                    z-index: 999;
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .nav-link {
                    font-size: 1.2rem;
                    padding: 1rem;
                }
                
                .hamburger.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                
                .hamburger.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .hamburger.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }
        `;
        document.head.appendChild(mobileStyles);
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Add scroll-animate class to elements
    const animateElements = document.querySelectorAll('.product-card, .feature-card, .section-header');
    animateElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Product Cards Functionality
function setupProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productBtn = card.querySelector('.product-btn');
        const category = card.getAttribute('data-category');
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Product button click handler
        if (productBtn) {
            productBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                handleProductClick(category);
            });
        }
        
        // Card click handler
        card.addEventListener('click', function() {
            handleProductClick(category);
        });
    });
}

function handleProductClick(category) {
    // Add ripple effect
    createRippleEffect(event.target);
    
    // Simulate product page navigation
    showProductModal(category);
}

function createRippleEffect(element) {
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
    
    // Add ripple animation CSS if not already added
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
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function showProductModal(category) {
    // Create modal for product preview
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
        background: #1a1a1a;
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid #d4af37;
        text-align: center;
        max-width: 400px;
        width: 90%;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <h3 style="color: #d4af37; margin-bottom: 1rem; font-size: 1.5rem;">
            ${getCategoryTitle(category)}
        </h3>
        <p style="color: #6a6a6a; margin-bottom: 2rem;">
            Explore our premium ${category} collection. Professional-grade tools at unbeatable prices.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="view-products" style="
                background: linear-gradient(135deg, #d4af37, #e6c866);
                color: #0a0a0a;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            ">View Products</button>
            <button id="close-modal" style="
                background: transparent;
                color: #ffffff;
                border: 2px solid #ffffff;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            ">Close</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Animate modal in
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Event listeners
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('view-products').addEventListener('click', () => {
        alert(`Redirecting to ${getCategoryTitle(category)} products page...`);
        closeModal();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

function getCategoryTitle(category) {
    const titles = {
        'our-brand': 'Our Brand',
        'combo': 'Build Your Own Combo',
        'combos': 'Professional Combos',
        'babyliss': 'Babyliss',
        'stylecraft': 'StyleCraft Gamma',
        'jrl': 'JRL',
        'wahl': 'Wahl',
        'cocco': 'Cocco'
    };
    return titles[category] || 'Products';
}

// Cart Functionality
function setupCart() {
    const cartIcon = document.querySelector('.fa-shopping-cart');
    const cartBadge = document.querySelector('.cart-badge');
    let cartCount = 0;
    
    // Initialize cart
    updateCartBadge(cartCount);
    
    cartIcon.addEventListener('click', function() {
        showCartModal();
    });
    
    function updateCartBadge(count) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    
    function showCartModal() {
        alert('Cart functionality coming soon! Currently in development.');
    }
    
    // Expose cart functions globally
    window.addToCart = function(productId) {
        cartCount++;
        updateCartBadge(cartCount);
        showCartNotification();
    };
    
    function showCartNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #d4af37, #e6c866);
            color: #0a0a0a;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
        `;
        notification.textContent = 'Item added to cart!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Newsletter Functionality
function setupNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        const input = newsletterForm.querySelector('input');
        const button = newsletterForm.querySelector('button');
        
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = input.value.trim();
            if (validateEmail(email)) {
                subscribeToNewsletter(email);
                input.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            newsletterForm.dispatchEvent(new Event('submit'));
        });
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function subscribeToNewsletter(email) {
    // Simulate API call
    showNotification('Successfully subscribed to newsletter!', 'success');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 
        'linear-gradient(135deg, #d4af37, #e6c866)' : 
        'linear-gradient(135deg, #dc3545, #e85563)';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: ${type === 'success' ? '#0a0a0a' : '#ffffff'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Loading Animations
function addLoadingAnimations() {
    const elements = document.querySelectorAll('.hero-content > *, .product-card, .feature-card');
    
    elements.forEach((el, index) => {
        el.classList.add('loading');
        el.style.animationDelay = `${index * 0.1}s`;
    });
}

// Smooth Scrolling Enhancement
function enhanceSmoothScrolling() {
    // Add momentum scrolling for iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Custom scroll behavior for better performance
    const scrollElements = document.querySelectorAll('a[href^="#"]');
    
    scrollElements.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const startPosition = window.pageYOffset;
                const targetPosition = targetElement.offsetTop - 80;
                const distance = targetPosition - startPosition;
                const duration = Math.min(Math.abs(distance) / 2, 800);
                
                let start = null;
                
                function animation(currentTime) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const run = ease(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }
                
                function ease(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t + b;
                    t--;
                    return -c / 2 * (t * (t - 2) - 1) + b;
                }
                
                requestAnimationFrame(animation);
            }
        });
    });
}

// Initialize smooth scrolling
enhanceSmoothScrolling();

// Search Functionality
function setupSearch() {
    const searchIcon = document.querySelector('.fa-search');
    
    searchIcon.addEventListener('click', function() {
        showSearchModal();
    });
    
    function showSearchModal() {
        alert('Search functionality coming soon!');
    }
}

setupSearch();

// Performance Optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
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
    
    // Debounce scroll events
    let scrollTimer = null;
    window.addEventListener('scroll', function() {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function() {
            // Handle scroll events here
        }, 150);
    });
}

optimizePerformance();

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[style*="position: fixed"]');
        modals.forEach(modal => {
            if (modal.style.zIndex >= 10000) {
                modal.click();
            }
        });
    }
    
    // Enter key for buttons
    if (e.key === 'Enter' && e.target.classList.contains('btn')) {
        e.target.click();
    }
});

// Console welcome message
console.log(
    '%c🔥 Welcome to Barber World! 🔥',
    'color: #d4af37; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 0px #000;'
);
console.log(
    '%cPremium hair clippers at unbeatable prices!',
    'color: #ffffff; font-size: 14px;'
);

// Export functions for potential external use
window.BarberWorld = {
    addToCart: window.addToCart,
    showNotification,
    createRippleEffect,
    validateEmail
};
