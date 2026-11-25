import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  async function entrar(email, senha) {
    const resposta = await api.login(email, senha);
    await AsyncStorage.setItem('@zerograu_token', resposta.token);
    setUsuario(resposta.usuario);
  }

  async function cadastrar(nome, email, senha) {
    const resposta = await api.cadastrar(nome, email, senha);
    await AsyncStorage.setItem('@zerograu_token', resposta.token);
    setUsuario(resposta.usuario);
  }

  async function sair() {
    await AsyncStorage.removeItem('@zerograu_token');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
