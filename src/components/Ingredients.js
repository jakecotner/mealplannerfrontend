import React, { useEffect, useState } from "react";
import axios from "axios";

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "",
    gluten_free: false,
    gluten_friendly: false,
    category: "",
    calories_per_unit: "",
    allergens: "",
    seasonal: false,
  });

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/ingredients/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
          },
        });
        setIngredients(response.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/ingredients/", newIngredient, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIngredients([...ingredients, response.data]);
      setNewIngredient({
        name: "",
        unit: "",
        gluten_free: false,
        gluten_friendly: false,
        category: "",
        calories_per_unit: "",
        allergens: "",
        seasonal: false,
      });
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  if (loading) {
    return <p>Loading ingredients...</p>;
  }

  return (
    <div>
      <h1>Ingredients</h1>
      <form onSubmit={handleAddIngredient}>
        <input
          type="text"
          placeholder="Name"
          value={newIngredient.name}
          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Unit"
          value={newIngredient.unit}
          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newIngredient.category}
          onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
        />
        <input
          type="number"
          placeholder="Calories per Unit"
          value={newIngredient.calories_per_unit}
          onChange={(e) =>
            setNewIngredient({ ...newIngredient, calories_per_unit: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Allergens"
          value={newIngredient.allergens}
          onChange={(e) => setNewIngredient({ ...newIngredient, allergens: e.target.value })}
        />
        <label>
          Gluten-Free:
          <input
            type="checkbox"
            checked={newIngredient.gluten_free}
            onChange={(e) => setNewIngredient({ ...newIngredient, gluten_free: e.target.checked })}
          />
        </label>
        <label>
          Gluten-Friendly:
          <input
            type="checkbox"
            checked={newIngredient.gluten_friendly}
            onChange={(e) =>
              setNewIngredient({ ...newIngredient, gluten_friendly: e.target.checked })
            }
          />
        </label>
        <label>
          Seasonal:
          <input
            type="checkbox"
            checked={newIngredient.seasonal}
            onChange={(e) => setNewIngredient({ ...newIngredient, seasonal: e.target.checked })}
          />
        </label>
        <button type="submit">Add Ingredient</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Calories per Unit</th>
            <th>Allergens</th>
            <th>Gluten-Free</th>
            <th>Seasonal</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient.ingredient_id}>
              <td>{ingredient.name}</td>
              <td>{ingredient.unit}</td>
              <td>{ingredient.category}</td>
              <td>{ingredient.calories_per_unit}</td>
              <td>{ingredient.allergens}</td>
              <td>{ingredient.gluten_free ? "Yes" : "No"}</td>
              <td>{ingredient.seasonal ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ingredients;
