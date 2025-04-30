// Add smooth animations for product cards
document.addEventListener('DOMContentLoaded', () => {
    // Add animation class to product cards when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all product cards
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
});

// Add animation for cart panel
function animateCartPanel(show) {
    const cartPanel = document.querySelector('.cart-panel');
    if (show) {
        cartPanel.style.transform = 'translateX(0)';
    } else {
        cartPanel.style.transform = 'translateX(100%)';
    }
}

// Add animation for adding items to cart
function animateAddToCart(button) {
    button.classList.add('adding');
    setTimeout(() => {
        button.classList.remove('adding');
    }, 500);
} 