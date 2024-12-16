import React, { useState, useEffect } from "react";
import axios from "axios";

function MealPlanner() {
  const [mealPlan, setMealPlan] = useState({
    name: "",
    weekOf: "",
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
  const [weekOptions, setWeekOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve token from local storage (or wherever it's stored)
        const token = localStorage.getItem("token");

        const recipesResponse = await axios.get("http://127.0.0.1:8000/recipes", {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the request
          },
        });

        setRecipes(recipesResponse.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const generateWeekOptions = () => {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const options = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startOfWeek);
        weekStart.setDate(weekStart.getDate() + i * 7);
        options.push(weekStart.toISOString().split("T")[0]);
      }
      setWeekOptions(options);
    };
    generateWeekOptions();
  }, []);

  const handleMealChange = (day, meal, recipeId) => {
    setMealSlots((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: recipeId },
    }));
  };

  const saveMealPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id"); // Ensure this is set during login

      if (!userId) {
        console.error("User ID not found. Ensure you are logged in.");
        return;
      }

      const payload = {
        user_id: parseInt(userId, 10),
        name: mealPlan.name,
        week_of: mealPlan.weekOf, // Ensure this is in "YYYY-MM-DD" format
      };

      console.log("Payload being sent to backend:", payload); // Debugging

      const mealPlanResponse = await axios.post(
        "http://127.0.0.1:8000/meal-plans",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
            });
          }
        });
      });

      console.log("MealPlanRecipes payload:", mealPlanRecipes); // Debugging

      await axios.post("http://127.0.0.1:8000/meal-plan-recipes", mealPlanRecipes, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
          Week Of:
          <select
            value={mealPlan.weekOf}
            onChange={(e) => setMealPlan({ ...mealPlan, weekOf: e.target.value })}
          >
            <option value="" disabled>
              Select Week
            </option>
            {weekOptions.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>
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
                    <option value="" disabled>
                      Select Recipe
                    </option>
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
      <button onClick={saveMealPlan}>Save Meal Plan</button>
    </div>
  );
}

export default MealPlanner;
