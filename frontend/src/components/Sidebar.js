// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-700 ${
      isActive ? 'bg-gray-800 text-white' : 'text-gray-300'
    }`;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-gray-900 text-gray-300 flex flex-col">
        <div className="text-white text-xl font-bold p-4 border-b border-gray-700">
          Admin Panel
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <div>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <div className="ml-4 mt-1 space-y-1">
              <NavLink
                to="/profile/edit"
                className={({ isActive }) =>
                  `block px-3 py-1 rounded hover:bg-gray-700 ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-300'
                  }`
                }
              >
                Edit Profile
              </NavLink>
            </div>
          </div>
          
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        {/* Your main content will go here */}
      </div>
    </div>
  );
};

export default Sidebar;
