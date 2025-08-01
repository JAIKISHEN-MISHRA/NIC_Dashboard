import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userAuthenticated = true; // 🔁 Change to false to force redirect to /login
      setIsLoggedIn(userAuthenticated);
      if (!userAuthenticated) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6600" />
        <Text>Checking login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/ashoka.png')} style={styles.logo} />
        <Text style={styles.govText}>महाराष्ट्र शासन</Text>
      </View>

      <Text style={styles.title}>Welcome to the Government Scheme Dashboard</Text>
      <Text style={styles.subtitle}>Select an action to proceed:</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard')}>
        <Text style={styles.cardText}>📊 View Scheme Insights</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/upload')}>
        <Text style={styles.cardText}>⬆️ Upload Scheme Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/upgrade-role')}>
        <Text style={styles.cardText}>🧑‍💼 Request Admin Access</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  govText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C62828',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FF9933',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
