import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, Age, Gender, Getting_Benefits, Reason_not_getting) {
  return { name, Age, Gender, Getting_Benefits, Reason_not_getting };
}

const rows = [
  createData("Rahul Sharma", 32, "Male", "Yes", ""),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData("Priya Verma", 45, "Female", "No", "Incomplete Documents"),
  createData("Ravi Das", 39, "Other", "Yes", ""),
  createData("Sunita Yadav", 50, "Female", "No", "Application Pending"),
];

export default function BasicTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>name </TableCell>
            <TableCell align="right">Age</TableCell>
            <TableCell align="right">Gender</TableCell>
            <TableCell align="right">Getting_Benefits</TableCell>
            <TableCell align="right">Reason_not_getting</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.Age}</TableCell>
              <TableCell align="right">{row.Gender}</TableCell>
              <TableCell align="right">{row.Getting_Benefits}</TableCell>
              <TableCell align="right">{row.Reason_not_getting}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
