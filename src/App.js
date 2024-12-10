import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { RecipesPage, RecipeDetail } from "./components/recipes";

import Inventory from "./components/inventory";
import Recipes from "./components/recipes";
import MealPlanner from "./components/mealplanner";



// Placeholder components for other sections
function Home() {
  return <h1>Home Page</h1>;
}

function MealPlans() {
  return <h1>Meal Plans</h1>;
}

function GroceryLists() {
  return <h1>Grocery Lists</h1>;
}

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/recipes">Recipes</Link></li>
          <li><Link to="/meal-plans">Meal Plans</Link></li>
          <li><Link to="/grocery-lists">Grocery Lists</Link></li>
        </ul>
      </nav>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
          <Route path="/meal-plans" element={<MealPlanner />} />

          <Route path="/grocery-lists" element={<GroceryLists />} />




      </Routes>
    </Router>
  );
}

export default App;
