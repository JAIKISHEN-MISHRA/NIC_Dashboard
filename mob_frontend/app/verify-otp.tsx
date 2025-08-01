import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { mobile } = useLocalSearchParams(); // get mobile from query
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    // TODO: Verify OTP with backend
    // On success → route to password reset or login
    // router.replace('/reset-password') or similar
  };

  return (
    <LinearGradient colors={['#FF9933', '#FFFFFF', '#138808']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>OTP sent to: {mobile}</Text>

          <TextInput
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffffcc', padding: 25, borderRadius: 16, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#C62828' },
  subtitle: { textAlign: 'center', color: '#333', marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: '#FF6600', marginBottom: 15, paddingVertical: 8, fontSize: 16 },
  button: { backgroundColor: '#FF6600', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
