import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Package, AlertTriangle, XCircle, BarChart3,ArrowRightLeftIcon } from "lucide-react";
import AddLocationModal from "./components/AddLocation";
import AddProducts from "./components/AddProducts";

import TransferStockModal from "./components/TransferStockModal";
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
  const [deletedImages, setDeletedImages] = useState([]);

  // 🔥 TRANSFER MODAL STATES
const [showTransferModal, setShowTransferModal] = useState(false);
const [transferProduct, setTransferProduct] = useState(null);
const [transferFrom, setTransferFrom] = useState("");
const [transferTo, setTransferTo] = useState("");
const [transferQty, setTransferQty] = useState("");

const getTotalStock = (warehouses = []) =>
  warehouses.reduce((sum, w) => sum + Number(w.quantity || 0), 0);

const getWarehouseNames = (warehouses = [], locations = []) => {
  return warehouses
    .map((w) => {
      const loc = locations.find((l) => l._id === w.locationId);
      return loc?.name;
    })
    .filter(Boolean);
};

 const [productData, setProductData] = useState({
  name: "",
  brand: "",
  category: "",
  mrp: "",
  price: "",
  quantityValue: "",
  quantityUnit: "",
  rating: 0,
  description: "",
  warehouses: [{ locationId: "", quantity: 0 }],
});


  const [filterStock, setFilterStock] = useState("");
  const [sortBy, setSortBy] = useState("");

  const totalProducts = products.length;
  const lowStock = products.filter(
  (p) => {
    const total = getTotalStock(p.warehouses);
    return total > 0 && total <= 10;
  }
).length;

const outOfStock = products.filter(
  (p) => getTotalStock(p.warehouses) === 0
).length;

 const mostStockProduct = products.reduce((max, p) => {
  const stock = getTotalStock(p.warehouses);
  if (!max || stock > getTotalStock(max.warehouses)) {
    return p;
  }
  return max;
}, null);



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
const getInitials = (name = "") => {
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
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
   setDeletedImages([]); // reset on open
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

 const MAX_IMAGES = 4;

const handleImages = (e) => {
  const files = Array.from(e.target.files);

  // current images count
  const currentCount = productData.images.length;

  // remaining slots
  const remaining = MAX_IMAGES - currentCount;

  if (remaining <= 0) {
    toast.error("You can upload only 4 images");
    return;
  }

  const filesToAdd = files.slice(0, remaining);

  setProductData((prev) => ({
    ...prev,
    images: [...prev.images, ...filesToAdd],
  }));

  setImagesPreview((prev) => [
    ...prev,
    ...filesToAdd.map((file) => URL.createObjectURL(file)),
  ]);

  // reset input so same file can be reselected
  e.target.value = "";
};

const removeImage = (index) => {
  const img = imagesPreview[index];

  // if image is from backend (URL), mark it for deletion
  if (img.startsWith(process.env.REACT_APP_IMAGE_URL)) {
    const filename = img.split("/").pop();
    setDeletedImages((prev) => [...prev, filename]);
  }

  setImagesPreview((prev) => prev.filter((_, i) => i !== index));

  setProductData((prev) => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index),
  }));
};



 const saveProduct = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // ---------- TEXT & NUMBERS ----------
  formData.append("name", productData.name);
  formData.append("brand", productData.brand);
  formData.append("category", productData.category);
  formData.append("quantityValue", productData.quantityValue);
  formData.append("quantityUnit", productData.quantityUnit);
  formData.append("mrp", productData.mrp);
  formData.append("price", productData.price);
  formData.append("rating", productData.rating);
  formData.append("description", productData.description);

  // ---------- ✅ WAREHOUSES (JSON) ----------
  formData.append(
    "warehouses",
    JSON.stringify(productData.warehouses)
  );

  // ---------- THUMBNAIL ----------
  if (productData.thumbnail instanceof File) {
    formData.append("thumbnail", productData.thumbnail);
  }

  // ---------- IMAGES ----------
  if (Array.isArray(productData.images)) {
    productData.images.forEach((img) => {
      if (img instanceof File) {
        formData.append("images", img);
      }
    });
  }

  // ---------- DELETED IMAGES (EDIT MODE) ----------
  if (editingId && deletedImages.length) {
    formData.append("deletedImages", JSON.stringify(deletedImages));
  }

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
  }
};

const handleTransferStock = async () => {
  if (!transferFrom || !transferTo || !transferQty) {
    toast.error("All fields are required");
    return;
  }

  if (transferFrom === transferTo) {
    toast.error("Source and destination cannot be same");
    return;
  }

  try {
    await apiClient.put(
      `/product/transfer/${transferProduct._id}`,
      {
        fromLocationId: transferFrom,
        toLocationId: transferTo,
        quantity: Number(transferQty),
      }
    );

    toast.success("Stock transferred successfully");
    fetchAll();

    setShowTransferModal(false);
    setTransferProduct(null);
    setTransferFrom("");
    setTransferTo("");
    setTransferQty("");

  } catch (err) {
    toast.error(err.response?.data?.message || "Transfer failed");
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
          className="bg-blue-900 hover:bg-amber-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm sm:text-base whitespace-nowrap"
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

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
  
  {/* ICON */}
  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
    {mostStockProduct
      ? getInitials(mostStockProduct.name)
      : <BarChart3 className="w-5 h-5" />}
  </div>

  {/* TEXT */}
  <div className="flex-1 min-w-0">
    <p className="text-xs sm:text-sm text-slate-600">Highest Available Stock</p>

    <p className="font-semibold text-slate-900 truncate">
      {mostStockProduct ? mostStockProduct.name : "-"}
    </p>

    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      {mostStockProduct
        ? `${mostStockProduct.totalQuantity}${mostStockProduct.quantityUnit}`
        : ""}
    </span>
  </div>

</div>


      </div>

      {/* ================= FILTER BAR (LIGHT SECTION) ================= */}
  <div className="bg-slate-50 border border-slate-200 p-2 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
  <div className="flex flex-col sm:flex-row items-center gap-3">

    {/* SEARCH */}
    <div className="flex items-center border rounded-lg bg-white px-2 sm:px-3 py-2 w-full sm:flex-1 text-sm">
      <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search…"
        className="outline-none w-full text-xs sm:text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* FILTERS */}
    <div className="flex flex-row gap-2 w-full sm:w-auto">
      <select
        className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white w-full sm:w-44"
        value={filterStock}
        onChange={(e) => setFilterStock(e.target.value)}
      >
        <option value="">All Stock</option>
        <option value="low">Low Stock</option>
        <option value="out">Out of Stock</option>
        <option value="most">Most Stock</option>
      </select>

      <select
        className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white w-full sm:w-44"
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
                <th className="p-2 sm:p-4 text-center border">Image</th>
                <th className="p-2 sm:p-4 text-left border">Product</th>
                <th className="p-2 sm:p-4 text-left border hidden sm:table-cell">Brand</th>
                <th className="p-2 sm:p-4 text-left border hidden lg:table-cell">Category</th>
                <th className="p-2 sm:p-4 text-center border">Quantity</th>
                <th className="p-2 sm:p-4 text-center border">Stock</th>
                <th className="p-2 sm:p-4 text-center border hidden lg:table-cell">Location</th>
                <th className="p-2 sm:p-4 text-center border">Action</th>
              </tr>
            </thead>

            <tbody>
              {products
                .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                .filter((p) => {
                 const total = getTotalStock(p.warehouses);

if (filterStock === "low") return total > 0 && total <= 10;
if (filterStock === "out") return total === 0;

                  if (filterStock === "most")
  return mostStockProduct && p._id === mostStockProduct._id;

                  return true;
                })
                .sort((a, b) => {
                 if (sortBy === "qty-low")
  return getTotalStock(a.warehouses) - getTotalStock(b.warehouses);

if (sortBy === "qty-high")
  return getTotalStock(b.warehouses) - getTotalStock(a.warehouses);

                  return 0;
                })
                .map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                    {/* IMAGE */}
                    <td className="p-2 sm:p-4 text-center">
  {p.thumbnail ? (
    <img
      src={`${process.env.REACT_APP_IMAGE_URL}/${p.thumbnail}`}
      alt={p.name}
      className="w-10 sm:w-14 h-10 sm:h-14 mx-auto rounded object-contain"
    />
  ) : (
    <div className="w-10 sm:w-14 h-10 sm:h-14 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm sm:text-base">
      {getInitials(p.name)}
    </div>
  )}
</td>


                    {/* PRODUCT NAME */}
                    <td className="p-2 sm:p-4 font-medium truncate text-xs sm:text-sm">{p.name}</td>

                    {/* BRAND */}
                    <td className="p-2 sm:p-4 hidden sm:table-cell text-xs sm:text-sm truncate">{p.brand?.name}</td>

                    {/* CATEGORY */}
                    <td className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm truncate">{p.category?.name}</td>

                    {/* QUANTITY */}
                   <td className="p-2 sm:p-4 text-center font-semibold text-xs sm:text-sm">
  <span className="whitespace-nowrap">
    {p.quantityValue}
    <span className="text-gray-500">{p.quantityUnit}</span>
  </span>
</td>


                    {/* STOCK */}
<td className="p-2 sm:p-4 text-center text-xs sm:text-sm font-semibold">
  {getTotalStock(p.warehouses)}
</td>

        <td className="p-2 sm:p-4 text-center hidden lg:table-cell text-xs">
  <div className="flex flex-col gap-1 items-center">

    {Array.isArray(p.warehouses) && p.warehouses.length > 0 ? (
      p.warehouses.map((w, i) => (
        <div
          key={i}
          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs whitespace-nowrap"
        >
          <strong>{w.location?.name || "Unknown"}</strong>
          <span className="ml-1 text-gray-600">
            – {w.quantity}
          </span>
        </div>
      ))
    ) : (
      <span className="text-gray-400">—</span>
    )}

  </div>
</td>




                    {/* ACTIONS */}
                    <td className="p-2 sm:p-4">
                      <div className="flex justify-center gap-2">
                        <button
 
   onClick={() => {
  setTransferProduct(p);
  setShowTransferModal(true);
}}


  className="p-1.5 sm:p-2 rounded-full text-purple-600 hover:bg-purple-100 transition border border-purple-200"
  title="Transfer Stock"
>
  <ArrowRightLeftIcon className="w-4 h-4" />
</button>

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
    <div className="w-full md:w-[70%] max-h-[95vh]">

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
  removeImage={removeImage}
  onClose={() => setShowModal(false)}
  onSubmit={saveProduct}          // ✅ CONNECT SAVE
  isEdit={!!editingId}             // ✅ ADD vs EDIT
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

      {/* FOOTER */}
      {/* <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          onClick={saveProduct}
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {editingId ? "Update Product" : "Save Product"}
        </button>
      </div> */}

    </div>
  </div>
)}
   {/* ================= TRANSFER STOCK MODAL ================= */}
{showTransferModal && (
  <TransferStockModal
    show={showTransferModal}
    product={transferProduct}
    locations={locations}

    transferFrom={transferFrom}
    setTransferFrom={setTransferFrom}

    transferTo={transferTo}
    setTransferTo={setTransferTo}

    transferQty={transferQty}
    setTransferQty={setTransferQty}

    onClose={() => {
      setShowTransferModal(false);
      setTransferProduct(null);
      setTransferFrom("");
      setTransferTo("");
      setTransferQty("");
    }}

    onTransfer={handleTransferStock}
  />
)}

    </div>
  );
};

export default Product;
