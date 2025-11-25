import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";

const Product = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [imagesPreview, setImagesPreview] = useState([]);

  const [productData, setProductData] = useState({
    name: "",
    category: "",
    brand: "",
    quantity: "",
    location: "",
    thumbnail: null,
    images: [],
  });

  // FETCH CATEGORIES, BRANDS, PRODUCTS
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const catRes = await apiClient.get("/category");
      const brandRes = await apiClient.get("/brands");
      const prodRes = await apiClient.get("/products");
      const locRes = await apiClient.get("/locations");

      setCategories(catRes.data);
      setBrands(brandRes.data);
      setProducts(prodRes.data);
      setLocations(locRes.data);

    } catch (err) {
      console.log("Error fetching data:", err);
    }
  };
 const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setProducts({ name: "", image: null });
    setImagesPreview("");
  };

  // OPEN MODAL
  const handleOpenModal = () => {
    setEditingId(null);
    setProductData({
      name: "",
      category: "",
      brand: "",
      quantity: "",
      location: "",
      thumbnail: null,
      images: [],
    });
    setThumbnailPreview("");
    setImagesPreview([]);
    setShowModal(true);
  };

  // EDIT PRODUCT
  const handleEditProduct = (p) => {
    setEditingId(p._id);
    setProductData({
      name: p.name,
      category: p.category,
      brand: p.brand,
      quantity: p.quantity,
      location: p.location,
      thumbnail: null,
      images: [],
    });

    setThumbnailPreview(
      p.thumbnail ? `${process.env.REACT_APP_IMAGE_URL}/${p.thumbnail}` : ""
    );

    setImagesPreview(
      p.images?.map((img) => `${process.env.REACT_APP_IMAGE_URL}/${img}`)
    );

    setShowModal(true);
  };

  // THUMBNAIL
  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProductData((prev) => ({ ...prev, thumbnail: file }));
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // MULTI IMAGES
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setProductData((prev) => ({ ...prev, images: files }));
    setImagesPreview(files.map((file) => URL.createObjectURL(file)));
  };

  // SAVE PRODUCT
  const handleSaveProduct = async () => {
    if (!productData.name || !productData.category || !productData.brand) {
      alert("Name, Category, Brand are required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("category", productData.category);
    formData.append("brand", productData.brand);
    formData.append("quantity", productData.quantity);
    formData.append("location", productData.location);

    if (productData.thumbnail) {
      formData.append("thumbnail", productData.thumbnail);
    }

    productData.images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      if (!editingId) {
        const res = await apiClient.post("/add-product", formData);
        setProducts((prev) => [res.data.product, ...prev]);
      } else {
        const res = await apiClient.put(`/product/${editingId}`, formData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data.product : p))
        );
      }

      setShowModal(false);
    } catch (err) {
      console.log("Product Save Error:", err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await apiClient.delete(`/product/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  // FILTER SEARCH
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ml-64 mt-12 p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-white p-3 rounded-lg shadow mb-6 max-w-md">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow-md border hover:shadow-lg transition-all">
            
            {/* THUMBNAIL */}
            <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={
                  p.thumbnail
                    ? `${process.env.REACT_APP_IMAGE_URL}/${p.thumbnail}`
                    : "https://via.placeholder.com/150"
                }
                alt={p.name}
                className="object-contain w-full h-full"
              />
            </div>

            <h2 className="text-lg font-semibold text-center mt-3">{p.name}</h2>

            <p className="text-sm text-center text-gray-600">
              {p.brandName} • {p.categoryName}
            </p>

            <p className="text-center text-gray-500">Qty: {p.quantity}</p>

            <div className="mt-3 flex justify-center gap-3">
              <button onClick={() => handleEditProduct(p)} className="p-2 bg-blue-100 rounded-full">
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>

              <button onClick={() => handleDelete(p._id)} className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg overflow-y-auto max-h-[95vh]">

            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            {/* NAME */}
            <label className="font-medium">Product Name</label>
            <input
              type="text"
              className="w-full border p-2 mb-4 rounded"
              value={productData.name}
              onChange={(e) =>
                setProductData((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            {/* CATEGORY */}
            <label className="font-medium">Category</label>
            <select
              className="w-full border p-2 mb-4 rounded"
              value={productData.category}
              onChange={(e) =>
                setProductData((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            {/* BRAND */}
            <label className="font-medium">Brand</label>
            <select
              className="w-full border p-2 mb-4 rounded"
              value={productData.brand}
              onChange={(e) =>
                setProductData((prev) => ({ ...prev, brand: e.target.value }))
              }
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>

            {/* QUANTITY */}
            <label className="font-medium">Quantity</label>
            <input
              type="number"
              className="w-full border p-2 mb-4 rounded"
              value={productData.quantity}
              onChange={(e) =>
                setProductData((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />

            {/* LOCATION */}
            <label className="font-medium">Inventory Location</label>
            <select
              className="w-full border p-2 mb-4 rounded"
              value={productData.location}
              onChange={(e) =>
                setProductData((prev) => ({ ...prev, location: e.target.value }))
              }
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>

            {/* THUMBNAIL */}
            <label className="font-medium">Thumbnail Image</label>
            <input type="file" className="mb-2" onChange={handleThumbnail} />
            {thumbnailPreview && (
              <img src={thumbnailPreview} className="w-32 h-32 object-contain mb-4" alt="preview" />
            )}

            {/* ADDITIONAL IMAGES */}
            <label className="font-medium">Additional Images (Max 4)</label>
            <input type="file" multiple className="mb-2" onChange={handleImages} />

            <div className="flex gap-2 flex-wrap mb-4">
              {imagesPreview.map((img, i) => (
                <img key={i} src={img} className="w-24 h-24 object-contain border rounded" alt="preview" />
              ))}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleCloseModal}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSaveProduct}>
                {editingId ? "Update Product" : "Save Product"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
