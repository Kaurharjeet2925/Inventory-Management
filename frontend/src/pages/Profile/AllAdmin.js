import React, { useEffect, useState } from "react";
import ThemedTable from "../../components/ThemedTable";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Eye, Trash2, Grid3x3, List, Plus } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const AllAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [failedImages, setFailedImages] = useState({});
  const [view, setView] = useState("cards"); // cards OR list
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const base = (process.env.REACT_APP_IMAGE_URL|| "http://localhost:5000")
   .replace(/\/uploads\/?$/i, '')
            .replace(/\/$/, "");


  // Fetch all users from backend
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/all");
      setAdmins(response.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await apiClient.delete(`/user/${userId}`);
      toast.success("User deleted successfully");
      setAdmins(admins.filter(admin => admin._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
      console.error(error);
    }
  };

  return (
        <div>
   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
  <h1 className="text-2xl sm:text-3xl font-semibold">All Users</h1>

  <div className="flex gap-3 items-center">
     <button
      onClick={() => navigate("/profile/add")}
      className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 ml-2"
      title="Add User"
    >
      <Plus className="w-5 h-5" />
    </button>
    <button
      onClick={() => setView("cards")}
      className={`p-2 rounded-lg ${view === "cards" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
      title="Card View"
    >
      <Grid3x3 className="w-5 h-5" />
    </button>

    <button
      onClick={() => setView("list")}
      className={`p-2 rounded-lg ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
      title="List View"
    >
      <List className="w-5 h-5" />
    </button>

   
  </div>
</div>



      {/* Show NO DATA message */}
      {admins.length === 0 ? (
        <div className="text-gray-500 text-lg">
          {loading ? "Loading..." : "No admins found. Add from Add Admin page."}
        </div>
      ) : (
        <>
          {/* CARD VIEW */}
          {view === "cards" && (
     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
              {admins.map((admin, idx) => {
                const key = admin._id || idx;
                const failed = !!failedImages[key];

                return (
                  <div
                    key={key}
                    className="relative group bg-white rounded-2xl border p-6
flex flex-col items-center
shadow-md transition-all duration-200
hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Delete Button - Top Right Corner */}
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="absolute top-3 right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition z-30 opacity-0 group-hover:opacity-100"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Hover overlay with Eye */}
<div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]
opacity-0 group-hover:opacity-100
flex justify-center items-center
rounded-2xl transition z-20">
                      <div className="relative">
                        <button
                          onClick={() => navigate(`/profile/view/${key}`, { state: { admin } })}
                          className="w-10 h-10 flex items-center justify-center"
                          aria-label={`View ${admin.name}`}
                        >
                          <Eye className="w-8 h-8 text-gray-800" />
                        </button>
                      </div>
                    </div>

                    {/* Profile Image */}
<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center relative z-10">
                      {admin.image && !failed ? (
                        <img
                          src={`${base}${admin.image}`}
                          alt="profile"
                          className="object-cover w-full h-full"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [key]: true,
                            }))
                          }
                        />
                      ) : (
                        (() => {
                          const nameparts = (admin.name || "").trim().split(" ");
                          const first = nameparts[0] ? nameparts[0].charAt(0).toUpperCase() : "";
                          const last = nameparts[1] ? nameparts[1].charAt(0).toUpperCase() : "";
                          const initials = first + last || first || "?";
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl font-semibold">
                              {initials}
                            </div>
                          );
                        })()
                      )}
                    </div>

                    {/* Name */}
                    <h2 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 text-center">
                      {admin.name}
                    </h2>

                    <span
  className={`mt-2 text-xs px-3 py-1 rounded-full font-medium
  ${admin.role === "superAdmin"
    ? "bg-purple-100 text-purple-700"
    : admin.role === "admin"
    ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700"
  }`}
>
  {admin.role || "Admin"}
</span>


                    {/* Email */}
                    <div className="mt-4 w-full">
<div className="bg-gray-50 px-3 py-2 rounded-md text-gray-700 text-sm flex gap-2 items-center break-all">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {admin.email}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mt-2 w-full">
<div className="bg-gray-50 px-3 py-2 rounded-md text-gray-700 text-sm flex gap-2 items-center break-all">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {admin.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
   
    
      <ThemedTable className="min-w-[900px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-3 whitespace-nowrap">Profile</th>
            <th className="p-3 whitespace-nowrap">Name</th>
            <th className="p-3 whitespace-nowrap">Email</th>
            <th className="p-3 whitespace-nowrap">Phone</th>
            <th className="p-3 whitespace-nowrap">Role</th>
            <th className="p-3 whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((admin, idx) => {
            const key = admin._id || idx;
            const failed = !!failedImages[key];

            return (
              <tr key={key} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {admin.image && !failed ? (
                    <img
                      src={`${base}${admin.image}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [key]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {(admin.name?.[0] || "?").toUpperCase()}
                    </div>
                  )}
                </td>

                <td className="p-3 whitespace-nowrap">{admin.name}</td>
                <td className="p-3 whitespace-nowrap">{admin.email}</td>
                <td className="p-3 whitespace-nowrap">
                  {admin.phone || "N/A"}
                </td>

                <td className="p-3 whitespace-nowrap">
                  <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                    {admin.role}
                  </span>
                </td>

                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/profile/view/${key}`, {
                          state: { admin },
                        })
                      }
                      className="p-2 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="p-2 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ThemedTable>
    </div>
  
)}

        </>
      )}
    </div>
   
  );
};

export default AllAdmins;
