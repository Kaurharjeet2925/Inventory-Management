import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import { FaStar } from "react-icons/fa6";
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
    unit: "",
    mrp: "",
    price: "",
    description: "",
    location: "",
    thumbnail: null,
    images: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const catRes = await apiClient.get("/category");
      const brandRes = await apiClient.get("/brands");
    

      setCategories(catRes.data);
      setBrands(brandRes.data);
     
    } catch (err) {
      console.log("Error fetching:", err);
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setProductData({
      name: "",
      category: "",
      brand: "",
      quantity: "",
      unit: "",
      mrp: "",
      price: "",
      description: "",
      location: "",
      thumbnail: null,
      images: [],
    });
    setThumbnailPreview("");
    setImagesPreview([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // Image handlers
  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    setProductData((prev) => ({ ...prev, thumbnail: file }));
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setProductData((prev) => ({ ...prev, images: files }));
    setImagesPreview(files.map((img) => URL.createObjectURL(img)));
  };

  // Save product
  const handleSaveProduct = async () => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "images") {
        productData.images.forEach((img) => formData.append("images", img));
      } else {
        formData.append(key, productData[key]);
      }
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

      handleCloseModal();
    } catch (err) {
      console.log("Save error:", err);
    }
  };

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

      {/* GRID LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded-xl shadow border hover:shadow-lg"
          >
            <img
              src={
                p.thumbnail
                  ? `${process.env.REACT_APP_IMAGE_URL}/${p.thumbnail}`
                  : "https://via.placeholder.com/150"
              }
              className="w-full h-40 object-contain"
              alt="thumb"
            />

            <h2 className="text-lg font-semibold text-center mt-3">{p.name}</h2>

            <p className="text-center text-gray-600 text-sm">
              {p.brandName} • {p.categoryName}
            </p>
          </div>
        ))}
      </div>

     
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[70%] p-8 rounded-xl shadow-lg overflow-y-auto max-h-[95vh]">

            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-2 gap-8">

              {/* LEFT COLUMN */}
              <div>

                <label className="font-semibold">Product Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded mb-4"
                  value={productData.name}
                  onChange={(e) =>
                    setProductData({ ...productData, name: e.target.value })
                  }
                />

                <label className="font-semibold">Brand</label>
                <select
                  className="w-full border p-2 rounded mb-4"
                  value={productData.brand}
                  onChange={(e) =>
                    setProductData({ ...productData, brand: e.target.value })
                  }
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <label className="font-semibold">Category</label>
                <select
                  className="w-full border p-2 rounded mb-4"
                  value={productData.category}
                  onChange={(e) =>
                    setProductData({ ...productData, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <label className="font-semibold">Original Price</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded mb-4"
                  value={productData.mrp}
                  onChange={(e) =>
                    setProductData({ ...productData, mrp: e.target.value })
                  }
                />

                <label className="font-semibold">Sales Price</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded mb-4"
                  value={productData.price}
                  onChange={(e) =>
                    setProductData({ ...productData, price: e.target.value })
                  }
                />

                <label className="font-semibold">Thumbnail Image</label>
                <input type="file" className="mb-3" onChange={handleThumbnail} />

                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
					alt="imagep"
                    className="w-32 h-32 object-contain mb-4 border rounded"
                  />
                )}

                
              </div>

              {/* RIGHT COLUMN */}
              <div>

                <label className="font-semibold">Quantity</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded mb-4"
                  value={productData.quantity}
                  onChange={(e) =>
                    setProductData({ ...productData, quantity: e.target.value })
                  }
                />

               

               <label className="font-semibold">Star Rating</label>
<div className="flex items-center gap-1 mb-4">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      className={`text-2xl cursor-pointer ${
        star <= productData.rating ? "text-yellow-400 color-yellow" : "text-gray-300"
      }`}
      onClick={() =>
        setProductData({ ...productData, rating: star })
      }
    >
      <FaStar/>
    </span>
  ))}
</div>


                <label className="font-semibold">Description</label>
                <textarea
                  className="w-full border p-2 rounded h-32 mb-4"
                  value={productData.description}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      description: e.target.value,
                    })
                  }
                />

                <label className="font-semibold">Inventory Location</label>
                <select
                  className="w-full border p-2 rounded mb-4"
                  value={productData.location}
                  onChange={(e) =>
                    setProductData({ ...productData, location: e.target.value })
                  }
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <label className="font-semibold">Product Images (Max 4)</label>
                <input type="file" multiple onChange={handleImages} />

                <div className="grid grid-cols-4 gap-3 mt-3">
                  {imagesPreview.map((img, i) => (
                    <img
                      key={i}
                      src={img}
					  alt="preview"
                      className="w-28 h-28 border rounded object-contain"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSaveProduct}
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}
     

    </div>
  );
};

export default Product;
