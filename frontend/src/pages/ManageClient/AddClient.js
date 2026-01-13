import React, { useState, useEffect } from "react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

const AddClient = ({ isOpen, onClose, onAddClient, clientData, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    openingBalance: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (isEdit && clientData) {
      setFormData({
        name: clientData.name || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        companyName: clientData.companyName || "",
        address: clientData.address || "",
        city: clientData.city || "",
        state: clientData.state || "",
        zipCode: clientData.zipCode || "",
        country: clientData.country || "",
        openingBalance: clientData.openingBalance ?? 0,
      });
    } else {
      resetForm();
    }
  }, [isOpen, clientData, isEdit]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "openingBalance" ? Number(value || 0) : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (formData.openingBalance < 0)
      newErrors.openingBalance = "Opening balance cannot be negative";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await apiClient.put(`/clients/${clientData._id}`, formData);
        toast.success("Client updated successfully");
        onAddClient(res.data?.client, true);
      } else {
        res = await apiClient.post("/clients", formData);
        toast.success("Client added successfully");
        onAddClient(res.data?.client, false);
      }
      resetForm();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      openingBalance: 0,
    });
    setErrors({});
  };

  if (!isOpen) return null;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center sticky top-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Edit Client" : "Add New Client"}
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-xl text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} className={inputClass} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" value={formData.email} onChange={handleChange} className={inputClass} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Phone *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className={labelClass}>Company Name</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* ROW 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>State</label>
              <input name="state" value={formData.state} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Zip Code</label>
              <input name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* ROW 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Country</label>
              <input name="country" value={formData.country} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Opening Balance</label>
              <input
                type="number"
                min="0"
                name="openingBalance"
                value={formData.openingBalance}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.openingBalance && (
                <p className="text-red-500 text-xs mt-1">{errors.openingBalance}</p>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-md">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-900 text-white rounded-md">
              {loading ? "Saving..." : isEdit ? "Update Client" : "Add Client"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddClient;
