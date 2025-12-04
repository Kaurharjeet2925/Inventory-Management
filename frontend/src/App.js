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
import History from './pages/Delivery/History.js';
import CompletedOrders from './pages/Delivery/Deliveries/CompletedOrders.js';
import AgentDashboard from './pages/Delivery/Deliveries/AgentDashboard.js';
import PendingOrders from './pages/Delivery/Deliveries/PendingOrders.js';
import ShippedOrders from './pages/Delivery/Deliveries/ShippedOrders.js';
import DeliveredOrders from './pages/Delivery/Deliveries/DeliveredOrders.js';



function App() {  
  return (
    <div>
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
      <Route path='/dashboard' element= {<Dashboard/>} />
     <Route path="/profile" element={<Profile />}>
        <Route path="edit" element={<EditProfile />} />
        <Route path="alladmin" element={<AllAdmin/>} />
        <Route path="view/:id" element={<ViewProfile/>} />
    </Route>
   <Route path="/manage-products" element={<ManageProducts/>}>
        <Route path="brands" element={<Brands/>} />
        <Route path="categories" element={<Categories/>} />
        <Route path="products" element={<Product/>} />
        <Route path="location" element={<Locations/>} />
    </Route>
     <Route path="/manage-client" element={<ManageClients/>}>
        <Route path="client" element={<Client/>} />
        
    </Route>
    <Route path="/orders" element={<ManageOrders/>}>
        <Route path="generate-order" element={<CreateOrders/>} />
        <Route path="view-order" element={<ViewOrders/>} />
    </Route>
    <Route path="/agent" element={<Agent />}>

  {/* Dashboard Home */}
  <Route path="agent-dashboard" element={<AgentDashboard />} />

  {/* Deliveries Section */}
  <Route path="deliveries">
    <Route index element={<AgentDashboard />} /> 
    <Route path="pending" element={<PendingOrders />} />
    <Route path="shipped" element={<ShippedOrders />} />
    <Route path="delivered" element={<DeliveredOrders />} />
    <Route path="completed" element={<CompletedOrders />} />
  </Route>

</Route>

   
    </Routes>
    </div>
  );
}

export default App;
