import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLocation } from './locationService';
import './MapComponent.css';
import { FaLocationCrosshairs } from "react-icons/fa6";
import { FaExchangeAlt } from "react-icons/fa";
import L from 'leaflet';
import axios from 'axios';
import { getDistance } from 'geolib';

const CustomMarkerIcon = L.icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const MapViewSetter = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 13);
        }
    }, [position, map]);

    return null;
};

const MapComponent = () => {
    const [position, setPosition] = useState([51.505, -0.09]);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [destinationPosition, setDestinationPosition] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [destinationQuery, setDestinationQuery] = useState('');
    const [route, setRoute] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
            setMarkerPosition([latitude, longitude]);
            setRoute([[latitude, longitude]]);
        });

        const watchId = navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
            setMarkerPosition([latitude, longitude]);
            setRoute((prevRoute) => [...prevRoute, [latitude, longitude]]);
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const handleSearch = async () => {
        const location = await fetchLocation(searchQuery);
        if (location) {
            setMarkerPosition([location.latitude, location.longitude]);
            setPosition([location.latitude, location.longitude]);
            setRoute([[location.latitude, location.longitude]]);
        }
    };

    const handleDestination = async () => {
        const location = await fetchLocation(destinationQuery);
        if (location) {
            const destination = [location.latitude, location.longitude];
            setDestinationPosition(destination);
            setRoute((prevRoute) => [...prevRoute, destination]);

            const distance = getDistance(
                { latitude: position[0], longitude: position[1] },
                { latitude: location.latitude, longitude: location.longitude }
            );

            alert(`Estimated Travel Distance: ${(distance / 1000).toFixed(2)} km`);
            fetchRoute(position, destination);
        }
    };

    const fetchRoute = async (start, end) => {
        const startCoords = `${start[1]},${start[0]}`;
        const endCoords = `${end[1]},${end[0]}`;
        const apiKey = '5b3ce3597851110001cf62486fbe35c5534a4bada1758c2f22a9bebb';

        try {
            const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
                params: {
                    api_key: apiKey,
                    start: startCoords,
                    end: endCoords
                },
            });
        } catch (error) {
            alert('Error fetching route. Please try again.');
        }
    };

    const handleCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            const currentPosition = [latitude, longitude];
            setPosition(currentPosition);
            setMarkerPosition(currentPosition);
            setRoute((prevRoute) => [...prevRoute, currentPosition]);
        });
    };

    const handleSwapLocations = () => {
        if (markerPosition && destinationPosition) {
            // Swap positions
            const tempMarkerPosition = markerPosition;
            setMarkerPosition(destinationPosition);
            setDestinationPosition(tempMarkerPosition);

            // Swap input values
            const tempSearchQuery = searchQuery;
            setSearchQuery(destinationQuery);
            setDestinationQuery(tempSearchQuery);

            // Calculate distance after swapping
            const newDistance = getDistance(
                { latitude: destinationPosition[0], longitude: destinationPosition[1] },
                { latitude: tempMarkerPosition[0], longitude: tempMarkerPosition[1] }
            );

            alert(`Estimated Travel Distance: ${(newDistance / 1000).toFixed(2)} km`);

            // Update the route
            setRoute((prevRoute) => [
                ...prevRoute.slice(0, -1), // Remove the last point (previous destination)
                destinationPosition, // Add the new destination
                tempMarkerPosition // Add the new current position
            ]);
        }
    };

    return (
        <div className="container">
            <div className="input-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Your location"
                />
                <button onClick={handleSearch}>Set Location</button>
                <button onClick={handleSwapLocations} title="Swap Locations">
                    <FaExchangeAlt size={15} />
                </button>
                <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="Choose destination"
                />
                <button onClick={handleDestination}>Set Destination</button>
                <button onClick={handleCurrentLocation} title="Current Location">
                    <FaLocationCrosshairs size={15} />
                </button>
            </div>
            <MapContainer center={position} zoom={13} className="map">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapViewSetter position={markerPosition} />
                {markerPosition && (
                    <Marker position={markerPosition} icon={CustomMarkerIcon}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}
                {destinationPosition && (
                    <Marker position={destinationPosition} icon={CustomMarkerIcon}>
                        <Popup>Destination</Popup>
                    </Marker>
                )}
                {route.length > 0 && <Polyline positions={route} color="blue" />}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
