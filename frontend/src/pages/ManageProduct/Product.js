import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Package, AlertTriangle, XCircle, BarChart3 } from "lucide-react";
import AddLocationModal from "./components/AddLocation";
import AddProducts from "./components/AddProducts";
const DEFAULT_UNITS = ["piece", "packet", "kg", "ltr", "gm"];

const Product = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [imagesPreview, setImagesPreview] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    category: "",
    quantityValue: "",
    quantityUnit: "",
    totalQuantity: "",
    mrp: "",
    price: "",
    description: "",
    location: "",
    rating: 0,
    thumbnail: null,
    images: [],
  });

  const [filterStock, setFilterStock] = useState("");
  const [sortBy, setSortBy] = useState("");

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.totalQuantity <= 10 && p.totalQuantity > 0).length;
  const outOfStock = products.filter((p) => p.totalQuantity === 0).length;
  const mostStockProduct = products.length ? Math.max(...products.map((p) => p.totalQuantity)) : 0;

  // FETCH DATA
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [cat, brand, prod, loc] = await Promise.all([
        apiClient.get("/category"),
        apiClient.get("/brands"),
        apiClient.get("/products"),
        apiClient.get("/locations"),
      ]);

      setCategories(cat.data);
      setBrands(brand.data);
      setProducts(prod.data);
      setLocations(loc.data.locations || loc.data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  const handleAddLocationFromProduct = async () => {
    if (!newLocationName.trim() || !newAddress.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await apiClient.post("/locations/create", {
        name: newLocationName,
        address: newAddress,
      });

      const newLoc = res.data.location;

      // update list
      setLocations((prev) => [...prev, newLoc]);

      // auto-select new location in product form
      setProductData((prev) => ({
        ...prev,
        location: newLoc._id,
      }));

      setShowLocationModal(false);
      setNewLocationName("");
      setNewAddress("");
      toast.success("Location added!");
    } catch (err) {
      toast.error("Failed to add location");
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setProductData({
      name: "",
      brand: "",
      category: "",
      quantityValue: "",
      quantityUnit: "",
      totalQuantity: "",
      mrp: "",
      price: "",
      description: "",
      location: "",
      rating: 0,
      thumbnail: null,
      images: [],
    });
    setThumbnailPreview("");
    setImagesPreview([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setProductData({
      name: p.name,
      brand: p.brand?._id,
      category: p.category?._id,
      location: p.location?._id,
      quantityValue: p.quantityValue,
      quantityUnit: p.quantityUnit,
      totalQuantity: p.totalQuantity,
      mrp: p.mrp,
      price: p.price,
      description: p.description,
      rating: p.rating || 0,
      thumbnail: null,
      images: [],
    });

    setThumbnailPreview(p.thumbnail ? `${process.env.REACT_APP_IMAGE_URL}/${p.thumbnail}` : "");
    setImagesPreview(Array.isArray(p.images) ? p.images.map((img) => `${process.env.REACT_APP_IMAGE_URL}/${img}`) : []);
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await apiClient.delete(`/product/${id}`);
    setProducts(products.filter((p) => p._id !== id));
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProductData({ ...productData, thumbnail: file });
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setProductData({ ...productData, images: files });
    setImagesPreview(files.map((file) => URL.createObjectURL(file)));
  };

  const saveProduct = async () => {
    const formData = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((img) => {
          if (img instanceof File) {
            formData.append("images", img);
          }
        });
      } else if (key === "thumbnail") {
        if (value instanceof File) {
          formData.append("thumbnail", value);
        }
      } else if (key !== "images") {
        formData.append(key, value);
      }
    });

    try {
      if (editingId) {
        await apiClient.put(`/product/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/product/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(editingId ? "Product updated successfully" : "Product added successfully");
      fetchAll();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving product");
      console.error(error);
    }
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
     
      <div className="flex flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Product Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage products, stock and locations</p>
        </div>

        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="hidden xs:inline">Add Product</span>
          <span className="inline xs:hidden">Add</span>
        </button>
      </div>
     

      {/* ================= STATS (LIGHT COLORS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 sm:mb-8">
        <div className="bg-blue-100 border border-blue-300 rounded-lg sm:rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-slate-600">Total Products</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-900">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg sm:rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-slate-600">Low Stock</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-900">{lowStock}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-lg sm:rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <XCircle className="w-4 sm:w-6 h-4 sm:h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-slate-600">Out of Stock</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-900">{outOfStock}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-lg sm:rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-green-100 text-green-600 rounded-lg">
            <BarChart3 className="w-4 sm:w-6 h-4 sm:h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-slate-600">Most Stock</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-900">{mostStockProduct}</p>
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR (LIGHT SECTION) ================= */}
      <div className="bg-slate-50 border border-slate-200 p-2 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center border rounded-lg bg-white px-2 sm:px-3 py-2 w-full text-sm">
            <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              className="outline-none w-full text-xs sm:text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white w-full"
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
            >
              <option value="">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="most">Most Stock</option>
            </select>

            <select
              className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white w-full"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort Qty</option>
              <option value="qty-low">Low → High</option>
              <option value="qty-high">High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[55vh]">
          <table className="w-full text-xs sm:text-sm table-auto">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="p-2 sm:p-4 text-center border">Img</th>
                <th className="p-2 sm:p-4 text-left border">Product</th>
                <th className="p-2 sm:p-4 text-left border hidden sm:table-cell">Brand</th>
                <th className="p-2 sm:p-4 text-left border hidden lg:table-cell">Category</th>
                <th className="p-2 sm:p-4 text-center border">Qty</th>
                <th className="p-2 sm:p-4 text-center border">Stock</th>
                <th className="p-2 sm:p-4 text-center border hidden lg:table-cell">Location</th>
                <th className="p-2 sm:p-4 text-center border">Act</th>
              </tr>
            </thead>

            <tbody>
              {products
                .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                .filter((p) => {
                  if (filterStock === "low") return p.totalQuantity <= 10 && p.totalQuantity > 0;
                  if (filterStock === "out") return p.totalQuantity === 0;
                  if (filterStock === "most") return p.totalQuantity === mostStockProduct;
                  return true;
                })
                .sort((a, b) => {
                  if (sortBy === "qty-low") return a.totalQuantity - b.totalQuantity;
                  if (sortBy === "qty-high") return b.totalQuantity - a.totalQuantity;
                  return 0;
                })
                .map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                    {/* IMAGE */}
                    <td className="p-2 sm:p-4 text-center">
                      <img
                        src={p.thumbnail ? `${process.env.REACT_APP_IMAGE_URL}/${p.thumbnail}` : "https://via.placeholder.com/60"}
                        alt={p.name}
                        className="w-10 sm:w-14 h-10 sm:h-14 mx-auto rounded object-contain"
                      />
                    </td>

                    {/* PRODUCT NAME */}
                    <td className="p-2 sm:p-4 font-medium truncate text-xs sm:text-sm">{p.name}</td>

                    {/* BRAND */}
                    <td className="p-2 sm:p-4 hidden sm:table-cell text-xs sm:text-sm truncate">{p.brand?.name}</td>

                    {/* CATEGORY */}
                    <td className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm truncate">{p.category?.name}</td>

                    {/* QUANTITY */}
                    <td className="p-2 sm:p-4 text-center font-semibold text-xs sm:text-sm">
                      <span className="hidden xs:inline">{p.quantityValue} {p.quantityUnit}</span>
                      <span className="inline xs:hidden">{p.quantityValue}</span>
                    </td>

                    {/* STOCK */}
                    <td className="p-2 sm:p-4 text-center text-xs sm:text-sm">{p.totalQuantity}</td>

                    {/* LOCATION */}
                    <td className="p-2 sm:p-4 text-center hidden lg:table-cell text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{p.location?.name}</span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-2 sm:p-4">
                      <div className="flex justify-center gap-2">
                        {/* EDIT */}
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 transition border border-blue-200"
                        >
                          <Pencil className="w-3 sm:w-4 h-3 sm:h-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-1.5 sm:p-2 rounded-full text-red-600 hover:bg-red-100 transition border border-red-200"
                        >
                          <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-4 sm:p-6 text-center text-gray-500 italic text-xs sm:text-sm">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
          <div className="bg-white p-4 sm:p-8 rounded-lg sm:rounded-xl shadow-lg w-full md:w-[70%] max-h-[95vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">{editingId ? "Edit Product" : "Add New Product"}</h2>

            <AddProducts
              productData={productData}
              setProductData={setProductData}
              brands={brands}
              categories={categories}
              units={units}
              setUnits={setUnits}
              locations={locations}
              setShowLocationModal={setShowLocationModal}
              thumbnailPreview={thumbnailPreview}
              imagesPreview={imagesPreview}
              handleThumbnail={handleThumbnail}
              handleImages={handleImages}
            />
            {showLocationModal && (
              <AddLocationModal
                show={showLocationModal}
                onClose={() => {
                  setShowLocationModal(false);
                  setNewLocationName("");
                  setNewAddress("");
                }}
                locationName={newLocationName}
                address={newAddress}
                setLocationName={setNewLocationName}
                setAddress={setNewAddress}
                onSave={handleAddLocationFromProduct}
              />
            )}

            <div className="flex justify-end mt-4 sm:mt-6 gap-2 sm:gap-3">
              <button className="bg-gray-300 px-3 sm:px-4 py-2 rounded text-sm" onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-sm" onClick={saveProduct}>
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
