import './App.css';
import Login from './pages/Login.js';
import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <div>
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
   
    </Routes>
    </div>
  );
}

export default App;
