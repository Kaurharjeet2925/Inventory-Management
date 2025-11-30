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
  imagesPreview,
  handleThumbnail,
  handleImages,
}) => {
  return (
    <div className="grid grid-cols-2 gap-8">

      {/* LEFT FORM */}
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
        
        <div className="grid grid-cols-2 gap-4 mb-4">
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

        <label className="font-semibold">Inventory Location</label>
        {(() => {
          const locations = ["WAREHOUSE-A", "WAREHOUSE-B", "WAREHOUSE-C", "WAREHOUSE-D"];
          const selectedOption = locations.includes(productData.location)
            ? productData.location
            : (productData.location ? 'Other' : '');

          return (
            <>
              <select
                className="w-full border p-2 rounded mb-2"
                value={selectedOption}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setProductData({ ...productData, location: '' });
                  } else {
                    setProductData({ ...productData, location: val });
                  }
                }}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="Other">Other (custom)</option>
              </select>

              {selectedOption === 'Other' && (
                <input
                  type="text"
                  className="w-full border p-2 rounded mb-4"
                  placeholder="Enter custom location"
                  value={productData.location || ''}
                  onChange={(e) =>
                    setProductData({ ...productData, location: e.target.value })
                  }
                />
              )}
            </>
          );
        })()}

        <label className="font-semibold">Original Price (MRP)</label>
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
            alt="thumbnail preview"
            className="w-32 h-32 object-contain mb-4 border rounded"
          />
        )}
      </div>

      {/* RIGHT FORM */}
      <div>
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

          <input
            list="unitsList"
            className="w-1/2 border p-2 rounded"
            placeholder="kg / g / piece"
            value={productData.quantityUnit}
            onChange={(e) => {
              const value = e.target.value;

              if (value && !units.includes(value)) {
                setUnits([...units, value]);
              }

              setProductData({ ...productData, quantityUnit: value });
            }}
          />

          <datalist id="unitsList">
            {units.map((u, i) => (
              <option key={i} value={u} />
            ))}
          </datalist>
        </div>

        <label className="font-semibold">Stock Quantity</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={productData.totalQuantity}
          onChange={(e) =>
            setProductData({ ...productData, totalQuantity: e.target.value })
          }
        />

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

        <label className="font-semibold">Description</label>
        <textarea
          className="w-full border p-2 rounded h-32 mb-4"
          value={productData.description}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
          }
        />

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
