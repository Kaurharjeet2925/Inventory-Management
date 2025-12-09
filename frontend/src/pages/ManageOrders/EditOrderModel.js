import React, { useState, useEffect } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";
import { apiClient } from "../../apiclient/apiclient";

const EditOrderModal = ({ order, onClose, onSave, viewOnly = false }) => {
  const [form, setForm] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [originalItems, setOriginalItems] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get("/products");
        setRawProducts(res.data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, []);

  // build productOptions (unique list)
  const seen = new Set();
  const productOptions = rawProducts
    .filter((p) => {
      const key = `${p.name}-${p.quantityValue}-${p.quantityUnit}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => ({
      _id: p._id,
      name: p.name,
      displayName: `${p.name} – ${p.quantityValue}${p.quantityUnit}`,
      unitType: p.quantityUnit,
      size: p.quantityValue,
      price: p.price,
    }));

  // get warehouses for selected product
  const getWarehouses = (name, size, unit) => {
    return rawProducts
      .filter((p) => p.name === name && p.quantityValue === size && p.quantityUnit === unit)
      .map((p) => ({
        id: p._id,
        warehouseName: p.location?.name || "Unknown",
        warehouseAddress: p.location?.address || "NA",
        stock: p.totalQuantity || 0,
      }));
  };

  useEffect(() => {
    if (!order || rawProducts.length === 0) return;

    const rebuilt = order.items.map((it) => {
      // Safety check for undefined items
      if (!it || !it.productName) {
        return {
          ...it,
          warehouseOptions: [],
          warehouseId: it?.warehouseId || "",
        };
      }

      const whList = getWarehouses(it.productName, it.quantityValue, it.unitType);
      return {
        ...it,
        warehouseOptions: whList,
        warehouseId: it.warehouseId || whList[0]?.id || "",
      };
    });

    setForm({
      ...order,
      newStatus: order.status,
      items: rebuilt,
      paymentDetails:
        order.paymentDetails || {
          totalAmount: 0,
          paidAmount: 0,
          balanceAmount: 0,
          paymentStatus: "unpaid",
        },
    });

    setOriginalItems(JSON.parse(JSON.stringify(rebuilt)));
  }, [order, rawProducts]);

  // Scroll edited row into view when edit mode opens
  useEffect(() => {
    if (editingIndex === null) return;
    const id = `item-row-${editingIndex}`;
    const el = document.getElementById(id);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingIndex]);

  if (!form) return null;

  // Only pending orders can edit items
  const itemsEditable = order.status === "pending" && !viewOnly;

  const updateField = (index, field, value) => {
    if (!itemsEditable) return;
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  // -------------------------
  // ⭐ ADD NEW ITEM FUNCTION
  // -------------------------
  const addNewItem = () => {
    if (!itemsEditable) return;

    const newItem = {
      productId: "",
      productName: "",
      quantity: 1,
      quantityValue: "",
      unitType: "",
      price: 0,
      totalPrice: 0,
      warehouseId: "",
      warehouseName: "",
      warehouseAddress: "",
      warehouseOptions: [],
    };

    const updated = [...form.items, newItem];
    setForm({ ...form, items: updated });

    // Open the new row in edit mode
    setEditingIndex(updated.length - 1);
  };

  const deleteItem = (index) => {
    if (!itemsEditable) return;
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
    setOriginalItems(updated);
  };

  const cancelInlineEdit = (index) => {
    // If item doesn't exist in originalItems, it's a new item being added, so delete it
    if (!originalItems[index]) {
      const updated = form.items.filter((_, i) => i !== index);
      setForm({ ...form, items: updated });
      setEditingIndex(null);
      return;
    }

    // Otherwise restore from originalItems
    const updated = [...form.items];
    updated[index] = originalItems[index];
    setForm({ ...form, items: updated });
    setEditingIndex(null);
  };

  // Ensure warehouse options exist for an item before editing
  const startInlineEdit = (index) => {
    const item = form.items[index];
    if (!item) return setEditingIndex(index);

    // populate warehouseOptions if empty
    if (!item.warehouseOptions || item.warehouseOptions.length === 0) {
      const whList = getWarehouses(item.productName, item.quantityValue, item.unitType);
      updateField(index, "warehouseOptions", whList);

      if (!item.warehouseId && whList.length > 0) {
        updateField(index, "warehouseId", whList[0].id);
        updateField(index, "warehouseName", whList[0].warehouseName);
        updateField(index, "warehouseAddress", whList[0].warehouseAddress);
      }
    }

    setEditingIndex(index);
  };

  const saveOrder = () => {
    if (!itemsEditable) {
      onSave({ _id: form._id, status: form.newStatus });
      return;
    }

    const updatedItems = form.items.map((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);

      return {
        productId: item.productId,
        productName: item.productName,
        quantity: qty,
        quantityValue: item.quantityValue,
        unitType: item.unitType,
        price,
        totalPrice: price * qty,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
        warehouseAddress: item.warehouseAddress,
      };
    });

    onSave({
      _id: form._id,
      status: form.newStatus,
      items: updatedItems,
      paymentDetails: {
        ...form.paymentDetails,
        paidAmount: Number(form.paymentDetails?.paidAmount || 0),
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{viewOnly ? "View Order" : "Edit Order"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={26} />
          </button>
        </div>

        {/* ORDER INFO */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Order ID</p>
            <p className="font-semibold text-lg">{form.orderId}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Client Name</p>
            <p className="font-semibold text-lg">{form.clientId?.name}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Agent</p>
            <p className="font-semibold text-lg">{form.deliveryPersonId?.name || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <select
              disabled={viewOnly}
              value={form.newStatus}
              onChange={(e) =>
                setForm({ ...form, newStatus: e.target.value })
              }
              className="border rounded p-2 w-full disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {!itemsEditable && (
              <p className="text-xs text-gray-500 mt-1">
                Items can be modified only while order is pending.
              </p>
            )}
          </div>

          <div>
            <p className="text-gray-600 text-sm">Date</p>
            <p className="font-semibold text-lg">
              {new Date(form.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ITEMS HEADER + ADD BUTTON */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Items</h3>

          {itemsEditable && (
            <button
              onClick={addNewItem}
              className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
            >
              + Add Item
            </button>
          )}
        </div>

        {/* ITEMS LIST */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {form.items.map((item, idx) => {
            return (
              <div key={idx} id={`item-row-${idx}`} className="border-b pb-4 last:border-b-0">
                {editingIndex === idx && itemsEditable ? (
                  // --------------------
                  // Edit Mode
                  // --------------------
                  <div className="grid grid-cols-6 gap-3 items-center">

                    {/* Product Select */}
                    <div className="col-span-2">
                      <SearchableSelect
                        options={productOptions}
                        value={item.productId}
                        placeholder="Product"
                        onChange={(selectedId) => {
                          const p = productOptions.find((q) => q._id === selectedId);

                          updateField(idx, "productId", selectedId);
                          updateField(idx, "productName", p.name);
                          updateField(idx, "unitType", p.unitType);
                          updateField(idx, "quantityValue", p.size);
                          updateField(idx, "price", p.price);

                          const wh = getWarehouses(
                            p.name,
                            p.size,
                            p.unitType
                          );

                          updateField(idx, "warehouseOptions", wh);
                          updateField(idx, "warehouseId", wh[0]?.id || "");
                          updateField(idx, "warehouseName", wh[0]?.warehouseName);
                          updateField(idx, "warehouseAddress", wh[0]?.warehouseAddress);
                        }}
                      />
                    </div>

                    {/* Price */}
                   

                    {/* Warehouse */}
                    <select
                      className="border rounded-lg px-3 py-2.5"
                      value={item.warehouseId}
                      onChange={(e) => {
                        const wid = e.target.value;
                        const wh = item.warehouseOptions.find((w) => w.id === wid);

                        updateField(idx, "warehouseId", wid);
                        updateField(idx, "warehouseName", wh?.warehouseName);
                        updateField(idx, "warehouseAddress", wh?.warehouseAddress);
                      }}
                    >
                      <option value="">Select</option>
                      {(item.warehouseOptions || [])?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.warehouseName} (Stock {w.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2.5"
                      value={item.price ?? ""}
                      onChange={(e) => updateField(idx, "price", e.target.value)}
                      placeholder="price"
                    />
                    {/* Quantity */}
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2.5"
                      value={item.quantity}
                      onChange={(e) =>
                        updateField(idx, "quantity", e.target.value)
                      }
                    />

                    {/* Save / Cancel */}
                    <div className="flex gap-2 justify-center">
                      <button
                        className="bg-green-600 text-white w-9 h-9 rounded-full"
                        onClick={() => setEditingIndex(null)}
                      >
                        ✔
                      </button>

                      <button
                        className="bg-red-500 text-white w-9 h-9 rounded-full"
                        onClick={() => cancelInlineEdit(idx)}
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                ) : (
                  // --------------------
                  // View Mode
                  // --------------------
                  <div>
                    <div className="flex justify-between">
                      <p className="font-semibold">
                        {item.productName} — Qty {item.quantity}
                      </p>

                      {itemsEditable && (
                        <div className="flex gap-3">
                          <Pencil
                            size={18}
                            onClick={() => startInlineEdit(idx)}
                            className="cursor-pointer text-blue-600"
                          />
                          <Trash2
                            size={18}
                            onClick={() => deleteItem(idx)}
                            className="cursor-pointer text-red-600"
                          />
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      Warehouse: {item.warehouseName}
                    </p>

                    <p className="text-sm text-gray-600">
                      Price: ₹{item.price}
                    </p>

                    <p className="text-sm text-gray-600">
                      Total: ₹{item.price * item.quantity}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 bg-gray-300 py-3 rounded"
            onClick={onClose}
          >
            {viewOnly ? "Close" : "Cancel"}
          </button>

          {!viewOnly && (
            <button
              className="flex-1 bg-green-600 text-white py-3 rounded"
              onClick={saveOrder}
            >
              Save Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
