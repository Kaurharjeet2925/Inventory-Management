import React from "react";

const AddLocationModal = ({
  show,
  onClose,
  onSave,
  locationName,
  address,
  setLocationName,
  setAddress,
  isEdit,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Location" : "Add Location"}
        </h2>

        <label className="font-semibold mb-2 block">Location Name</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />

        <label className="font-semibold mb-2 block">Address</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={onSave}
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
