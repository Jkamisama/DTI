// Refresh intervals
const OCCUPANCY_REFRESH_INTERVAL = 5000; // 5 seconds
const LOCKER_STATUS_REFRESH_INTERVAL = 10000; // 10 seconds

// DOM Elements
const totalLockersElement = document.getElementById('totalLockers');
const availableLockersElement = document.getElementById('availableLockers');
const occupiedLockersElement = document.getElementById('occupiedLockers');
const lockerStatusContainer = document.getElementById('lockerStatus');
const otpRefreshBtn = document.getElementById('refreshOTP');

// Fetch occupancy data
async function fetchOccupancy() {
    try {
        const response = await fetch('/occupancy');
        const data = await response.json();
        
        // Update UI
        if (totalLockersElement) totalLockersElement.textContent = data.total;
        if (availableLockersElement) availableLockersElement.textContent = data.available;
        if (occupiedLockersElement) occupiedLockersElement.textContent = data.occupied;
    } catch (error) {
        console.error('Error fetching occupancy:', error);
    }
}

// Fetch locker status
async function fetchLockerStatus() {
    try {
        const response = await fetch('/api/lockers/status');
        const lockers = await response.json();
        
        // Update UI
        if (lockerStatusContainer) {
            lockerStatusContainer.innerHTML = '';
            lockers.forEach(locker => {
                const lockerElement = createLockerElement(locker);
                lockerStatusContainer.appendChild(lockerElement);
            });
        }
    } catch (error) {
        console.error('Error fetching locker status:', error);
    }
}

// Create locker element
function createLockerElement(locker) {
    const div = document.createElement('div');
    div.className = 'col-md-2 mb-3';
    
    const card = document.createElement('div');
    card.className = `card ${getStatusClass(locker.status)}`;
    
    card.innerHTML = `
        <div class="card-body text-center">
            <h5 class="card-title">Locker ${locker.number}</h5>
            <p class="card-text">
                <span class="badge ${getStatusBadgeClass(locker.status)}">
                    ${locker.status.toUpperCase()}
                </span>
            </p>
            ${locker.lastCleaned ? `
                <small class="text-muted">
                    Last cleaned: ${new Date(locker.lastCleaned).toLocaleDateString()}
                </small>
            ` : ''}
        </div>
    `;
    
    div.appendChild(card);
    return div;
}

// Get status-specific classes
function getStatusClass(status) {
    switch (status) {
        case 'available': return 'border-success bg-success bg-opacity-10';
        case 'occupied': return 'border-danger bg-danger bg-opacity-10';
        case 'maintenance': return 'border-warning bg-warning bg-opacity-10';
        default: return '';
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'available': return 'bg-success';
        case 'occupied': return 'bg-danger';
        case 'maintenance': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// Event Listeners
if (otpRefreshBtn) {
    otpRefreshBtn.addEventListener('click', () => {
        // Add OTP refresh functionality here
        console.log('Refreshing OTPs...');
    });
}

// Initialize when the section is shown
document.querySelector('a[href="#lockers"]').addEventListener('click', () => {
    fetchOccupancy();
    fetchLockerStatus();
    
    // Set up auto-refresh only when the section is visible
    const occupancyInterval = setInterval(fetchOccupancy, OCCUPANCY_REFRESH_INTERVAL);
    const statusInterval = setInterval(fetchLockerStatus, LOCKER_STATUS_REFRESH_INTERVAL);
    
    // Clear intervals when leaving the section
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#lockerSection')) {
            clearInterval(occupancyInterval);
            clearInterval(statusInterval);
        }
    });
}); 