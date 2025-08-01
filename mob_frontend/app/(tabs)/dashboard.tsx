import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import {
  PieChart,
  BarChart,
  LineChart,
} from 'react-native-gifted-charts';

import SchemePicker from '@/components/SchemePicker';
import LocationPicker from '@/components/LocationPicker';
import ChartCard from '@/components/ChartCard';
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
} from '@/services/api';

const screenWidth = Dimensions.get('window').width - 40;

export default function DashboardScreen() {
  const [selectedScheme, setSelectedScheme] = useState('A');

  const [selectedState, setSelectedState] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await getStates();
        setStates(res?.data ?? []);
      } catch (err) {
        console.error('Failed to load states', err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setDivisions([]);
      setDistricts([]);
      setTalukas([]);
      setSelectedDivision('');
      setSelectedDistrict('');
      setSelectedTaluka('');
      return;
    }

    const fetchDivisions = async () => {
      try {
        const res = await getDivisions(selectedState);
        const options = res.data.map((d: any) => ({
          label: d.division_name,
          value: d.division_code,
        }));
        setDivisions(options);
      } catch (err) {
        console.error('Failed to load divisions', err);
      }
    };

    fetchDivisions();
  }, [selectedState]);

  useEffect(() => {
    if (!selectedDivision) {
      setDistricts([]);
      setTalukas([]);
      setSelectedDistrict('');
      setSelectedTaluka('');
      return;
    }

    const fetchDistricts = async () => {
      try {
        const res = await getDistricts(selectedState, selectedDivision);
        const options = res.data.map((d: any) => ({
          label: d.district_name,
          value: d.district_code,
        }));
        setDistricts(options);
      } catch (err) {
        console.error('Failed to load districts', err);
      }
    };

    fetchDistricts();
  }, [selectedDivision]);

  useEffect(() => {
    if (!selectedDistrict) {
      setTalukas([]);
      setSelectedTaluka('');
      return;
    }

    const fetchTalukas = async () => {
      try {
        const res = await getTalukas(selectedState, selectedDivision, selectedDistrict);
        const options = res.data.map((t: any) => ({
          label: t.taluka_name,
          value: t.taluka_code,
        }));
        setTalukas(options);
      } catch (err) {
        console.error('Failed to load talukas', err);
      }
    };

    fetchTalukas();
  }, [selectedDistrict]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 Scheme Dashboard</Text>

      <SchemePicker selectedScheme={selectedScheme} onChange={setSelectedScheme} />

      <LocationPicker
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        selectedTaluka={selectedTaluka}
        setSelectedTaluka={setSelectedTaluka}
        states={states}
        divisions={divisions}
        districts={districts}
        talukas={talukas}
      />

      <ChartCard title="👫 Gender Distribution">
        <PieChart
          data={[
            { value: 55, color: '#4B9CD3', text: 'Male' },
            { value: 40, color: '#FF69B4', text: 'Female' },
            { value: 5, color: '#A020F0', text: 'Other' },
          ]}
          donut
          showText
          textColor="black"
          radius={100}
          animationDuration={1000}
        />
      </ChartCard>

      <ChartCard title="📈 Age Group Distribution">
        <BarChart
          barWidth={28}
          data={[
            { value: 30, label: '18-25', frontColor: '#4CAF50' },
            { value: 50, label: '26-35', frontColor: '#2196F3' },
            { value: 40, label: '36-50', frontColor: '#FFC107' },
            { value: 20, label: '51+', frontColor: '#FF5722' },
          ]}
          yAxisColor="#ccc"
          xAxisColor="#ccc"
          noOfSections={5}
          animationDuration={1000}
        />
      </ChartCard>

      <ChartCard title="✅ Accepted vs ❌ Rejected">
        <BarChart
          barWidth={50}
          data={[
            { value: 85, label: 'Accepted', frontColor: '#66BB6A' },
            { value: 15, label: 'Rejected', frontColor: '#EF5350' },
          ]}
          yAxisColor="#ccc"
          xAxisColor="#ccc"
          noOfSections={5}
          animationDuration={1000}
        />
      </ChartCard>

      <ChartCard title="📅 Yearly Applicants">
        <LineChart
          curved
          data={[
            { value: 1200, label: '2020' },
            { value: 1500, label: '2021' },
            { value: 1700, label: '2022' },
            { value: 2200, label: '2023' },
            { value: 2600, label: '2024' },
          ]}
          color="#2196F3"
          thickness={3}
          hideDataPoints={false}
          animationDuration={1000}
        />
      </ChartCard>

      <ChartCard title="📆 Monthly Applicants (2024)">
        <LineChart
          curved
          data={[
            { value: 100, label: 'Jan' },
            { value: 150, label: 'Feb' },
            { value: 200, label: 'Mar' },
            { value: 250, label: 'Apr' },
            { value: 210, label: 'May' },
            { value: 300, label: 'Jun' },
          ]}
          color="#9C27B0"
          thickness={3}
          hideDataPoints={false}
          animationDuration={1000}
        />
      </ChartCard>

      <ChartCard title="💰 Budget: Allocated vs Used">
        <BarChart
          barWidth={60}
          data={[
            { value: 100, label: 'Allocated', frontColor: '#3F51B5' },
            { value: 76, label: 'Used', frontColor: '#00BCD4' },
          ]}
          yAxisColor="#ccc"
          xAxisColor="#ccc"
          noOfSections={5}
          animationDuration={1000}
        />
      </ChartCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#C62828',
    textAlign: 'center',
  },
});

