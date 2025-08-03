import React from 'react'
import Sidenav from '../Components/Sidenav'
import Box from '@mui/material/Box';
import Navbar from '../Components/Navbar';
import SimpleDropdownRow from './Menu';
function Dashboard() {
  return (
    <>
    <Navbar/>
    <Box height={30}/>
    <Box sx={{ display: 'flex' }}>
      <Sidenav/>
      <Box component="main" sx={{flexGrow:1,p:3}}>
      <SimpleDropdownRow/>
      </Box>
    </Box>
    </>
  )
}

export default Dashboard
