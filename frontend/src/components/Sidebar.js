// Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setProfileOpen(location.pathname.startsWith("/profile"));
  }, [location.pathname]);

  useEffect(() => {
    setProfileOpen(location.pathname.startsWith("/products"));
  }, [location.pathname]);
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-700 ${
      isActive ? "bg-gray-800 text-white" : "text-gray-300"
    }`;

  return (
    <>
      {/* FIX: Sidebar is now FIXED and FULL HEIGHT */}
      <aside className="w-64 bg-gray-900 text-gray-300 fixed top-0 left-0 h-screen overflow-y-auto">
        <div className="text-white text-xl font-bold p-4 border-b border-gray-700">
          Admin Panel
        </div>

        <nav className="p-4 space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className={`w-full text-left px-4 py-2 rounded flex justify-between hover:bg-gray-700 ${
              profileOpen ? "bg-gray-800 text-white" : "text-gray-300"
            }`}
          >
            <span>Manage Admin</span>
            <span>{profileOpen ? "▾" : "▸"}</span>
          </button>

          {profileOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <NavLink to="/profile/alladmin" className={linkClass}>
                All Admin
              </NavLink>

              <NavLink to="/profile/edit" className={linkClass}>
                Add Admin
              </NavLink>
            </div>
          )}
            <button
            onClick={() => setProductOpen((prev) => !prev)}
            className={`w-full text-left px-4 py-2 rounded flex justify-between hover:bg-gray-700 ${
              productOpen ? "bg-gray-800 text-white" : "text-gray-300"
            }`}
          >
            <span>Manage Products</span>
            <span>{productOpen ? "▾" : "▸"}</span>
          </button>

          {productOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <NavLink to="/products" className={linkClass}>
                Products
              </NavLink>

              <NavLink to="/brands" className={linkClass}>
                Brands
              </NavLink>
              <NavLink to="/category" className={linkClass}>
                category
              </NavLink>
              <NavLink to="/location" className={linkClass}>
                category
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
