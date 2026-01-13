import React from "react";

const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Edit Location" : "Add Location"}
          </h2>
          <button onClick={onClose} type="button" className="text-xl text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className={labelClass}>Location Name</label>
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border rounded-md text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-blue-900 hover:bg-amber-500 text-white"
          >
            {isEdit ? "Update Location" : "Save Location"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLocationModal;
