import React, {  useState } from 'react';
import { BarChart,Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Chart = () => {
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   axios.get('http://localhost:5000/api/monthly-data')
  //     .then(res => {
  //       const formatted = res.data.map(item => ({
  //         month: item.month.substring(0, 7),  // Format '2024-01'
  //         totalDisbursed: parseFloat(item.total_disbursed),
  //         beneficiaries: parseInt(item.total_beneficiaries)
  //       }));
  //       setData(formatted);
  //     });
  // }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      {/* <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="totalDisbursed" stroke="#82ca9d" />
        <Line type="monotone" dataKey="beneficiaries" stroke="#8884d8" />
      </LineChart> */}
      <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalDisbursed" fill="#8884d8" />
            <Bar dataKey="beneficiaries" fill="#8884d8" />

          </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
