import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";

const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

const Categories = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [newCategory, setNewCategory] = useState({
    name: "",
    image: null,
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiClient.get("/category");
      setCategories(res.data || []);
    };
    fetchCategories();
  }, []);

  /* ================= MODAL ================= */
  const openModal = () => {
    setEditingId(null);
    setNewCategory({ name: "", image: null });
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setNewCategory({ name: cat.name, image: null });
    setImagePreview(
      cat.image ? `${process.env.REACT_APP_IMAGE_URL}/${cat.image}` : ""
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewCategory({ name: "", image: null });
    setImagePreview("");
  };

  /* ================= IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewCategory((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= SAVE ================= */
  const saveCategory = async () => {
    if (!newCategory.name.trim()) return alert("Category name required");

    const formData = new FormData();
    formData.append("name", newCategory.name);
    if (newCategory.image instanceof File) {
      formData.append("uploadImage", newCategory.image);
    }

    try {
      let res;
      if (editingId) {
        res = await apiClient.put(`/category/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? res.data.category : c))
        );
      } else {
        res = await apiClient.post("/add-category", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCategories((prev) => [res.data.category, ...prev]);
      }
      closeModal();
    } catch {
      alert("Error saving category");
    }
  };

  /* ================= DELETE ================= */
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await apiClient.delete(`/category/${id}`);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Category Management
        </h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-blue-900 hover:bg-amber-500 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-white p-3 rounded-lg shadow mb-6 max-w-md">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* GRID (COMPACT LIKE BRANDS) */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">

        {filteredCategories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white p-2 rounded-lg shadow-sm border hover:shadow-md transition"
          >
            {/* IMAGE */}
            <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden border max-h-40">

              <img
                src={
                  cat.image
                    ? `${process.env.REACT_APP_IMAGE_URL}/${cat.image}`
                    : "https://via.placeholder.com/300"
                }
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* NAME */}
            <h2 className="text-sm font-medium text-center mt-2 truncate">
              {cat.name}
            </h2>

            {/* ACTIONS */}
            <div className="mt-2 flex justify-center gap-2">
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-100"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteCategory(cat._id)}
                className="p-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <p className="text-gray-500 mt-6 text-lg">No categories found.</p>
      )}

      {/* ================= MODAL (SAME THEME AS BRANDS) ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveCategory();
            }}
            className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-xl text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* IMAGE */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 border rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>

                <label className="mt-3 cursor-pointer bg-blue-900 hover:bg-amber-500 text-white px-3 py-2 rounded-md flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>
              </div>

              {/* NAME */}
              <div>
                <label className={labelClass}>Category Name</label>
                <input
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
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
                {editingId ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Categories;
