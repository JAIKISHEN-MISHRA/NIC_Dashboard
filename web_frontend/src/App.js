import logo from './logo.svg';
import './App.css';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import {BrowserRouter, Routes,Route} from "react-router-dom"
import Home from "./pages/Home";
import About from './pages/About';
import Settings from './pages/Settings';

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
     <Route path="/login" exact element={<Login/>}/>
     <Route path="/signup" exact element={<SignUp/>}/>
     <Route path='/' exact element={<Home/>}/>
      <Route path='/about' exact element={<About/>}/>
      <Route path='/settings' exact element={<Settings/>}/>
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
