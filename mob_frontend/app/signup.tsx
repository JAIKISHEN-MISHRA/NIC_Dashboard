import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

type FormField = 'firstname' | 'middlename' | 'lastname' | 'email' | 'mobile' | 'password';

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState<Record<FormField, string>>({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    mobile: '',
    password: '',
  });

  const handleChange = (key: FormField, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSignup = () => {
    // TODO: API call here
    // On success: router.replace('/login');
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
            <Text style={styles.title}>Create Account</Text>

            {(['firstname', 'middlename', 'lastname', 'email', 'mobile', 'password'] as FormField[]).map((field) => (
              <View key={field} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {['firstname', 'lastname', 'email', 'mobile', 'password'].includes(field) && <Text style={{ color: 'red' }}> *</Text>}
                </Text>
                <TextInput
                  value={form[field]}
                  onChangeText={text => handleChange(field, text)}
                  secureTextEntry={field === 'password'}
                  keyboardType={field === 'mobile' ? 'numeric' : 'default'}
                  style={styles.input}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.link}>Already have an account? Login</Text>
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
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#FF6600',
    paddingVertical: 6,
    fontSize: 16,
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
  link: {
    marginTop: 15,
    color: '#3366cc',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 14,
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
