import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";

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

  // FETCH ALL CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // OPEN MODAL
  const handleOpenModal = () => {
    setEditingId(null);
    setNewCategory({ name: "", image: null });
    setImagePreview("");
    setShowModal(true);
  };

  // EDIT CATEGORY
  const handleEditCategory = (cat) => {
    setEditingId(cat._id);
    setNewCategory({ name: cat.name, image: null });

    setImagePreview(
          cat.image
          ? `${process.env.REACT_APP_IMAGE_URL}/uploads/${cat.image}`

           : ""
          );

    setShowModal(true);
  };

  // CLOSE MODAL
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewCategory({ name: "", image: null });
    setImagePreview("");
  };

  // IMAGE HANDLER
   const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewCategory((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };
  // ADD / UPDATE CATEGORY
  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      alert("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", newCategory.name);

    if (newCategory.image instanceof File) {
      formData.append("uploadImage", newCategory.image);
    }

    try {
      let res;

      if (!editingId) {
        // ADD
        res = await apiClient.post("/add-category", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setCategories((prev) => [res.data.category, ...prev]);
      } else {
        // UPDATE
        res = await apiClient.put(`/category/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? res.data.category : c))
        );
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Error saving category");
    }
  };

  // DELETE CATEGORY
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await apiClient.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // SEARCH FILTER
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-white p-3 rounded-lg shadow mb-6 max-w-md">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white p-4 rounded-xl shadow-md border hover:shadow-lg transition-all"
          >
            <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={
                  cat.image
                    ? `${process.env.REACT_APP_IMAGE_URL}/${cat.image}`
                    : "https://via.placeholder.com/150"
                }
                alt={cat.name}
                className="object-contain w-full h-full"
              />
            </div>

            <h2 className="text-lg font-semibold text-center mt-3">
              {cat.name}
            </h2>

            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => handleEditCategory(cat)}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleDeleteCategory(cat._id)}
                className="p-2 bg-red-100 rounded-full hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NO RESULTS */}
      {filteredCategories.length === 0 && (
        <p className="text-gray-500 mt-6 text-lg">No categories found.</p>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Category" : "Add New Category"}
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

            {/* CATEGORY NAME */}
            <label className="block text-sm font-medium mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
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
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? "Update Category" : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default Categories;
