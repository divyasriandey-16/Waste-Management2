import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaHome, FaUtensils } from "react-icons/fa";

import FoodMap from "../components/FoodMap";
import LocationPicker from "../components/LocationPicker";
import ChatBox from "../components/ChatBox";

function Dashboard() {
  const [foods, setFoods] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [receiverOtp, setReceiverOtp] = useState({});
  const [enteredOtp, setEnteredOtp] = useState({});
  const [foodImageMap, setFoodImageMap] = useState({});
  const [coords, setCoords] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const userId = user?.id;

  const socketRef = useRef(null);
  const postFoodRef = useRef(null);
  const marketplaceRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const foodImages = [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
    "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg",
    "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg",
  ];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return "N/A";
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const getExpiryTime = () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 45 * 60000);
    return expiry.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchFoods = async () => {
    const res = await axios.get("http://localhost:5000/api/food");
    setFoods(res.data);
    

    const imgMap = {};
    res.data.forEach((food) => {
      imgMap[food._id] =
        foodImages[Math.floor(Math.random() * foodImages.length)];
    });
    setFoodImageMap(imgMap);
     setLoading(false);
  };

  useEffect(() => {
    fetchFoods();
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("foodUpdated", () => {
  fetchFoods();
});

    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    return () => socketRef.current.disconnect();
  }, []);

  const postFood = async (e) => {
    e.preventDefault();
    if (!coords) return alert("Select location on map");

    await axios.post("http://localhost:5000/api/food", {
      foodName,
      quantity,
      location,
      latitude: coords.lat,
      longitude: coords.lng,
      postedBy: userId,
    });

    setFoodName("");
    setQuantity("");
    setLocation("");
    setCoords(null);
    fetchFoods();
  };

  const requestFood = async (foodId) => {
    const res = await axios.post(
      `http://localhost:5000/api/food/request/${foodId}`,
      { userId }
    );

    setReceiverOtp((prev) => ({
      ...prev,
      [foodId]: res.data.otp,
    }));

    setTimeout(fetchFoods, 200);
  };

  const collectFood = async (foodId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/food/collect/${foodId}`,
        { otp: enteredOtp[foodId] }
      );

      setEnteredOtp((prev) => ({
        ...prev,
        [foodId]: "",
      }));

      fetchFoods();
    } catch {
      alert("Invalid OTP");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const getStatusStyle = (status) => {
  if (status === "available") return "bg-success";
  if (status === "requested") return "bg-warning";
  return "bg-danger";
};
const filteredFoods =
  filter === "all"
    ? foods
    : foods.filter((f) => f.status === filter);

const sortedFoods = userLocation
  ? [...filteredFoods].sort((a, b) =>
      calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude
      ) -
      calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude
      )
    )
  : filteredFoods;

  return (
    <div className="d-flex">
      {/* SIDEBAR */}
      <div
        style={{
          width: "240px",
          height: "100vh",
          background: "#111827",
          color: "white",
          padding: "25px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h4 style={{ color: "#ff4d4d" }}>🍴 SmartShare</h4>

          <div style={{ marginTop: "40px" }}>
            <div
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
              onClick={() => scrollToSection(marketplaceRef)}
            >
              <FaHome /> Dashboard
            </div>

            {userRole === "donor" && (
              <div
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
                onClick={() => scrollToSection(postFoodRef)}
              >
                <FaUtensils /> Post Food
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#ff4d4d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontWeight: "bold",
            }}
          >
            {userRole?.charAt(0).toUpperCase()}
          </div>
          <small>{userRole}</small>
        </div>
      </div>

      {/* MAIN */}
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between">
          <h2>Welcome, {userRole}</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* IMPACT SECTION */}
       {/* IMPACT SECTION */}
<div className="row my-4">

  <div className="col-md-3">
    <div className="card p-3 shadow-sm">
      <h6>Total Meals Saved</h6>
      <h3>{foods.filter(f => f.status === "collected").length}</h3>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow-sm">
      <h6>Active Requests</h6>
      <h3>{foods.filter(f => f.status === "requested").length}</h3>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow-sm">
      <h6>Available Meals</h6>
      <h3>{foods.filter(f => f.status === "available").length}</h3>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow-sm">
      <h6>Nearby Donors (Under 5km)</h6>
      <h3>
        {
          foods.filter(f =>
            userLocation &&
            calculateDistance(
              userLocation.lat,
              userLocation.lng,
              f.latitude,
              f.longitude
            ) < 5
          ).length
        }
      </h3>
    </div>
  </div>

</div>
        {/* DONOR POST */}
        {userRole === "donor" && (
          <div ref={postFoodRef} className="card p-4 shadow mb-4">
            <h4>Post Food</h4>
            <form onSubmit={postFood}>
              <input className="form-control mb-2"
                placeholder="Food name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
              <input className="form-control mb-2"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <input className="form-control mb-2"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <LocationPicker setCoords={setCoords} />
              <button className="btn btn-primary mt-2">Post Food</button>
            </form>
          </div>
        )}

        {/* RECEIVER MAP */}
        {userRole === "receiver" && (
          <>
            <h4>📍 Nearby Food Map</h4>
            <FoodMap foods={foods} userLocation={userLocation} />
          </>
        )}

        <h3 ref={marketplaceRef}>Food Marketplace</h3>
        <div className="mb-3">
  <select
    className="form-select"
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
  >
    <option value="all">All</option>
    <option value="available">Available</option>
    <option value="requested">Requested</option>
    <option value="collected">Collected</option>
  </select>
</div>

        <div className="row">
         {sortedFoods.map((food) => (
            <div className="col-md-4 mb-4" key={food._id}>
              <div className="card p-3 shadow-sm">

                <img
                  src={foodImageMap[food._id]}
                  alt="food"
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />

                <h4 className="mt-2">{food.foodName}</h4>
                <p>📍 {food.location}</p>

                {userLocation && (
                  <p>
                    📏 {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      food.latitude,
                      food.longitude
                    )} km away
                  </p>
                )}

                <p style={{ color: "red" }}>
                  ⏳ Expires by {getExpiryTime()}
                </p>
<span className={`badge ${getStatusStyle(food.status)} mt-2`}>
  {food.status}
</span>

                {userRole === "receiver" && food.status === "available" && (
                  <button
                    className="btn btn-danger w-100 mt-2"
                    onClick={() => requestFood(food._id)}
                  >
                    Request Food
                  </button>
                )}

                {userRole === "receiver" &&
  food.requestedBy === userId &&
  food.otp && (
    <div className="alert alert-success mt-2">
      OTP: <b>{food.otp}</b>
    </div>
)}

                {userRole === "donor" && food.status === "requested" && (
                  <>
                    <input
                      className="form-control mt-2"
                      placeholder="Enter OTP"
                      value={enteredOtp[food._id] || ""}
                      onChange={(e) =>
                        setEnteredOtp({
                          ...enteredOtp,
                          [food._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="btn btn-success w-100 mt-2"
                      onClick={() => collectFood(food._id)}
                    >
                      Verify & Collect
                    </button>
                  </>
                )}

                {food.status === "requested" && (
                  <button
                    className="btn btn-outline-primary w-100 mt-2"
                    onClick={() => setActiveChat(food._id)}
                  >
                    💬 Contact Donor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeChat && (
        <div style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: "400px",
          height: "100vh",
          background: "white",
          boxShadow: "-5px 0 25px rgba(0,0,0,0.15)",
          padding: "20px"
        }}>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => setActiveChat(null)}
          >
            Close
          </button>

          <ChatBox
            socket={socketRef.current}
            roomId={activeChat}
            userRole={userRole}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;