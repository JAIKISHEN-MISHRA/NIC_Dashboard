import React from "react";
import { Chart } from "react-google-charts";
import { ResponsiveContainer } from "recharts";

export const data = [
  ["Name", "Age", "Gender", "Getting Benefits", "Reason (if not)"],
  ["Rahul Sharma", 32, "Male", "Yes", ""],
  ["Priya Verma", 45, "Female", "No", "Incomplete Documents"],
  ["Arjun Singh", 28, "Male", "Yes", ""],
  ["Meena Kumari", 60, "Female", "No", "Not Eligible"],
  ["Ravi Das", 39, "Other", "Yes", ""],
  ["Sunita Yadav", 50, "Female", "No", "Application Pending"],
];

export const options = {
  allowHtml: true,
  showRowNumber: true,
};

export default function Table() {
  return (
    <>
    <ResponsiveContainer width="100%" height={40}></ResponsiveContainer>
    <Chart
      chartType="Table"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
    <ResponsiveContainer/>
    </>
  );
}
