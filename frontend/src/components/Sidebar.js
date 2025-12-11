// Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  

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
  useEffect(() => {
    setDeliveryOpen(location.pathname.startsWith("/agent"));
  }, [location.pathname]);
  useEffect(() => {
    setReportsOpen(location.pathname.startsWith("/reports"));
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
      setDeliveryOpen(false);
      setReportsOpen(false);
    } else if (menu === 'product') {
      setProductOpen(!productOpen);
      setProfileOpen(false);
      setOrdersOpen(false);
      setClientsOpen(false);
      setDeliveryOpen(false);
      setReportsOpen(false);
    } else if (menu === 'orders') {
      setOrdersOpen(!ordersOpen);
      setProfileOpen(false);
      setProductOpen(false);
      setClientsOpen(false);
      setDeliveryOpen(false);
      setReportsOpen(false);
    } else if (menu === 'clients') {
      setClientsOpen(!clientsOpen);
      setProfileOpen(false);
      setProductOpen(false);
      setOrdersOpen(false);
      setDeliveryOpen(false);
      setReportsOpen(false);
    } else if (menu === 'agent') {
      setDeliveryOpen(!deliveryOpen);
      setProfileOpen(false);
      setProductOpen(false);
      setOrdersOpen(false);
      setClientsOpen(false);
      setReportsOpen(false);
    }
    else if (menu === 'reports') {
      setReportsOpen(!reportsOpen);
      setProfileOpen(false);
      setProductOpen(false);
      setOrdersOpen(false);
      setClientsOpen(false);
      setDeliveryOpen(false);
    }
  };

  return (
    <>
      {/* FIX: Sidebar is now FIXED and FULL HEIGHT */}
      <aside className="hidden md:block md:w-64 md:bg-gray-900 md:text-gray-300 md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto">
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
              <NavLink to="/manage-products/location" className={linkClass}>
                Warehouse Locations
              </NavLink>
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
          <button
            onClick={() => handleMenuToggle('reports')}
            className={`w-full text-left px-4 py-2 rounded flex justify-between hover:bg-gray-700 ${
              reportsOpen ? "bg-gray-800 text-white" : "text-gray-300"
            }`}
          >
            <span>Reports</span>
            <span>{reportsOpen ? "▾" : "▸"}</span>
          </button>

          {reportsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <NavLink to="/reports/sales-reports" className={linkClass}>
                Sales Reports
              </NavLink>
              <NavLink to="/reports/inventory-reports" className={linkClass}>
                Inventory Reports
              </NavLink>
            </div>
          )}

          <NavLink to="/agent/agent-dashboard" className={linkClass}>
            Agent Dashboard
          </NavLink>

        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  </div>
      </aside>
    </>
  );
};

export default Sidebar;
