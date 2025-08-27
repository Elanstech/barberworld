// Contact Page JavaScript
// Handles form submission with mailto functionality and FAQ interactions

document.addEventListener('DOMContentLoaded', () => {
    initializeContactForm();
    initializeFAQ();
    setupScrollAnimations();
    
    console.log('✅ Contact page loaded successfully');
});

function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');
    
    form.addEventListener('submit', handleFormSubmission);
    
    // Add input validation styling
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidationError);
    });
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        showMessage('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Show loading state
    setSubmitButtonLoading(submitBtn, true);
    
    // Create mailto URL
    const mailtoUrl = createMailtoUrl(formData);
    
    // Simulate form processing delay
    setTimeout(() => {
        try {
            // Open default email client
            window.location.href = mailtoUrl;
            
            // Show success message
            showMessage('Your email client has been opened with your message. Please send the email to complete your inquiry.', 'success');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Error opening email client:', error);
            showMessage('Unable to open email client. Please contact us directly at Bejdistributors@yahoo.com', 'error');
        } finally {
            setSubmitButtonLoading(submitBtn, false);
        }
    }, 1000);
}

function createMailtoUrl(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone') || 'Not provided';
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Create email subject
    const emailSubject = `Contact Form: ${getSubjectText(subject)}`;
    
    // Create email body
    const emailBody = `
Hello Barber World Team,

I'm contacting you through your website contact form.

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${getSubjectText(subject)}

Message:
${message}

Best regards,
${name}
    `.trim();
    
    // Create mailto URL
    const mailtoUrl = `mailto:Bejdistributors@yahoo.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    return mailtoUrl;
}

function getSubjectText(subjectValue) {
    const subjectMap = {
        'product-inquiry': 'Product Inquiry',
        'technical-support': 'Technical Support',
        'warranty-claim': 'Warranty Claim',
        'bulk-order': 'Bulk Order',
        'partnership': 'Partnership Opportunity',
        'other': 'Other'
    };
    
    return subjectMap[subjectValue] || 'General Inquiry';
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    removeFieldError(field);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }
    
    // Phone validation (optional, but if provided should be valid)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
        if (!phoneRegex.test(value)) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }
    
    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    
    field.parentNode.appendChild(errorEl);
}

function removeFieldError(field) {
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) {
        errorEl.remove();
    }
}

function clearValidationError(e) {
    const field = e.target;
    field.classList.remove('error');
    removeFieldError(field);
}

function setSubmitButtonLoading(button, isLoading) {
    const originalText = button.innerHTML;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <div class="loading-spinner"></div>
            Processing...
        `;
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-${type}`;
    messageEl.textContent = message;
    
    // Insert after form
    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(messageEl, form.nextSibling);
    
    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 8000);
    }
}

// FAQ Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Scroll Animations
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
        const animateElements = document.querySelectorAll('.contact-method, .faq-item');
        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
            observer.observe(el);
        });
    }
}

// Add CSS for field validation and animations
const validationStyles = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .field-error {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        font-weight: 500;
    }
    
    .form-message {
        margin-top: 1.5rem;
        padding: 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        text-align: center;
    }
    
    .form-success {
        background-color: #10b981;
        color: white;
    }
    
    .form-error {
        background-color: #ef4444;
        color: white;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = validationStyles;
document.head.appendChild(styleSheet);