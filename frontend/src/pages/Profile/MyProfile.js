import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {apiClient} from "../../apiclient/apiclient";
import ProfileCard from "./ProfileCard";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/user/me").then(res => setUser(res.data.user));
  }, []);

  if (!user) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="w-full px-1 lg:px-6 ml-0 lg:ml-64 mt-12">
      <ProfileCard
        user={user}
        showEdit={true}
        onEdit={() => navigate(`/profile/edit/${user._id}`)}
      />
    </div>
  );
};

export default MyProfile;
