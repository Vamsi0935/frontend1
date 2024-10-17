import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLocation } from './locationService';
import './MapComponent.css';
import { FaLocationCrosshairs } from "react-icons/fa6";
import L from 'leaflet';

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
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
            setMarkerPosition([latitude, longitude]);
        });
    }, []);

    const handleSearch = async () => {
        const location = await fetchLocation(searchQuery);
        if (location) {
            setMarkerPosition([location.latitude, location.longitude]);
            setPosition([location.latitude, location.longitude]);
        }
    };

    const handleCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            const currentPosition = [latitude, longitude];
            setPosition(currentPosition);
            setMarkerPosition(currentPosition);
        });
    };

    return (
        <div className="container">
            <div className="input-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search location"
                />
                <button onClick={handleSearch}>Search</button>
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
                        <Popup>
                            You are here <FaLocationCrosshairs />
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
