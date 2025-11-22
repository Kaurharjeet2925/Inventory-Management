import './App.css';
import Login from './pages/Login.js';
import { Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dasboard.js';
import Profile from './pages/Profile.js';
import EditProfile from './pages/EditProfile.js';
function App() {
  return (
    <div>
     <Routes>
      <Route path="/" element={<Login />} />
      <Route path='/dashboard' element= {<Dashboard/>} />
     <Route path="/profile" element={<Profile />}>
        <Route path="edit" element={<EditProfile />} />
    </Route>

    </Routes>
    </div>
  );
}

export default App;
