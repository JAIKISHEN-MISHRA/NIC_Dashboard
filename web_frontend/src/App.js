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
import Dashboard from './pages/Dashboard';
import MainPage from './pages/MainPage';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes without MainPage */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Routes with MainPage layout */}
          <Route path="/" element={<MainPage />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="AdminRequest" element={<AdminRequest />} />
            <Route path="upload" element={<Upload />} />
            <Route path="AddScheme" element={<AddScheme />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
