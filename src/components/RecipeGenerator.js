import React, { useState } from "react";
import axios from "axios";

function Home() {
  const [preferences, setPreferences] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/recipes/auto-generate/",
        null, // No body needed, preferences are sent as a query parameter
        {
          params: { preferences },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGeneratedRecipe(response.data); // Set the recipe data in state
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to MealPlannerGPT</h1>
      <div>
        <h2>Generate a Recipe</h2>
        <input
          type="text"
          placeholder="Enter your preferences (e.g., vegan, gluten-free)"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <button onClick={handleGenerateRecipe} disabled={loading}>
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {generatedRecipe && (
        <div style={{ marginTop: "20px" }}>
          <h2>{generatedRecipe.title}</h2>
          <p><strong>Category:</strong> {generatedRecipe.category}</p>
          <p><strong>Servings:</strong> {generatedRecipe.servings}</p>
          <p><strong>Instructions:</strong></p>
          <p>{generatedRecipe.instructions}</p>
          <h3>Ingredients:</h3>
          <ul>
            {generatedRecipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
