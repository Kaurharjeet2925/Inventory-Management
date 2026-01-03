import React from "react";
import { FaStar } from "react-icons/fa";

/* ================= COMMON STYLES ================= */
const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass =
  "block text-sm font-medium text-slate-600 mb-1";

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
  onClose,          // ✅ NEW (close modal)
  isEdit,           // ✅ NEW (for title)
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden">

      {/* ================= MODAL HEADER ================= */}
      <div className="px-6 py-4 bg-gray-100 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
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

      {/* ================= MODAL BODY ================= */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-4">

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                const value = e.target.value;
                if (value === "__add_new__") {
                  setShowLocationModal(true);
                  setProductData({ ...productData, location: "" });
                  return;
                }
                setProductData({ ...productData, location: value });
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

          <div>
            <label className={labelClass}>Thumbnail Image</label>
            <input type="file" onChange={handleThumbnail} />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="thumbnail"
                className="w-32 h-32 mt-3 object-contain border rounded-md"
              />
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-4">

          <div>
            <label className={labelClass}>Quantity (Value + Unit)</label>
            <div className="flex gap-3">
              <input
                type="number"
                className={inputClass}
                value={productData.quantityValue}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    quantityValue: e.target.value,
                  })
                }
              />

              <input
                list="unitsList"
                className={inputClass}
                value={productData.quantityUnit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !units.includes(value))
                    setUnits([...units, value]);
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
                setProductData({
                  ...productData,
                  totalQuantity: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className={labelClass}>Rating</label>
            <div className="flex gap-1">
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
              className="w-full rounded-md border border-slate-300 p-3 text-sm
                         focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              value={productData.description}
              onChange={(e) =>
                setProductData({
                  ...productData,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className={labelClass}>Product Images</label>
            <input type="file" multiple onChange={handleImages} />
            <div className="grid grid-cols-4 gap-3 mt-3">
              {imagesPreview.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`product-${i}`}
                  className="w-24 h-24 object-contain border rounded-md"
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddProducts;
