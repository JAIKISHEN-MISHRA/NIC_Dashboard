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

  return (
    <>
    <Navbar/>
    <Box height={50}/>
    <Box sx={{ display: 'flex' }}>
      <Sidenav/>
      <Box component="main" sx={{flexGrow:1,p:3}}>
      <Grid container spacing={2}>
        <Grid size={8}>
          <Stack spacing={3} direction={"row"}>
            <Card sx={{ minWidth: 30 + "%" , height:180,backgroundColor: '#D18A99', color: 'white',transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: 6,
    },}} >
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          <ManIcon sx={{ mr: 1 }} /> 
          Count of Men - {maleCount !== null ? maleCount : "Loading..."}
        </Typography>
      </CardContent>
    </Card>

            <Card sx={{ minWidth: 30 + "%" , height:180,backgroundColor: '#8AD1C2', color: 'white',transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: 6,
    },}} >

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          <WomanIcon/> 
          Count of Women-30
        </Typography>
        
      </CardContent>
    </Card>
    <Card sx={{ minWidth: 30 + "%" , height:180,backgroundColor: '#D1C28A', color: 'white',transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: 6,
    },}} onClick={() => setShowOtherDetails(!showOtherDetails)}>

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
         <WheelchairPickupIcon/>
         Count of Other - 40
        </Typography>
      </CardContent>
    </Card>
    <Collapse in={showOtherDetails}>
  <Stack direction="column" spacing={2}>
    <Stack spacing={2} direction="column" sx={{ transition: 'opacity 0.5s ease-in', opacity: showOtherDetails ? 1 : 0 }}>
    <Card sx={{ width: 200, height: 80, backgroundColor: '#F4C2C2' }}>
      <CardContent>
        <Typography variant="body1">Transgender: 12</Typography>
      </CardContent>
    </Card>
    <Card sx={{ width: 200, height: 80, backgroundColor: '#C2F4C9' }}>
      <CardContent>
        <Typography variant="body1">Disability: 18</Typography>
      </CardContent>
    </Card>
    <Card sx={{ width: 200, height: 80, backgroundColor: '#C2D4F4' }}>
      <CardContent>
        <Typography variant="body1">Senior Citizen: 10</Typography>
      </CardContent>
    </Card>
  </Stack>
  </Stack>
</Collapse>
    </Stack>
    
        </Grid>
        {!showOtherDetails && (
  <Grid size={4}>
    <Card sx={{ maxWidth: 400, height: 180 }}>
      <Animate />
    </Card>
  </Grid>
)}

</Grid>
    
    <Box height={20}/>


      <Grid container spacing={2}>
        <Grid size={8}>
          <Card sx={{height: 60+"vh" }}>
      <CardContent>
        {/* <BarChart/> */}
        <Chart/>
      </CardContent>
    </Card>
        </Grid>
        <Grid size={4}>
                     <Card sx={{height: 60+"vh" }}>

      <CardContent>
        <PieChart/>
      </CardContent>
    </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
    </>
  )
}

export default Home
