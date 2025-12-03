import React from "react";
import { FaStar } from "react-icons/fa";

const AddProducts = ({
  productData,
  setProductData,
  brands,
  categories,
  units,
  setUnits,
  thumbnailPreview,
  locations,
  setShowLocationModal,   // <-- coming from Product.jsx
  imagesPreview,
  handleThumbnail,
  handleImages,
}) => {
  return (
    <div className="grid grid-cols-2 gap-8">

      {/* LEFT FORM */}
      <div>
        {/* Product Name */}
        <label className="font-semibold">Product Name</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={productData.name}
          onChange={(e) =>
            setProductData({ ...productData, name: e.target.value })
          }
        />

        {/* Brand + Category */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Brand */}
          <div>
            <label className="font-semibold">Brand</label>
            <select
              className="w-full border p-2 rounded"
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

          {/* Category */}
          <div>
            <label className="font-semibold">Category</label>
            <select
              className="w-full border p-2 rounded"
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

        {/* Inventory Location */}
        <label className="font-semibold">Inventory Location</label>

<select
  className="w-full border p-2 rounded mb-4"
  value={productData.location}
  onChange={(e) => {
    const value = e.target.value;

    if (value === "__add_new__") {
      // Open modal
      setShowLocationModal(true);

      // Reset selection to previous chosen value
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

  {/* ADD NEW LOCATION OPTION */}
  <option value="__add_new__" className="text-blue-600 font-semibold">
    ➕ Add New Location
  </option>
</select>
    

        {/* MRP */}
        <label className="font-semibold">Original Price</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={productData.mrp}
          onChange={(e) =>
            setProductData({ ...productData, mrp: e.target.value })
          }
        />

        {/* Sales Price */}
        <label className="font-semibold">Sales Price</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={productData.price}
          onChange={(e) =>
            setProductData({ ...productData, price: e.target.value })
          }
        />

        {/* Thumbnail */}
        <label className="font-semibold">Thumbnail Image</label>
        <input type="file" className="mb-3" onChange={handleThumbnail} />

        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="thumbnail preview"
            className="w-32 h-32 object-contain mb-4 border rounded"
          />
        )}
      </div>

      {/* RIGHT FORM */}
      <div>
        {/* Quantity */}
        <label className="font-semibold">Quantity (Value + Unit)</label>
        <div className="flex gap-3 mb-4">
          <input
            type="number"
            className="w-1/2 border p-2 rounded"
            placeholder="500"
            value={productData.quantityValue}
            onChange={(e) =>
              setProductData({ ...productData, quantityValue: e.target.value })
            }
          />

          {/* Unit */}
          <input
            list="unitsList"
            className="w-1/2 border p-2 rounded"
            placeholder="kg / g / piece"
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

        {/* Stock */}
        <label className="font-semibold">Stock Quantity</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={productData.totalQuantity}
          onChange={(e) =>
            setProductData({ ...productData, totalQuantity: e.target.value })
          }
        />

        {/* Rating */}
        <label className="font-semibold">Rating</label>
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl cursor-pointer ${
                star <= (productData.rating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setProductData({ ...productData, rating: star })}
            >
              <FaStar />
            </span>
          ))}
        </div>

        {/* Description */}
        <label className="font-semibold">Description</label>
        <textarea
          className="w-full border p-2 rounded h-32 mb-4"
          value={productData.description}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
          }
        />

        {/* Product Images */}
        <label className="font-semibold">Product Images</label>
        <input type="file" multiple onChange={handleImages} />

        <div className="grid grid-cols-4 gap-3 mt-3">
          {imagesPreview.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`product-image-${i}`}
              className="w-28 h-28 border rounded object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
