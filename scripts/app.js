let panorama;
let interval;

// Define your four locations
const locations = {
    location1: {
        start: { lat: 51.67396085135671, lng: -0.021771820958973 },
        end: { lat: 51.67134873911908, lng: -0.027533717252012462 },
        name: "Regus Office, Enfield"
    },
    location2: {
        start: { lat: 51.60685169741555, lng: -0.1108544444932265 },
        end: { lat: 51.60949737102854, lng: -0.11011565584119586 },
        name: "Arcadian Gardens NHS Medical Centre"
    },
    location3: {
        
        start: { lat: 53.507515429636705, lng: -1.141418042721771 },
        end: { lat: 53.50940730473737, lng: -1.1446018125414992},
        name: "Adefey Group Ltd."
    },
    location4: {
         
        start: { lat: 51.483751988354555, lng: -2.617986580159722 },
        end: { lat: 51.48474750721394, lng: -2.618512250879439 },
        name: "St Monica Trust"
    }
};

let currentLocation = null;
let currentPointIndex = 0;
let routePoints;

function initStreetView() {
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'),
        {
            position: locations.location1.start,
            pov: { heading: 0, pitch: 0 },
            zoom: 1
        }
    );

    // Add event listener for location select
    document.getElementById('locationSelect').addEventListener('change', handleLocationChange);
    document.getElementById('startBtn').addEventListener('click', startJourney);
    document.getElementById('stopBtn').addEventListener('click', stopJourney);
}

function handleLocationChange() {
    const selectedValue = document.getElementById('locationSelect').value;
    if (selectedValue && locations[selectedValue]) {
        currentLocation = locations[selectedValue];
        stopJourney(); // Stop any ongoing journey
        panorama.setPosition(currentLocation.start);
        routePoints = null; // Reset route points for new calculation
    }
}

function calculateRoute() {
    if (!currentLocation) {
        alert('Please select a location first');
        return Promise.reject('No location selected');
    }

    const directionsService = new google.maps.DirectionsService();
    
    return new Promise((resolve, reject) => {
        directionsService.route(
            {
                origin: currentLocation.start,
                destination: currentLocation.end,
                travelMode: 'WALKING'
            },
            (response, status) => {
                if (status === 'OK') {
                    resolve(response.routes[0].overview_path);
                } else {
                    reject('Directions request failed');
                }
            }
        );
    });
}

async function startJourney() {
    if (!currentLocation) {
        alert('Please select a location first');
        return;
    }

    if (!routePoints) {
        try {
            routePoints = await calculateRoute();
        } catch (error) {
            console.error(error);
            return;
        }
    }
    
    currentPointIndex = 0;
    moveAlongRoute();
    
    interval = setInterval(() => {
        currentPointIndex++;
        if (currentPointIndex >= routePoints.length) {
            stopJourney();
            return;
        }
        moveAlongRoute();
    }, 2000);
}

function moveAlongRoute() {
    if (!routePoints || routePoints.length === 0) return;
    
    const point = routePoints[currentPointIndex];
    panorama.setPosition({ lat: point.lat(), lng: point.lng() });
    
    if (currentPointIndex < routePoints.length - 1) {
        const nextPoint = routePoints[currentPointIndex + 1];
        const heading = google.maps.geometry.spherical.computeHeading(point, nextPoint);
        panorama.setPov({ heading: heading, pitch: 0 });
    }
}

function stopJourney() {
    clearInterval(interval);
}

// Initialize when the page loads
google.maps.event.addDomListener(window, 'load', initStreetView);