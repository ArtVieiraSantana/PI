import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarCarrinho, removerDoCarrinho, alterarQuantidadeCarrinho } from '../database/localDb';
import useThickScrollbar from '../hooks/useThickScrollbar';
import ConfirmModal from '../components/ConfirmModal';

export default function CarrinhoScreen({ navigation }) {
  const [itens, setItens] = useState([]);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const { scrollRef, scrollProps, scrollbar } = useThickScrollbar();

  const carregar = useCallback(async () => {
    const dados = await listarCarrinho();
    setItens(dados);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Confirmação usada tanto quando a quantidade chega a 0 pelo botão "-"
  // quanto quando o usuário toca em "Remover" diretamente.
  function confirmarRemocao(item) {
    setItemParaRemover(item);
  }

  async function confirmarRemocaoItem() {
    if (!itemParaRemover) return;
    const item = itemParaRemover;
    setItemParaRemover(null);

    try {
      await removerDoCarrinho(item.produto_id);
      await carregar();
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert(`Erro ao remover item do carrinho: ${err.message}`);
      } else {
        Alert.alert('Erro ao remover item do carrinho', err.message);
      }
    }
  }

  async function handleAumentar(item) {
    await alterarQuantidadeCarrinho(item.produto_id, item.quantidade + 1);
    carregar();
  }

  async function handleDiminuir(item) {
    if (item.quantidade <= 1) {
      // Chegou a 0: pergunta antes de remover, em vez de remover direto.
      confirmarRemocao(item);
      return;
    }
    await alterarQuantidadeCarrinho(item.produto_id, item.quantidade - 1);
    carregar();
  }

  function handleRemover(item) {
    confirmarRemocao(item);
  }

  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Carrinho de compras</Text>

      <View style={styles.listaComBarra}>
        <FlatList
          ref={scrollRef}
          {...scrollProps}
          data={itens}
          keyExtractor={(item) => String(item.produto_id)}
          ListEmptyComponent={<Text style={styles.vazio}>Seu carrinho está vazio.</Text>}
          renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imagem_url ? (
              <Image source={{ uri: item.imagem_url }} style={styles.imagem} resizeMode="cover" />
            ) : (
              <View style={[styles.imagem, styles.imagemPlaceholder]} />
            )}

            <View style={styles.info}>
              <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.detalhe}>R$ {item.preco.toFixed(2)} un.</Text>

              <View style={styles.quantidadeLinha}>
                <TouchableOpacity
                  style={styles.quantidadeBotao}
                  onPress={() => handleDiminuir(item)}
                >
                  <Text style={styles.quantidadeBotaoTexto}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantidadeValor}>{item.quantidade}</Text>

                <TouchableOpacity
                  style={styles.quantidadeBotao}
                  onPress={() => handleAumentar(item)}
                >
                  <Text style={styles.quantidadeBotaoTexto}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleRemover(item)}>
              <Text style={styles.remover}>Remover</Text>
            </TouchableOpacity>
          </View>
          )}
        />
        {scrollbar}
      </View>

      <View style={styles.rodape}>
        <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.botao, itens.length === 0 && styles.botaoDesabilitado]}
          disabled={itens.length === 0}
          onPress={() => navigation.navigate('Checkout', { itens, total })}
        >
          <Text style={styles.botaoTexto}>Ir para pagamento</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={Boolean(itemParaRemover)}
        title="Remover item do carrinho"
        message={
          itemParaRemover
            ? `Tem certeza que deseja excluir o item "${itemParaRemover.nome}" do carrinho?`
            : ''
        }
        confirmText="Remover"
        onCancel={() => setItemParaRemover(null)}
        onConfirm={confirmarRemocaoItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 48, paddingHorizontal: 16 },
  listaComBarra: { flex: 1, flexDirection: 'row' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1a1a2e' },
  vazio: { textAlign: 'center', color: '#888', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imagem: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#EFEFF4' },
  imagemPlaceholder: {},
  info: { flex: 1, marginLeft: 12 },
  nome: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  detalhe: { color: '#555', marginTop: 2, fontSize: 13 },
  quantidadeLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantidadeBotao: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantidadeBotaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 18 },
  quantidadeValor: { width: 32, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  remover: { color: '#c0392b', fontSize: 12, fontWeight: '600', marginLeft: 8 },
  rodape: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  total: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  botao: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 10 },
  botaoDesabilitado: { backgroundColor: '#aaa' },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
