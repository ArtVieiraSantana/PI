import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { api } from '../services/api';
import { limparCarrinho } from '../database/localDb';

export default function CheckoutScreen({ route, navigation }) {
  const { itens, total } = route.params;
  const [endereco, setEndereco] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handlePagar() {
    if (!endereco) {
      Alert.alert('Atenção', 'Informe o endereço de entrega.');
      return;
    }

    setCarregando(true);
    try {
      const pedido = await api.criarPedido({
        itens: itens.map((i) => ({ produtoId: i.produto_id, quantidade: i.quantidade })),
        formaPagamento: 'mercado_pago',
        enderecoEntrega: endereco,
        frete: 0,
      });

      const preferencia = await api.criarPreferenciaPagamento({
        pedidoNumero: pedido.numero_pedido,
        itens: itens.map((i) => ({ nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
      });

      await limparCarrinho();

      if (preferencia.initPoint) {
        Linking.openURL(preferencia.initPoint);
      }

      Alert.alert('Pedido criado', `Pedido ${pedido.numero_pedido} enviado para pagamento no Mercado Pago.`);
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Erro no pagamento', err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Formulário de pagamento</Text>
      <Text style={styles.total}>Total do pedido: R$ {total.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Endereço de entrega"
        value={endereco}
        onChangeText={setEndereco}
      />

      <Text style={styles.info}>O pagamento será concluído via Checkout Pro do Mercado Pago.</Text>

      <TouchableOpacity style={styles.botao} disabled={carregando} onPress={handlePagar}>
        <Text style={styles.botaoTexto}>{carregando ? 'Processando...' : 'Pagar com Mercado Pago'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  total: { fontSize: 16, color: '#555', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  info: { color: '#888', fontSize: 12, marginBottom: 20 },
  botao: { backgroundColor: '#009ee3', padding: 14, borderRadius: 8 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
