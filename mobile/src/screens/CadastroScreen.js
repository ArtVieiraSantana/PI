import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Regras de senha exigidas neste cadastro (apenas estas três, por pedido
// do cliente — não usa o mesmo conjunto de regras do print de referência):
//   1) ao menos uma letra minúscula
//   2) ao menos um número
//   3) confirmação de senha (os dois campos precisam ser iguais)
function validarSenha(senha, confirmarSenha) {
  return {
    minuscula: /[a-z]/.test(senha),
    numero: /[0-9]/.test(senha),
    confere: senha.length > 0 && senha === confirmarSenha,
  };
}

function ItemRegra({ ok, texto }) {
  return (
    <View style={styles.regraLinha}>
      <Text style={[styles.regraIcone, ok ? styles.regraIconeOk : styles.regraIconeFalta]}>
        {ok ? '✓' : '○'}
      </Text>
      <Text style={[styles.regraTexto, ok && styles.regraTextoOk]}>{texto}</Text>
    </View>
  );
}

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarRegras, setMostrarRegras] = useState(false);
  const { cadastrar } = useAuth();

  const regras = validarSenha(senha, confirmarSenha);
  const senhaValida = regras.minuscula && regras.numero && regras.confere;

  async function handleCadastro() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (!senhaValida) {
      setMostrarRegras(true);
      Alert.alert('Senha inválida', 'Verifique os requisitos de senha listados abaixo do campo.');
      return;
    }
    try {
      await cadastrar(nome, email, senha);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Erro ao cadastrar', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar conta</Text>

      <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
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
        onFocus={() => setMostrarRegras(true)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        onFocus={() => setMostrarRegras(true)}
      />

      {mostrarRegras && (
        <View style={styles.regrasBox}>
          <Text style={styles.regrasTitulo}>Sua senha deve conter:</Text>
          <ItemRegra ok={regras.minuscula} texto="letra minúscula" />
          <ItemRegra ok={regras.numero} texto="número" />
          <ItemRegra ok={regras.confere} texto="confirmar senha (os dois campos devem ser iguais)" />
        </View>
      )}

      <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#1a1a2e' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  regrasBox: {
    backgroundColor: '#F7F7FB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  regrasTitulo: { fontSize: 12, color: '#555', marginBottom: 6, fontWeight: '600' },
  regraLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  regraIcone: { width: 18, fontSize: 13, fontWeight: 'bold' },
  regraIconeOk: { color: '#2e9e4f' },
  regraIconeFalta: { color: '#aaa' },
  regraTexto: { fontSize: 13, color: '#888' },
  regraTextoOk: { color: '#2e9e4f', fontWeight: '600' },
  botao: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 8, marginTop: 8 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, color: '#1a1a2e' },
});
