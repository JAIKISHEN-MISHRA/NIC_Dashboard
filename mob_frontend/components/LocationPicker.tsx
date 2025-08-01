import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Option = { label: string; value: string };

type Props = {
  selectedState: string;
  setSelectedState: (value: string) => void;

  selectedDivision: string;
  setSelectedDivision: (value: string) => void;

  selectedDistrict: string;
  setSelectedDistrict: (value: string) => void;

  selectedTaluka: string;
  setSelectedTaluka: (value: string) => void;

  states: { state_code: string; state_name: string }[];
  divisions: Option[];
  districts: Option[];
  talukas: Option[];
};

export default function LocationPicker({
  selectedState,
  setSelectedState,
  selectedDivision,
  setSelectedDivision,
  selectedDistrict,
  setSelectedDistrict,
  selectedTaluka,
  setSelectedTaluka,
  states,
  divisions,
  districts,
  talukas,
}: Props) {
  return (
    <>
      <Text style={styles.label}>Select State:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedState}
          onValueChange={value => {
            setSelectedState(value);
            setSelectedDivision('');
            setSelectedDistrict('');
            setSelectedTaluka('');
          }}
          style={styles.picker}
        >
          <Picker.Item label="-- Select State --" value="" />
          {states?.map(s => (
            <Picker.Item key={s.state_code} label={s.state_name} value={s.state_code} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Division:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          enabled={divisions.length > 0}
          selectedValue={selectedDivision}
          onValueChange={value => {
            setSelectedDivision(value);
            setSelectedDistrict('');
            setSelectedTaluka('');
          }}
          style={[styles.picker, divisions.length === 0 && styles.disabledPicker]}
        >
          <Picker.Item label="-- Select Division --" value="" />
          {divisions?.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select District:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          enabled={districts.length > 0}
          selectedValue={selectedDistrict}
          onValueChange={value => {
            setSelectedDistrict(value);
            setSelectedTaluka('');
          }}
          style={[styles.picker, districts.length === 0 && styles.disabledPicker]}
        >
          <Picker.Item label="-- Select District --" value="" />
          {districts?.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Taluka:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          enabled={talukas.length > 0}
          selectedValue={selectedTaluka}
          onValueChange={setSelectedTaluka}
          style={[styles.picker, talukas.length === 0 && styles.disabledPicker]}
        >
          <Picker.Item label="-- Select Taluka --" value="" />
          {talukas?.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: '600',
    color: '#444',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  disabledPicker: {
    backgroundColor: '#f2f2f2',
    color: '#aaa',
  },
});
