import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import AddClient from '../ManageClient/AddClient';
import socket from "../../socket/socketClient";
import ThemedTable from '../../components/ThemedTable';

const CreateOrders = () => {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState("");

  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [qtyError, setQtyError] = useState("");

  const [rawProducts, setRawProducts] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  const [amountData, setAmountData] = useState({
    totalAmount: "",
    paidAmount: "",
    balanceAmount: "",
    paymentStatus: "COD",
  });

  const [itemForm, setItemForm] = useState({
    productId: "",
    productName: "",
    quantity: "",
    unitType: "",
    price: "",
  });

  const [formData, setFormData] = useState({
    paymentMethod: "credit-card",
    notes: "",
    gstPercentage: 18,
  });

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
 const inputClass =
    "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white " +
    "hover:bg-amber-500 focus:ring-2 focus:ring-amber-400 transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed"

  const secondaryBtn =
    "inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 " +
    "hover:bg-slate-100 transition"

  const labelClass = "flex items-center h-10 text-sm font-medium text-slate-600"

  useEffect(() => {
    socket.on("order_created", (order) => {
      console.log("📦 New order created:", order);
    });
  
    return () => {
      socket.off("order_created");
    };
  }, []);

  // Listen for product stock updates from server and update local product list
  useEffect(() => {
    const handleProductUpdated = ({ productId, totalQuantity }) => {
      if (!productId) return;
      setRawProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, totalQuantity } : p))
      );

      // Also update warehouseOptions if present
      setWarehouseOptions((prev) =>
        prev.map((w) => (w.id === productId ? { ...w, stock: totalQuantity } : w))
      );
    };

    socket.on("product_updated", handleProductUpdated);
    return () => socket.off("product_updated", handleProductUpdated);
  }, []);
  
  /* -------------------------------------------------------
     LOAD CLIENTS
  -------------------------------------------------------- */
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await apiClient.get("/clients");
        setClients(res.data?.clients || []);
      } catch (err) {
        console.error("Failed to load clients", err);
      }
    };
    loadClients();
  }, []);

  /* -------------------------------------------------------
     LOAD DELIVERY PERSONS
  -------------------------------------------------------- */
  useEffect(() => {
    const loadDeliveryPersons = async () => {
      try {
        const res = await apiClient.get("/delivery-persons");
        setDeliveryPersons(res.data || []);
      } catch (err) {
        console.error("Failed to load delivery persons", err);
      }
    };
    loadDeliveryPersons();
  }, []);

  /* -------------------------------------------------------
     LOAD PRODUCTS + MERGE NAME (name + qty + unit)
  -------------------------------------------------------- */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get("/products");

        setRawProducts(res.data);

        const merged = res.data.map((p) => ({
          ...p,
          displayName: `${p.name} – ${p.quantityValue || 0} ${p.quantityUnit || ""}`,
        }));

        const map = new Map();
        merged.forEach((p) => {
          const key = `${p.name}-${p.quantityValue}-${p.quantityUnit}`;
          if (!map.has(key)) map.set(key, p);
        });

        setProducts(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, []);

 
  const SearchableSelect = ({ options = [], value, onChange, placeholder }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
      const selectedOption = options.find((o) => o._id === value);
      setQuery(selectedOption ? selectedOption.displayName : "");
    }, [value, options]);

    const filteredOptions = options.filter((o) =>
      o.displayName.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="relative" ref={ref}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={inputClass}
          onFocus={() => setOpen(true)}
        />

        {open && (
          <ul className="absolute w-full bg-white border rounded mt-1 max-h-48 overflow-auto shadow z-50">
            {filteredOptions.length === 0 && (
              <li className="p-2 text-sm text-gray-500">No results</li>
            )}

            {filteredOptions.map((o) => (
              <li
                key={o._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(o._id);
                  setQuery(o.displayName);
                  setOpen(false);
                }}
              >
                {o.displayName}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------
      CLIENT DETAILS
  -------------------------------------------------------- */
  const selectedClient = clients.find((c) => c._id === selectedClientId);

  const handleAddNewClient = (newClient) => {
    setClients([...clients, newClient]);
    setSelectedClientId(newClient._id);
  };

  /* -------------------------------------------------------
      ITEM QUANTITY CHANGE
  -------------------------------------------------------- */
  const handleItemChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const qty = Number(value);
      if (!qty || qty <= 0) {
        setItemForm({ ...itemForm, quantity: "" });
        return;
      }

const selectedWh = warehouseOptions.find(
  (w) => w.warehouseId === selectedWarehouseId
);
      const availableQty = selectedWh?.stock || 0;

      const alreadyOrdered = orderItems
        .filter(
          (it) =>
            it.productId === itemForm.productId && it.warehouseId === selectedWarehouseId
        )
        .reduce((sum, it) => sum + it.quantity, 0);

      const remaining = availableQty - alreadyOrdered;

      if (qty > remaining) {
        setQtyError(`Only ${remaining} available in this warehouse`);
        return;
      }

      setQtyError("");
      setItemForm({ ...itemForm, quantity: qty });
      return;
    }

    setItemForm({ ...itemForm, [name]: value });
  };


  const addItem = () => {
    if (!itemForm.productId) return alert("Select a product");
    if (!selectedWarehouseId) return alert("Select a warehouse");
    if (!itemForm.quantity) return alert("Enter quantity");
  
    const selectedProduct = products.find(p => p._id === itemForm.productId);
const selectedWarehouse = warehouseOptions.find(
  w => w.warehouseId === selectedWarehouseId
);
  
    const itemToAdd = {
      id: Date.now(),
      productId: itemForm.productId,
      warehouseId: selectedWarehouseId,
      warehouseName: selectedWarehouse?.warehouseName || "Unknown",
      productName: selectedProduct.name,
      quantity: Number(itemForm.quantity),
      quantityValue: selectedProduct.quantityValue,
      quantityUnit: selectedProduct.quantityUnit,
      price: Number(itemForm.price),
      total: Number(itemForm.quantity) * Number(itemForm.price),
    };
  
    setOrderItems([...orderItems, itemToAdd]);
  
    // Clear product selection and reset item inputs after adding
    setItemForm({
      productId: "",
      productName: "",
      quantity: "",
      unitType: "",
      price: "",
    });

    // clear editing flag after add/update
    setEditingItemId(null);
  
    setSelectedWarehouseId("");
    setQtyError("");
  };
  
  
   
  const removeItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleEditItem = (item) => {
    // populate form with selected item
    setItemForm({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitType: item.quantityUnit || item.unitType || "",
      price: item.price,
    });

    setSelectedWarehouseId(item.warehouseId);

    // remove item from list so it can be updated when user clicks Add/Update
    setOrderItems(orderItems.filter((it) => it.id !== item.id));
    setQtyError("");
    setEditingItemId(item.id);
  };
  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setAmountData((prev) => ({ ...prev, totalAmount: total }));
  }, [orderItems]);
  

  /* -------------------------------------------------------
      BALANCE CALCULATION
  -------------------------------------------------------- */
 useEffect(() => {
  const total = Number(amountData.totalAmount || 0);
  const paid = Number(amountData.paidAmount || 0);

  const balance = Math.max(total - paid, 0);

  let status = "COD";
  if (paid >= total && total > 0) {
    status = "PAID";
  } else if (paid > 0 && paid < total) {
    status = "PARTIAL";
  }

  setAmountData(prev => ({
    ...prev,
    balanceAmount: balance,
    paymentStatus: status,
  }));
}, [amountData.totalAmount, amountData.paidAmount]);


  /* -------------------------------------------------------
      SUBMIT ORDER
  -------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClientId) return alert("Select a client");
    if (orderItems.length === 0) return alert("Add at least one item");
    if (!selectedDeliveryPersonId) return alert("Select a delivery person");

    if (!amountData.totalAmount) return alert("Total amount required");

   const payload = {
  clientId: selectedClientId,
  deliveryPersonId: selectedDeliveryPersonId,

  paymentDetails: {
    paidAmount: Number(amountData.paidAmount) || 0,
  },

  items: orderItems,
  notes: formData.notes,
  status: "pending",
};

    try {
      await apiClient.post("/orders", payload);
      alert("Order created successfully!");

      // Reset all fields
      setSelectedClientId("");
      setSelectedDeliveryPersonId("");
      setOrderItems([]);
      setItemForm({
        productId: "",
        productName: "",
        quantity: "",
        unitType: "",
      });

      setAmountData({
        totalAmount: "",
        paidAmount: "",
        balanceAmount: "",
        paymentStatus: "cod",
      });

      setSelectedWarehouseId("");
      setWarehouseOptions([]);

    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create order");
    }
  };


 return (
  <div className="max-w-7xl mx-auto px-3 sm:px-6">


    {/* PAGE HEADER */}
    <h1 className="text-2xl font-semibold text-slate-800 mb-1">
      Create New Order
    </h1>
    <p className="text-sm text-slate-500 mb-6">
      Select a client and add items
    </p>

    <form onSubmit={handleSubmit}>

      {/* CLIENT SELECTION */}
      
<div className="bg-gray-50 p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Client Details
        </h2>

        <div className="flex flex-row gap-2 sm:gap-4 sm:items-end">
          <div className="flex-1">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Small round button on mobile, full button on desktop */}
          <button
            type="button"
            onClick={() => setIsAddClientOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-blue-900 text-white p-2 sm:rounded-md sm:px-5 sm:py-2.5 sm:gap-2 sm:text-sm sm:font-medium sm:bg-blue-900 sm:hover:bg-amber-500 sm:focus:ring-2 sm:focus:ring-amber-400 transition w-9 h-9 sm:w-auto sm:h-auto"
            title="Add New Client"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Client</span>
          </button>
        </div>

        {selectedClient && (
          <div className="mt-4 p-4 rounded-lg bg-white border-l-4 border-amber-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><b>Name:</b> {selectedClient.name}</div>
              <div><b>Phone:</b> {selectedClient.phone}</div>
              <div><b>Company:</b> {selectedClient.companyName || "-"}</div>
              <div><b>Email:</b> {selectedClient.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* DELIVERY PERSON */}
<div className="bg-gray-50 p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Delivery Person
        </h2>

        <select
          value={selectedDeliveryPersonId}
          onChange={(e) => setSelectedDeliveryPersonId(e.target.value)}
          className={inputClass}
        >
          <option value="">Select Delivery Person</option>
          {deliveryPersons.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.phone})
            </option>
          ))}
        </select>
      </div>

      {/* ORDER ITEMS */}
<div className="
  bg-gray-50 p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm mb-6
  max-h-[75vh] sm:max-h-none
  flex flex-col
">

        <h2 className="text-lg font-semibold text-slate-800 ">
          Order Items
        </h2>
<div className="shrink-0"></div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end mb-4">



         <div className="lg:col-span-3">
  <label className={labelClass}>Product</label>

  <SearchableSelect
    options={products}
    value={itemForm.productId}
    onChange={(id) => {
      const p = products.find((prod) => prod._id === id);
      if (!p) return;

      setItemForm({
        productId: id,
        productName: p.name,
        quantity: "",
        unitType: p.quantityUnit,
        price: p.price || 0,
      });

      // ✅ ONLY warehouse-based stock
      const warehouses = (p.warehouses || []).map((w) => ({
        warehouseId: w.location._id,
        warehouseName: w.location.name,
        warehouseAddress: w.location.address,
        stock: Number(w.quantity || 0),
      }));

      setWarehouseOptions(warehouses);
      setSelectedWarehouseId("");
      setQtyError("");
    }}
    placeholder="Search product..."
  />
</div>


          <div className="lg:col-span-3">

            <label className={labelClass}>Warehouse</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select Warehouse</option>
              {warehouseOptions.map((wh) => {
  const alreadyOrdered = orderItems
    .filter(
      it =>
        it.productId === itemForm.productId &&
        it.warehouseId === wh.warehouseId
    )
    .reduce((sum, it) => sum + it.quantity, 0);

  return (
    <option key={wh.warehouseId} value={wh.warehouseId}>
      {wh.warehouseName} (Stock: {wh.stock - alreadyOrdered})
    </option>
  );
})}

            </select>
          </div>

          <div className="lg:col-span-2">

            <label className={labelClass}>Unit Price (₹)</label>
            <input
              type="number"
              className={inputClass}
              value={itemForm.price ?? ""}
              onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
            />
          </div>

        <div className="lg:col-span-2">

            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={itemForm.quantity}
              disabled={
                selectedWarehouseId &&
              warehouseOptions.find(w => w.warehouseId === selectedWarehouseId)?.stock <= 0
              }
              onChange={handleItemChange}
              className={inputClass}
              min="1"
            />
          </div>

         <div className="lg:col-span-2">
            <button
              type="button"
              onClick={addItem}
              disabled={
                !itemForm.productId ||
                !selectedWarehouseId ||
                warehouseOptions.find(w => w.id === selectedWarehouseId)?.stock <= 0
              }
              className={`${primaryBtn} w-full h-10 sm:h-[42px]`}

            >
              {editingItemId ? <><Edit3 size={16}/> Update</> : <><Plus size={18}/> Add Item</>}
            </button>
          </div>
        </div>

        {qtyError && (
          <p className="text-red-500 text-xs font-medium px-1">
            {qtyError}
          </p>
        )}

       
{orderItems.length > 0 && (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
   
    
      <ThemedTable className="min-w-[900px] text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-left">Warehouse</th>
            <th className="p-4 text-left">Price</th>
            <th className="p-4 text-left">Qty</th>
            <th className="p-4 text-left">Total</th>
            <th className="p-4 text-left">Action</th>
          </tr>
        </thead>
     
   

    {/* TABLE BODY (SCROLLS) */}
   
        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="p-4">{item.productName}</td>
              <td className="p-4">{item.warehouseName}</td>
              <td className="p-4">₹{item.price}</td>
              <td className="p-4">{item.quantity}</td>
              <td className="p-4">
                ₹{item.quantity * item.price}
              </td>
              <td className="p-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditItem(item)}
                  className="text-blue-600"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </ThemedTable>
    </div>

 
)}

      </div>

      {/* PAYMENT */}
<div className="bg-gray-50 p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 ">Payment Details</h2>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end
                        bg-gray-50  mb-4">

          <div className="md:col-span-3">
                 <label className={labelClass}>Total Amount</label>
              <input
                type="number"
                value={amountData.totalAmount}
                onChange={(e) =>
                  setAmountData({ ...amountData, totalAmount: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3">
                <label className={labelClass}>Paid Amount</label>
              <input
                type="number"
                value={amountData.paidAmount}
                onChange={(e) =>
                 setAmountData({
                   ...amountData,
                paidAmount: Number(e.target.value) || 0,
                })
               }

                className={inputClass}
              />
            </div>

             <div className="md:col-span-3">
               <label className={labelClass}>Balance</label>
              <input
                type="number"
                value={amountData.balanceAmount}
                readOnly
                className={inputClass}
              />
            </div>
              <div className="md:col-span-3">
               <label className={labelClass}>Payment Status</label>
            <input
              type="text"
              value={amountData.paymentStatus}
              readOnly
              className={inputClass}
            />
          </div>
          </div>

         
        </div>

      {/* ACTIONS */}
   <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button type="reset" className={`${secondaryBtn} w-full sm:w-auto`}>Cancel</button>
        <button type="submit" className={`${primaryBtn} w-full sm:w-auto`}>Create Order</button>
      </div>

    </form>

    <AddClient
      isOpen={isAddClientOpen}
      onClose={() => setIsAddClientOpen(false)}
      onAddClient={handleAddNewClient}
    />
  </div>
);

};

export default CreateOrders;
