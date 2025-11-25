import React, { useState, useRef } from "react";

const AddBrand = () => {
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brandName.trim()) {
      alert("Brand name is required");
      return;
    }

    // Read stored brands
    const storedBrands = JSON.parse(localStorage.getItem("brands")) || [];

    const newBrand = {
      id: Date.now(),
      brandName,
      description,
      image: imagePreview || "", // storing preview URL
    };

    // Save to localStorage
    localStorage.setItem("brands", JSON.stringify([...storedBrands, newBrand]));

    alert("Brand added successfully!");

    // Reset form
    setBrandName("");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="ml-64 p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg">
        <h2 className="text-3xl font-semibold mb-6">Add Brand</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Brand Name */}
          <div>
            <label className="block mb-2 font-medium">Brand Name*</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              className="border p-3 rounded w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="border p-3 rounded w-full h-24 resize-none"
            />
          </div>

          {/* Brand Image Upload */}
          <div>
            <label className="block mb-2 font-medium">Brand Logo (Optional)</label>

            <div className="flex items-center gap-4">
              {/* Image Preview */}
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No image</span>
                )}
              </div>

              {/* File Input */}
              <div className="flex flex-col">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
                <small className="text-xs text-gray-500">
                  Upload JPG, PNG, JPEG
                </small>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Brand
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBrand;
