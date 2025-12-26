import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Eye, Trash2 } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const AllAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [failedImages, setFailedImages] = useState({});
  const [view, setView] = useState("cards"); // cards OR list
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  <main className="pt-16 md:pt-20 md:ml-64 px-4 md:px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">All Admins</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setView("cards")}
            className={`px-4 py-2 rounded-lg ${
              view === "cards" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Card View
          </button>

          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg ${
              view === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            List View
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
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
                    <div className="w-32 h-32 rounded-full overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center relative z-10">
                      {admin.image && !failed ? (
                        <img
                          src={`http://localhost:5000${admin.image}`}
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
                    <h2 className="text-xl font-semibold mt-4">
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
                      <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-700 text-sm flex gap-2 items-center">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {admin.email}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mt-2 w-full">
                      <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-700 text-sm flex gap-2 items-center">
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
            <div className="bg-white p-6 rounded-xl shadow-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-3">Profile</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Actions</th>
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
                              src={`http://localhost:5000${admin.image}`}
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

                        <td className="p-3">
                          {admin.name}
                        </td>

                        <td className="p-3">{admin.email}</td>

                        <td className="p-3">{admin.phone || "N/A"}</td>

                        <td className="p-3">
                          <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                            {admin.role}
                          </span>
                        </td>

                        <td className="p-3 flex gap-2">
                          <button onClick={() => navigate(`/profile/view/${key}`, { state: { admin } })} className="p-2 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </button>

                          <button onClick={() => handleDelete(admin._id)} className="p-2 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
    </main>
  );
};

export default AllAdmins;
