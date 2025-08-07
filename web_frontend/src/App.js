import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Components/Login';
import SignUp from './Components/SignUp';
import Home from "./pages/Home";
import AdminRequest from './pages/AdminRequest';
import Upload from './pages/Upload';         
import AddScheme from './pages/AddScheme';   
import Layout from './Components/Layout';    
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path='/change-password' element={<ChangePassword/>}/>

          {/* Protected routes (with Navbar + Sidenav layout) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/AdminRequest" element={<AdminRequest />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/AddScheme" element={<AddScheme />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
