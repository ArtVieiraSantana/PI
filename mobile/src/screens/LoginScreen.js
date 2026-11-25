import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { entrar } = useAuth();

  async function handleLogin() {
    try {
      await entrar(email, senha);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Erro ao entrar', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ZeroGrau</Text>
      <Text style={styles.subtitulo}>Entrar na sua conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1a1a2e' },
  subtitulo: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#555' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  botao: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 8, marginTop: 8 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, color: '#1a1a2e' },
});
