import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";

const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

const Brands = () => {
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [newBrand, setNewBrand] = useState({
    name: "",
    image: null,
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchBrands = async () => {
      const res = await apiClient.get("/brands");
      setBrands(res.data || []);
    };
    fetchBrands();
  }, []);

  /* ================= MODAL HANDLERS ================= */
  const openModal = () => {
    setEditingId(null);
    setNewBrand({ name: "", image: null });
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (brand) => {
    setEditingId(brand._id);
    setNewBrand({ name: brand.name, image: null });
    setImagePreview(
      brand.image ? `${process.env.REACT_APP_IMAGE_URL}/${brand.image}` : ""
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewBrand({ name: "", image: null });
    setImagePreview("");
  };

  /* ================= IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewBrand((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= SAVE ================= */
  const saveBrand = async () => {
    if (!newBrand.name.trim()) return alert("Brand name required");

    const formData = new FormData();
    formData.append("name", newBrand.name);
    if (newBrand.image instanceof File) {
      formData.append("uploadImage", newBrand.image);
    }

    try {
      let res;
      if (editingId) {
        res = await apiClient.put(`/brand/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBrands((prev) =>
          prev.map((b) => (b._id === editingId ? res.data.brand : b))
        );
      } else {
        res = await apiClient.post("/add-brand", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBrands((prev) => [res.data.brand, ...prev]);
      }
      closeModal();
    } catch (err) {
      alert("Error saving brand");
    }
  };

  /* ================= DELETE ================= */
  const deleteBrand = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    await apiClient.delete(`/brand/${id}`);
    setBrands((prev) => prev.filter((b) => b._id !== id));
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Brand Management</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-blue-900 hover:bg-amber-500 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" /> Add Brand
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-white p-3 rounded-lg shadow mb-6 max-w-md">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          placeholder="Search brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBrands.map((brand) => (
          <div
            key={brand._id}
            className="bg-white p-2 rounded-lg shadow-sm border hover:shadow-md transition"
          >
<div>
  <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden border max-h-40">

    <img
      src={
        brand.image
          ? `${process.env.REACT_APP_IMAGE_URL}/${brand.image}`
          : "https://via.placeholder.com/300"
      }
      alt={brand.name}
      className="w-full h-full object-cover"
    />
  </div>

  <h2 className="text-sm font-medium text-center mt-2 truncate">
    {brand.name}
  </h2>

  <div className="mt-2 flex justify-center gap-2">
    <button
      onClick={() => openEdit(brand)}
      className="p-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-100"
    >
      <Pencil className="w-4 h-4" />
    </button>

    <button
      onClick={() => deleteBrand(brand._id)}
      className="p-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-100"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
</div>

          </div>
        ))}
      </div>

      {/* ================= MODAL (SAME THEME) ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveBrand();
            }}
            className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Brand" : "Add Brand"}
              </h2>
              <button type="button" onClick={closeModal} className="text-xl text-gray-500">
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* IMAGE */}
              <div className="flex flex-col items-center">
               <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
  {imagePreview ? (
    <img
      src={imagePreview}
      alt="Brand Preview"
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-gray-400 text-sm">No Image</span>
  )}
</div>


                <label className="mt-3 cursor-pointer bg-blue-900 hover:bg-amber-500 text-white px-3 py-2 rounded-md flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImage} />
                </label>
              </div>

              {/* NAME */}
              <div>
                <label className={labelClass}>Brand Name</label>
                <input
                  value={newBrand.name}
                  onChange={(e) =>
                    setNewBrand((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 border rounded-md hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-blue-900 hover:bg-amber-500 text-white"
              >
                {editingId ? "Update Brand" : "Save Brand"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Brands;
