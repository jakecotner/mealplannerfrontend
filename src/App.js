import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Inventory from "./components/inventory";
import Login from "./components/Login";
import { RecipesPage, RecipeDetail } from "./components/recipes";
import MealPlanner from "./components/mealplanner";

function Home() {
  return <h1>Welcome to MealPlannerGPT</h1>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login"); // Redirect to login page
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f4f4f4" }}>
        <div>
          <h1 style={{ margin: 0 }}>MealPlannerGPT</h1>
        </div>
        <nav>
          <ul style={{ display: "flex", listStyle: "none", gap: "15px", margin: 0, padding: 0 }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/recipes">Recipes</Link></li>
            <li><Link to="/meal-plans">Meal Plans</Link></li>
            {!isLoggedIn ? (
              <li><Link to="/login">Log In</Link></li>
            ) : (
              <li>
                <button
                  onClick={handleLogout}
                  style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
        <Route path="/meal-plans" element={<MealPlanner />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
