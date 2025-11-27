// Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setProfileOpen(location.pathname.startsWith("/profile"));
  }, [location.pathname]);

  useEffect(() => {
    setProductOpen(location.pathname.startsWith("/manage-products"));
  }, [location.pathname]);
   useEffect(() => {
    setOrdersOpen(location.pathname.startsWith("/orders"));
  }, [location.pathname]);
  useEffect(() => {
    setClientsOpen(location.pathname.startsWith("/manage-client"));
  }, [location.pathname]);
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-700 ${
      isActive ? "bg-gray-800 text-white" : "text-gray-300"
    }`;

  const handleMenuToggle = (menu) => {
    if (menu === 'profile') {
      setProfileOpen(!profileOpen);
      setProductOpen(false);
      setOrdersOpen(false);
      setClientsOpen(false);
    } else if (menu === 'product') {
      setProductOpen(!productOpen);
      setProfileOpen(false);
      setOrdersOpen(false);
      setClientsOpen(false);
    } else if (menu === 'orders') {
      setOrdersOpen(!ordersOpen);
      setProfileOpen(false);
      setProductOpen(false);
      setClientsOpen(false);
    } else if (menu === 'clients') {
      setClientsOpen(!clientsOpen);
      setProfileOpen(false);
      setProductOpen(false);
      setOrdersOpen(false);
    }
  };

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
            onClick={() => handleMenuToggle('profile')}
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
            onClick={() => handleMenuToggle('product')}
            className={`w-full text-left px-4 py-2 rounded flex justify-between hover:bg-gray-700 ${
              productOpen ? "bg-gray-800 text-white" : "text-gray-300"
            }`}
          >
            <span>Manage Products</span>
            <span>{productOpen ? "▾" : "▸"}</span>
          </button>

          {productOpen && (
            <div className="ml-4 mt-1 space-y-1">
              

              <NavLink to="/manage-products/brands" className={linkClass}>
                Brands
              </NavLink>
              <NavLink to="/manage-products/categories" className={linkClass}>
                Category
              </NavLink>
              <NavLink to="/manage-products/products" className={linkClass}>
                Products
              </NavLink>
              {/* <NavLink to="/manage-products/location" className={linkClass}>
                Locations
              </NavLink> */}
            </div>
          )}
           <button
            onClick={() => handleMenuToggle('orders')}
            className={`w-full text-left px-4 py-2 rounded flex justify-between hover:bg-gray-700 ${
              ordersOpen ? "bg-gray-800 text-white" : "text-gray-300"
            }`}
          >
            <span>Manage Orders</span>
            <span>{ordersOpen ? "▾" : "▸"}</span>
          </button>

           {ordersOpen && (
            <div className="ml-4 mt-1 space-y-1">
              

              <NavLink to="/orders/generate-order" className={linkClass}>
               Generate Order
              </NavLink>
              <NavLink to="/orders/view-order" className={linkClass}>
                View Orders
              </NavLink>
             
             
            </div>
          )}
           <button
            onClick={() => handleMenuToggle('clients')}
            className={`w-full text-left px-4 py-2 rounded flex justify-between hover:bg-gray-700 ${
              clientsOpen ? "bg-gray-800 text-white" : "text-gray-300"
            }`}
          >
            <span>Manage Clients</span>
            <span>{clientsOpen ? "▾" : "▸"}</span>
          </button>

           {clientsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              

              <NavLink to="/manage-client/client" className={linkClass}>
               Clients
              </NavLink>
              
             
             
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
