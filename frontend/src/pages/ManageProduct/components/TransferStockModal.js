import React from "react";

const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

const TransferStockModal = ({
  show,
  onClose,
  onTransfer,

  product,
  locations,

  transferFrom,
  setTransferFrom,
  transferTo,
  setTransferTo,
  transferQty,
  setTransferQty,
}) => {
  if (!show || !product) return null;

  const totalStock = product.warehouses.reduce(
    (sum, w) => sum + Number(w.quantity || 0),
    0
  );

 const selectedWarehouse = product.warehouses.find(
  (w) =>
    w.location?._id?.toString() === transferFrom ||
    w.locationId?.toString() === transferFrom
);


const availableQty = selectedWarehouse?.quantity || 0;


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Transfer Stock
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">

          {/* PRODUCT INFO */}
          <div className="bg-slate-50 border rounded-md p-3 space-y-1">
            <p className="text-sm text-slate-600">Product</p>
            <p className="font-semibold text-slate-900">
              {product.name}
              <span className="text-sm text-gray-600 ml-1">
                ({product.quantityValue} {product.quantityUnit})
              </span>
            </p>
            <p className="text-sm text-green-600">
              Total Stock: {totalStock}
            </p>
          </div>

          {/* FROM LOCATION */}
          <div>
            <label className={labelClass}>From Warehouse</label>
            <select
  className={inputClass}
  value={transferFrom}
  onChange={(e) => setTransferFrom(e.target.value)}
>
  <option value="">Select source warehouse</option>

  {product.warehouses
    .filter((w) => w.quantity > 0)
    .map((w) => (
      <option
  key={(w.location?._id || w.locationId).toString()}
  value={(w.location?._id || w.locationId).toString()}
>

        {w.location?.name || "Unknown"} (Qty: {w.quantity})
      </option>
    ))}
</select>


            {transferFrom && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {availableQty}
              </p>
            )}
          </div>

          {/* TO LOCATION */}
          <div>
            <label className={labelClass}>To Warehouse</label>
            <select
              className={inputClass}
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            >
              <option value="">Select destination</option>
              {locations
                .filter((l) => l._id !== transferFrom)
                .map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </div>

          {/* QUANTITY */}
          <div>
            <label className={labelClass}>Transfer Quantity</label>
            <input
              type="number"
              min="1"
              max={availableQty}
              value={transferQty}
              onChange={(e) => setTransferQty(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onTransfer}
            className="px-6 py-2 rounded-md bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
            disabled={
              !transferFrom ||
              !transferTo ||
              !transferQty ||
              Number(transferQty) > availableQty
            }
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferStockModal;
