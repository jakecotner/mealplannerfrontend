import React, { useEffect, useState } from "react";
import axios from "axios";

// RecipesPage Component
const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/recipes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError("Failed to fetch recipes. Please log in and try again.");
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeClick = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://127.0.0.1:8000/recipes/${recipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedRecipe(response.data);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: 1,
          borderRight: "1px solid #ccc",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <h2>My Recipes</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {recipes.map((recipe) => (
          <div
            key={recipe.recipe_id}
            style={{
              padding: "10px",
              margin: "10px 0",
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: selectedRecipe?.recipe_id === recipe.recipe_id ? "#f0f0f0" : "#fff",
            }}
            onClick={() => handleRecipeClick(recipe.recipe_id)}
          >
            <h3>{recipe.title}</h3>
            <p>{recipe.category || "Uncategorized"}</p>
          </div>
        ))}
      </div>

      <div style={{ flex: 3, padding: "20px", overflowY: "auto" }}>
        {selectedRecipe ? (
          <RecipeDetail recipe={selectedRecipe} />
        ) : (
          <p>Select a recipe to view details.</p>
        )}
      </div>
    </div>
  );
};

// RecipeDetail Component
const RecipeDetail = ({ recipe }) => (
  <div>
    <h1>{recipe.title}</h1>
    <p><strong>Category:</strong> {recipe.category}</p>
    <p><strong>Servings:</strong> {recipe.servings}</p>
    <p><strong>Prep Time:</strong> {recipe.prep_time} minutes</p>
    <p><strong>Cook Time:</strong> {recipe.cook_time} minutes</p>
    <h2>Instructions</h2>
    <p>{recipe.instructions}</p>
    <h2>Notes</h2>
    <p>{recipe.notes || "No notes available."}</p>
  </div>
);

// Export both components
export { RecipesPage, RecipeDetail };
