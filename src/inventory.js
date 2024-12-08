import React, { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/inventory/1"); // Replace "1" with the user ID
        setInventory(response.data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) {
    return <p>Loading inventory...</p>;
  }

  return (
    <div>
      <h1>Inventory</h1>
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
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
