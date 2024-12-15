import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Used for Sign Up
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const [error, setError] = useState(""); // Display error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        // Sign Up logic
        await axios.post("http://127.0.0.1:8000/signup", {
          username,
          email,
          password,
        });
        alert("Sign-Up successful! Please log in.");
        setIsSignUp(false); // Redirect to login form
      } else {
        // Login logic
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await axios.post("http://127.0.0.1:8000/token", formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const { access_token } = response.data;
        localStorage.setItem("token", access_token);
        alert("Login successful!");
        navigate("/"); // Redirect to home page
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username, email, or password. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {isSignUp && (
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
      </form>
      <p>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(""); // Clear errors when switching forms
          }}
        >
          {isSignUp ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}

export default Login;
