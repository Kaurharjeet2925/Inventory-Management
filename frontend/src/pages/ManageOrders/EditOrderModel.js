import React, { useState, useEffect } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";
import { apiClient } from "../../apiclient/apiclient";
import { formatAnyDateToDDMMYYYY } from "../../utils/dateFormatter";

const EditOrderModal = ({ order, onClose, onSave, viewOnly = false }) => {
  const [form, setForm] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [originalItems, setOriginalItems] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);

  /* ================= LOAD PRODUCTS ================= */
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

  /* ================= PRODUCT OPTIONS ================= */
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

  const getWarehouses = (name, size, unit) =>
    rawProducts
      .filter(
        (p) =>
          p.name === name &&
          p.quantityValue === size &&
          p.quantityUnit === unit
      )
      .map((p) => ({
        id: p._id,
        warehouseName: p.location?.name || "Unknown",
        warehouseAddress: p.location?.address || "NA",
        stock: p.totalQuantity || 0,
      }));

  /* ================= INIT FORM ================= */
  useEffect(() => {
    if (!order || rawProducts.length === 0) return;

    const rebuilt = order.items.map((it) => {
      const whList = it?.productName
        ? getWarehouses(it.productName, it.quantityValue, it.unitType)
        : [];

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

  if (!form) return null;

  /* ================= RULES ================= */
  const itemsEditable =
    order.status === "pending" && !viewOnly;

  const statusEditable =
    order.status !== "completed" && !viewOnly;

  /* ================= HELPERS ================= */
  const updateField = (index, field, value) => {
    if (!itemsEditable) return;
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  const addNewItem = () => {
    if (!itemsEditable) return;
    setForm({
      ...form,
      items: [
        ...form.items,
        {
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
        },
      ],
    });
    setEditingIndex(form.items.length);
  };

  const deleteItem = (index) => {
    if (!itemsEditable) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const cancelInlineEdit = (index) => {
    if (!originalItems[index]) {
      deleteItem(index);
    } else {
      const updated = [...form.items];
      updated[index] = originalItems[index];
      setForm({ ...form, items: updated });
    }
    setEditingIndex(null);
  };

  const startInlineEdit = (index) => {
    if (!itemsEditable) return;
    setEditingIndex(index);
  };

  /* ================= SAVE ================= */
  const saveOrder = () => {
    // 🔒 STATUS-ONLY UPDATE
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

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">
            {viewOnly ? "View Order" : "Edit Order"}
          </h2>
          <button onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        {/* ORDER INFO */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold">{form.orderId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-semibold">{form.clientId?.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Agent</p>
            <p className="font-semibold">
              {form.deliveryPersonId?.name || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Status</p>
            <select
              disabled={!statusEditable}
              value={form.newStatus}
              onChange={(e) =>
                setForm({ ...form, newStatus: e.target.value })
              }
              className="border rounded p-2 w-full disabled:bg-gray-100"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {!statusEditable && (
              <p className="text-xs text-red-500 mt-1">
                Completed orders cannot be modified.
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold">
              {formatAnyDateToDDMMYYYY(form.createdAt)}
            </p>
          </div>
        </div>

        {/* ITEMS */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Items</h3>
          {itemsEditable && (
            <button
              onClick={addNewItem}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              + Add Item
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {form.items.map((item, idx) => (
            <div key={idx} className="border-b pb-4">
              {editingIndex === idx && itemsEditable ? (
                <div className="grid grid-cols-6 gap-3 items-center">
                  <SearchableSelect
                    options={productOptions}
                    value={item.productId}
                    onChange={(id) => {
                      const p = productOptions.find((x) => x._id === id);
                      updateField(idx, "productId", id);
                      updateField(idx, "productName", p.name);
                      updateField(idx, "price", p.price);
                      updateField(idx, "unitType", p.unitType);
                      updateField(idx, "quantityValue", p.size);
                    }}
                  />

                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateField(idx, "price", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateField(idx, "quantity", e.target.value)
                    }
                  />

                  <button onClick={() => setEditingIndex(null)}>✔</button>
                  <button onClick={() => cancelInlineEdit(idx)}>✖</button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <p>
                    {item.productName} × {item.quantity}
                  </p>

                  {itemsEditable && (
                    <div className="flex gap-3">
                      <Pencil onClick={() => startInlineEdit(idx)} />
                      <Trash2 onClick={() => deleteItem(idx)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-gray-300 py-3" onClick={onClose}>
            Cancel
          </button>
          {!viewOnly && (
            <button
              className="flex-1 bg-green-600 text-white py-3"
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
