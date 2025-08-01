import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function UpgradeRoleScreen() {
  const handleRequestUpgrade = () => {
    Alert.alert('Request Sent', 'Your request for admin access has been submitted.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧑‍💼 Request Admin Access</Text>
      <Text style={styles.subtitle}>Upgrade your access to upload or manage scheme data.</Text>

      <TouchableOpacity style={styles.button} onPress={handleRequestUpgrade}>
        <Text style={styles.buttonText}>Request Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  button: {
    backgroundColor: '#FF9933',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
