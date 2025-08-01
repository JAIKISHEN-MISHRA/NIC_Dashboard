import React from 'react'
import Sidenav from '../Components/Sidenav'
import Box from '@mui/material/Box';
import Navbar from '../Components/Navbar';
import Table from '../charts/Table';
import BasicTable from '../charts/BasicTable';
function About() {
  return (
    <>
    <Navbar/>
    <Box height={30}/>
    <Box sx={{ display: 'flex' }}>
      <Sidenav/>
      <Box component="main" sx={{flexGrow:1,p:3}}>
      {/* <Table/> */}
    <Box height={20}/>

      <BasicTable/>
      </Box>
    </Box>
    </>
  )
}

export default About
