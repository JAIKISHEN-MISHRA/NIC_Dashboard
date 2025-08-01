import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: API call here
    // On success: router.replace('/dashboard');
  };

  return (
<LinearGradient colors={['#f3a75aff', '#FFFFFF', '#54b84aff']} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.header}>
            <Image source={require('../assets/ashoka.png')} style={styles.logo} />
            <Text style={styles.govText}>महाराष्ट्र सरकार</Text>
            <Text style={styles.govSubText}>Government of India</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>

            <Text style={styles.label}>Email / Mobile Number<Text style={{ color: 'red' }}> *</Text></Text>
            <TextInput
              value={emailOrMobile}
              onChangeText={setEmailOrMobile}
              style={styles.input}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password<Text style={{ color: 'red' }}> *</Text></Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={styles.forgotLink}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            {/* ✅ Signup Link added here */}
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Don’t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.welcomeText}>WELCOME TO</Text>
            <Text style={styles.yojanaText}>Pradhan Mantri Yojana</Text>
            <Image source={require('../assets/flag_ashoka.png')} style={styles.flagIcon} />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center', flex: 1 },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  govText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 22,
  },
  govSubText: {
    fontSize: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffffdd',
    padding: 25,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6600',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6600',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#FF6600',
    marginBottom: 15,
    paddingVertical: 6,
    fontSize: 16,
  },
  forgotLink: {
    color: '#3366cc',
    textAlign: 'right',
    textDecorationLine: 'underline',
    marginBottom: 10,
    fontSize: 13,
  },
  signupLink: {
    color: '#3366cc',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#FF6600',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#C62828',
    fontWeight: '600',
    marginBottom: 2,
  },
  yojanaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'center',
  },
  flagIcon: {
    marginTop: 10,
    width: 200,
    height: 200,
  },
});
