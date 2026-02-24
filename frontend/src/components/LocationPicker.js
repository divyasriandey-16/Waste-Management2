import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

function LocationMarker({ setCoords }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoords(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function LocationPicker({ setCoords }) {
  return (
    <MapContainer
      center={[17.385, 78.4867]}
      zoom={12}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setCoords={setCoords} />
    </MapContainer>
  );
}

export default LocationPicker;
