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
   <Route path="/products" element={<Product/>}>
        <Route path="Add-location" element={<EditProfile />} />
        <Route path="Brands" element={<Brands/>} />
        <Route path="AddCategories ==" element={<ViewProfile/>} />
    </Route>
    </Routes>
    </div>
  );
}

export default App;
