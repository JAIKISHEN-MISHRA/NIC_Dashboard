import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => `${currentYear - i}`);

// Dummy service replacements
const fetchSchemes = async () => ['Scheme A', 'Scheme B'];
const addScheme = async (name: string) => name;
const uploadCSV = async (data: any) => new Promise(resolve => setTimeout(resolve, 1000));

type UploadableFile = { name: string };

export default function UploadScreen() {
  const [schemeName, setSchemeName] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<UploadableFile | null>(null);
  const [existingSchemes, setExistingSchemes] = useState<string[]>([]);
  const [newScheme, setNewScheme] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemes().then(setExistingSchemes);
  }, []);

  const handleAddScheme = async () => {
    if (!newScheme.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a valid scheme name' });
      return;
    }
    setLoading(true);
    await addScheme(newScheme.trim());
    const updated = await fetchSchemes();
    setExistingSchemes(updated);
    setNewScheme('');
    setLoading(false);
    Toast.show({ type: 'success', text1: 'Scheme added successfully' });
  };

  const handleUpload = async () => {
    if (!schemeName || !month || !year || !file) {
      Toast.show({ type: 'error', text1: 'Please complete all fields before uploading.' });
      return;
    }
    setLoading(true);
    await uploadCSV({ file, schemeName, month, year });
    setLoading(false);
    Toast.show({ type: 'success', text1: 'Upload Successful', text2: `${file.name} uploaded.` });
  };

  const pickDummyFile = () => {
    setFile({ name: 'demo.csv' });
    Toast.show({ type: 'info', text1: 'Dummy file selected', text2: 'demo.csv' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📤 Upload Scheme Data</Text>

        <Text style={styles.label}>New Scheme</Text>
        <TextInput
          placeholder="Enter new scheme name"
          style={styles.input}
          value={newScheme}
          onChangeText={setNewScheme}
        />
        <TouchableOpacity style={styles.orangeButton} onPress={handleAddScheme}>
          <Text style={styles.orangeButtonText}>Add Scheme</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#FF6600" />}

        <Text style={styles.label}>Select Scheme</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={schemeName} onValueChange={setSchemeName}>
            <Picker.Item label="-- Select Scheme --" value="" />
            {existingSchemes.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Month</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={month} onValueChange={setMonth}>
            <Picker.Item label="-- Select Month --" value="" />
            {months.map((m) => <Picker.Item key={m} label={m} value={m} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Select Year</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={year} onValueChange={setYear}>
            <Picker.Item label="-- Select Year --" value="" />
            {years.map((y) => <Picker.Item key={y} label={y} value={y} />)}
          </Picker>
        </View>

        <View style={styles.fileSection}>
          <TouchableOpacity style={styles.orangeButton} onPress={pickDummyFile}>
            <Text style={styles.orangeButtonText}>Select Dummy File</Text>
          </TouchableOpacity>
          {file && (
            <Text style={styles.selectedFile}>📄 {file.name}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.orangeButton} onPress={handleUpload}>
          <Text style={styles.orangeButtonText}>Upload CSV</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        <Toast />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 60, // More padding to avoid bottom nav bar overlap
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF6600',
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  fileSection: {
    marginVertical: 20,
  },
  selectedFile: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#555',
  },
  orangeButton: {
    backgroundColor: '#FF6600',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  orangeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
