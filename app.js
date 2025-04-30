// Product data
const products = [
    {
        id: 1,
        name: "Fresh Fruits",
        price: 199.99,
        category: "Food",
        image: "images/fruits-vegetables.png",
        description: "Fresh seasonal fruits"
    },
    {
        id: 2,
        name: "Dairy Products",
        price: 149.99,
        category: "Food",
        image: "images/dairy-bread-eggs.png",
        description: "Fresh dairy products"
    },
    {
        id: 3,
        name: "Bakery Items",
        price: 89.99,
        category: "Food",
        image: "images/bakery-biscuits.png",
        description: "Fresh bakery items"
    },
    {
        id: 4,
        name: "Beverages",
        price: 129.99,
        category: "Beverages",
        image: "images/tea-coffee-drinks.png",
        description: "Cold drinks and beverages"
    },
    {
        id: 5,
        name: "Snacks",
        price: 79.99,
        category: "Snacks",
        image: "images/snack-munchies.png",
        description: "Delicious snacks"
    },
    {
        id: 6,
        name: "Personal Care",
        price: 299.99,
        category: "Personal Care",
        image: "images/baby-care.png",
        description: "Personal care products"
    }
];

// Cart functionality
let cart = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    setupEventListeners();
});

// Display products in the grid
function displayProducts(category = null) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    const filteredProducts = category 
        ? products.filter(product => product.category === category)
        : products;

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <p class="price">₹${product.price}</p>
        <p class="description">${product.description}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    `;
    return card;
}

// Setup event listeners
function setupEventListeners() {
    // Category filters
    document.querySelectorAll('.categories-sidebar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            displayProducts(category);
        });
    });

    // Add to cart buttons
    document.getElementById('productsGrid').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', toggleCart);
    document.querySelector('.cart-close').addEventListener('click', toggleCart);
}

// Add to cart functionality
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartDisplay();
    updateCartCount();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartFooter = document.querySelector('.cart-footer');

    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'flex';
        cartFooter.style.display = 'none';
        return;
    }

    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="price">₹${item.price}</p>
                <div class="quantity">
                    <button class="decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase" data-id="${item.id}">+</button>
                </div>
            </div>
        </div>
    `).join('');

    updateCartTotal();
}

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
}

// Toggle cart panel
function toggleCart() {
    const cartPanel = document.querySelector('.cart-panel');
    cartPanel.classList.toggle('active');
} 