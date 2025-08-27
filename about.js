// About Page Specific JavaScript
// This file contains functionality specific to the about page

document.addEventListener('DOMContentLoaded', () => {
    // Animate stats counter when in viewport
    animateStats();
    
    // Add scroll animations for sections
    setupScrollAnimations();
    
    console.log('✅ About page loaded successfully');
});

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    animateNumber(entry.target);
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    }
}

function animateNumber(element) {
    const finalValue = element.textContent.trim();
    const isNumberOnly = /^\d+$/.test(finalValue);
    
    if (!isNumberOnly) {
        // For values like "10+" or "24/7", animate the number part
        const numberMatch = finalValue.match(/\d+/);
        if (numberMatch) {
            const number = parseInt(numberMatch[0]);
            const suffix = finalValue.replace(number.toString(), '');
            animateCounter(element, 0, number, 1000, suffix);
        }
        return;
    }
    
    // For pure numbers
    const targetValue = parseInt(finalValue);
    animateCounter(element, 0, targetValue, 1000);
}

function animateCounter(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(start + (end - start) * easedProgress);
        
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = end + suffix;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function setupScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.value-card, .brand-item, .story-text, .mission-text');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }
}

// Add CSS for animations
const animationStyles = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .value-card:nth-child(1) { transition-delay: 0.1s; }
    .value-card:nth-child(2) { transition-delay: 0.2s; }
    .value-card:nth-child(3) { transition-delay: 0.3s; }
    
    .brand-item:nth-child(1) { transition-delay: 0.1s; }
    .brand-item:nth-child(2) { transition-delay: 0.2s; }
    .brand-item:nth-child(3) { transition-delay: 0.3s; }
    .brand-item:nth-child(4) { transition-delay: 0.4s; }
    .brand-item:nth-child(5) { transition-delay: 0.5s; }
    .brand-item:nth-child(6) { transition-delay: 0.6s; }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);