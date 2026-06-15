(function () {
    const flightPathStorageKey = "iss-mission-board.flightPath.v1";
    const maxStoredFlightPathPoints = 50;

    let map;
    let marker;
    let flightPath;

    const escapeHtml = (value) => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const getLeaflet = () => globalThis.L;

    const ensureLeaflet = () => {
        if (!getLeaflet()) {
            throw new Error("Leaflet konnte nicht geladen werden.");
        }
    };

    const ensureMap = () => {
        if (!map || !marker || !flightPath) {
            throw new Error("Die ISS-Karte wurde noch nicht initialisiert.");
        }
    };

    const issIcon = () => getLeaflet().divIcon({
        className: "iss-marker",
        html: "<div class=\"iss-marker-core\">ISS</div>",
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -22]
    });

    window.initializeMap = (elementId = "iss-map") => {
        ensureLeaflet();
        const leaflet = getLeaflet();

        if (map) {
            setTimeout(() => map.invalidateSize(), 50);
            return;
        }

        map = leaflet.map(elementId, {
            worldCopyJump: true,
            zoomControl: true
        }).setView([0, 0], 2);

        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 7,
            minZoom: 2,
            attribution: "&copy; OpenStreetMap-Mitwirkende"
        }).addTo(map);

        flightPath = leaflet.polyline([], {
            color: "#ffd447",
            weight: 4,
            opacity: 0.95,
            lineJoin: "round"
        }).addTo(map);

        marker = leaflet.marker([0, 0], {
            icon: issIcon(),
            title: "International Space Station"
        }).addTo(map);

        setTimeout(() => map.invalidateSize(), 100);
    };

    window.updateIssPosition = (latitude, longitude, locationLabel, updatedAt) => {
        ensureMap();

        const latLng = [latitude, longitude];
        const popupContent = `
            <div class="iss-popup">
                <div class="fw-semibold mb-1">International Space Station</div>
                <div><strong>Latitude:</strong> ${Number(latitude).toFixed(4)}</div>
                <div><strong>Longitude:</strong> ${Number(longitude).toFixed(4)}</div>
                <div><strong>Region:</strong> ${escapeHtml(locationLabel)}</div>
                <div><strong>Update:</strong> ${escapeHtml(updatedAt)}</div>
            </div>`;

        marker.setLatLng(latLng);
        marker.bindPopup(popupContent);
        map.panTo(latLng, { animate: true, duration: 0.8 });
    };

    window.updateFlightPath = (points) => {
        ensureMap();

        if (!Array.isArray(points)) {
            return;
        }

        const latLngs = points
            .filter((point) => Array.isArray(point) && point.length >= 2)
            .map((point) => [Number(point[0]), Number(point[1])])
            .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));

        flightPath.setLatLngs(latLngs);
    };

    window.loadStoredFlightPath = () => {
        try {
            const storedValue = localStorage.getItem(flightPathStorageKey);

            if (!storedValue) {
                return [];
            }

            const points = JSON.parse(storedValue);

            if (!Array.isArray(points)) {
                localStorage.removeItem(flightPathStorageKey);
                return [];
            }

            return points
                .map((point) => ({
                    latitude: Number(point.latitude),
                    longitude: Number(point.longitude),
                    timestamp: point.timestamp
                }))
                .filter((point) =>
                    Number.isFinite(point.latitude) &&
                    Number.isFinite(point.longitude) &&
                    typeof point.timestamp === "string" &&
                    point.timestamp.length > 0)
                .slice(-maxStoredFlightPathPoints);
        } catch {
            localStorage.removeItem(flightPathStorageKey);
            return [];
        }
    };

    window.saveFlightPath = (points) => {
        if (!Array.isArray(points)) {
            return;
        }

        const normalizedPoints = points
            .map((point) => ({
                latitude: Number(point.latitude ?? point.Latitude),
                longitude: Number(point.longitude ?? point.Longitude),
                timestamp: point.timestamp ?? point.Timestamp
            }))
            .filter((point) =>
                Number.isFinite(point.latitude) &&
                Number.isFinite(point.longitude) &&
                typeof point.timestamp === "string" &&
                point.timestamp.length > 0)
            .slice(-maxStoredFlightPathPoints);

        localStorage.setItem(flightPathStorageKey, JSON.stringify(normalizedPoints));
    };
})();
