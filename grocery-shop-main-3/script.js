// Import password utilities
import { validatePassword, checkPasswordStrength, hashPassword, verifyPassword } from './passwordUtils.js';

// Mock data
const products = [
    {
        id: 1,
        name: "Fresh Fruits & Vegetables",
        price: 49.99,
        category: "Food",
        stock: 50,
        imageUrl: "grocery-shop-main/images/fruits-vegetables.png"
    },
    {
        id: 2,
        name: "Dairy & Bread",
        price: 39.99,
        category: "Food",
        stock: 30,
        imageUrl: "grocery-shop-main/images/dairy-bread-eggs.png"
    },
    {
        id: 3,
        name: "Cold Drinks & Juices",
        price: 29.99,
        category: "Beverages",
        stock: 40,
        imageUrl: "grocery-shop-main/images/cold-drinks-juices.png"
    },
    {
        id: 4,
        name: "Snacks & Munchies",
        price: 19.99,
        category: "Snacks",
        stock: 60,
        imageUrl: "grocery-shop-main/images/snack-munchies.png"
    },
    {
        id: 5,
        name: "Cleaning Essentials",
        price: 24.99,
        category: "Personal Care",
        stock: 45,
        imageUrl: "grocery-shop-main/images/cleaning-essentials.png"
    },
    {
        id: 6,
        name: "Bakery & Biscuits",
        price: 34.99,
        category: "Food",
        stock: 70,
        imageUrl: "grocery-shop-main/images/bakery-biscuits.png"
    },
    {
        id: 7,
        name: "Baby Care",
        price: 44.99,
        category: "Personal Care",
        stock: 35,
        imageUrl: "grocery-shop-main/images/baby-care.png"
    },
    {
        id: 8,
        name: "Pet Care",
        price: 54.99,
        category: "Personal Care",
        stock: 25,
        imageUrl: "grocery-shop-main/images/pet-care.png"
    },
    {
        id: 9,
        name: "Tea & Coffee",
        price: 14.99,
        category: "Beverages",
        stock: 80,
        imageUrl: "grocery-shop-main/images/tea-coffee-drinks.png"
    },
    {
        id: 10,
        name: "Instant Food",
        price: 19.99,
        category: "Food",
        stock: 55,
        imageUrl: "grocery-shop-main/images/instant-food.png"
    },
    {
        id: 11,
        name: "Chicken & Meat",
        price: 89.99,
        category: "Food",
        stock: 20,
        imageUrl: "grocery-shop-main/images/chicken-meat-fish.png"
    },
    {
        id: 12,
        name: "Rice & Dal",
        price: 69.99,
        category: "Food",
        stock: 40,
        imageUrl: "grocery-shop-main/images/atta-rice-dal.png"
    }
];

// Add these arrays at the top of the file
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
let foodDeliveries = JSON.parse(localStorage.getItem('foodDeliveries')) || [];

// Add current user tracking
let currentUser = null;

// Load current user from localStorage on page load
try {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log('Loaded user:', currentUser);
    }
} catch (error) {
    console.error('Error loading user:', error);
}

// Update the spaces array with more detailed information
const spaces = [
    {
        id: 1,
        name: "LRC Block A",
        type: "Library",
        status: "Available",
        currentOccupancy: 15,
        maxOccupancy: 50,
        motionDetected: true,
        wifiStrength: "Strong",
        cameraFeed: "images/camera-feed-placeholder.jpg"
    },
    {
        id: 2,
        name: "LRC Block B",
        type: "Library",
        status: "Occupied",
        currentOccupancy: 45,
        maxOccupancy: 50,
        motionDetected: false,
        wifiStrength: "Strong",
        cameraFeed: "images/camera-feed-placeholder.jpg"
    },
    {
        id: 3,
        name: "LRC Block C",
        type: "Library",
        status: "Available",
        currentOccupancy: 20,
        maxOccupancy: 50,
        motionDetected: true,
        wifiStrength: "Strong",
        cameraFeed: "images/camera-feed-placeholder.jpg"
    },
    {
        id: 4,
        name: "Basketball Court 1",
        type: "Sports",
        status: "Available",
        currentOccupancy: 8,
        maxOccupancy: 20,
        motionDetected: true,
        wifiStrength: "Strong",
        cameraFeed: "images/camera-feed-placeholder.jpg"
    },
    {
        id: 5,
        name: "Basketball Court 2",
        type: "Sports",
        status: "Occupied",
        currentOccupancy: 18,
        maxOccupancy: 20,
        motionDetected: false,
        wifiStrength: "Strong",
        cameraFeed: "images/camera-feed-placeholder.jpg"
    },
    {
        id: 6,
        name: "Tennis Court",
        type: "Sports",
        status: "Available",
        currentOccupancy: 2,
        maxOccupancy: 4,
        motionDetected: true,
        wifiStrength: "Strong",
        cameraFeed: "images/camera-feed-placeholder.jpg"
    }
];

// Locker System
const lockers = [
    { id: 1, number: "L001", status: "available", currentDelivery: null },
    { id: 2, number: "L002", status: "available", currentDelivery: null },
    { id: 3, number: "L003", status: "available", currentDelivery: null },
    { id: 4, number: "L004", status: "available", currentDelivery: null },
    { id: 5, number: "L005", status: "available", currentDelivery: null },
    { id: 6, number: "L006", status: "available", currentDelivery: null }
];

// Function to generate a random 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeBtns = document.getElementsByClassName('close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const navLinks = document.querySelectorAll('.nav-links a');
const pages = document.querySelectorAll('.page');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target page
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === targetPage) {
                page.classList.add('active');
            }
        });
    });
});

// Modal functionality
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'block';
});

Array.from(closeBtns).forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === registerModal) {
        registerModal.style.display = 'none';
    }
});

// Password validation and strength checking
function setupPasswordValidation() {
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordStrength = registerPassword.nextElementSibling;
    const requirements = document.querySelectorAll('.password-requirements li');

    if (registerPassword) {
        registerPassword.addEventListener('input', (e) => {
            const password = e.target.value;
            const validation = validatePassword(password);
            const strength = checkPasswordStrength(password);

            // Update password strength indicator
            passwordStrength.className = 'password-strength ' + strength.level.replace(' ', '-');

            // Update requirements list
            requirements.forEach(req => {
                const requirement = req.textContent.toLowerCase();
                if (requirement.includes('8 characters')) {
                    req.classList.toggle('valid', password.length >= 8);
                } else if (requirement.includes('uppercase')) {
                    req.classList.toggle('valid', /[A-Z]/.test(password));
                } else if (requirement.includes('lowercase')) {
                    req.classList.toggle('valid', /[a-z]/.test(password));
                } else if (requirement.includes('number')) {
                    req.classList.toggle('valid', /[0-9]/.test(password));
                } else if (requirement.includes('special')) {
                    req.classList.toggle('valid', /[!@#$%^&*(),.?":{}|<>]/.test(password));
                }
            });

            // Update input styling
            registerPassword.classList.toggle('error', !validation.isValid);
            registerPassword.classList.toggle('success', validation.isValid);
        });
    }

    // Password confirmation
    if (confirmPassword) {
        confirmPassword.addEventListener('input', (e) => {
            const password = registerPassword.value;
            const confirm = e.target.value;
            
            if (password !== confirm) {
                confirmPassword.classList.add('error');
                confirmPassword.classList.remove('success');
            } else {
                confirmPassword.classList.remove('error');
                confirmPassword.classList.add('success');
            }
        });
    }
}

// Function to save reservations to localStorage
function saveReservations() {
    try {
        localStorage.setItem('reservations', JSON.stringify(reservations));
        console.log('Reservations saved:', reservations);
    } catch (error) {
        console.error('Error saving reservations:', error);
    }
}

// Function to load reservations from localStorage
function loadReservations() {
    try {
        const savedReservations = localStorage.getItem('reservations');
        if (savedReservations) {
            reservations = JSON.parse(savedReservations);
            console.log('Reservations loaded:', reservations);
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
    }
}

// Function to save food deliveries to localStorage
function saveFoodDeliveries() {
    localStorage.setItem('foodDeliveries', JSON.stringify(foodDeliveries));
}

// Function to save products to localStorage
function saveProducts() {
    try {
        localStorage.setItem('products', JSON.stringify(products));
        console.log('Products saved:', products);
    } catch (error) {
        console.error('Error saving products:', error);
    }
}

// Function to load products from localStorage
function loadProducts() {
    try {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            const parsedProducts = JSON.parse(savedProducts);
            // Update the products array while maintaining references
            products.length = 0;
            products.push(...parsedProducts);
            console.log('Products loaded:', products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Form submissions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    
    // Extract enrollment number from email (before @)
    const enrollmentNumber = email.split('@')[0];
    
    // Check if it's a delivery partner email
    const isDeliveryPartner = email.endsWith('@delivery.com');
    const isStoreWorker = email === 'store@gmail.com';
    
    // Mock login with user data and password verification
    currentUser = {
        id: Math.floor(Math.random() * 1000),
        email: email,
        name: isDeliveryPartner ? 'Delivery Partner' : enrollmentNumber,
        enrollmentNumber: enrollmentNumber,
        role: isStoreWorker ? 'store_worker' : (isDeliveryPartner ? 'delivery_partner' : 'student'),
        passwordHash: hashPassword(password)
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('Login submitted:', currentUser);
    
    // Load reservations and deliveries from localStorage
    loadReservations();
    foodDeliveries = JSON.parse(localStorage.getItem('foodDeliveries')) || [];
    
    loginModal.style.display = 'none';
    updateAuthState(true);
    updateUIForUserRole();
    renderLockers();
    renderUserDeliveries();
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = e.target.elements[3].value;
    const confirmPassword = e.target.elements[4].value;
    
    // Validate password
    const validation = validatePassword(password);
    if (!validation.isValid) {
        alert('Please fix the password requirements:\n' + validation.errors.join('\n'));
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    const formData = {
        name: e.target.elements[0].value,
        enrollmentNumber: e.target.elements[1].value,
        email: e.target.elements[2].value,
        passwordHash: hashPassword(password),
        phoneNumber: e.target.elements[5].value
    };
    
    // Mock registration
    currentUser = {
        id: Math.floor(Math.random() * 1000),
        ...formData,
        role: 'student'
    };
    
    console.log('Register submitted:', currentUser);
    registerModal.style.display = 'none';
    updateAuthState(true);
    updateUIForUserRole();
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser'); // Clear current user from localStorage
    updateAuthState(false);
});

// Authentication state management
function updateAuthState(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (isLoggedIn) {
        // Hide login/register buttons
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        
        // Show welcome message and logout button
        if (!welcomeMessage) {
            const welcome = document.createElement('div');
            welcome.id = 'welcomeMessage';
            welcome.className = 'welcome-message';
            welcome.innerHTML = `Welcome, ${currentUser.name || currentUser.email}!`;
            authButtons.insertBefore(welcome, logoutBtn);
        }
        logoutBtn.classList.remove('hidden');
    } else {
        // Show login/register buttons
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        
        // Hide welcome message and logout button
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        logoutBtn.classList.add('hidden');
    }
}

// Grocery Store Functions
window.renderProducts = function(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <div class="content">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                <p class="stock">In Stock: ${product.stock}</p>
                <div class="quantity-selector">
                    <label for="quantity-${product.id}">Quantity:</label>
                    <input type="number" id="quantity-${product.id}" min="1" max="${product.stock}" value="1">
                </div>
                <button class="btn" onclick="reserveProduct(${product.id})">Reserve</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Update UI based on user role
function updateUIForUserRole() {
    const grocerySection = document.getElementById('grocery');
    const userReservationsPanel = document.getElementById('userReservationsPanel');
    const storeReservationsPanel = document.getElementById('storeReservationsPanel');
    const deliveryInterface = document.getElementById('deliveryInterface');
    const userLockerInterface = document.getElementById('userLockerInterface');
    
    // Hide/show interfaces based on role
    if (currentUser) {
        if (currentUser.role === 'delivery_partner') {
            // Show delivery interface, hide user interface
            if (deliveryInterface) deliveryInterface.style.display = 'block';
            if (userLockerInterface) userLockerInterface.style.display = 'none';
        } else if (currentUser.role === 'student') {
            // Show user interface, hide delivery interface
            if (deliveryInterface) deliveryInterface.style.display = 'none';
            if (userLockerInterface) userLockerInterface.style.display = 'block';
        }
        
        // Handle grocery store panels
        if (currentUser.role === 'store_worker') {
            // Remove existing panels
            if (userReservationsPanel) userReservationsPanel.remove();
            if (storeReservationsPanel) storeReservationsPanel.remove();
            
            // Add store worker reservations panel
            const storePanel = document.createElement('div');
            storePanel.id = 'storeReservationsPanel';
            storePanel.className = 'reservations-panel';
            storePanel.innerHTML = `
                <h3>Recent Reservations</h3>
                <div id="storeReservationsList"></div>
            `;
            if (grocerySection) {
                grocerySection.querySelector('.container').prepend(storePanel);
                renderStoreReservations();
            }
        } else if (currentUser.role === 'student') {
            // Remove existing panels
            if (userReservationsPanel) userReservationsPanel.remove();
            if (storeReservationsPanel) storeReservationsPanel.remove();
            
            // Add user's reservation history panel
            const userPanel = document.createElement('div');
            userPanel.id = 'userReservationsPanel';
            userPanel.className = 'reservations-panel user-reservations';
            userPanel.innerHTML = `
                <h3>My Reservations</h3>
                <div id="userReservationsList"></div>
            `;
            if (grocerySection) {
                grocerySection.querySelector('.container').prepend(userPanel);
                renderUserReservations();
            }
        }
    }
}

// Function to render store worker's view of reservations
function renderStoreReservations() {
    if (!currentUser || currentUser.role !== 'store_worker') return;
    
    const reservationsList = document.getElementById('storeReservationsList');
    if (!reservationsList) return;
    
    // Load reservations first
    loadReservations();
    
    const userReservations = reservations.filter(r => r.status !== 'cancelled');
    
    if (userReservations.length === 0) {
        reservationsList.innerHTML = '<p class="no-reservations">No active reservations</p>';
        return;
    }
    
    reservationsList.innerHTML = userReservations.map(reservation => `
        <div class="reservation-card">
            <h4>${reservation.productName}${reservation.quantity > 1 ? ` (${reservation.quantity})` : ''}</h4>
            <p>Reserved by: ${reservation.userName}</p>
            <p>User ID: ${reservation.userEmail}</p>
            <p>Time: ${reservation.timestamp}</p>
            <p>Status: ${reservation.status}</p>
            <div class="reservation-actions">
                <button class="btn btn-success" onclick="updateReservationStatus(${reservation.id}, 'completed')">
                    Mark as Completed
                </button>
                <button class="btn btn-danger" onclick="updateReservationStatus(${reservation.id}, 'cancelled')">
                    Cancel
                </button>
            </div>
        </div>
    `).join('');
}

// Function to render user's reservation history
function renderUserReservations() {
    if (!currentUser || currentUser.role === 'store_worker') return;
    
    const reservationsList = document.getElementById('userReservationsList');
    if (!reservationsList) return;
    
    // Load reservations first
    loadReservations();
    
    const userReservations = reservations.filter(r => r.userEmail === currentUser.email);
    
    if (userReservations.length === 0) {
        reservationsList.innerHTML = '<p class="no-reservations">You haven\'t made any reservations yet</p>';
        return;
    }
    
    reservationsList.innerHTML = userReservations.map(reservation => `
        <div class="reservation-card ${reservation.status}">
            <h4>${reservation.productName}${reservation.quantity > 1 ? ` (${reservation.quantity})` : ''}</h4>
            <p>Reserved on: ${reservation.timestamp}</p>
            <p>Status: <span class="status-${reservation.status}">${reservation.status}</span></p>
            ${reservation.status === 'pending' ? `
                <button class="btn btn-danger" onclick="cancelReservation(${reservation.id})">
                    Cancel Reservation
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Function to update reservation status
window.updateReservationStatus = function(reservationId, status) {
    // Load current reservations
    loadReservations();
    
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
        reservation.status = status;
        
        // If cancelled, restore stock
        if (status === 'cancelled') {
            const product = products.find(p => p.id === reservation.productId);
            if (product) {
                product.stock += reservation.quantity;
                saveProducts(); // Save updated stock
            }
        }
        
        // Save updated reservations
        saveReservations();
        
        // Update UI
        renderUserReservations();
        renderStoreReservations();
        renderProducts();
        updateCartCount();
    }
}

// Function to cancel a reservation (for users)
window.cancelReservation = function(reservationId) {
    if (!currentUser) return;
    
    // Load current reservations
    loadReservations();
    
    const reservation = reservations.find(r => r.id === reservationId && r.userEmail === currentUser.email);
    if (reservation) {
        updateReservationStatus(reservationId, 'cancelled');
    }
}

// Function to update cart count
function updateCartCount() {
    if (!currentUser) return;
    
    loadReservations();
    const userReservations = reservations.filter(r => r.userEmail === currentUser.email && r.status === 'pending');
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = userReservations.length;
    }
}

// Function to toggle reservations panel
function toggleReservationsPanel() {
    const panel = document.getElementById('userReservationsPanel');
    if (panel) {
        panel.classList.toggle('active');
        renderUserReservations();
        updateCartCount();
    }
}

// Update the reserveProduct function
window.reserveProduct = function(productId) {
    if (!currentUser) {
        alert('Please login to reserve products');
        loginModal.style.display = 'block';
        return;
    }

    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value) || 1;

    if (product && product.stock >= quantity) {
        product.stock -= quantity;
        
        // Create reservation record
        const reservation = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            userId: currentUser.id,
            userEmail: currentUser.email,
            userName: currentUser.name || currentUser.email,
            quantity: quantity,
            timestamp: new Date().toLocaleString(),
            status: 'pending'
        };
        
        // Load existing reservations first
        loadReservations();
        
        // Add to reservations array
        reservations.push(reservation);
        
        // Save both reservations and products
        saveReservations();
        saveProducts();
        
        // Update UI
        renderProducts();
        updateCartCount();
        
        alert(`Reserved ${quantity} ${product.name}${quantity > 1 ? 's' : ''}`);
    } else {
        alert(`Not enough stock available. Only ${product.stock} ${product.name}${product.stock !== 1 ? 's' : ''} in stock.`);
    }
}

// Function to render reservations for store workers
function renderReservations() {
    if (!currentUser || currentUser.role !== 'store_worker') return;
    
    const reservationsList = document.getElementById('reservationsList');
    if (!reservationsList) return;
    
    reservationsList.innerHTML = reservations.map(reservation => `
        <div class="reservation-card">
            <h4>${reservation.productName}</h4>
            <p>Reserved by: ${reservation.userName}</p>
            <p>User ID: ${reservation.userId}</p>
            <p>Time: ${reservation.timestamp}</p>
            <p>Status: ${reservation.status}</p>
            <div class="reservation-actions">
                <button class="btn btn-success" onclick="updateReservationStatus(${reservation.id}, 'completed')">
                    Mark as Completed
                </button>
                <button class="btn btn-danger" onclick="updateReservationStatus(${reservation.id}, 'cancelled')">
                    Cancel
                </button>
            </div>
        </div>
    `).join('');
}

// Category filtering
document.querySelectorAll('.categories-sidebar a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(p => p.category === category);
        renderProducts(filteredProducts);
    });
});

// Search functionality
const searchInput = document.querySelector('.search-header input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
});

// Spaces Functions
function renderSpaces() {
    const spacesGrid = document.getElementById('spacesGrid');
    if (!spacesGrid) return;
    
    spacesGrid.innerHTML = spaces.map(space => `
        <div class="space-card ${space.status.toLowerCase()}">
            <h3>${space.name}</h3>
            <p>Type: ${space.type}</p>
            <p>Status: ${space.status}</p>
            <p>Occupancy: ${space.currentOccupancy}/${space.maxOccupancy}</p>
            <div class="space-actions">
                <button class="btn ${space.status === 'Available' ? 'btn-success' : 'btn-danger'}" 
                        onclick="scheduleSpace(${space.id})"
                        ${space.status === 'Occupied' ? 'disabled' : ''}>
                    ${space.status === 'Available' ? 'Schedule' : 'Occupied'}
                </button>
            </div>
        </div>
    `).join('');
}

function scheduleSpace(spaceId) {
    const space = spaces.find(s => s.id === spaceId);
    if (space && space.status === 'Available') {
        space.status = 'Scheduled';
        space.currentOccupancy++;
        renderSpaces();
        alert(`Scheduled ${space.name}`);
    } else {
        alert('Space is not available');
    }
}

// Function to render lockers grid
function renderLockers() {
    const lockerGrid = document.getElementById('lockerGrid');
    if (!lockerGrid) return;

    lockerGrid.innerHTML = lockers.map(locker => `
        <div class="locker-cell ${locker.status}">
            <h4>Locker ${locker.number}</h4>
            <div class="status ${locker.status}">${locker.status.toUpperCase()}</div>
            ${locker.status === 'occupied' ? `
                <div class="delivery-info">
                    <p><i class="fas fa-user"></i> ${locker.currentDelivery ? locker.currentDelivery.studentId : ''}</p>
                    <p><i class="fas fa-utensils"></i> ${locker.currentDelivery ? locker.currentDelivery.foodDetails : ''}</p>
                    <p><i class="fas fa-clock"></i> ${locker.currentDelivery ? new Date(locker.currentDelivery.timestamp).toLocaleString() : ''}</p>
                </div>
            ` : ''}
        </div>
    `).join('');

    // Update delivery locker select options (for delivery)
    const deliveryLockerSelect = document.getElementById('deliveryLocker');
    if (deliveryLockerSelect) {
        deliveryLockerSelect.innerHTML = `
            <option value="">Select a locker</option>
            ${lockers
                .filter(locker => locker.status === 'available')
                .map(locker => `
                    <option value="${locker.id}">Locker ${locker.number}</option>
                `).join('')}
        `;
    }

    // Update retrieve locker select options (for pickup)
    const retrieveLockerSelect = document.getElementById('retrieveLocker');
    if (retrieveLockerSelect) {
        retrieveLockerSelect.innerHTML = `
            <option value="">Select a locker</option>
            ${lockers
                .filter(locker => locker.status === 'occupied')
                .map(locker => `
                    <option value="${locker.number}">Locker ${locker.number}</option>
                `).join('')}
        `;
    }
}

// Function to update locker overview
function updateLockerOverview() {
    const totalLockers = lockers.length;
    const availableLockers = lockers.filter(l => l.status === 'available').length;
    const occupiedLockers = totalLockers - availableLockers;

    document.getElementById('totalLockers').textContent = totalLockers;
    document.getElementById('availableLockers').textContent = availableLockers;
    document.getElementById('occupiedLockers').textContent = occupiedLockers;
}

// Function to render locker grid
function renderLockerGrid() {
    const gridContainer = document.getElementById('lockerGrid');
    gridContainer.innerHTML = '';

    lockers.forEach(locker => {
        const lockerCell = document.createElement('div');
        lockerCell.className = 'locker-cell';
        
        const statusClass = locker.status === 'available' ? 'available' : 'occupied';
        const statusText = locker.status === 'available' ? 'Available' : 'Occupied';
        
        lockerCell.innerHTML = `
            <h4>Locker ${locker.number}</h4>
            <div class="status ${statusClass}">${statusText}</div>
            ${locker.status === 'occupied' ? `
                <div class="delivery-info">
                    <p><i class="fas fa-user"></i> ${locker.currentDelivery ? locker.currentDelivery.studentId : ''}</p>
                    <p><i class="fas fa-utensils"></i> ${locker.currentDelivery ? locker.currentDelivery.foodDetails : ''}</p>
                    <p><i class="fas fa-clock"></i> ${locker.currentDelivery ? new Date(locker.currentDelivery.timestamp).toLocaleString() : ''}</p>
                </div>
            ` : ''}
        `;
        
        gridContainer.appendChild(lockerCell);
    });
}

// Function to render delivery cards
function renderDeliveryCards() {
    const cardsContainer = document.getElementById('deliveryCards');
    cardsContainer.innerHTML = '';

    const userDeliveries = lockers
        .filter(l => l.status === 'occupied' && l.currentDelivery.studentId === currentUser.email)
        .map(l => l.currentDelivery);

    if (userDeliveries.length === 0) {
        cardsContainer.innerHTML = '<p class="no-deliveries">No active deliveries found.</p>';
        return;
    }

    userDeliveries.forEach(delivery => {
        const card = document.createElement('div');
        card.className = 'delivery-card';
        
        card.innerHTML = `
            <h4>Delivery Details</h4>
            <div class="otp">${delivery.otp}</div>
            <div class="details">
                <p><i class="fas fa-box"></i> Locker: ${delivery.lockerNumber}</p>
                <p><i class="fas fa-utensils"></i> ${delivery.foodDetails}</p>
                <p><i class="fas fa-clock"></i> ${new Date(delivery.timestamp).toLocaleString()}</p>
            </div>
            <div class="timestamp">Delivered ${new Date(delivery.timestamp).toLocaleString()}</div>
        `;
        
        cardsContainer.appendChild(card);
    });
}

// Function to render OTP history
function renderOTPHistory() {
    const otpContainer = document.getElementById('otpCards');
    otpContainer.innerHTML = '';

    const userDeliveries = lockers
        .filter(l => l.status === 'occupied' && l.currentDelivery.studentId === currentUser.email)
        .map(l => l.currentDelivery);

    if (userDeliveries.length === 0) {
        otpContainer.innerHTML = '<p class="no-otps">No active OTPs found.</p>';
        return;
    }

    userDeliveries.forEach(delivery => {
        const card = document.createElement('div');
        card.className = 'otp-card';
        
        card.innerHTML = `
            <h4>Locker ${delivery.lockerNumber}</h4>
            <div class="otp-number">${delivery.otp}</div>
            <div class="locker-info">
                <p><i class="fas fa-utensils"></i> ${delivery.foodDetails}</p>
                <p><i class="fas fa-clock"></i> ${new Date(delivery.timestamp).toLocaleString()}</p>
            </div>
            <div class="timestamp">Generated ${new Date(delivery.timestamp).toLocaleString()}</div>
        `;
        
        otpContainer.appendChild(card);
    });
}

// Function to refresh OTPs
function refreshOTPs() {
    renderDeliveryCards();
    renderOTPHistory();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Add event listener for refresh button
    const refreshBtn = document.getElementById('refreshOTPsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshOTPs);
    }
    
    // Initial render
    updateLockerOverview();
    renderLockerGrid();
    renderDeliveryCards();
    renderOTPHistory();
});

// Update locker functions to refresh UI
function updateLockerStatus(lockerNumber, status, delivery = null) {
    const locker = lockers.find(l => l.number === lockerNumber);
    if (locker) {
        locker.status = status;
        if (delivery) {
            locker.currentDelivery = delivery;
        }
        saveLockers();
        updateLockerOverview();
        renderLockerGrid();
        renderDeliveryCards();
        renderOTPHistory();
    }
}

// Function to update motion detection status
function updateMotionDetection() {
    spaces.forEach(space => {
        // Simulate random motion detection
        space.motionDetected = Math.random() > 0.5;
        
        // Update occupancy randomly
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        space.currentOccupancy = Math.max(0, Math.min(space.maxOccupancy, space.currentOccupancy + change));
        
        // Update status based on occupancy
        space.status = space.currentOccupancy >= space.maxOccupancy * 0.8 ? "Occupied" : "Available";
    });
    
    // Update UI
    renderSpaces();
    renderAvailabilityOverview();
}

// Function to render availability overview
function renderAvailabilityOverview() {
    const lrcBlocks = spaces.filter(space => space.type === "Library");
    const sportsCourts = spaces.filter(space => space.type === "Sports");
    
    // Update LRC blocks
    const blockList = document.querySelector('.block-list');
    if (blockList) {
        blockList.innerHTML = lrcBlocks.map(block => `
            <div class="block-item ${block.status.toLowerCase()}">
                <span class="block-name">${block.name}</span>
                <span class="block-status">${block.status}</span>
                <span class="block-capacity">${block.currentOccupancy}/${block.maxOccupancy}</span>
            </div>
        `).join('');
    }
    
    // Update sports courts
    const courtList = document.querySelector('.court-list');
    if (courtList) {
        courtList.innerHTML = sportsCourts.map(court => `
            <div class="court-item ${court.status.toLowerCase()}">
                <span class="court-name">${court.name}</span>
                <span class="court-status">${court.status}</span>
                <span class="court-capacity">${court.currentOccupancy}/${court.maxOccupancy}</span>
            </div>
        `).join('');
    }
}

// Function to render camera feeds
function renderCameraFeeds() {
    const cameraGrid = document.querySelector('.camera-grid');
    if (!cameraGrid) return;
    
    cameraGrid.innerHTML = spaces.map(space => `
        <div class="camera-card">
            <div class="camera-header">
                <h4>${space.name}</h4>
                <span class="motion-indicator ${space.motionDetected ? 'active' : ''}"></span>
            </div>
            <div class="camera-feed">
                <img src="${space.cameraFeed}" alt="${space.name} Camera Feed">
                <div class="motion-overlay">
                    <div class="motion-dot"></div>
                    <div class="motion-dot"></div>
                    <div class="motion-dot"></div>
                </div>
            </div>
            <div class="camera-stats">
                <span class="stat"><i class="fas fa-users"></i> ${space.currentOccupancy}/${space.maxOccupancy}</span>
                <span class="stat"><i class="fas fa-wifi"></i> ${space.wifiStrength}</span>
                <span class="stat"><i class="fas fa-bolt"></i> ${space.motionDetected ? 'Motion Detected' : 'No Motion'}</span>
            </div>
        </div>
    `).join('');
}

// Initialize space management
document.addEventListener('DOMContentLoaded', () => {
    renderSpaces();
    renderCameraFeeds();
    renderAvailabilityOverview();
    
    // Update motion detection and occupancy every 5 seconds
    setInterval(updateMotionDetection, 5000);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load products first
    loadProducts();
    
    // Load reservations
    loadReservations();
    
    // Load current user and update UI
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log('Loaded user on init:', currentUser);
            updateAuthState(true);
            updateUIForUserRole();
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
    
    // Add cart button event listener
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleReservationsPanel);
    }
    
    // Update cart count
    updateCartCount();
    
    renderProducts();
    renderSpaces();
    renderLockers();
    renderUserDeliveries();
    setupPasswordValidation();
}); 