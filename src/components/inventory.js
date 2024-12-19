import React, { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedQuantity, setUpdatedQuantity] = useState(0);
  const [newItem, setNewItem] = useState({
    ingredient_id: "",
    quantity: 0,
    unit: "",
    preferred_store: "",
    link_to_purchase: "",
    expiry_date: "",
    location: "",
    quantity_threshold: 0,
    notes: "",
  });

  // Fetch data (inventory and ingredients) on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in.");

        // Fetch user-specific ingredients
        const ingredientsResponse = await axios.get("http://127.0.0.1:8000/ingredients/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIngredients(ingredientsResponse.data);

        // Fetch inventory
        const inventoryResponse = await axios.get("http://127.0.0.1:8000/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Merge unit data from ingredients into inventory
        const inventoryWithUnits = inventoryResponse.data.map((item) => {
          const ingredient = ingredientsResponse.data.find(
            (ing) => ing.ingredient_id === item.ingredient_id
          );
          return {
            ...item,
            unit: ingredient?.unit || "N/A",
          };
        });
        setInventory(inventoryWithUnits);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Delete an item
  const deleteItem = async (ingredientId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/inventory/${ingredientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(inventory.filter((item) => item.ingredient_id !== ingredientId));
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  // Start editing an item
  const handleEdit = (item) => {
    setEditingItem(item);
    setUpdatedQuantity(item.quantity);
  };

  // Save edited item
  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { quantity: updatedQuantity };

      const response = await axios.put(
        `http://127.0.0.1:8000/inventory/${editingItem.ingredient_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInventory(
        inventory.map((item) =>
          item.ingredient_id === editingItem.ingredient_id ? response.data : item
        )
      );
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error.message);
    }
  };

  // Add a new item
  const addItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ingredient_id: parseInt(newItem.ingredient_id, 10),
        quantity: parseFloat(newItem.quantity),
        preferred_store: newItem.preferred_store || null,
        link_to_purchase: newItem.link_to_purchase || null,
        expiry_date: newItem.expiry_date || null,
        location: newItem.location || null,
        quantity_threshold: parseFloat(newItem.quantity_threshold) || null,
        notes: newItem.notes || null,
      };

      const response = await axios.post("http://127.0.0.1:8000/inventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInventory([...inventory, response.data]);
      setNewItem({
        ingredient_id: "",
        quantity: 0,
        unit: "",
        preferred_store: "",
        link_to_purchase: "",
        expiry_date: "",
        location: "",
        quantity_threshold: 0,
        notes: "",
      });
    } catch (error) {
      console.error("Error adding item:", error.message);
    }
  };

  if (loading) {
    return <p>Loading inventory...</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Add Item Form */}
        <div style={{ flex: 1 }}>
          <h2>Add Item</h2>
          <form onSubmit={addItem} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <select
              value={newItem.ingredient_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedIngredient = ingredients.find(
                  (ing) => parseInt(ing.ingredient_id, 10) === parseInt(selectedId, 10)
                );
                setNewItem({
                  ...newItem,
                  ingredient_id: selectedId,
                  unit: selectedIngredient?.unit || "",
                });
              }}
              required
            >
              <option value="" disabled>
                Select Ingredient
              </option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
              required
            />
            <input
              type="text"
              placeholder="Unit"
              value={newItem.unit}
              readOnly
            />
            <input
              type="text"
              placeholder="Preferred Store"
              value={newItem.preferred_store}
              onChange={(e) => setNewItem({ ...newItem, preferred_store: e.target.value })}
            />
            <input
              type="date"
              placeholder="Expiry Date"
              value={newItem.expiry_date}
              onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            />
            <button type="submit">Add Item</button>
          </form>
        </div>

        {/* Inventory Table */}
        <div style={{ flex: 2 }}>
          <h2>Inventory</h2>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.ingredient_id}>
                  <td>{item.ingredient_name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>
                    {editingItem && editingItem.ingredient_id === item.ingredient_id ? (
                      <button onClick={saveEdit}>Save</button>
                    ) : (
                      <button onClick={() => handleEdit(item)}>Edit</button>
                    )}
                    <button onClick={() => deleteItem(item.ingredient_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
