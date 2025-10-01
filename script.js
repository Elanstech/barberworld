// ==========================================
// BARBER WORLD - COMPLETE SHOPPING SYSTEM
// ==========================================

// Stripe Configuration - PUBLIC KEY ONLY (Client-Side Safe)
const STRIPE_PUBLIC_KEY = 'pk_live_51SBkTC180Qgk23qGQhs7CN7k6C3YrNPPjE7PTmBnRnchwB28lpubKJA2D5ZZt8adQArpHjYx5ToqgD3157jd5jqb00KzdTTaIA';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// State Management
let allProducts = [];
let cart = [];
let currentView = 'home';
let currentCategory = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    loadCart();
    updateCartBadge();
    initializeAboutSection();
    initializeFooterInteractions();
    console.log('🚀 Barber World Loaded');
});

// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================

async function loadAllProducts() {
    try {
        const response = await fetch('all-products.json');
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        console.log(`✅ Loaded ${allProducts.length} products`);
        
        displayFeaturedProducts();
    } catch (error) {
        console.error('❌ Error loading products:', error);
        await loadBrandProducts();
    }
}

async function loadBrandProducts() {
    try {
        const brands = ['jrl', 'wahl', 'babyliss', 'stylecraft'];
        const promises = brands.map(brand => 
            fetch(`${brand}-products.json`)
                .then(res => res.json())
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        allProducts = results.flat();
        
        console.log(`✅ Loaded ${allProducts.length} products from brand files`);
        displayFeaturedProducts();
    } catch (error) {
        console.error('❌ Failed to load brand products:', error);
    }
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 4);
    
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

function getProductImage(product) {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    
    if (brand === 'babyliss') {
        return 'https://www.sallybeauty.com/dw/image/v2/BCSM_PRD/on/demandware.static/-/Sites-SBS-SallyBeautySupply/default/dw594b01df/images/large/SBS-008819.jpg?sw=750&sh=750&sfrm=png';
    } else if (brand === 'stylecraft' || name.includes('gamma')) {
        return 'https://www.barberdepots.com/wp-content/uploads/2023/01/stylecraft-instinct-clipper-sc607m-blue-cover-on-stand.webp';
    } else if (brand === 'jrl') {
        return 'https://m.media-amazon.com/images/I/51f7yv8H2-L._UF1000,1000_QL80_.jpg';
    } else if (brand === 'wahl') {
        return 'https://salon-evo.com/wp-content/uploads/2023/10/Untitled-design-10.png';
    } else if (brand === 'andis') {
        return 'https://www.sallybeauty.com/dw/image/v2/BCSM_PRD/on/demandware.static/-/Sites-SBS-SallyBeautySupply/default/dw94874ac8/images/large/SBS-022916.jpg?sw=1500&sh=1500&sfrm=png';
    }
    
    if (name.includes('clipper')) {
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
    } else if (name.includes('trimmer')) {
        return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop';
    } else if (name.includes('shaver')) {
        return 'https://images.unsplash.com/photo-1589710751893-f9a6770634a2?w=400&h=300&fit=crop';
    } else if (name.includes('dryer') || name.includes('blow')) {
        return 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=300&fit=crop';
    } else if (name.includes('comb') || name.includes('clip') || name.includes('cape') || name.includes('accessory')) {
        return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop';
    }
    
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
}

// ==========================================
// CATEGORY FILTERING
// ==========================================

function loadProducts(category) {
    currentCategory = category;
    currentView = 'products';
    
    const filtered = allProducts.filter(p => {
        const brand = p.brand.toLowerCase();
        const name = p.name.toLowerCase();
        const cat = category.toLowerCase();
        
        if (brand.includes(cat) || cat.includes(brand)) return true;
        if (cat.includes('combo') && (name.includes('combo') || name.includes('kit'))) return true;
        if (cat.includes('clipper') && name.includes('clipper')) return true;
        if (cat.includes('trimmer') && name.includes('trimmer')) return true;
        if (cat.includes('shaver') && name.includes('shaver')) return true;
        
        return false;
    });
    
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('products-view').style.display = 'block';
    document.getElementById('category-title').textContent = category;
    
    const grid = document.getElementById('products-grid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-box-open" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                <h3 style="color: #666;">No products found</h3>
                <p style="color: #999;">Try browsing another category</p>
                <button class="btn-primary" onclick="showHome()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #d4af37; color: white; border: none; border-radius: 12px; cursor: pointer;">
                    Back to Home
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(product => createProductCard(product)).join('');
    window.scrollTo({top: 0, behavior: 'smooth'});
    
    console.log(`📦 Showing ${filtered.length} products for: ${category}`);
}

function showHome() {
    currentView = 'home';
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('products-view').style.display = 'none';
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartBadge();
    showNotification(`${product.name} added to cart!`);
    
    const badge = document.getElementById('cart-badge');
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => badge.style.transform = 'scale(1)', 300);
}

function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    displayCart();
    updateCartBadge();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
    updateCartBadge();
    showNotification('Item removed from cart');
}

function displayCart() {
    const container = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    
    if (cart.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'flex';
        footerEl.style.display = 'none';
        return;
    }
    
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${getProductImage(item)}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCartTotal();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

function saveCart() {
    localStorage.setItem('barber_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('barber_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function openCart() {
    displayCart();
    document.getElementById('cart-modal').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-modal').classList.remove('active');
}

// ==========================================
// STRIPE CHECKOUT - SECURE VERSION
// ==========================================

async function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Prepare line items for Stripe
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `${item.brand} - Professional Equipment`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));
        
        console.log('🛒 Starting checkout with', lineItems.length, 'items');
        
        // Call server-side checkout API
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lineItems }),
        });
        
        const data = await response.json();
        
        // Handle errors
        if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.message || data.error || 'Checkout failed');
        }
        
        // Validate session ID
        if (!data.id) {
            throw new Error('No session ID received from server');
        }
        
        console.log('✅ Checkout session created:', data.id);
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: data.id,
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        hideLoading();
        
        // User-friendly error messages
        let errorMessage = 'Checkout failed. Please try again.';
        
        if (error.message.includes('API key') || error.message.includes('configuration')) {
            errorMessage = 'Payment system error. Please contact support at Bejdistributors@yahoo.com';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
    }
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

function openSearch() {
    document.getElementById('search-modal').classList.add('active');
    document.getElementById('search-input').focus();
}

function closeSearch() {
    document.getElementById('search-modal').classList.remove('active');
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    ).slice(0, 10);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No results found</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(product => createProductCard(product)).join('');
}

// ==========================================
// ABOUT SECTION ANIMATIONS
// ==========================================

function initializeAboutSection() {
    // Add scroll animations for about section
    const aboutSection = document.getElementById('about-section');
    if (!aboutSection) return;

    // Create intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateAboutContent();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(aboutSection);
}

function animateAboutContent() {
    const elements = [
        '.about-title',
        '.about-description', 
        '.feature-item',
        '.warranty-notice',
        '.about-image'
    ];

    elements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            setTimeout(() => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'all 0.6s ease';
                
                // Trigger animation
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            }, index * 150);
        }
    });

    // Animate feature items individually
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.5s ease';
            
            requestAnimationFrame(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            });
        }, 800 + (index * 200));
    });
}

// ==========================================
// FOOTER INTERACTIONS
// ==========================================

function initializeFooterInteractions() {
    // Add hover effects to payment cards
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effect to designer credit
    const designerCredit = document.querySelector('.designer-credit');
    if (designerCredit) {
        designerCredit.addEventListener('click', () => {
            showDesignerInfo();
        });
        
        designerCredit.style.cursor = 'pointer';
        designerCredit.title = 'Click to learn more about Elan\'s Tech World';
    }

    // Add email copy functionality
    const emailElements = document.querySelectorAll('p');
    emailElements.forEach(element => {
        if (element.textContent.includes('Bejdistributors@yahoo.com')) {
            element.style.cursor = 'pointer';
            element.title = 'Click to copy email';
            element.addEventListener('click', copyEmail);
        }
    });
}

function showDesignerInfo() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #d4af37, #b8941f);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        animation: popIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=60&fit=crop&crop=center" 
                 style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid white; margin-bottom: 1rem;">
        </div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Elan's Tech World</h3>
        <p style="margin: 0 0 1rem 0; line-height: 1.6;">
            Professional web development and design services. 
            Specializing in modern, responsive e-commerce solutions.
        </p>
        <button onclick="this.parentElement.remove(); document.querySelector('.modal-backdrop').remove();" 
                style="background: white; color: #d4af37; border: none; padding: 0.75rem 1.5rem; 
                       border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
            Close
        </button>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    backdrop.addEventListener('click', () => {
        backdrop.remove();
        notification.remove();
    });
    
    document.body.appendChild(backdrop);
    document.body.appendChild(notification);
    
    // Auto close after 8 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            backdrop.remove();
            notification.remove();
        }
    }, 8000);
}

function copyEmail() {
    const email = 'Bejdistributors@yahoo.com';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
            showNotification('Email copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyEmail(email);
        });
    } else {
        fallbackCopyEmail(email);
    }
}

function fallbackCopyEmail(email) {
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Email copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Could not copy email. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// ==========================================
// SMOOTH SCROLL TO ABOUT SECTION
// ==========================================

function scrollToAbout() {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
        aboutSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export function for use in other files
window.scrollToAbout = scrollToAbout;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'loading' ? '#d4af37' : '#28a745'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
        max-width: 350px;
        font-size: 0.95rem;
        line-height: 1.5;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'loading' ? 'spinner fa-spin' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'error' ? 5000 : 3000);
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes popIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .payment-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .designer-logo {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
`;
document.head.appendChild(style);

console.log('✅ Barber World System Ready with About Section & Footer');
