import React, { useState } from "react";
import axios from "axios";

function RecipeGenerator() {
  const [preferences, setPreferences] = useState(""); // User input for preferences
  const [generatedRecipe, setGeneratedRecipe] = useState(null); // Holds the generated recipe
  const [loading, setLoading] = useState(false); // Loading state for recipe generation
  const [saving, setSaving] = useState(false); // Loading state for saving
  const [error, setError] = useState(""); // Error messages

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
        "http://127.0.0.1:8000/api/v1/recipes/generate/", // Corrected URL
        null,
        {
          params: { preferences }, // Send preferences as query params
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGeneratedRecipe(response.data); // Store the generated recipe
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to generate recipe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Combined Function to Save Recipe Details and Ingredients
  const handleSaveRecipe = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }

      // Step 1: Save Recipe Details
      const recipeDetailsResponse = await axios.post(
        "http://127.0.0.1:8000/api/v1/recipes/save/details/",
        {
          title: generatedRecipe.title,
          instructions: generatedRecipe.instructions,
          category: generatedRecipe.category || "General",
          servings: generatedRecipe.servings,
          prep_time: generatedRecipe.prep_time,
          cook_time: generatedRecipe.cook_time,
          notes: "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const recipeId = recipeDetailsResponse.data.recipe_id;

      // Step 2: Save Recipe Ingredients
      const ingredientPayload = generatedRecipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        optional: false,
        preparation_style: "",
      }));

      console.log("Payload being sent:", { recipe_id: recipeId, ingredients: ingredientPayload }); // Debug

      await axios.post(
        "http://127.0.0.1:8000/api/v1/recipes/save/ingredients/", // Correct URL
        { recipe_id: recipeId, ingredients: ingredientPayload }, // Both fields in the body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Recipe and ingredients saved successfully!");
    } catch (err) {
      console.error("Error saving recipe:", err);
      setError("Failed to save the recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", padding: "20px" }}>
      {/* Input Area - Left */}
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

      {/* Output Area - Right */}
      <div style={{ flex: 2, borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
        {error && (
          <div style={{ color: "red" }}>
            {typeof error === "string"
              ? error
              : Array.isArray(error)
              ? error.map((err, idx) => (
                  <p key={idx}>{err.msg || JSON.stringify(err)}</p>
                ))
              : typeof error === "object"
              ? <p>{JSON.stringify(error)}</p>
              : <p>{error}</p>}
          </div>
        )}

        {generatedRecipe ? (
          <div>
            <h2>{generatedRecipe.title}</h2>
            <p><strong>Category:</strong> {generatedRecipe.category}</p>
            <p><strong>Servings:</strong> {generatedRecipe.servings}</p>
            <p><strong>Prep Time:</strong> {generatedRecipe.prep_time} minutes</p>
            <p><strong>Cook Time:</strong> {generatedRecipe.cook_time} minutes</p>
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
            {/* Save Button */}
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
