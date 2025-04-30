// Get user information from localStorage
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = '/login.html';
}

// DOM Elements
const lockerGrid = document.getElementById('lockerGrid');
const deliveryHistory = document.getElementById('deliveryHistory');
const pickupModal = new bootstrap.Modal(document.getElementById('pickupModal'));
const modalLockerNumber = document.getElementById('modalLockerNumber');
const deliveryCodeInput = document.getElementById('deliveryCode');
const confirmPickupBtn = document.getElementById('confirmPickup');

let currentDeliveryId = null;

// Fetch and display lockers
async function fetchLockers() {
    try {
        const response = await fetch('/api/lockers');
        const lockers = await response.json();
        
        lockerGrid.innerHTML = '';
        lockers.forEach(locker => {
            const lockerCard = createLockerCard(locker);
            lockerGrid.appendChild(lockerCard);
        });
    } catch (error) {
        console.error('Error fetching lockers:', error);
        showAlert('Error loading lockers', 'danger');
    }
}

// Create locker card element
function createLockerCard(locker) {
    const card = document.createElement('div');
    card.className = `locker-card ${locker.status}`;
    
    const lastCleaned = locker.lastCleaned ? new Date(locker.lastCleaned).toLocaleDateString() : 'Never';
    
    card.innerHTML = `
        <h3>Locker ${locker.lockerNumber}</h3>
        <div class="status-badge bg-${getStatusColor(locker.status)}">
            ${locker.status.toUpperCase()}
        </div>
        <p class="mt-2">Last Cleaned: ${lastCleaned}</p>
        ${locker.status === 'occupied' ? `
            <button class="btn btn-primary mt-2" onclick="showPickupModal('${locker.lockerNumber}', ${locker.current_delivery_id})">
                Pickup
            </button>
        ` : ''}
    `;
    
    return card;
}

// Get status color for badge
function getStatusColor(status) {
    switch (status) {
        case 'available': return 'success';
        case 'occupied': return 'danger';
        case 'maintenance': return 'warning';
        default: return 'secondary';
    }
}

// Fetch and display user's delivery history
async function fetchDeliveryHistory() {
    try {
        const response = await fetch(`/api/users/${user.id}/deliveries`);
        const deliveries = await response.json();
        
        deliveryHistory.innerHTML = '';
        deliveries.forEach(delivery => {
            const deliveryItem = createDeliveryItem(delivery);
            deliveryHistory.appendChild(deliveryItem);
        });
    } catch (error) {
        console.error('Error fetching delivery history:', error);
        showAlert('Error loading delivery history', 'danger');
    }
}

// Create delivery history item
function createDeliveryItem(delivery) {
    const item = document.createElement('div');
    item.className = 'delivery-item';
    
    const createdAt = new Date(delivery.createdAt).toLocaleString();
    const pickedUpAt = delivery.pickedUpAt ? new Date(delivery.pickedUpAt).toLocaleString() : 'Not picked up';
    
    item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h5>Delivery #${delivery.id}</h5>
            <span class="badge bg-${getStatusColor(delivery.status)}">${delivery.status}</span>
        </div>
        <p class="mb-1">Code: ${delivery.deliveryCode}</p>
        <p class="mb-1">Locker: ${delivery.lockerNumber || 'Not assigned'}</p>
        <small class="text-muted">Created: ${createdAt}</small><br>
        <small class="text-muted">Picked up: ${pickedUpAt}</small>
    `;
    
    return item;
}

// Show pickup modal
function showPickupModal(lockerNumber, deliveryId) {
    currentDeliveryId = deliveryId;
    modalLockerNumber.textContent = lockerNumber;
    deliveryCodeInput.value = '';
    pickupModal.show();
}

// Handle pickup confirmation
confirmPickupBtn.addEventListener('click', async () => {
    const deliveryCode = deliveryCodeInput.value;
    
    if (!deliveryCode || deliveryCode.length !== 6) {
        showAlert('Please enter a valid 6-digit delivery code', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/deliveries/${currentDeliveryId}/pickup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deliveryCode })
        });
        
        if (response.ok) {
            pickupModal.hide();
            showAlert('Delivery picked up successfully!', 'success');
            fetchLockers();
            fetchDeliveryHistory();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Failed to pickup delivery', 'danger');
        }
    } catch (error) {
        console.error('Error picking up delivery:', error);
        showAlert('Error picking up delivery', 'danger');
    }
});

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Initialize page
fetchLockers();
fetchDeliveryHistory();

// Refresh data every 30 seconds
setInterval(() => {
    fetchLockers();
    fetchDeliveryHistory();
}, 30000); 