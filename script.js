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

// Add at the beginning of the file
let lrcCamera = null;
let lrcStream = null;

// Function to initialize LRC camera
async function initializeLRCCamera() {
    try {
        const video = document.getElementById('lrcCamera');
        if (!video) return;

        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        lrcStream = stream;
        video.srcObject = stream;
        
        // Start person detection if YOLO is available
        if (typeof yoloModel !== 'undefined' && yoloModel) {
            setInterval(() => detectPeople(video), 1000);
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please check permissions.');
    }
}

// Function to detect people in video feed
async function detectPeople(videoElement) {
    if (!yoloModel || !videoElement) return;
    
    try {
        // Create a temporary canvas to process the video frame
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        // Process frame with YOLO
        const tfImg = tf.browser.fromPixels(canvas);
        const expandedImg = tfImg.expandDims(0);
        const normalizedImg = expandedImg.div(255.0);
        
        const predictions = await yoloModel.predict(normalizedImg);
        
        // Count people (class 0 is person in COCO dataset)
        let peopleCount = 0;
        const scores = predictions[1].arraySync()[0];
        const classes = predictions[2].arraySync()[0];
        
        for (let i = 0; i < scores.length; i++) {
            if (classes[i] === 0 && scores[i] > 0.5) {
                peopleCount++;
            }
        }
        
        // Update occupancy display
        const occupancyElement = document.getElementById('lrcOccupancy');
        if (occupancyElement) {
            occupancyElement.textContent = `${peopleCount}/50`;
        }
        
        // Clean up tensors
        tfImg.dispose();
        expandedImg.dispose();
        normalizedImg.dispose();
        predictions.forEach(p => p.dispose());
        
    } catch (error) {
        console.error('Error in person detection:', error);
    }
}

// Function to stop camera feed
function stopLRCCamera() {
    if (lrcStream) {
        lrcStream.getTracks().forEach(track => track.stop());
        lrcStream = null;
    }
    const video = document.getElementById('lrcCamera');
    if (video) {
        video.srcObject = null;
    }
}

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

// Auth Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup auth modals
    setupAuthModals();
    
    // Setup password validation
    setupPasswordValidation();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById(page).classList.add('active');
                
                document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear current user
            currentUser = null;
            localStorage.removeItem('currentUser');
            
            // Update UI
            updateUIForUserRole();
            
            // Show notification
            showNotification('Logged out successfully', 'info');
            
            // Redirect to home page
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('home').classList.add('active');
            
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            document.querySelector('.nav-links a[data-page="home"]').classList.add('active');
        });
    }
    
    // Load products
    loadProducts();
    
    // Update UI based on user status
    updateUIForUserRole();
    
    // Render spaces
    renderSpaces();
    
    // Initialize lockers
    initializeLockers();
    
    // Initialize the camera system for Library (LRC)
    initializeLRCCamera();
    
    // Initialize YOLO monitoring
    initYOLO();
    
    // Setup monitoring
    initMonitoring();
});

function setupAuthModals() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Open modals
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'block';
});

    // Close modals
    closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

    // Switch between modals
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

function setupPasswordValidation() {
    const passwordInput = document.getElementById('registerPassword');
    const requirements = {
        length: str => str.length >= 8,
        uppercase: str => /[A-Z]/.test(str),
        lowercase: str => /[a-z]/.test(str),
        number: str => /[0-9]/.test(str),
        special: str => /[^A-Za-z0-9]/.test(str)
    };

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strengthBar = document.querySelector('.strength-bar');
        let validCount = 0;

        // Update requirement checks
        Object.entries(requirements).forEach(([key, validate]) => {
            const li = document.querySelector(`[data-requirement="${key}"]`);
            if (validate(password)) {
                li.classList.add('valid');
                validCount++;
            } else {
                li.classList.remove('valid');
            }
        });

        // Update strength bar
        if (validCount <= 2) {
            strengthBar.className = 'strength-bar weak';
        } else if (validCount <= 4) {
            strengthBar.className = 'strength-bar medium';
        } else {
            strengthBar.className = 'strength-bar strong';
        }
    });
}

function setupFormSubmission() {
    console.log('Setting up form submission handlers...');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Simple validation
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            
            if (!user) {
                alert('User not found. Please register first.');
                return;
            }
            
            // Verify password using the verifyPassword function
            if (!verifyPassword(password, user.passwordHash)) {
                alert('Incorrect password. Please try again.');
                return;
            }
            
            // Only proceed here if both user exists AND password is correct
            currentUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            };
            
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            updateUIForUserRole();
            
            // Close modal
            loginModal.style.display = 'none';
            
            // Show notification
            showNotification(`Welcome, ${currentUser.name}!`, 'success');
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const enrollment = document.getElementById('registerEnrollment').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Simple validation
            if (!name || !email || !password || !confirmPassword) {
                alert('Please fill all required fields');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Check password strength
            const validation = validatePassword(password);
            if (!validation.isValid) {
                alert('Password does not meet requirements:\n' + validation.errors.join('\n'));
                return;
            }

            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(u => u.email === email)) {
                alert('User with this email already exists');
                return;
            }
            
            // Check if this is a store account (contains 'store' in email)
            const isStoreUser = email.toLowerCase().includes('store');
            
            // Create passwordHash
            const passwordHash = hashPassword(password);
            
            // Create user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                enrollment: enrollment,
                passwordHash: passwordHash,
                role: isStoreUser ? 'store_worker' : 'student'
            };
            
            // Save to users collection in localStorage
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Set as current user (without password hash)
            currentUser = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                enrollment: newUser.enrollment,
                role: newUser.role
            };
            
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            updateUIForUserRole();
            
            // Close modal
            registerModal.style.display = 'none';
            
            // Show notification
            showNotification(`Welcome, ${name}!`, 'success');
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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

// Function to update UI elements based on user role
function updateUIForUserRole() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    const userDisplayName = document.getElementById('userDisplayName');
    
    if (currentUser) {
        // Hide login/register, show logout
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        // Show current user display
        if (currentUserDisplay) {
            currentUserDisplay.classList.remove('hidden');
            
            // Set display name (prefer name over email if available)
            if (userDisplayName) {
                const displayText = currentUser.name || currentUser.email;
                userDisplayName.textContent = currentUser.email.includes('store') ? 
                    `${displayText} (Store Staff)` : displayText;
                
                // Add title attribute for hover tooltip with full text
                userDisplayName.setAttribute('title', userDisplayName.textContent);
            }
        }
        
        const userReservationsPanel = document.getElementById('userReservationsPanel');
        const storeReservationsPanel = document.getElementById('storeReservationsPanel');
        
        // Remove any existing reservations panels
            if (userReservationsPanel) userReservationsPanel.remove();
            if (storeReservationsPanel) storeReservationsPanel.remove();
            
        if (currentUser.role === 'store_worker' || currentUser.email.includes('store')) {
            // Add store worker reservations panel
            const storePanel = document.createElement('div');
            storePanel.id = 'storeReservationsPanel';
            storePanel.className = 'reservations-panel';
            storePanel.innerHTML = `
                <div class="cart-header">
                    <h3><i class="fas fa-list"></i> All Reservations</h3>
                    <button class="cart-close">&times;</button>
                </div>
                <div id="storeReservationsList"></div>
            `;
            document.body.appendChild(storePanel);
            
            // Add event listener to close button
            storePanel.querySelector('.cart-close').addEventListener('click', toggleReservationsPanel);
            
            // Add "View Reservations" button in grocery header
            const groceryHeader = document.querySelector('.grocery-header');
            if (groceryHeader) {
                // Check if button already exists
                let reservationsBtn = document.getElementById('storeReservationsBtn');
                if (!reservationsBtn) {
                    reservationsBtn = document.createElement('button');
                    reservationsBtn.id = 'storeReservationsBtn';
                    reservationsBtn.className = 'btn btn-primary';
                    reservationsBtn.innerHTML = '<i class="fas fa-list"></i> View Reservations';
                    reservationsBtn.addEventListener('click', toggleReservationsPanel);
                    
                    // Add to header actions
                    const headerActions = groceryHeader.querySelector('.header-actions');
                    if (headerActions) {
                        headerActions.appendChild(reservationsBtn);
                    }
                }
            }
            
            // Initial render of store reservations
            renderStoreReservations();
        } else {
            // Regular user
            // Add user's reservation history panel
            const userPanel = document.createElement('div');
            userPanel.id = 'userReservationsPanel';
            userPanel.className = 'reservations-panel user-reservations';
            userPanel.innerHTML = `
                <div class="cart-header">
                    <h3><i class="fas fa-shopping-cart"></i> My Reservations</h3>
                    <button class="cart-close">&times;</button>
                </div>
                <div id="userReservationsList"></div>
            `;
            document.body.appendChild(userPanel);
            
            // Add event listener to close button
            userPanel.querySelector('.cart-close').addEventListener('click', toggleReservationsPanel);
            
            // Add "My Reservations" button in grocery header
            const groceryHeader = document.querySelector('.grocery-header');
            if (groceryHeader) {
                // Check if button already exists
                let reservationsBtn = document.getElementById('userReservationsBtn');
                if (!reservationsBtn) {
                    reservationsBtn = document.createElement('button');
                    reservationsBtn.id = 'userReservationsBtn';
                    reservationsBtn.className = 'btn btn-info';
                    reservationsBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> My Reservations';
                    reservationsBtn.addEventListener('click', toggleReservationsPanel);
                    
                    // Add to header actions
                    const headerActions = groceryHeader.querySelector('.header-actions');
                    if (headerActions) {
                        headerActions.appendChild(reservationsBtn);
                    }
                }
            }
            
            // Initial render of user reservations
                renderUserReservations();
            }
        
        // Update cart count
        updateCartCount();
    } else {
        // Show login/register, hide logout
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        
        // Hide current user display
        if (currentUserDisplay) {
            currentUserDisplay.classList.add('hidden');
            if (userDisplayName) {
                userDisplayName.textContent = '';
            }
        }
        
        // Remove reservation panels
        const userReservationsPanel = document.getElementById('userReservationsPanel');
        const storeReservationsPanel = document.getElementById('storeReservationsPanel');
        if (userReservationsPanel) userReservationsPanel.remove();
        if (storeReservationsPanel) storeReservationsPanel.remove();
        
        // Remove reservation buttons
        const userReservationsBtn = document.getElementById('userReservationsBtn');
        const storeReservationsBtn = document.getElementById('storeReservationsBtn');
        if (userReservationsBtn) userReservationsBtn.remove();
        if (storeReservationsBtn) storeReservationsBtn.remove();
    }
}

// Function to render store worker's view of reservations
function renderStoreReservations() {
    // Allow users with "store" in their email or role set to store_worker
    if (!currentUser || !(currentUser.role === 'store_worker' || currentUser.email.includes('store'))) return;
    
    const reservationsList = document.getElementById('storeReservationsList');
    if (!reservationsList) return;
    
    // Load reservations first
    loadReservations();
    
    // Filter can be 'all', 'pending', 'completed', 'cancelled'
    const currentFilter = localStorage.getItem('storeReservationFilter') || 'all';
    
    // Get all reservations, ordered by most recent first
    let userReservations = [...reservations].sort((a, b) => {
        // Sort by timestamp (most recent first)
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Apply filter
    if (currentFilter !== 'all') {
        userReservations = userReservations.filter(r => r.status === currentFilter);
    }
    
    // Add filter controls at the top
    const filterControls = document.createElement('div');
    filterControls.className = 'reservation-filters';
    filterControls.innerHTML = `
        <h4>Filter Reservations:</h4>
        <div class="filter-buttons" >
            <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" style="border:none;">All</button>
            <button class="filter-btn ${currentFilter === 'pending' ? 'active' : ''}" data-filter="pending" style="border:none;">Pending</button>
            <button class="filter-btn ${currentFilter === 'completed' ? 'active' : ''}" data-filter="completed" style="border:none;">Completed</button>
            <button class="filter-btn ${currentFilter === 'cancelled' ? 'active' : ''}" data-filter="cancelled" style="border:none;">Cancelled</button>
        </div>
    `;
    
    // Clear and add the filter controls
    reservationsList.innerHTML = '';
    reservationsList.appendChild(filterControls);
    
    // Add event listeners to filter buttons
    const filterButtons = filterControls.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            localStorage.setItem('storeReservationFilter', filter);
            renderStoreReservations(); // Refresh with new filter
        });
    });
    
    // If no reservations match the filter
    if (userReservations.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'no-reservations';
        emptyMessage.textContent = `No ${currentFilter !== 'all' ? currentFilter : 'active'} reservations found`;
        reservationsList.appendChild(emptyMessage);
        return;
    }
    
    // Create reservation cards container
    const reservationCards = document.createElement('div');
    reservationCards.className = 'reservation-cards';
    
    // Add reservation cards
    userReservations.forEach(reservation => {
        // Find the product to get its price
        const product = products.find(p => p.id === reservation.productId);
        const itemPrice = product ? product.price : 0;
        const itemTotal = product ? (product.price * reservation.quantity).toFixed(2) : '0.00';
        
        // Create the reservation card
        const card = document.createElement('div');
        card.className = `reservation-card ${reservation.status}`;
        card.innerHTML = `
            <div class="reservation-header">
            <h4>${reservation.productName}${reservation.quantity > 1 ? ` (${reservation.quantity})` : ''}</h4>
                <span class="reservation-status ${reservation.status}">${reservation.status.toUpperCase()}</span>
            </div>
            <div class="reservation-details">
                <p><strong>Reserved by:</strong> ${reservation.userName}</p>
                <p><strong>Email:</strong> ${reservation.userEmail}</p>
                <p><strong>Date & Time:</strong> ${reservation.timestamp}</p>
                <p><strong>Item Price:</strong> ₹${itemPrice.toFixed(2)} × ${reservation.quantity} = ₹${itemTotal}</p>
            </div>
            ${reservation.status === 'pending' ? `
            <div class="reservation-actions">
                <button class="btn btn-success" onclick="updateReservationStatus(${reservation.id}, 'completed')">
                        <i class="fas fa-check"></i> Complete
                </button>
                <button class="btn btn-danger" onclick="updateReservationStatus(${reservation.id}, 'cancelled')">
                        <i class="fas fa-times"></i> Cancel
                </button>
            </div>
            ` : ''}
        `;
        
        reservationCards.appendChild(card);
    });
    
    // Add the cards to the list
    reservationsList.appendChild(reservationCards);
}

// Function to render user's reservation history
function renderUserReservations() {
    // Don't block store users from seeing their own reservations
    if (!currentUser) return;
    
    const reservationsList = document.getElementById('userReservationsList');
    if (!reservationsList) return;
    
    // Load reservations first
    loadReservations();
    
    const userReservations = reservations.filter(r => r.userEmail === currentUser.email);
    
    if (userReservations.length === 0) {
        reservationsList.innerHTML = '<p class="no-reservations">You haven\'t made any reservations yet</p>';
        return;
    }
    
    // Calculate total cart value for pending items
    const pendingReservations = userReservations.filter(r => r.status === 'pending');
    let totalCartValue = 0;
    
    // Find the product price for each reservation and calculate total
    pendingReservations.forEach(reservation => {
        const product = products.find(p => p.id === reservation.productId);
        if (product) {
            totalCartValue += (product.price * reservation.quantity);
        }
    });
    
    // Render reservation cards
    reservationsList.innerHTML = userReservations.map(reservation => {
        // Find product to get price
        const product = products.find(p => p.id === reservation.productId);
        const itemPrice = product ? product.price : 0;
        const itemTotal = product ? (product.price * reservation.quantity).toFixed(2) : '0.00';
        
        return `
        <div class="reservation-card ${reservation.status}">
            <h4>${reservation.productName}${reservation.quantity > 1 ? ` (${reservation.quantity})` : ''}</h4>
            <p>Reserved on: ${reservation.timestamp}</p>
            <p>Status: <span class="status-${reservation.status}">${reservation.status}</span></p>
                <p>Price: ₹${itemPrice.toFixed(2)} × ${reservation.quantity} = ₹${itemTotal}</p>
            ${reservation.status === 'pending' ? `
                <button class="btn btn-danger" onclick="cancelReservation(${reservation.id})">
                    Cancel Reservation
                </button>
            ` : ''}
        </div>
        `;
    }).join('');
    
    // Add total cart value summary at the bottom if there are pending reservations
    if (pendingReservations.length > 0) {
        const totalCartSummary = document.createElement('div');
        totalCartSummary.className = 'cart-total-summary';
        totalCartSummary.innerHTML = `
            <h3>Total Cart Value: ₹${totalCartValue.toFixed(2)}</h3>
            <p>${pendingReservations.length} pending item(s)</p>
        `;
        reservationsList.appendChild(totalCartSummary);
    }
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
    if (!currentUser) return;

    let panel;
    if (currentUser.role === 'store_worker') {
        panel = document.getElementById('storeReservationsPanel');
        if (panel) {
            panel.classList.toggle('active');
            renderStoreReservations();
        }
    } else {
        panel = document.getElementById('userReservationsPanel');
        if (panel) {
            panel.classList.toggle('active');
            renderUserReservations();
        }
    }
    updateCartCount();
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

    // Update the overview counts
    updateLockerOverview();

    // Update delivery locker select options
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

    // Update retrieve locker select options
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
    const occupiedLockers = lockers.filter(l => l.status === 'occupied').length;

    // Update the display
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
        locker.currentDelivery = delivery;
        
        // Save to localStorage
        localStorage.setItem('lockers', JSON.stringify(lockers));
        
        // Update UI
        renderLockers();
        updateLockerOverview();
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

// Initialize lockers from localStorage or default state
function initializeLockers() {
    const savedLockers = localStorage.getItem('lockers');
    if (savedLockers) {
        const parsedLockers = JSON.parse(savedLockers);
        lockers.length = 0; // Clear the array
        lockers.push(...parsedLockers); // Add saved lockers
    }
    renderLockers();
    updateLockerOverview();
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeLockers();
});

// Library Monitoring Simulation
let isPlaying = false;
let simulationInterval;
let currentTime = 0;
const maxCapacity = 50;
let occupancyData = [];

// Generate random occupancy data for the day
function generateOccupancyData() {
    occupancyData = [];
    let currentOccupancy = 10; // Start with 10 people
    
    // Generate data points for 12 hours (9 AM to 9 PM)
    for (let hour = 0; hour < 12; hour++) {
        for (let minute = 0; minute < 60; minute += 5) { // Data points every 5 minutes
            // Add random fluctuation
            const change = Math.floor(Math.random() * 5) - 2;
            currentOccupancy = Math.max(0, Math.min(maxCapacity, currentOccupancy + change));
            
            // Add peak hours pattern (2 PM - 4 PM)
            if (hour >= 5 && hour <= 7) { // 2 PM - 4 PM
                currentOccupancy = Math.min(maxCapacity, currentOccupancy + 2);
            }
            
            occupancyData.push({
                time: hour * 60 + minute,
                occupancy: currentOccupancy
            });
        }
    }
}

// Initialize monitoring canvas
function initMonitoring() {
    const canvas = document.getElementById('monitoringCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Generate initial data
    generateOccupancyData();
    
    // Setup play/pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // Setup playback speed
    const speedSelect = document.getElementById('playbackSpeed');
    if (speedSelect) {
        speedSelect.addEventListener('change', updatePlaybackSpeed);
    }
    
    // Initialize YOLO
    initYOLO();
}

// Toggle play/pause simulation
function togglePlayPause() {
    const btn = document.getElementById('playPauseBtn');
    const icon = btn.querySelector('i');
    const text = btn.querySelector('span');
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        text.textContent = 'Pause';
        startSimulation();
    } else {
        icon.className = 'fas fa-play';
        text.textContent = 'Play';
        stopSimulation();
    }
}

// Start simulation
function startSimulation() {
    if (simulationInterval) clearInterval(simulationInterval);
    
    if (isYoloInitialized) {
        // Use YOLO for real-time detection
        simulationInterval = setInterval(detectObjects, 1000);
    } else {
        // Fallback to simulation
        const speed = parseInt(document.getElementById('playbackSpeed').value);
        simulationInterval = setInterval(updateSimulation, 1000 / speed);
    }
}

// Stop simulation
function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

// Update simulation state
function updateSimulation() {
    currentTime = (currentTime + 1) % occupancyData.length;
    const data = occupancyData[currentTime];
    
    // Update occupancy display
    const currentOccupancyEl = document.getElementById('currentOccupancy');
    if (currentOccupancyEl) {
        currentOccupancyEl.textContent = `${data.occupancy}/${maxCapacity}`;
    }
    
    // Update alert level
    updateAlertLevel(data.occupancy);
    
    // Update graph
    updateGraph(currentTime);
    
    // Update canvas visualization
    updateCanvas(data.occupancy);
}

// Update alert level indicator
function updateAlertLevel(occupancy) {
    const indicator = document.getElementById('alertIndicator');
    const levelText = document.getElementById('alertLevel');
    
    const percentage = (occupancy / maxCapacity) * 100;
    
    if (percentage >= 80) {
        indicator.className = 'alert-indicator high';
        levelText.textContent = 'High';
    } else if (percentage >= 50) {
        indicator.className = 'alert-indicator medium';
        levelText.textContent = 'Moderate';
    } else {
        indicator.className = 'alert-indicator low';
        levelText.textContent = 'Normal';
    }
}

// Update occupancy graph
function updateGraph(currentIndex) {
    const graphLine = document.getElementById('graphLine');
    const percentage = (occupancyData[currentIndex].occupancy / maxCapacity) * 100;
    
    graphLine.style.height = `${percentage}%`;
}

// Update canvas visualization
function updateCanvas(occupancy) {
    const canvas = document.getElementById('monitoringCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    const gridSize = 20;
    const rows = Math.floor(canvas.height / gridSize);
    const cols = Math.floor(canvas.width / gridSize);
    
    // Calculate number of people to draw
    const peopleToShow = Math.min(occupancy, (rows * cols));
    
    // Draw people as dots
    ctx.fillStyle = '#3498db';
    for (let i = 0; i < peopleToShow; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        const x = col * gridSize + gridSize / 2;
        const y = row * gridSize + gridSize / 2;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Update playback speed
function updatePlaybackSpeed() {
    if (isPlaying) {
        startSimulation(); // Restart with new speed
    }
}

// Initialize monitoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    initMonitoring();
});

// YOLO Integration
let yoloModel = null;
let videoElement = null;
let isYoloInitialized = false;

// Initialize YOLO model
async function initYOLO() {
    try {
        // Load YOLO model
        yoloModel = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1');
        console.log('YOLO model loaded successfully');
        
        // Create video element for camera feed
        videoElement = document.createElement('video');
        videoElement.style.display = 'none';
        videoElement.autoplay = true;
        videoElement.muted = true;
        document.body.appendChild(videoElement);
        
        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        
        isYoloInitialized = true;
        console.log('YOLO initialization complete');
    } catch (error) {
        console.error('Error initializing YOLO:', error);
        // Fallback to simulation if YOLO fails
        initMonitoring();
    }
}

// Detect objects using YOLO
async function detectObjects() {
    if (!isYoloInitialized || !yoloModel || !videoElement) return;
    
    try {
        // Prepare input tensor
        const tfImg = tf.browser.fromPixels(videoElement);
        const expandedImg = tfImg.expandDims(0);
        const normalizedImg = expandedImg.div(255.0);
        
        // Run inference
        const predictions = await yoloModel.predict(normalizedImg);
        
        // Process predictions
        const boxes = predictions[0].arraySync();
        const scores = predictions[1].arraySync();
        const classes = predictions[2].arraySync();
        const numDetections = predictions[3].arraySync();
        
        // Count people
        let peopleCount = 0;
        for (let i = 0; i < numDetections[0]; i++) {
            if (classes[0][i] === 1 && scores[0][i] > 0.5) { // Class 1 is person in COCO dataset
                peopleCount++;
            }
        }
        
        // Update occupancy
        updateOccupancyFromYOLO(peopleCount);
        
        // Clean up tensors
        tfImg.dispose();
        expandedImg.dispose();
        normalizedImg.dispose();
        predictions.forEach(p => p.dispose());
        
    } catch (error) {
        console.error('Error in object detection:', error);
    }
}

// Update occupancy based on YOLO detection
function updateOccupancyFromYOLO(count) {
    const currentOccupancyEl = document.getElementById('currentOccupancy');
    if (currentOccupancyEl) {
        currentOccupancyEl.textContent = `${count}/${maxCapacity}`;
    }
    
    // Update alert level
    updateAlertLevel(count);
    
    // Update graph
    const currentIndex = Math.floor((currentTime / occupancyData.length) * occupancyData.length);
    updateGraph(currentIndex);
    
    // Update canvas visualization
    updateCanvas(count);
}

// Add TensorFlow.js script
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js';
document.head.appendChild(script);

// Update the spaces page initialization
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    
    // Initialize camera when spaces page is active
    const spacesPage = document.getElementById('spaces');
    if (spacesPage && spacesPage.classList.contains('active')) {
        initializeLRCCamera();
    }
    
    // Handle page navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetPage = link.getAttribute('data-page');
            if (targetPage !== 'spaces') {
                stopLRCCamera();
            } else {
                initializeLRCCamera();
            }
        });
    });
});

// Show locker section
function showLockerSection() {
    hideAllSections();
    document.getElementById('lockerSection').style.display = 'block';
    // Update the active navigation item
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('a[href="#lockers"]').classList.add('active');
}

// Add to your existing navigation handling code
document.querySelector('a[href="#lockers"]').addEventListener('click', (e) => {
    e.preventDefault();
    showLockerSection();
});

// Expose essential functions to the global scope
window.showNotification = showNotification;
window.updateUIForUserRole = updateUIForUserRole;
window.verifyPassword = verifyPassword;
window.validatePassword = validatePassword;
window.hashPassword = hashPassword;

// Helper function to debug user authentication (add at the bottom of the file)
window.debugUserStorage = function() {
    console.log('--- User Storage Debug ---');
    console.log('Current User:', localStorage.getItem('currentUser'));
    console.log('All Users:', localStorage.getItem('users'));
    
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('User count:', users.length);
        
        if (users.length > 0) {
            console.log('Sample user structure:');
            console.log(users[0]);
        }
    } catch (e) {
        console.error('Error parsing users:', e);
    }
    
    // Verify password hash function is working
    const testPassword = 'Test123!';
    const testHash = hashPassword(testPassword);
    console.log('Password hash test:', testPassword, '->', testHash);
    console.log('Verify test:', verifyPassword(testPassword, testHash));
    console.log('------------------------');
}; 

