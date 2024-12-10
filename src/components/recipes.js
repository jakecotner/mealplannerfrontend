import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/recipes");
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div>
      <h1>Recipes</h1>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.recipe_id}>
            <Link to={`/recipes/${recipe.recipe_id}`}>{recipe.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipeDetail() {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    ingredient_id: "",
    quantity: "",
    optional: false,
    preparation_style: "",
  });
  const [availableIngredients, setAvailableIngredients] = useState([]);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const availableIngredientsResponse = await axios.get(
          "http://127.0.0.1:8000/ingredients"
        );
        const fetchedAvailableIngredients = availableIngredientsResponse.data;
        setAvailableIngredients(fetchedAvailableIngredients);

        const recipeResponse = await axios.get(`http://127.0.0.1:8000/recipes/${recipeId}`);
        setRecipe(recipeResponse.data);

        const ingredientsResponse = await axios.get(
          `http://127.0.0.1:8000/recipe-ingredients/${recipeId}`
        );
        const fetchedIngredients = ingredientsResponse.data.map((ingredient) => {
          const matchedIngredient = fetchedAvailableIngredients.find(
            (ing) => ing.ingredient_id === ingredient.ingredient_id
          );
          return {
            ...ingredient,
            ingredient_name: matchedIngredient?.name || "Unknown",
            unit: matchedIngredient?.unit || "Unknown",
          };
        });
        setIngredients(fetchedIngredients);
      } catch (error) {
        console.error("Error fetching recipe details:", error);
      }
    };

    fetchRecipeDetails();
  }, [recipeId]);

  const addIngredient = async () => {
    try {
      const payload = {
        recipe_id: parseInt(recipeId, 10),
        ingredient_id: parseInt(newIngredient.ingredient_id, 10),
        quantity: parseFloat(newIngredient.quantity),
        optional: newIngredient.optional,
        preparation_style: newIngredient.preparation_style,
      };

      await axios.post("http://127.0.0.1:8000/recipe-ingredients/", payload);

      const matchedIngredient = availableIngredients.find(
        (ing) => ing.ingredient_id === parseInt(newIngredient.ingredient_id, 10)
      );

      setIngredients([
        ...ingredients,
        {
          ...payload,
          ingredient_name: matchedIngredient?.name || "Unknown",
          unit: matchedIngredient?.unit || "Unknown",
        },
      ]);
      setNewIngredient({ ingredient_id: "", quantity: "", optional: false, preparation_style: "" });
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const deleteIngredient = async (ingredientId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/recipe-ingredients/${recipeId}/${ingredientId}`
      );
      setIngredients(ingredients.filter((ing) => ing.ingredient_id !== ingredientId));
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    }
  };

  if (!recipe) return <p>Loading recipe details...</p>;

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h1>{recipe.title}</h1>
        <p><strong>Instructions:</strong> {recipe.instructions}</p>
        <p><strong>Category:</strong> {recipe.category}</p>
        <p><strong>Servings:</strong> {recipe.servings}</p>
        <p><strong>Prep Time:</strong> {recipe.prep_time} minutes</p>
        <p><strong>Cook Time:</strong> {recipe.cook_time} minutes</p>
        <p><strong>Freezing Instructions:</strong> {recipe.freezing_instructions}</p>
        <p><strong>Notes:</strong> {recipe.notes}</p>
        <button>Edit Other Details</button>
      </div>

      <div style={{ flex: 1 }}>
        <h2>Ingredients</h2>
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Preparation Style</th>
              <th>Optional</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.ingredient_id}>
                <td>{ingredient.ingredient_name || "Unknown"}</td>
                <td>{ingredient.quantity}</td>
                <td>{ingredient.unit}</td>
                <td>{ingredient.preparation_style || "None"}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={ingredient.optional}
                    readOnly
                  />
                </td>
                <td>
                  <button onClick={() => deleteIngredient(ingredient.ingredient_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Add Ingredient</h3>
        <div>
          <select
            value={newIngredient.ingredient_id}
            onChange={(e) => setNewIngredient({ ...newIngredient, ingredient_id: e.target.value })}
          >
            <option value="" disabled>Select Ingredient</option>
            {availableIngredients.map((ingredient) => (
              <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                {ingredient.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
          />
          <input
            type="text"
            placeholder="Preparation Style"
            value={newIngredient.preparation_style}
            onChange={(e) =>
              setNewIngredient({ ...newIngredient, preparation_style: e.target.value })
            }
          />
          <label>
            Optional
            <input
              type="checkbox"
              checked={newIngredient.optional}
              onChange={(e) => setNewIngredient({ ...newIngredient, optional: e.target.checked })}
            />
          </label>
          <button onClick={addIngredient}>Add Ingredient</button>
        </div>
      </div>
    </div>
  );
}

export { RecipesPage, RecipeDetail };
