import React from 'react'
import Sidenav from '../Components/Sidenav'
import Box from '@mui/material/Box';
import Navbar from '../Components/Navbar';
function Settings() {
  return (
    <>
    <Navbar/>
    <Box height={30}/>
    <Box sx={{ display: 'flex' }}>
      <Sidenav/>
      <Box component="main" sx={{flexGrow:1,p:3}}>
      <h1>Settings</h1>
      </Box>
    </Box>
    </>
  )
}

export default Settings
