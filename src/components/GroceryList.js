import React, { useState, useEffect } from "react";
import axios from "axios";

function GroceryList() {
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState("");
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/meal-plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMealPlans(response.data);
      } catch (error) {
        console.error("Error fetching meal plans:", error);
      }
    };

    fetchMealPlans();
  }, []);

  const generateGroceryList = async () => {
    if (!selectedMealPlan) {
      alert("Please select a meal plan.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://127.0.0.1:8000/grocery-lists/from-meal-plan/${selectedMealPlan}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroceryList(response.data.items);
    } catch (error) {
      console.error("Error generating grocery list:", error);
      alert("Failed to generate grocery list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Grocery List</h1>
      <div>
        <label>Select Meal Plan:</label>
        <select
          value={selectedMealPlan}
          onChange={(e) => setSelectedMealPlan(e.target.value)}
        >
          <option value="" disabled>Select a Meal Plan</option>
          {mealPlans.map((plan) => (
            <option key={plan.meal_plan_id} value={plan.meal_plan_id}>
              {plan.name}
            </option>
          ))}
        </select>
        <button onClick={generateGroceryList} disabled={loading}>
          {loading ? "Generating..." : "Generate Grocery List"}
        </button>
      </div>

      {groceryList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Purchased</th>
            </tr>
          </thead>
          <tbody>
            {groceryList.map((item) => (
              <tr key={item.ingredient_id}>
                <td>{item.ingredient.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit || "N/A"}</td>
                <td>
                  <input type="checkbox" checked={item.purchased} readOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GroceryList;
