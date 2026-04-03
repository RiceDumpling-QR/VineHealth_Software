import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { loginUser, registerUser } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }
    if (mode === 'register' && !username.trim()) {
      setError('Please enter a username.');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await loginUser(email.trim(), password);
      } else {
        result = await registerUser(email.trim(), username.trim(), password);
      }
      onLogin(result.user_id, result.username);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>🌱</Text>
      <Text style={styles.title}>PlantGuard</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Register'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          <Text style={styles.toggle}>
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a6b35',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  heading: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  error: { color: '#e53935', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  button: {
    backgroundColor: '#3a6b35',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggle: { color: '#3a6b35', textAlign: 'center', fontSize: 13 },
});
