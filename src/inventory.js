import React, { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [ingredients, setIngredients] = useState([]); // List of valid ingredients
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedQuantity, setUpdatedQuantity] = useState(0);
  const [newItem, setNewItem] = useState({ ingredient_id: "", quantity: 0, unit: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryResponse = await axios.get("http://127.0.0.1:8000/inventory/1"); // Replace "1" with the user ID
        setInventory(inventoryResponse.data);

        const ingredientsResponse = await axios.get("http://127.0.0.1:8000/ingredients"); // Fetch valid ingredients
        setIngredients(ingredientsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteItem = async (ingredientId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/inventory/1/${ingredientId}`); // Replace "1" with the user ID
      setInventory(inventory.filter((item) => item.ingredient_id !== ingredientId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setUpdatedQuantity(item.quantity);
  };

  const saveEdit = async (e) => {
    if (e.type === "click" || (e.type === "keydown" && e.key === "Enter")) {
      try {
        const response = await axios.put(`http://127.0.0.1:8000/inventory/1/${editingItem.ingredient_id}`, {
          ingredient_id: editingItem.ingredient_id,
          quantity: updatedQuantity,
          unit: editingItem.unit,
        });
        setInventory(
          inventory.map((item) =>
            item.ingredient_id === editingItem.ingredient_id ? response.data : item
          )
        );
        setEditingItem(null);
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/inventory/1", newItem); // Replace "1" with the user ID
      const addedItem = response.data;
      setInventory([...inventory, { ...addedItem, ingredient_name: ingredients.find(ing => ing.id === newItem.ingredient_id)?.name }]);
      setNewItem({ ingredient_id: "", quantity: 0, unit: "" });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  if (loading) {
    return <p>Loading inventory...</p>;
  }

  return (
    <div>
      <h1>Inventory</h1>
      <form onSubmit={addItem}>
        <select
          value={newItem.ingredient_id}
          onChange={(e) => setNewItem({ ...newItem, ingredient_id: e.target.value })}
          required
        >
          <option value="" disabled>
            Select Ingredient
          </option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
          required
        />
        <input
          type="text"
          placeholder="Unit"
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          required
        />
        <button type="submit">Add Item</button>
      </form>
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
              <td>
                {editingItem && editingItem.ingredient_id === item.ingredient_id ? (
                  <input
                    type="number"
                    value={updatedQuantity}
                    onChange={(e) => setUpdatedQuantity(e.target.value)}
                    onKeyDown={saveEdit}
                  />
                ) : (
                  item.quantity
                )}
              </td>
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
  );
}

export default Inventory;
