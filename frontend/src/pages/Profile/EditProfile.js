import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
// dd-MM-yyyy -> Date
const parseDDMMYYYY = (value) => {
  if (!value) return null;
  return parse(value, "dd-MM-yyyy", new Date());
};

// Date -> dd-MM-yyyy
const formatDDMMYYYY = (date) => {
  if (!date) return "";
  return format(date, "dd-MM-yyyy");
};


const EditProfile = () => {
  const { id } = useParams();          // if id exists → EDIT
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

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

  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // We'll use a native date input for actual value (ISO yyyy-mm-dd)
  // and display dd-mm-yyyy visually via `DateInputOverlay`.

  /* ================= PREFILL DATA (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEditMode) return;

    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/user/${id}`);
        const u = res.data.user;

        const nameArr = (u.name || "").split(" ");
        const firstName = nameArr[0] || "";
        const lastName = nameArr.slice(1).join(" ") || "";

        setForm({
          firstName,
          lastName,
          phone: u.phone || "",
          email: u.email || "",
          password: "",               // ❌ never prefill password
          gender: u.gender || "",
          address: u.address || "",
          dateofbirth: u.dateofbirth ? u.dateofbirth.split("T")[0] : "",
          role: u.role || "",
          image: "",
        });

        if (u.image) {
          const base = (
            process.env.REACT_APP_IMAGE_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
          )
          
            .replace(/\/uploads\/?$/i, '')
            .replace(/\/$/, "");

          setImagePreview(`${base}${u.image.startsWith("/") ? u.image : "/" + u.image}`);
        }
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };

    fetchUser();
  }, [id, isEditMode]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm(prev => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.role) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isEditMode && !form.password) {
      toast.error("Password is required for new user");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (!value) return;
        formData.append(key, value);
      });

      if (isEditMode) {
        // ✏️ UPDATE
        await apiClient.put(`/user/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Profile updated successfully");
      } else {
        // ➕ ADD
        await apiClient.post("/superadmin/create-user", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("User created successfully");
      }

      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  return (
        <div >
        <h1 className="text-3xl lg:text-4xl font-semibold mb-8"> {isEditMode ? "Edit Profile" : "Add New User"}</h1>

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
    <option value="delivery-boy">Delivery Boy</option>
    <option value="coAdmin">Co Admin</option>
    
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

  <DatePicker
    selected={parseDDMMYYYY(form.dateofbirth)}
    onChange={(date) =>
      setForm((prev) => ({
        ...prev,
        dateofbirth: formatDDMMYYYY(date),
      }))
    }
    dateFormat="dd-MM-yyyy"
    placeholderText="DD-MM-YYYY"
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    maxDate={new Date()}
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
              {isEditMode ? "Update Profile" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    
  );
};

export default EditProfile;
