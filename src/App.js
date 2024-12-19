import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Inventory from "./components/inventory";
import Login from "./components/Login";
import { RecipesPage, RecipeDetail } from './components/recipes';
import MealPlanner from "./components/mealplanner";
import Ingredients from "./components/Ingredients";
import RecipeGenerator from "./components/RecipeGenerator";
import GroceryList from "./components/GroceryList"; // Import GroceryList
import axios from "axios";



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f4f4f4" }}>
        <div>
          <h1 style={{ margin: 0 }}>MealPlannerGPT</h1>
        </div>
        <nav>
          <ul style={{ display: "flex", listStyle: "none", gap: "15px", margin: 0, padding: 0 }}>
            <li><Link to="/">AI Recipe Generator</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/recipes">Recipes</Link></li>
            <li><Link to="/meal-plans">Meal Plans</Link></li>
            <li><Link to="/ingredients">Ingredients</Link></li>
            <li><Link to="/grocery-list">Grocery List</Link></li> {/* New navigation link */}
            {!isLoggedIn ? (
              <li><Link to="/login">Log In</Link></li>
            ) : (
              <li style={{ position: "relative" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "blue",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={(e) => {
                    const dropdown = e.target.nextSibling;
                    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
                  }}
                >
                  {currentUser?.username || "User"}
                </button>
                <ul
                  style={{
                    display: "none",
                    position: "absolute",
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    listStyle: "none",
                    padding: "10px",
                    margin: 0,
                    zIndex: 1000,
                  }}
                >
                  <li><Link to="/profile">Profile</Link></li>
                  <li><Link to="/settings">Settings</Link></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      style={{
                        background: "none",
                        border: "none",
                        color: "blue",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<RecipeGenerator />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
        <Route path="/meal-plans" element={<MealPlanner />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/grocery-list" element={<GroceryList />} /> {/* New route for Grocery List */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Routes>
    </div>
  );
}

export default App;
