import React, { useState } from "react";
import { useAdminProducts } from "../hooks/useAdminProducts";
import { useQuery } from "@tanstack/react-query";
import API from "../api";

const AdminAddProduct = () => {
  const { addProduct, isAdding } = useAdminProducts();

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await API.get("/categories");
      return data.categories;
    },
  });

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    type: "simpleCandle",
    scent: "",
    color: "",
    size: "medium",
    burnTime: "",
    stock: "",
    weight: "",
    material: "soy wax",
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isLatest: false,
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append all text fields
    Object.keys(productData).forEach((key) => {
      if (key === "category" && !productData[key]) {
        // Option A: Skip it (Mongoose will ignore it)
        // Option B: formData.append('category', null);
        return;
      }
      formData.append(key, productData[key]);
    });

    // Append images (limit 4 as per your route)
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    addProduct(formData);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-stone-200">
        <h1 className="text-3xl font-serif text-stone-800 mb-8 border-b pb-4">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={productData.name}
                onChange={handleInputChange}
                className="w-full border-stone-300 rounded-md shadow-sm focus:ring-coffee focus:border-coffee p-2.5 border"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                rows="3"
                required
                value={productData.description}
                onChange={handleInputChange}
                className="w-full border-stone-300 rounded-md shadow-sm focus:ring-coffee focus:border-coffee p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Base Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                required
                value={productData.price}
                onChange={handleInputChange}
                className="w-full border-stone-300 rounded-md shadow-sm p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={productData.discountPrice}
                onChange={handleInputChange}
                className="w-full border-stone-300 rounded-md shadow-sm p-2.5 border"
              />
            </div>
          </div>

          <hr />

          {/* Section 2: Product Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2.5"
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={productData.type}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2.5"
              >
                <option value="simpleCandle">Simple Candle</option>
                <option value="simpleRaw">Raw Material</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                required
                value={productData.stock}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Scent
              </label>
              <input
                type="text"
                name="scent"
                placeholder="e.g. Lavender"
                value={productData.scent}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={productData.color}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Size
              </label>
              <select
                name="size"
                value={productData.size}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2.5"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <hr />

          {/* Section 3: Attributes & Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["isFeatured", "isTrending", "isBestSeller", "isLatest"].map(
              (flag) => (
                <label
                  key={flag}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={flag}
                    checked={productData[flag]}
                    onChange={handleInputChange}
                    className="rounded text-coffee focus:ring-coffee"
                  />
                  <span className="text-sm text-stone-600">
                    {flag.replace("is", "")}
                  </span>
                </label>
              )
            )}
          </div>

          <div className="bg-stone-50 p-6 rounded-md border-2 border-dashed border-stone-300">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Upload Images (Max 4)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300"
            />
            <p className="mt-2 text-xs text-stone-400">
              Selected: {selectedImages.length} files
            </p>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full bg-stone-900 text-white py-4 rounded-md font-medium hover:bg-stone-800 transition-all disabled:bg-stone-400"
          >
            {isAdding ? "Uploading to Naisha Creation..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;
