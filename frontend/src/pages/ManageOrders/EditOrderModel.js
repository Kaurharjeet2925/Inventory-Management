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
      quantityUnit: p.quantityUnit,
      quantityValue: p.quantityValue,
      price: p.price,
    }));

  /* ================= INIT FORM ================= */
  useEffect(() => {
    if (!order) return;

    const rebuiltItems = order.items.map((it) => ({
      ...it,
      warehouseId: it.warehouseId || "",
    }));

    setForm({
      ...order,
      newStatus: order.status,
      items: rebuiltItems,
      paymentDetails: {
        totalAmount: order.paymentDetails?.totalAmount || 0,
        discount: order.paymentDetails?.discount || 0,
        paidAmount: order.paymentDetails?.paidAmount || 0,
        balanceAmount: order.paymentDetails?.balanceAmount || 0,
        paymentStatus: order.paymentDetails?.paymentStatus || "unpaid",
      },
    });

    setOriginalItems(JSON.parse(JSON.stringify(rebuiltItems)));
  }, [order]);
useEffect(() => {
  if (!form) return;

  const totalAmount = form.items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const discount = Number(form.paymentDetails.discount || 0);
  const paid = Number(form.paymentDetails.paidAmount || 0);

  const payable = Math.max(totalAmount - discount, 0);
  const balanceAmount = Math.max(payable - paid, 0);

  let paymentStatus = "unpaid";
  if (balanceAmount === 0) paymentStatus = "paid";
  else if (paid > 0) paymentStatus = "partial";

  setForm((prev) => ({
    ...prev,
    paymentDetails: {
      ...prev.paymentDetails,
      totalAmount,
      balanceAmount,
      paymentStatus,
    },
  }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  form?.items,
  form?.paymentDetails?.discount,
]);


  if (!form) return null;


const isLocked = ["completed", "cancelled"].includes(order.status);

const itemsEditable = !viewOnly && !isLocked && order.status === "pending";
const statusEditable = !viewOnly && !isLocked;
const paymentEditable = !viewOnly && !isLocked;


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
          quantityUnit: "",
          price: 0,
          totalPrice: 0,
          warehouseId: "",
          warehouseName: "",
          warehouseAddress: "",
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
  if (isLocked) return;
    // 🔒 STATUS ONLY UPDATE
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
        quantityUnit: item.quantityUnit, // ✅ SAME AS CREATE ORDER
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
        discount: Number(form.paymentDetails.discount || 0),
        paidAmount: Number(form.paymentDetails.paidAmount || 0),
      },
    });
  };
const getWarehouseOptions = (productId, index) => {
  const product = rawProducts.find(p => p._id === productId);
  if (!product) return [];

  return (product.warehouses || []).map(w => {
    const alreadyUsed = form.items
      .filter(
        (it, i) =>
          i !== index &&
          it.productId === productId &&
          it.warehouseId === w.location._id
      )
      .reduce((sum, it) => sum + Number(it.quantity || 0), 0);

    return {
      warehouseId: w.location._id,
      warehouseName: w.location.name,
      warehouseAddress: w.location.address,
      stock: Math.max(Number(w.quantity || 0) - alreadyUsed, 0),
    };
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
              <option value="pending">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {isLocked && (
  <p className="text-xs text-red-500 mt-1">
    {order.status === "cancelled"
      ? "Cancelled order cannot be modified."
      : "Completed order cannot be modified."}
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
  <div className="grid grid-cols-4 gap-3 items-center">

    {/* PRODUCT */}
    <SearchableSelect
      options={productOptions}
      value={item.productId}
      onChange={(id) => {
        const p = productOptions.find(x => x._id === id);
        updateField(idx, "productId", id);
        updateField(idx, "productName", p.name);
        updateField(idx, "price", p.price);
        updateField(idx, "quantityUnit", p.quantityUnit);
        updateField(idx, "quantityValue", p.quantityValue);
        updateField(idx, "warehouseId", "");
        updateField(idx, "warehouseName", "");
        updateField(idx, "warehouseAddress", "");
      }}
    />

    {/* ✅ WAREHOUSE */}
    <select
      value={item.warehouseId || ""}
      onChange={(e) => {
        const wh = getWarehouseOptions(item.productId, idx)
          .find(w => w.warehouseId === e.target.value);

        updateField(idx, "warehouseId", wh?.warehouseId || "");
        updateField(idx, "warehouseName", wh?.warehouseName || "");
        updateField(idx, "warehouseAddress", wh?.warehouseAddress || "");
      }}
      className="border rounded p-2 w-full"
    >
      <option value="">Select Warehouse</option>
      {getWarehouseOptions(item.productId, idx).map(wh => (
        <option key={wh.warehouseId} value={wh.warehouseId}>
          {wh.warehouseName} (Stock: {wh.stock})
        </option>
      ))}
    </select>

    {/* PRICE */}
    <input
      type="number"
      value={item.price}
      onChange={(e) => updateField(idx, "price", e.target.value)}
      className="border rounded p-2 w-full"
    />

    {/* QTY */}
    <input
      type="number"
      value={item.quantity}
      onChange={(e) => updateField(idx, "quantity", e.target.value)}
      className="border rounded p-2 w-full"
    />

    {/* ACTIONS */}
    <div className="flex gap-2">
      <button onClick={() => setEditingIndex(null)}>✔</button>
      <button onClick={() => cancelInlineEdit(idx)}>✖</button>
    </div>

  </div>
) : (

                <div className="flex justify-between">
                  <p>
                    {item.productName} ({item.quantityValue}
                    {item.quantityUnit}) × {item.quantity}
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

        {/* PAYMENT DETAILS */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Total</label>
              <input
                disabled
                value={form.paymentDetails.totalAmount}
                className="border p-2 w-full bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Discount</label>
              <input
                type="number"
                disabled={!paymentEditable}
                value={form.paymentDetails.discount}
               onChange={(e) =>
  setForm({
    ...form,
    paymentDetails: {
      ...form.paymentDetails,
      discount: Number(e.target.value || 0),
    },
  })

                }
                className="border p-2 w-full"
              />
            </div>

            <div>
             <div>
  <label className="text-sm text-gray-600">Paid</label>
  <input
    disabled
    value={form.paymentDetails.paidAmount}
    className="border p-2 w-full bg-gray-100"
  />
</div>

            </div>

            <div>
              <label className="text-sm text-gray-600">Balance</label>
              <input
                disabled
                value={form.paymentDetails.balanceAmount}

                className="border p-2 w-full bg-gray-100 text-red-600 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-gray-300 py-3" onClick={onClose}>
            Cancel
          </button>
         {!viewOnly && !isLocked && (
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
