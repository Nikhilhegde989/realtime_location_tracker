const socket = io();

function sendGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Timestamp: ${new Date().toISOString()}`);
                socket.emit("send-location", { latitude, longitude });
            },
            (error) => {
                console.error("Geolocation error:", error);
                // Retry after a delay if there's an error
                setTimeout(sendGeolocation, 5000);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, // Increase the timeout to 10 seconds
                maximumAge: 0,
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Send geolocation every 5 seconds
setInterval(sendGeolocation, 5000);

const map = L.map("map").setView([0,0], 10); // Set default view to Manipal

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location from ${id}: Latitude: ${latitude}, Longitude: ${longitude}, Timestamp: ${new Date().toISOString()}`);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude], 16); // Update map view to the latest location
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
