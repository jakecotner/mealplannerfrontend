import React, { useState, useEffect } from "react";
import axios from "axios";

function MealPlanner() {
  const [mealPlan, setMealPlan] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [mealSlots, setMealSlots] = useState({
    Monday: { breakfast: null, lunch: null, dinner: null },
    Tuesday: { breakfast: null, lunch: null, dinner: null },
    Wednesday: { breakfast: null, lunch: null, dinner: null },
    Thursday: { breakfast: null, lunch: null, dinner: null },
    Friday: { breakfast: null, lunch: null, dinner: null },
    Saturday: { breakfast: null, lunch: null, dinner: null },
    Sunday: { breakfast: null, lunch: null, dinner: null },
  });
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [missingItems, setMissingItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipesResponse = await axios.get("http://127.0.0.1:8000/recipes");
        setRecipes(recipesResponse.data);

        const inventoryResponse = await axios.get("http://127.0.0.1:8000/inventory/1"); // Replace '1' with user ID
        setInventory(inventoryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleMealChange = (day, meal, recipeId) => {
    setMealSlots((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: recipeId },
    }));
  };

  const verifyInventory = () => {
    const requiredIngredients = [];
    Object.values(mealSlots).forEach((meals) => {
      Object.values(meals).forEach((recipeId) => {
        if (recipeId) {
          const recipe = recipes.find((r) => r.recipe_id === recipeId);
          if (recipe) {
            requiredIngredients.push(...recipe.ingredients);
          }
        }
      });
    });

    const missing = requiredIngredients.filter((ingredient) => {
      const inventoryItem = inventory.find((i) => i.ingredient_id === ingredient.ingredient_id);
      return !inventoryItem || inventoryItem.quantity < ingredient.quantity;
    });

    setMissingItems(missing);
  };

  const saveMealPlan = async () => {
    try {
      const mealPlanResponse = await axios.post("http://127.0.0.1:8000/meal-plans", mealPlan);
      const mealPlanId = mealPlanResponse.data.meal_plan_id;

      const mealPlanRecipes = [];
      Object.entries(mealSlots).forEach(([day, meals]) => {
        Object.entries(meals).forEach(([meal, recipeId]) => {
          if (recipeId) {
            mealPlanRecipes.push({
              meal_plan_id: mealPlanId,
              recipe_id: recipeId,
              meal,
              day_of_week: day,
              date: null, // Calculate date based on startDate
            });
          }
        });
      });

      await axios.post("http://127.0.0.1:8000/meal-plan-recipes", mealPlanRecipes);
      alert("Meal plan saved successfully!");
    } catch (error) {
      console.error("Error saving meal plan:", error);
    }
  };

  return (
    <div>
      <h1>Meal Planner</h1>
      <div>
        <label>
          Plan Name:
          <input
            type="text"
            value={mealPlan.name}
            onChange={(e) => setMealPlan({ ...mealPlan, name: e.target.value })}
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            value={mealPlan.startDate}
            onChange={(e) => setMealPlan({ ...mealPlan, startDate: e.target.value })}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={mealPlan.endDate}
            onChange={(e) => setMealPlan({ ...mealPlan, endDate: e.target.value })}
          />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(mealSlots).map(([day, meals]) => (
            <tr key={day}>
              <td>{day}</td>
              {["breakfast", "lunch", "dinner"].map((meal) => (
                <td key={meal}>
                  <select
                    value={meals[meal] || ""}
                    onChange={(e) => handleMealChange(day, meal, parseInt(e.target.value, 10))}
                  >
                    <option value="" disabled>Select Recipe</option>
                    {recipes.map((recipe) => (
                      <option key={recipe.recipe_id} value={recipe.recipe_id}>
                        {recipe.title}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={verifyInventory}>Verify Inventory</button>
      {missingItems.length > 0 && (
        <div>
          <h3>Missing Ingredients</h3>
          <ul>
            {missingItems.map((item) => (
              <li key={item.ingredient_id}>
                {item.name}: {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={saveMealPlan}>Save Meal Plan</button>
    </div>
  );
}

export default MealPlanner;
