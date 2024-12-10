import React, { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [ingredients, setIngredients] = useState([]); // List of valid ingredients
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedQuantity, setUpdatedQuantity] = useState(0);
  const [newItem, setNewItem] = useState({
    ingredient_id: "",
    quantity: 0,
    preferred_store: "",
    link_to_purchase: "",
    expiry_date: "",
    location: "",
    quantity_threshold: 0,
    notes: "",
  });

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
      const existingItem = inventory.find(
        (item) => parseInt(item.ingredient_id, 10) === parseInt(newItem.ingredient_id, 10)
      );

      if (existingItem) {
        // Update quantity if item exists
        const updatedQuantity = parseFloat(existingItem.quantity) + parseFloat(newItem.quantity);
        const response = await axios.put(
          `http://127.0.0.1:8000/inventory/1/${existingItem.ingredient_id}`,
          {
            ingredient_id: existingItem.ingredient_id,
            quantity: updatedQuantity,
          }
        );
        setInventory(
          inventory.map((item) =>
            item.ingredient_id === existingItem.ingredient_id ? response.data : item
          )
        );
      } else {
        // Add new item if it doesn't exist
        const selectedIngredient = ingredients.find(
          (ing) => parseInt(ing.ingredient_id, 10) === parseInt(newItem.ingredient_id, 10)
        );

        const payload = {
          user_id: 1, // Replace with the actual user ID
          ingredient_id: parseInt(newItem.ingredient_id, 10), // Ensure ingredient_id is passed correctly
          quantity: parseFloat(newItem.quantity), // Ensure quantity is a float
          preferred_store: newItem.preferred_store || null, // Optional fields set to null if empty
          link_to_purchase: newItem.link_to_purchase || null,
          expiry_date: newItem.expiry_date || null,
          location: newItem.location || null,
          quantity_threshold: parseFloat(newItem.quantity_threshold) || null, // Optional float
          notes: newItem.notes || null, // Optional string
        };

        console.log("Payload being sent to backend:", payload);

        const response = await axios.post("http://127.0.0.1:8000/inventory/1", payload);
        const addedItem = response.data;

        setInventory([
          ...inventory,
          {
            ...addedItem,
            ingredient_name: selectedIngredient?.name,
            unit: selectedIngredient?.unit, // Include the unit from ingredients
          },
        ]);
      }

      // Reset the form
      setNewItem({
        ingredient_id: "",
        quantity: 0,
        preferred_store: "",
        link_to_purchase: "",
        expiry_date: "",
        location: "",
        quantity_threshold: 0,
        notes: "",
      });
    } catch (error) {
      console.error("Error adding item:", error.response?.data || error.message);
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
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedIngredient = ingredients.find(
              (ing) => parseInt(ing.ingredient_id, 10) === parseInt(selectedId, 10)
            );
            setNewItem({
              ...newItem,
              ingredient_id: selectedId,
              unit: selectedIngredient?.unit || "", // Automatically populate unit
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
          onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
          required
        />
        <input
          type="text"
          placeholder="Preferred Store"
          value={newItem.preferred_store}
          onChange={(e) => setNewItem({ ...newItem, preferred_store: e.target.value })}
        />
        <input
          type="url"
          placeholder="Link to Purchase"
          value={newItem.link_to_purchase}
          onChange={(e) => setNewItem({ ...newItem, link_to_purchase: e.target.value })}
        />
        <input
          type="date"
          placeholder="Expiry Date"
          value={newItem.expiry_date}
          onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={newItem.location}
          onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity Threshold"
          value={newItem.quantity_threshold}
          onChange={(e) => setNewItem({ ...newItem, quantity_threshold: parseFloat(e.target.value) })}
        />
        <textarea
          placeholder="Notes"
          value={newItem.notes}
          onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
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
              <td>{item.quantity}</td>
              <td>{item.unit}</td> {/* Display unit from the ingredient table */}
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
