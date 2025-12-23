import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ user, showEdit, onEdit }) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
const isSuperAdmin = loggedInUser?.role === "superAdmin";
    const navigate = useNavigate();
  return (
    <div className="space-y-6">

      {/* ===== TOP PROFILE CARD ===== */}
     <div className="bg-white rounded-xl border p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  
  <div className="flex items-center gap-4">
    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
      {user.name?.[0]}
    </div>

    <div>
      <h2 className="text-lg font-semibold">{user.name}</h2>
      <p className="text-sm text-gray-500 capitalize">{user.role}</p>
      <p className="text-sm text-gray-500">{user.email}</p>
    </div>
  </div>

  {isSuperAdmin && (
  <button
    onClick={() => navigate(`/profile/edit/${user._id}`)}
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  >
    Edit Profile
  </button>
)}

</div>



      {/* ===== PERSONAL INFORMATION ===== */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-md font-semibold mb-4">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <Info label="Full Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone || "-"} />
          <Info label="Gender" value={user.gender || "-"} />
          <Info label="Date of Birth" value={user.dateofbirth || "-"} />
          <Info label="Role" value={user.role} />
        </div>
      </div>

      {/* ===== ADDRESS ===== */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-md font-semibold mb-2">Address</h3>
        <p className="text-sm text-gray-700">
          {user.address || "-"}
        </p>
      </div>

    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

export default ProfileCard;
