import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');

  const handleSendOtp = () => {
    // TODO: Call backend to send OTP to mobile
    router.push({ pathname: '/verify-otp', params: { mobile } });
  };

  return (
    <LinearGradient colors={['#FF9933', '#FFFFFF', '#138808']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <TextInput
            placeholder="Enter Registered Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffffcc', padding: 25, borderRadius: 16, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#C62828' },
  input: { borderBottomWidth: 1, borderColor: '#FF6600', marginBottom: 15, paddingVertical: 8, fontSize: 16 },
  button: { backgroundColor: '#FF6600', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
