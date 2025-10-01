// ==========================================
// ABOUT PAGE - ADDITIONAL ANIMATIONS
// Works with script.js from index
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Update cart badge if cart exists
    updateCartBadge();

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll(`
        .value-card,
        .stat-card,
        .process-step,
        .feature-item,
        .visual-card
    `);

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Counter Animation for Stats
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = element.textContent.trim();
        const isPercentage = target.includes('%');
        const isSuffix = target.includes('+');
        const isTime = target.includes('h') || target.includes('/7');
        const isRating = target.includes('★');
        
        let numericValue;
        if (isPercentage) {
            numericValue = parseInt(target.replace('%', ''));
        } else if (isSuffix) {
            numericValue = parseInt(target.replace('+', '').replace('K', '000'));
        } else if (isTime) {
            numericValue = parseInt(target.replace('h', ''));
        } else if (isRating) {
            numericValue = parseFloat(target.replace('★', ''));
        } else {
            numericValue = parseInt(target.replace(/\D/g, ''));
        }
        
        const duration = 2000;
        const steps = 60;
        const stepValue = numericValue / steps;
        let currentValue = 0;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            currentValue += stepValue;
            
            if (currentStep >= steps) {
                clearInterval(interval);
                element.textContent = target;
            } else {
                if (target.includes('K+')) {
                    element.textContent = Math.floor(currentValue / 1000) + 'K+';
                } else if (isPercentage) {
                    element.textContent = Math.floor(currentValue) + '%';
                } else if (isTime && target.includes('h')) {
                    element.textContent = Math.floor(currentValue) + 'h';
                } else if (isTime && target.includes('/7')) {
                    element.textContent = '24/7';
                } else if (isRating) {
                    element.textContent = currentValue.toFixed(1) + '★';
                } else if (isSuffix) {
                    element.textContent = Math.floor(currentValue) + '+';
                } else {
                    element.textContent = Math.floor(currentValue);
                }
            }
        }, duration / steps);
    };

    // Observe stat numbers for animation
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statObserver.observe(stat);
    });

    // Parallax effect for hero background
    const heroSection = document.querySelector('.about-hero');
    const heroBg = document.querySelector('.about-hero-bg');
    
    if (heroSection && heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (scrolled <= heroSection.offsetHeight) {
                heroBg.style.transform = `translate(${rate}px, ${rate}px) scale(1.1)`;
            }
        });
    }

    // Add smooth reveal animation for mission section
    const missionSection = document.querySelector('.mission-section');
    if (missionSection) {
        const missionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, { threshold: 0.2 });
        
        missionObserver.observe(missionSection);
    }

    // Add click ripple effect to CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255,255,255,0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Add stagger animation to feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.6s ease ${index * 0.1}s`;
    });

    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.3 });

    featureItems.forEach(item => featureObserver.observe(item));

    // Process step hover effect
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.process-icon');
            if (icon) {
                icon.style.animation = 'pulse 0.5s ease';
            }
        });
    });
});

// Add ripple and pulse animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// Update cart badge helper function
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

console.log('About page enhanced - Barber World');
