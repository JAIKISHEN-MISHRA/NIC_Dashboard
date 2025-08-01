import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Props = {
  selectedScheme: string;
  onChange: (value: string) => void;
};

export default function SchemePicker({ selectedScheme, onChange }: Props) {
  return (
    <>
      <Text style={styles.label}>Select Scheme:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedScheme} onValueChange={onChange} style={styles.picker}>
          <Picker.Item label="Scheme A" value="A" />
          <Picker.Item label="Scheme B" value="B" />
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
});
