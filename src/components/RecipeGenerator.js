import React, { useState } from "react";
import axios from "axios";

function RecipeGenerator() {
  const [preferences, setPreferences] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Function to generate a recipe
  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/recipes/generate/",
        null,
        {
          params: {
            preferences: `Please create a recipe based on this prompt: ${preferences}`,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setGeneratedRecipe({
          ...response.data,
          recipe_id: response.data.recipe_id || null, // Ensure recipe_id is present
        });
      } else {
        throw new Error("No recipe was generated. Please try again.");
      }
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError(
        err.response?.data?.detail || "Failed to generate recipe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to save the recipe
  const handleSaveRecipe = async () => {
    if (!generatedRecipe || !generatedRecipe.recipe_id) {
      setError("No recipe to save. Please generate a recipe first.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }

      const payload = {
        recipe_id: generatedRecipe.recipe_id,
        ingredients: generatedRecipe.ingredients,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/recipes/save/ingredients/",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message) {
        alert("Recipe and ingredients saved successfully!");
      } else {
        throw new Error("Failed to save recipe. Server did not respond properly.");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      setError(
        error.response?.data?.detail ||
          "Failed to save recipe. Please ensure all fields are valid."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", padding: "20px" }}>
      {/* Input Area */}
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h2>Generate a Recipe</h2>
        <textarea
          placeholder="What type of meal would you like? (e.g., gluten-free, spicy chicken curry, vegan pasta)"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            height: "150px",
            resize: "none",
            fontSize: "16px",
            padding: "10px",
          }}
        />
        <button
          onClick={handleGenerateRecipe}
          disabled={loading || !preferences.trim()}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </div>

      {/* Output Area */}
      <div style={{ flex: 2, borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        {generatedRecipe ? (
          <div>
            <h2>{generatedRecipe.title}</h2>
            <p>
              <strong>Category:</strong> {generatedRecipe.category}
            </p>
            <p>
              <strong>Servings:</strong> {generatedRecipe.servings}
            </p>
            <p>
              <strong>Prep Time:</strong> {generatedRecipe.prep_time} minutes
            </p>
            <p>
              <strong>Cook Time:</strong> {generatedRecipe.cook_time} minutes
            </p>
            <p>
              <strong>Instructions:</strong>
            </p>
            <p>{generatedRecipe.instructions}</p>

            <h3>Ingredients:</h3>
            <ul>
              {generatedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSaveRecipe}
              disabled={saving}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Recipe"}
            </button>
          </div>
        ) : (
          <p>No recipe generated yet. Enter preferences and click 'Generate Recipe'.</p>
        )}
      </div>
    </div>
  );
}

export default RecipeGenerator;
