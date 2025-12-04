import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { Plus, Trash2 } from 'lucide-react';
import AddClient from '../ManageClient/AddClient';

const CreateOrders = () => {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState("");

  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [qtyError, setQtyError] = useState("");

  const [rawProducts, setRawProducts] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  const [amountData, setAmountData] = useState({
    totalAmount: "",
    paidAmount: "",
    balanceAmount: "",
    paymentStatus: "unpaid",
  });

  const [itemForm, setItemForm] = useState({
    productId: "",
    productName: "",
    quantity: "",
    unitType: "",
  });

  const [formData, setFormData] = useState({
    paymentMethod: "credit-card",
    notes: "",
    gstPercentage: 18,
  });

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

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

  /* -------------------------------------------------------
      SEARCHABLE DROPDOWN COMPONENT
  -------------------------------------------------------- */
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
          className="w-full border p-2 rounded"
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

      const selectedWh = warehouseOptions.find((w) => w.id === selectedWarehouseId);
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

  /* -------------------------------------------------------
      ADD ITEM
  -------------------------------------------------------- */
  const addItem = () => {
    if (!itemForm.productId) return alert("Select a product");
    if (!selectedWarehouseId) return alert("Select a warehouse");
    if (!itemForm.quantity) return alert("Enter quantity");
  
    const selectedProduct = products.find(p => p._id === itemForm.productId);
    const selectedWarehouse = warehouseOptions.find(w => w.id === selectedWarehouseId);
  
    const itemToAdd = {
      id: Date.now(),
      productId: itemForm.productId,
      warehouseId: selectedWarehouseId,
      warehouseName: selectedWarehouse?.warehouseName || "Unknown",   // ✅ FIX 1
      productName: selectedProduct.name,
      quantity: Number(itemForm.quantity),
      quantityValue: selectedProduct.quantityValue,   // ✅ FIX 2
      quantityUnit: selectedProduct.quantityUnit,     // ✅ FIX 3
    };
  
    setOrderItems([...orderItems, itemToAdd]);
  
    setItemForm({
      productId: "",
      productName: "",
      quantity: "",
      unitType: "",
    });
  
    setSelectedWarehouseId("");
  };
  
   
  const removeItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  /* -------------------------------------------------------
      BALANCE CALCULATION
  -------------------------------------------------------- */
  useEffect(() => {
    const total = Number(amountData.totalAmount || 0);
    const paid = Number(amountData.paidAmount || 0);
    const balance = total - paid;

    setAmountData((prev) => ({
      ...prev,
      balanceAmount: balance >= 0 ? balance : 0,
      paymentStatus:
        paid === 0
          ? "unpaid"
          : paid >= total
          ? "paid"
          : "partial",
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

      paymentDetails: amountData,
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
        paymentStatus: "unpaid",
      });

      setSelectedWarehouseId("");
      setWarehouseOptions([]);

    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create order");
    }
  };


  return (
    <div className="ml-64 mt-12 p-6">
      <h1 className="text-3xl font-bold mb-2">Create New Order</h1>
      <p className="text-gray-600 mb-6">Select a client and add items</p>

      <form onSubmit={handleSubmit}>
        
        {/* CLIENT SELECTION */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Select Client</h2>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full border rounded p-3 text-lg"
              >
                <option value="">-- Select Client --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} ({client.phone})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsAddClientOpen(true)}
              className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={20} /> New Client
            </button>
          </div>

          {/* CLIENT DETAILS */}
          {selectedClient && (
            <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div><b>Name:</b> {selectedClient.name}</div>
                <div><b>Phone:</b> {selectedClient.phone}</div>
                <div><b>Email:</b> {selectedClient.email}</div>
                <div><b>City:</b> {selectedClient.city}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Delivery Person</h2>

          <select
  value={selectedDeliveryPersonId}
  onChange={(e) => setSelectedDeliveryPersonId(e.target.value)}
  className="w-full border p-3 rounded"
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
      
<div className="bg-gray-50 p-6 rounded-lg mb-6">
  <h2 className="text-xl font-bold mb-4">Order Items</h2>

  {/* 3-column layout: Product – Stock – Add */}
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 items-end">

    {/* PRODUCT SELECT */}
    <div className="sm:col-span-1">
      <label className="block text-sm font-semibold mb-1">Product</label>

      <SearchableSelect
        options={products}
        value={itemForm.productId}
        onChange={(id) => {
          const p = products.find((prod) => prod._id === id);

          setItemForm({
            productId: id,
            productName: p.name,
            quantity: "",
            unitType: p.quantityUnit,
          });

          const warehouses = rawProducts
            .filter(prod =>
              prod.name === p.name &&
              prod.quantityValue === p.quantityValue &&
              prod.quantityUnit === p.quantityUnit
            )
            .map(prod => ({
              id: prod._id,
              warehouseName: prod.location?.name || "Unknown",
              stock: prod.totalQuantity || 0,
            }));

          setWarehouseOptions(warehouses);
          setSelectedWarehouseId("");
          setQtyError("");
        }}
        placeholder="Search product..."
      />
    </div>
    <div>
  <label className="font-semibold">Warehouse</label>
  <select
    value={selectedWarehouseId}
    onChange={(e) => setSelectedWarehouseId(e.target.value)}
    className="border p-2 rounded w-full"
  >
    <option value="">Select Warehouse</option>

    {warehouseOptions.map((wh) => {
      // calculate already ordered FROM THIS warehouse only
      const alreadyOrdered = orderItems
        .filter(
          (it) =>
            it.productId === itemForm.productId &&
            it.warehouseId === wh.id
        )
        .reduce((sum, it) => sum + it.quantity, 0);

      const remainingStock = wh.stock - alreadyOrdered;

      return (
        <option key={wh.id} value={wh.id}>
          {wh.warehouseName} (Stock: {remainingStock})
        </option>
      );
    })}
  </select>
</div>


    {/* STOCK (order quantity) */}
    <div className="relative sm:col-span-1">
      <label className="block text-sm font-semibold mb-1">Quantity</label>

      <input
        type="number"
        name="quantity"
        value={itemForm.quantity}
        disabled={
          selectedWarehouseId &&
          warehouseOptions.find(w => w.id === selectedWarehouseId)?.stock <= 0
        }
        onChange={handleItemChange}
        className={`w-full border rounded p-2 ${qtyError ? "border-red-500" : ""}`}
        min="1"
      />

      {/* AVAILABLE STOCK */}
      {itemForm.productId && selectedWarehouseId && (
  <span className="absolute -bottom-5 left-0 text-xs text-gray-600">
    Available:{" "}
    {(() => {
      const wh = warehouseOptions.find(
        (w) => w.id === selectedWarehouseId
      );

      // deduct already ordered 
      const alreadyOrdered = orderItems
        .filter(
          (it) =>
            it.productId === itemForm.productId &&
            it.warehouseId === selectedWarehouseId
        )
        .reduce((sum, it) => sum + it.quantity, 0);

      return (wh?.stock || 0) - alreadyOrdered;
    })()}
  </span>
)}


      {qtyError && (
        <p className="text-red-500 text-xs absolute -bottom-10 left-0">
          {qtyError}
        </p>
      )}
    </div>

    {/* ADD BUTTON */}
    <div className="sm:col-span-1">
      <button
        type="button"
        onClick={addItem}
        disabled={
          !itemForm.productId ||
          !selectedWarehouseId ||
          warehouseOptions.find(w => w.id === selectedWarehouseId)?.stock <= 0
        }
        className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Add
      </button>
    </div>

  </div>

  {/* ADDED ITEMS LIST */}
  {orderItems.length > 0 && (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200 ">
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-left">Warehouse</th>
            <th className="p-4 text-left">Quantity</th>
            <th className="p-4 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="p-4 text-left">{item.productName}-{item.quantityValue}{item.quantityUnit}</td>
              <td className='p-4 text-left'>{item.warehouseName}</td>
              <td className="p-4 text-left">{item.quantity}</td>
              <td className="p-4 text-left">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)} 
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

<div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label>Total Amount</label>
              <input
                type="number"
                value={amountData.totalAmount}
                onChange={(e) =>
                  setAmountData({ ...amountData, totalAmount: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Paid Amount</label>
              <input
                type="number"
                value={amountData.paidAmount}
                onChange={(e) =>
                  setAmountData({ ...amountData, paidAmount: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Balance</label>
              <input
                type="number"
                value={amountData.balanceAmount}
                readOnly
                className="border bg-gray-100 p-2 rounded w-full"
              />
            </div>
          </div>

          <div className="mt-3">
            <label>Payment Status</label>
            <input
              type="text"
              value={amountData.paymentStatus}
              readOnly
              className="border bg-gray-100 p-2 rounded w-full"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex gap-3 justify-end">
          <button
            type="reset"
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Order
          </button>
        </div>
      </form>

      {/* ADD CLIENT MODAL */}
      <AddClient
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onAddClient={handleAddNewClient}
      />
    </div>
  );
};

export default CreateOrders;
