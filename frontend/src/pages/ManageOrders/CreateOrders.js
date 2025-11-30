import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { Plus, Trash2 } from 'lucide-react';
import AddClient from '../ManageClient/AddClient';

const CreateOrders = () => {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [qtyError, setQtyError] = useState("");

  const [itemForm, setItemForm] = useState({
    productId: '',
    productName: '',
    quantity: '',
    unitType: '',
  });

  const [formData, setFormData] = useState({
    paymentMethod: 'credit-card',
    notes: '',
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
        const res = await apiClient.get('/clients');
        setClients(res.data?.clients || []);
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    };
    loadClients();
  }, []);

  /* -------------------------------------------------------
     LOAD PRODUCTS + MERGE NAME (name + qty + unit)
  -------------------------------------------------------- */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get('/products');

        const mergedProducts = res.data.map((p) => ({
          ...p,
          displayName: `${p.name} – ${ p.quantityValue || 0} ${p.quantityUnit || ''}`,
        }));

        setProducts(mergedProducts);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    loadProducts();
  }, []);

  const SearchableSelect = ({ options = [], value, onChange, placeholder }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }, []);

    // Show selected item in input
    useEffect(() => {
      const sel = options.find((o) => o._id === value);
      setQuery(sel ? sel.displayName : '');
    }, [value, options]);

    const filtered = options.filter((o) =>
      (o.displayName || '').toLowerCase().includes(query.toLowerCase())
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
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border p-2 rounded"
        />

        {open && (
          <ul className="absolute z-40 w-full bg-white border rounded mt-1 max-h-48 overflow-auto shadow">
            {filtered.length === 0 && (
              <li className="p-2 text-sm text-gray-500">No results</li>
            )}

            {filtered.map((o) => (
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

  const selectedClient = clients.find((c) => String(c._id) === String(selectedClientId));

  const handleAddNewClient = (newClient) => {
    setClients([...clients, newClient]);
    setSelectedClientId(newClient._id);
  };

  /* -------------------------------------------------------
     ITEM CHANGE
  -------------------------------------------------------- */
  const handleItemChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const product = products.find((p) => p._id === itemForm.productId);
      const dbStock = product?.totalQuantity || product?.quantityValue || 0;
      // Deduct quantities already added in orderItems for this product
      const alreadyOrdered = orderItems
        .filter((it) => String(it.productId) === String(itemForm.productId))
        .reduce((sum, it) => sum + it.quantity, 0);
      const availableQty = dbStock - alreadyOrdered;
      const qty = Number(value);

      if (!qty || qty <= 0) {
        setItemForm({ ...itemForm, quantity: "" });
        return;
      }

      if (qty > availableQty) {
        setQtyError(`Cannot select more than ${availableQty} in stock`);
        return;
      } else {
        setQtyError("");
      }

      setItemForm({ ...itemForm, quantity: qty });
      return;
    }

    setItemForm({ ...itemForm, [name]: value });
  };

  /* -------------------------------------------------------
     ADD ITEM
  -------------------------------------------------------- */
  const addItem = () => {
    const product = products.find((p) => p._id === itemForm.productId);
    const dbStock = product?.totalQuantity || product?.quantityValue || 0;
    // Deduct quantities already added in orderItems for this product
    const alreadyOrdered = orderItems
      .filter((it) => String(it.productId) === String(itemForm.productId))
      .reduce((sum, it) => sum + it.quantity, 0);
    const availableQty = dbStock - alreadyOrdered;

    if (!itemForm.productId) return alert("Select a product first");
    if (!itemForm.quantity || itemForm.quantity <= 0) return alert("Enter valid quantity");

    if (itemForm.quantity > availableQty) {
      return alert(`You cannot add more than ${availableQty}`);
    }

    const itemToAdd = {
      id: Date.now(),
      productId: itemForm.productId,
      productName: product?.name,
      quantityValue: product?.quantityValue || null,
      unitType: itemForm.unitType,
      quantity: Number(itemForm.quantity),
    };

    setOrderItems([...orderItems, itemToAdd]);

    setItemForm({
      productId: "",
      productName: "",
      quantity: "",
      unitType: "",
    });
  };

  const removeItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  
 
  /* -------------------------------------------------------
     SUBMIT ORDER
  -------------------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedClientId || orderItems.length === 0) {
      alert("Select a client and add at least one item.");
      return;
    }

    // Build payload expected by backend: client + items + optional notes/status
    const payload = {
      clientId: selectedClientId,
      clientName: selectedClient?.name || "",
      items: orderItems.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: Number(it.quantity),
        quantityValue: Number(it.quantityValue),
        unitType: it.unitType || "",
      })),
      notes: formData.notes || "",
      status: "pending",
    };

    (async () => {
      try {
        const res = await apiClient.post('/orders', payload);
        if (res?.data?.order) {
          alert('Order created successfully');
          setSelectedClientId(null);
          setOrderItems([]);
          setFormData({ paymentMethod: 'credit-card', notes: '', gstPercentage: 18 });
        } else {
          alert('Order created (no order object returned)');
        }
      } catch (err) {
        console.error('Failed to create order', err);
        const msg = err?.response?.data?.message || err.message || 'Failed to create order';
        alert(msg);
      }
    })();
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

        {/* ORDER ITEMS */}
       {/* -----------------------------
    ORDER ITEMS (FINAL SIMPLE VERSION)
    Product | Stock | Add Button
------------------------------ */}
<div className="bg-gray-50 p-6 rounded-lg mb-6">
  <h2 className="text-xl font-bold mb-4">Order Items</h2>

  {/* 3-column layout: Product – Stock – Add */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 items-end">

    {/* PRODUCT SELECT */}
    <div className="sm:col-span-1">
      <label className="block text-sm font-semibold mb-1">Product</label>

      <SearchableSelect
        options={products}
        value={itemForm.productId}
        onChange={(id) => {
          const selectedProduct = products.find((p) => p._id === id);

          // auto-set quantity to 1 and fill unitType from product
          setItemForm({
            productId: id,
            productName: selectedProduct?.name || "",
            quantity: 1,
            unitType: selectedProduct?.quantityUnit || "",
          });

          setQtyError("");
        }}
        placeholder="Search product..."
      />
    </div>

    {/* STOCK (order quantity) */}
    <div className="relative sm:col-span-1">
      <label className="block text-sm font-semibold mb-1">Quantity</label>

      <input
        type="number"
        name="quantity"
        value={itemForm.quantity}
        onChange={handleItemChange}
        className={`w-full border rounded p-2 ${qtyError ? "border-red-500" : ""}`}
        min="1"
      />

      {/* AVAILABLE STOCK */}
      {itemForm.productId && (
        <span className="absolute -bottom-5 left-0 text-xs text-gray-600">
          Available:{" "}
          {(() => {
            const prod = products.find((p) => p._id === itemForm.productId);
            const dbStock = prod?.totalQuantity ?? prod?.quantityValue ?? 0;
            // Deduct quantities already added in orderItems
            const alreadyOrdered = orderItems
              .filter((it) => String(it.productId) === String(itemForm.productId))
              .reduce((sum, it) => sum + it.quantity, 0);
            const remaining = dbStock - alreadyOrdered;
            return remaining;
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
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-center">Qty</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="p-2">{item.productName}</td>
              <td className="p-2 text-center">{item.quantity}</td>
              <td className="p-2 text-center">
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
