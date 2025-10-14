const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

let allProducts = [];

// Fetch all products from your main JSON file
async function fetchAllProducts() {
    try {
        const response = await fetch('/json/all-products-products.json');
        allProducts = await response.json();
        loadRecommendedProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Get random products
function getRandomProducts(count = 4) {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Map category to page URL
function getCategoryPage(category) {
    const categoryMap = {
        'Clipper': '/brands/clippers.html',
        'Trimmer': '/brands/trimmers.html',
        'Shaver': '/brands/shavers.html',
        'Combo': '/brands/combos.html'
    };
    return categoryMap[category] || '/brands/allproducts.html';
}

// Load order details
if (sessionId) {
    document.getElementById('orderNumber').textContent = `#${sessionId.slice(-8).toUpperCase()}`;
    fetchOrderDetails(sessionId);
} else {
    document.getElementById('orderNumber').textContent = 'N/A';
}

// Fetch order details from API
async function fetchOrderDetails(sessionId) {
    try {
        const response = await fetch(`/api/order-details?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.orderNumber) {
            document.getElementById('orderNumber').textContent = data.orderNumber;
        }
        
        if (data.email) {
            const shippingText = document.querySelector('.shipping-text p');
            shippingText.textContent = `Tracking information will be sent to ${data.email}`;
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
    }
}

// Load recommended products
function loadRecommendedProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const recommendedProducts = getRandomProducts(4);
    
    if (recommendedProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; color: #6b7280;">Loading products...</p>';
        return;
    }
    
    recommendedProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        
        // Get product image from your JSON structure
        const productImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : product.image || 'https://via.placeholder.com/400';
        
        productCard.innerHTML = `
            <img src="${productImage}" alt="${escapeHtml(product.name)}" class="product-image" loading="lazy">
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            </div>
        `;
        
        // Link to the category page where this product appears
        productCard.addEventListener('click', () => {
            const categoryPage = getCategoryPage(product.category);
            window.location.href = categoryPage;
        });
        
        productsGrid.appendChild(productCard);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchAllProducts();
    
    const style = document.createElement('style');
    style.textContent = `
        .product-card {
            animation: fadeInUp 0.6s ease-out both;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        .product-card:hover {
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(style);
});

// Optional: Analytics tracking
if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase_confirmation', {
        'session_id': sessionId
    });
}
