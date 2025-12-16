import './App.css';
import Login from './pages/Login.js';
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dasboard.js';
import Profile from './pages/Profile.js';
import EditProfile from './pages/EditProfile.js';
import AllAdmin from './pages/AllAdmin.js';
import ViewProfile from './pages/ViewProfile.js';
import Product from './pages/ManageProduct/Product.js';
import Brands from './pages/ManageProduct/Brands.js';
import ManageProducts from './pages/ManageProduct/ManageProducts.js';
import Categories from './pages/ManageProduct/Category.js';
import ManageOrders from './pages/ManageOrders/ManageOrders.js';
import CreateOrders from './pages/ManageOrders/CreateOrders.js';
import ViewOrders from './pages/ManageOrders/ViewOrders.js';
import ManageClients from './pages/ManageClient/ManageClients.js';
import Client from './pages/ManageClient/Client.js';
import Locations from './pages/ManageProduct/Locations.js';
import Agent from './pages/Delivery/Agent.js';
//import History from './pages/Delivery/History.js';
import CompletedOrders from './pages/Delivery/Deliveries/CompletedOrders.js';
import AgentDashboard from './pages/Delivery/Deliveries/AgentDashboard.js';
import PendingOrders from './pages/Delivery/Deliveries/PendingOrders.js';
import ShippedOrders from './pages/Delivery/Deliveries/ShippedOrders.js';
import DeliveredOrders from './pages/Delivery/Deliveries/DeliveredOrders.js';
import socket from "../src/socket/socketClient.js"; 
import NotificationHandler from './components/NotificationHandler.js';
import { useEffect } from 'react';
import SalesReports from './pages/Reports/SalesReports.js';
import InventoryReports from './pages/Reports/InventoryReports.js';
import { NotificationProvider } from "./context/NotificationContext";
import Reports from './pages/Reports/Reports.js';
import DeliveryList from './pages/Delivery/DeliveriesList.js';

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => socket.off("connect");
  }, []);

  return (
    <NotificationProvider>
      <NotificationHandler />
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />}>
          <Route path="edit" element={<EditProfile />} />
          <Route path="alladmin" element={<AllAdmin />} />
          <Route path="view/:id" element={<ViewProfile />} />
        </Route>

        <Route path="/manage-products" element={<ManageProducts />}>
          <Route path="brands" element={<Brands />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Product />} />
          <Route path="location" element={<Locations />} />
        </Route>

        <Route path="/manage-client" element={<ManageClients />}>
          <Route path="client" element={<Client />} />
        </Route>

        <Route path="/orders" element={<ManageOrders />}>
          <Route path="generate-order" element={<CreateOrders />} />
          <Route path="view-order" element={<ViewOrders />} />
        </Route>
        <Route path="reports" element={<Reports />}>
            {/* <Route index element={<Reports />} /> */}
            <Route path="sales-reports" element={<SalesReports />} />
            <Route path="inventory-reports" element={<InventoryReports />} />
          </Route>
        <Route path="/agent" element={<Agent />}>
          <Route path="agent-dashboard" element={<AgentDashboard />} />

          <Route path="deliveries">
            <Route index element={<AgentDashboard />} />
            <Route path="pending" element={<PendingOrders />} />
            <Route path="shipped" element={<ShippedOrders />} />
            <Route path="delivered" element={<DeliveredOrders />} />
            <Route path="completed" element={<CompletedOrders />} />
          </Route>
          <Route path="deliveries-history" element={<DeliveryList />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}
export default App;