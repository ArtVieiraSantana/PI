import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const metroUrl = NativeModules.SourceCode?.scriptURL;
const metroHost = metroUrl?.match(/^https?:\/\/([^/:]+)/)?.[1];
const defaultHost = Platform.select({
  android: metroHost || '10.0.2.2',
  default: metroHost || 'localhost',
});
const defaultBaseUrl =
  Platform.OS === 'web' ? '/api' : `http://${defaultHost}:3000/api`;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl;

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem('@zerograu_token');

  const resposta = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const dados = resposta.status === 204 ? null : await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados?.mensagem || 'Erro ao comunicar com a API.');
  }
  return dados;
}

export const api = {
  cadastrar: (nome, email, senha) =>
    request('/auth/cadastro', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }),

  login: (email, senha) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  listarProdutos: () => request('/produtos'),

  inserirProduto: (produto) => request('/produtos', { method: 'POST', body: JSON.stringify(produto) }),

  alterarProduto: (id, produto) =>
    request(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(produto) }),

  excluirProduto: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),

  criarPedido: (payload) => request('/pedidos', { method: 'POST', body: JSON.stringify(payload) }),

  criarPreferenciaPagamento: (payload) =>
    request('/pagamentos/preferencia', { method: 'POST', body: JSON.stringify(payload) }),

  // Item 2.2 do roteiro: exporta pedidos/itens/produtos em JSON, usado
  // pelo botão "Exportar dados (JSON)" da Home (somente admin) e, depois,
  // pelo dashboard em Python (item 2.5).
  exportarRelatorioJson: () => request('/relatorios/export-json'),
};
