let panorama;
let interval;

const startPoint = { lat: 51.67396085135671, lng: -0.021771820958973 }; // Example: Regus Office
const endPoint = { lat: 51.67134873911908, lng: -0.027533717252012462 };   // Enfield Lock





function initStreetView() {
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'),
        {
            position: startPoint,
            pov: { heading: 0, pitch: 0 },
            zoom: 1
        }
    );
}

function calculateRoute() {
    const directionsService = new google.maps.DirectionsService();
    
    return new Promise((resolve, reject) => {
        directionsService.route(
            {
                origin: startPoint,
                destination: endPoint,
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

let currentPointIndex = 0;
let routePoints;

async function startJourney() {
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
document.addEventListener('DOMContentLoaded', () => {
    initStreetView();
    
    document.getElementById('startBtn').addEventListener('click', startJourney);
    document.getElementById('stopBtn').addEventListener('click', stopJourney);
});