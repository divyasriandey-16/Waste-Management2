import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// fix marker icons (leaflet issue)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FoodMap({ foods }) {
  return (
    <MapContainer
      center={
  foods.length > 0 && foods[0].latitude
    ? [foods[0].latitude, foods[0].longitude]
    : [17.385, 78.4867]
}

      zoom={12}
      style={{ height: "400px", width: "100%", borderRadius: "15px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {foods.map((food, index) => (
        <Marker
          key={food._id}
          position={[
  food.latitude || 17.385,
  food.longitude || 78.4867,
]}

        >
          <Popup>
            <h5>{food.foodName}</h5>
            <p>{food.location}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default FoodMap;
