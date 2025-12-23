import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {apiClient} from "../../apiclient/apiclient";
import ProfileCard from "./ProfileCard";

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ DEFINE loggedInUser HERE
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/user/${id}`)
      .then(res => setUser(res.data.user))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!user) return <div className="p-6 text-red-600">Profile not found</div>;

  const isSuperAdmin = loggedInUser?.role === "superAdmin";

  return (
     <div className="px-6 lg:px-4 ml-64 mt-12">
      <ProfileCard
        user={user}
        showEdit={isSuperAdmin}
        onEdit={() => navigate(`/profile/edit/${user._id}`)}
      />
    </div>
  );
};

export default ViewProfile;
