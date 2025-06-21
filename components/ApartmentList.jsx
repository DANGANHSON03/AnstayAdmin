import React, { useState } from "react";
import EditApartmentModal from "./EditApartmentModal";

export default function ApartmentList({ apartments, onUpdate }) {
  const [editingApartment, setEditingApartment] = useState(null);

  const handleEditClick = (apartment) => {
    setEditingApartment(apartment);
  };

  const handleCloseModal = () => {
    setEditingApartment(null);
  };

  const handleSave = (updatedApartment) => {
    onUpdate(updatedApartment);
    setEditingApartment(null);
  };

  return (
    <div>
      <table>
        <tbody>
          {apartments.map((apartment, idx) => (
            <tr key={apartment.id}>
              <td className="border px-2 py-1">
                <button
                  className="text-blue-600 mr-2"
                  onClick={() => handleEditClick(apartment)}
                >
                  ✏️
                </button>
                <button className="text-red-600">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingApartment && (
        <EditApartmentModal
          apartment={editingApartment}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
