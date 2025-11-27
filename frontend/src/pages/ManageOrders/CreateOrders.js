import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { Plus, Trash2 } from 'lucide-react';
import AddClient from '../ManageClient/AddClient';

const CreateOrders = () => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [qtyError, setQtyError] = useState("");
  const [itemForm, setItemForm] = useState({
    productId: '',
    productName: '',
    quantity: '',
    // unitPrice removed (calculated from products mapping)
    unitType: '', // e.g. 'piece', 'packet', 'kg'
  });

  const [formData, setFormData] = useState({
    paymentMethod: 'credit-card',
    notes: '',
    gstPercentage: 18,
  });

  // Sample clients data (would come from API)
  const [clients, setClients] = useState([]);

  React.useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await apiClient.get('/clients');
        // controller returns { message, clients, total }
        setClients(res.data?.clients || []);
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    };
    loadClients();
  }, []);

  // Sample products data (would come from API)
  // products now include unitPrices mapping for different unit types
  const [products, setProducts] = useState([]);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        // normalize returned products to expected shape
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    loadProducts();
  }, []);

  // Reusable searchable select for products
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

    useEffect(() => {
      const sel = options.find((o) => (o._id || o.id) === value || o.id === value);
      setQuery(sel ? (sel.name || '') : '');
    }, [value, options]);

    const filtered = options.filter((o) => (o.name || '').toLowerCase().includes(query.toLowerCase()));

    return (
      <div className="relative" ref={ref}>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border p-2 rounded"
        />
        {open && (
          <ul className="absolute z-40 w-full bg-white border rounded mt-1 max-h-48 overflow-auto shadow">
            {filtered.length === 0 && <li className="p-2 text-sm text-gray-500">No results</li>}
            {filtered.map((o) => (
              <li key={o._id || o.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { onChange(o._id || o.id); setQuery(o.name); setOpen(false); }}>
                {o.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const selectedClient = clients.find((c) => c._id === selectedClientId);

  const handleAddNewClient = (newClient) => {
    // Add new client to list and auto-select it
    setClients([...clients, newClient]);
    setSelectedClientId(newClient._id);
  };

 const handleItemChange = (e) => {
  const { name, value } = e.target;

  if (name === "quantity") {
    const product = products.find(
      (p) => (p._id || p.id) === itemForm.productId
    );

    const availableQty = product?.quantity || 0;
    const qty = Number(value);

    // If user enters more than available → show error
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



  // product selection is handled inline by SearchableSelect onChange

  const handleUnitTypeChange = (e) => {
    const newUnit = e.target.value;
    setItemForm({ ...itemForm, unitType: newUnit });
  };

  const addItem = () => {
  const product = products.find(
    (p) => (p._id || p.id) === itemForm.productId
  );

  const availableQty = product?.quantity || 0;

  if (!itemForm.productId || !itemForm.unitType) {
    return alert("Please select product and unit");
  }

  if (itemForm.quantity > availableQty) {
    return alert(`You cannot add more than ${availableQty} items.`);
  }

  const itemToAdd = {
    id: Date.now(),
    productId: itemForm.productId,
    productName: itemForm.productName,
    unitType: itemForm.unitType,
    quantity: itemForm.quantity,
  };

  setOrderItems([...orderItems, itemToAdd]);
  setItemForm({
    productId: "",
    productName: "",
    quantity: 1,
    unitType: "",
  });
};


  const removeItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const prod = products.find((p) => (p._id || p.id) === item.productId);
      // prefer explicit unitPrices mapping if available, otherwise fallback to product.price
      const priceFromMap = prod && prod.unitPrices && item.unitType ? (prod.unitPrices[item.unitType] || 0) : null;
      const price = priceFromMap != null ? priceFromMap : (prod?.price || 0);
      return sum + item.quantity * price;
    }, 0);
  };

  const calculateGST = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * formData.gstPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientId || orderItems.length === 0) {
      alert('Please select a client and add items');
      return;
    }
    const orderData = {
      clientId: selectedClientId,
      clientName: selectedClient.name,
      items: orderItems,
      subtotal: calculateSubtotal(),
      gstPercentage: formData.gstPercentage,
      gstAmount: calculateGST(),
      total: calculateTotal(),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    console.log('Order Data:', orderData);
    alert('Order created successfully!');
    // Reset form
    setSelectedClientId(null);
    setOrderItems([]);
    setFormData({ paymentMethod: 'credit-card', notes: '', gstPercentage: 18 });
  };

  return (
    <div className="ml-64 mt-12 p-6">
      <h1 className="text-3xl font-bold mb-2">Create New Order</h1>
      <p className="text-gray-600 mb-6">Select a client and add items to create an order</p>

      <form onSubmit={handleSubmit}>
        {/* Client Selection */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Select Client</h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full border rounded p-3 text-lg"
                required
              >
                <option value="">-- Choose a Client --</option>
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
              className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 flex items-center gap-2 whitespace-nowrap transition"
            >
              <Plus size={20} /> New Client
            </button>
          </div>

          {/* Selected Client Details */}
          {selectedClient && (
            <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-semibold">{selectedClient.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-semibold">{selectedClient.phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-semibold">{selectedClient.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">City:</span>
                  <p className="font-semibold">{selectedClient.city}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Product </label>
              <SearchableSelect
                options={products}
                value={itemForm.productId}
                onChange={(id) => {
                  // set product id and populate default unitType
                  const selectedProduct = products.find((p) => (p._id || p.id) === id);
                  const unitTypes = selectedProduct?.unitOptions || [];
                  const defaultUnit = Array.isArray(unitTypes) && unitTypes.length > 0 ? unitTypes[0] : '';
                  setItemForm({ ...itemForm, productId: id, productName: selectedProduct?.name || '', unitType: defaultUnit });
                }}
                placeholder="Search product..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Unit</label>
              <select
                value={itemForm.unitType}
                onChange={handleUnitTypeChange}
                className="w-full border rounded p-2"
                disabled={!itemForm.productId}
              >
                <option value="">Select Unit</option>
                {(products.find(p => (p._id || p.id) === itemForm.productId)?.unitOptions || []).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="relative pb-7">
  <label className="block text-sm font-semibold mb-1">Quantity</label>

  <input
    type="number"
    name="quantity"
    value={itemForm.quantity}
    onChange={handleItemChange}
    className={`w-full border rounded p-2 ${qtyError ? "border-red-500" : ""}`}
    min="1"
  />

  {itemForm.productId && (
    <span className="absolute -bottom-5 left-0 text-xs text-gray-600">
      Available: {products.find(p => (p._id || p.id) === itemForm.productId)?.quantity || 0}
    </span>
  )}

  {qtyError && (
    <p className="text-red-500 text-xs absolute -bottom-10 left-0">
      {qtyError}
    </p>
  )}
</div>



            {/* unit price is kept internally; no visible input required */}

            <div className="flex items-end">
              <button
                type="button"
                onClick={addItem}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>

          {/* Items List */}
          {orderItems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-center">Unit</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-100">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">{item.unitType || '-'}</td>
                      
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

              <div className="mt-4 text-right">
                <div className="text-lg font-semibold mb-2">
                  Subtotal: <span className="text-gray-700">₹{calculateSubtotal()}</span>
                </div>
                <div className="flex items-center justify-end gap-2 mb-2">
                  <label className="text-lg font-semibold">GST ({formData.gstPercentage}%):</label>
                  <input
                    type="number"
                    name="gstPercentage"
                    value={formData.gstPercentage}
                    onChange={handleInputChange}
                    className="w-20 border rounded p-1 text-center"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="text-gray-700 ml-2">₹{calculateGST().toFixed(2)}</span>
                </div>
                <div className="text-xl font-bold border-t-2 pt-2">
                  Total: <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

       
        {/* Action Buttons */}
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

      {/* Add Client Modal */}
      <AddClient
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onAddClient={handleAddNewClient}
      />
    </div>
  );
};

export default CreateOrders;
