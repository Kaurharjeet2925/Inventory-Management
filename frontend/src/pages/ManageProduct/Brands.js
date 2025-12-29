import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import PageContainer from "../../components/PageContainer";

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

  useEffect(() => {
  const fetchBrands = async () => {
    try {
      const response = await apiClient.get("/brands");
      setBrands(response.data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  fetchBrands();   // <-- REQUIRED
}, []);


  // ---------------------------
  // OPEN MODAL
  // ---------------------------
  const handleOpenModal = () => {
    setEditingId(null);
    setNewBrand({ name: "", image: null });
    setImagePreview("");
    setShowModal(true);
  };

  // ---------------------------
  // EDIT BRAND
  // ---------------------------
  const handleEditBrand = (brand) => {
    setEditingId(brand._id);
    setNewBrand({ name: brand.name, image: null });
     setImagePreview(
          brand.image
          ? `${process.env.REACT_APP_IMAGE_URL}/${brand.image}`
           : ""
          );
       setShowModal(true);
    };

  // ---------------------------
  // CLOSE MODAL
  // ---------------------------
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewBrand({ name: "", image: null });
    setImagePreview("");
  };

  // ---------------------------
  // IMAGE HANDLER (REAL FILE)
  // ---------------------------
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewBrand((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  // ---------------------------
  // ADD / UPDATE BRAND
  // ---------------------------
  const handleAddBrand = async () => {
    if (!newBrand.name) {
      alert("Brand name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", newBrand.name);

    if (newBrand.image instanceof File) {
      formData.append("uploadImage", newBrand.image);
    }

    try {
      if (!editingId) {
        // ADD MODE
        const res = await apiClient.post("/add-brand", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBrands((prev) => [res.data.brand, ...prev]);
      } else {
        // UPDATE MODE
        const res = await apiClient.put(`/brand/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBrands((prev) =>
          prev.map((b) => (b._id === editingId ? res.data.brand : b))
        );
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error saving brand:", err);
      alert("Error saving brand");
    }
  };

  // ---------------------------
  // DELETE BRAND
  // ---------------------------
  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Delete this brand?")) return;

    try {
      await apiClient.delete(`/brand/${id}`);
      setBrands((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // SEARCH FILTER
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Brand Management</h1>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Add Brand
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-white p-3 rounded-lg shadow mb-6 max-w-md">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by brand name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* BRAND GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand._id}
            className="bg-white p-4 rounded-xl shadow-md border hover:shadow-lg transition-all"
          >
            <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={
                  brand.image
                    ? `${process.env.REACT_APP_IMAGE_URL}/${brand.image}`
                    : "https://via.placeholder.com/150"
                }
                alt={brand.name}
                className="object-contain w-full h-full"
              />
            </div>

            <h2 className="text-lg font-semibold text-center mt-3">
              {brand.name}
            </h2>

            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => handleEditBrand(brand)}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleDeleteBrand(brand._id)}
                className="p-2 bg-red-100 rounded-full hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NO RESULTS */}
      {filteredBrands.length === 0 && (
        <p className="text-gray-500 mt-6 text-lg">No brands found.</p>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg">

            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Brand" : "Add New Brand"}
            </h2>

            {/* IMAGE UPLOAD */}
            <div className="mb-4 flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </div>

              <label className="mt-3 cursor-pointer bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImage}
                />
              </label>
            </div>

            {/* BRAND NAME */}
            <label className="block text-sm font-medium mb-1">Brand Name</label>
            <input
              type="text"
              placeholder="Enter brand name"
              value={newBrand.name}
              onChange={(e) =>
                setNewBrand((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border rounded-md p-2 mb-4"
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleAddBrand}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? "Update Brand" : "Save Brand"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
