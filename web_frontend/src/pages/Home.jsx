import React,{useEffect,useState} from 'react'
import Sidenav from '../Components/Sidenav'
import Box from '@mui/material/Box';
import Navbar from "../Components/Navbar"
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import WheelchairPickupIcon from '@mui/icons-material/WheelchairPickup';
import CardContent from '@mui/material/CardContent';
import ManIcon from '@mui/icons-material/Man';
import Collapse from '@mui/material/Collapse';
import WomanIcon from '@mui/icons-material/Woman';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import "../css/Dash.css";
import Animate from '../charts/Animate';
import PieChart from '../charts/PieChart';
import Chart from "../charts/Chart";
import axios from 'axios';
import Menu from "../pages/Menu";
import SimpleDropdownRow from '../pages/Menu';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


function Home() {
   const [maleCount, setMaleCount] = useState(null);
const [showOtherDetails, setShowOtherDetails] = useState(false);


//    useEffect(() => {
//   axios.get('http://localhost:5000/api/countmale')
//     .then((res) => {
//       setMaleCount(res.data.count); // Use res.data directly in Axios
//     })
//     .catch((err) => {
//       console.error("Error fetching male count:", err);
//     });
// }, []);
const [age, setAge] = useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <>
    <Navbar/>
     <Box height={50}/>
   <Box sx={{ display: 'flex' }}>  
      <Sidenav/>
      
      <SimpleDropdownRow/>

     </Box> 

    {/* <Menu/> */}
    </>
  )
    
}

export default Home
