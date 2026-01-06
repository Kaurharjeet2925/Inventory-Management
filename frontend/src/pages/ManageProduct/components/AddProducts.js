import React from "react";
import { FaStar } from "react-icons/fa";

/* ================= COMMON STYLES ================= */
const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

const fileInputClass =
  "block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 " +
  "file:rounded-md file:border-0 file:text-sm file:font-medium " +
  "file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100";

/* ================= COMPONENT ================= */
const AddProducts = ({
  productData,
  setProductData,
  brands,
  categories,
  units,
  setUnits,
  thumbnailPreview,
  locations,
  setShowLocationModal,
  imagesPreview,
  handleThumbnail,
  handleImages,
  removeImage,
  onClose,
  isEdit,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
    >
      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* ================= BODY (SCROLLABLE) ================= */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Product Name</label>
              <input
                type="text"
                className={inputClass}
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand</label>
                <select
                  className={inputClass}
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
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
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
              </div>
            </div>

            <div>
              <label className={labelClass}>Inventory Location</label>
              <select
                className={inputClass}
                value={productData.location}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setShowLocationModal(true);
                    setProductData({ ...productData, location: "" });
                  } else {
                    setProductData({ ...productData, location: e.target.value });
                  }
                }}
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
                <option value="__add_new__">➕ Add New Location</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Original Price (MRP)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={productData.mrp}
                  onChange={(e) =>
                    setProductData({ ...productData, mrp: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Sales Price</label>
                <input
                  type="number"
                  className={inputClass}
                  value={productData.price}
                  onChange={(e) =>
                    setProductData({ ...productData, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Thumbnail Image</label>
              <input type="file" className={fileInputClass} onChange={handleThumbnail} />
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="thumbnail"
                  className="w-28 h-28 mt-3 object-contain border rounded-md"
                />
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Quantity</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Value"
                  className={inputClass}
                  value={productData.quantityValue}
                  onChange={(e) =>
                    setProductData({ ...productData, quantityValue: e.target.value })
                  }
                />
                <input
                  list="unitsList"
                  placeholder="Unit"
                  className={inputClass}
                  value={productData.quantityUnit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !units.includes(value)) setUnits([...units, value]);
                    setProductData({ ...productData, quantityUnit: value });
                  }}
                />
                <datalist id="unitsList">
                  {units.map((u, i) => (
                    <option key={i} value={u} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className={labelClass}>Stock Quantity</label>
              <input
                type="number"
                className={inputClass}
                value={productData.totalQuantity}
                onChange={(e) =>
                  setProductData({ ...productData, totalQuantity: e.target.value })
                }
              />
            </div>

            <div>
              <label className={labelClass}>Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    onClick={() =>
                      setProductData({ ...productData, rating: star })
                    }
                    className={`cursor-pointer text-xl ${
                      star <= (productData.rating || 0)
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-amber-400"
                value={productData.description}
                onChange={(e) =>
                  setProductData({ ...productData, description: e.target.value })
                }
              />
            </div>

            <div>
  <label className={labelClass}>
    Product Images <span className="text-xs text-gray-500">(Max 4)</span>
  </label>

  {/* Upload input */}
  {imagesPreview.length < 4 && (
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleImages}
      className={fileInputClass}
    />
  )}

  {/* Image Preview Grid */}
  <div className="grid grid-cols-4 gap-4 mt-3">
    {imagesPreview.map((img, index) => (
      <div
        key={index}
        className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50"
      >
        {/* Image */}
        <img
          src={img}
          alt={`product-${index}`}
          className="w-full h-full object-cover"
        />

        {/* ❌ Remove button */}
        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute top-1 right-1 bg-red-600 text-white 
                     w-5 h-5 rounded-full flex items-center 
                     justify-center text-xs hover:bg-red-700"
          title="Remove image"
        >
          ✕
        </button>
      </div>
    ))}
  </div>

  {/* Counter */}
  <p className="text-xs text-gray-500 mt-2">
    {imagesPreview.length} / 4 images uploaded
  </p>
</div>


          </div>

        </div>
      </div>

      {/* ================= FOOTER (SEPARATE CARD) ================= */}
      <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
        >
          Cancel
        </button>

       <button type="submit" className="px-6 py-2 bg-blue-900 hover:bg-amber-500 transition text-white rounded-md">
  {isEdit ? "Update Product" : "Save Product"}
</button>

      </div>
    </form>
  );
};

export default AddProducts;
