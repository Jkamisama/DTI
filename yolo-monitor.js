// YOLO Feed and Occupancy Monitoring

document.addEventListener('DOMContentLoaded', () => {
    initializeYOLOFeed();
    setupOccupancyUpdates();
});

function initializeYOLOFeed() {
    // Replace the canvas with YOLO feed
    const timelapseVideo = document.querySelector('.time-lapse-video');
    timelapseVideo.innerHTML = `
        <img id="yoloFeed" src="http://127.0.0.1:5000/video_feed" alt="Live YOLO Feed" style="width: 100%; height: 100%; object-fit: cover;">
    `;
}

function setupOccupancyUpdates() {
    // Set up WebSocket or Server-Sent Events connection to get occupancy updates
    const occupancyEndpoint = 'http://127.0.0.1:5000/occupancy';
    
    // Poll for occupancy updates every second
    setInterval(async () => {
        try {
            const response = await fetch(occupancyEndpoint, {
                method: 'GET',
                mode: 'cors',  // Enable CORS
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received occupancy data:', data); // Debug log
            
            // Check if data has count or person_count
            const count = data.count || data.person_count || data.occupancy || 0;
            console.log('Parsed count:', count); // Debug log
            
            updateOccupancyDisplay(count);
        } catch (error) {
            console.error('Error fetching occupancy:', error);
        }
    }, 1000); // Poll every second
}

function updateOccupancyDisplay(count) {
    console.log('Updating display with count:', count); // Debug log
    
    // Update the occupancy display
    const currentOccupancy = document.getElementById('currentOccupancy');
    if (currentOccupancy) {
        currentOccupancy.textContent = `${count}/50`;
        console.log('Updated occupancy text to:', `${count}/50`); // Debug log
        
        // Update alert level based on occupancy
        const alertIndicator = document.getElementById('alertIndicator');
        const alertLevel = document.getElementById('alertLevel');
        
        if (count >= 40) {
            alertIndicator.className = 'alert-indicator high';
            alertLevel.textContent = 'High';
        } else if (count >= 25) {
            alertIndicator.className = 'alert-indicator medium';
            alertLevel.textContent = 'Medium';
        } else {
            alertIndicator.className = 'alert-indicator low';
            alertLevel.textContent = 'Normal';
        }
    } else {
        console.error('Could not find currentOccupancy element'); // Debug log
    }
}

// Handle play/pause button (optional, since we're using live feed)
document.getElementById('playPauseBtn').addEventListener('click', () => {
    const btn = document.getElementById('playPauseBtn');
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');
    
    if (icon.classList.contains('fa-play')) {
        icon.classList.replace('fa-play', 'fa-pause');
        span.textContent = 'Pause';
    } else {
        icon.classList.replace('fa-pause', 'fa-play');
        span.textContent = 'Play';
    }
});

// Simulated occupancy monitoring
let currentOccupancy = 15;
const maxOccupancy = 50;

function updateOccupancy() {
    // Simulate random changes in occupancy
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    currentOccupancy = Math.max(0, Math.min(maxOccupancy, currentOccupancy + change));
    
    // Update display
    const occupancyElement = document.getElementById('currentOccupancy');
    if (occupancyElement) {
        occupancyElement.textContent = `${currentOccupancy}/${maxOccupancy}`;
    }

    // Update alert level
    const percentage = (currentOccupancy / maxOccupancy) * 100;
    const indicator = document.getElementById('alertIndicator');
    const levelText = document.getElementById('alertLevel');
    
    if (indicator && levelText) {
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
}

// Update occupancy every 5 seconds
setInterval(updateOccupancy, 5000);

// Initial update
document.addEventListener('DOMContentLoaded', updateOccupancy); 