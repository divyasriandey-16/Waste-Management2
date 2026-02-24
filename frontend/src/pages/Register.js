import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("receiver");


  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/register", {
  name,
  email,
  password,
  role
});


    alert("Registered successfully");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />
        <select
  value={role}
  onChange={(e) => setRole(e.target.value)}
>
  <option value="receiver">Receiver</option>
  <option value="donor">Donor</option>
</select>
<br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
