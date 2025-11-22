import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, Link } from "react-router-dom";
const Profile = () => {
  return (
	  <div className="flex">
      <Sidebar/>

      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p>Welcome to Admin Profile</p>
        <div className="mt-4">
          <Link to="edit" className="px-4 py-2 bg-blue-600 text-white rounded">Edit Profile</Link>
        </div>
        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Profile;
