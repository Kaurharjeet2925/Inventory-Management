import React, { useState, useRef } from 'react';
import { apiClient } from '../apiclient/apiclient';
import { toast } from 'react-toastify';

const EditProfile = () => {
const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  image: "",
  gender: "",
  address: "",
  dateofbirth: "",
  role: "",  
});

  const [imagePreview, setImagePreview] = useState('');
  // keep the selected file in form.image instead of a separate unused state variable
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // store the File object in form.image so it is actually used and available on submit
    setForm(prev => ({ ...prev, image: file }));
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim() || !form.role) {
    toast.error("Please fill in all required fields");
    return;
  }

  try {
    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("phone", form.phone);
    formData.append("gender", form.gender);
    formData.append("address", form.address);
    formData.append("dateofbirth", form.dateofbirth);
    formData.append("role", form.role);
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    // Call the API
    const response = await apiClient.post("/superadmin/create-user", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    toast.success(response.data?.message || `${form.role} created successfully!`);
    handleCancel();
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
    toast.error(errorMessage);
    console.error(error);
  }
};

const handleCancel = () => {
  setForm({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    dateOfBirth: "",
    image: "",
    role: "admin",  // default role
  });
  // clear image preview and reset fw-full min-h-screen p-6ile input element
  setImagePreview('');
  if (fileInputRef && fileInputRef.current) fileInputRef.current.value = '';
};


  return (
	 <div className="ml-64 mt-12 p-2">
      <div className="w-full bg-white shadow-md p-10 rounded-xl min-h-screen">
        <h1 className="text-3xl lg:text-4xl font-semibold mb-8">Add New Admin</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-x-12 w-full"
        >
          {/* First Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full"
            />
          </div>
         <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Gender</label>
            <div className="flex flex-col">
         <select
             name="gender"
             value={form.gender}
             onChange={handleChange}
             className="border border-gray-200 p-3 rounded-md w-full bg-white"
         >
    <option value="">Select gender</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
  </select>
</div>

          </div>
		  <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Role</label>
            <div className="flex flex-col">
         <select
             name="role"
             value={form.role}
             onChange={handleChange}
             className="border border-gray-200 p-3 rounded-md w-full bg-white"
         >
    <option value="">Select role </option>
    <option value="admin">Admin</option>
    <option value="delievery-boy">Delievery Boy</option>
    
  </select>
</div>
</div>
          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full"
            />
          </div>
		    <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Date of birth</label>
            <input
              type="date"
              name="dateofbirth"
              value={form.dateofbirth}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full"
            />
          </div>
 <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Address</label>
            <textarea
              name="address"
              placeholder="Enter Address"
              value={form.address}
              onChange={handleChange}
              className="border border-gray-200 p-3 rounded-md w-full h-24 resize-none"
            />
          </div>
		 
          {/* Profile Image (preview + upload) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Profile Image </label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-sm text-gray-400">No image</span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
                <small className="text-xs text-gray-500 mt-2">Upload an image to preview (optional)</small>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end items-center gap-4 mt-2">
           <button
  type="button"
  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md"
  onClick={handleCancel}
>
  Cancel
</button>


            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
