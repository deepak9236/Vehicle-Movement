import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn.pixabay.com/photo/2013/07/12/11/58/car-145008_1280.png',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

const center = [17.385044, 78.486671];

function Map({ vehicleData }) {
  const initialPosition = vehicleData.length > 0 ? [vehicleData[0].latitude, vehicleData[0].longitude] : center;
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (vehicleData.length > 0) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < vehicleData.length) {
          setCurrentPosition([vehicleData[index].latitude, vehicleData[index].longitude]);
          setPathCoordinates(vehicleData.slice(0, index + 1).map(point => [point.latitude, point.longitude]));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [vehicleData]);

  useEffect(() => {
    if (destination) {
      const moveInterval = setInterval(() => {
        const [currentLat, currentLng] = currentPosition;
        const [destLat, destLng] = destination;

        if (Math.abs(currentLat - destLat) < 0.0001 && Math.abs(currentLng - destLng) < 0.0001) {
          clearInterval(moveInterval);
          setDestination(null);
        } else {
          const newLat = currentLat + (destLat - currentLat) * 0.01;
          const newLng = currentLng + (destLng - currentLng) * 0.01;
          setCurrentPosition([newLat, newLng]);
          setPathCoordinates(coords => [...coords, [newLat, newLng]]);
        }
      }, 1000);

      return () => clearInterval(moveInterval);
    }
  }, [destination, currentPosition]);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setDestination([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  }

  return (
    <MapContainer center={center} zoom={50} style={{ width: '1000px', height: '600px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClickHandler />
      {pathCoordinates.length > 0 && (
        <>
          <Marker position={currentPosition} icon={vehicleIcon} />
          <Polyline positions={pathCoordinates} color="red" />
        </>
      )}
    </MapContainer>
  );
}

export default Map;
