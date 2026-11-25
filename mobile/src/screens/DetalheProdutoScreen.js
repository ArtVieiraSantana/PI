import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { adicionarAoCarrinho } from '../database/localDb';
import useThickScrollbar from '../hooks/useThickScrollbar';

export default function DetalheProdutoScreen({ route, navigation }) {
  const { produto } = route.params;
  const { scrollRef, scrollProps, scrollbar } = useThickScrollbar();

  async function handleAdicionarCarrinho() {
    await adicionarAoCarrinho(produto);
    Alert.alert('Carrinho', `${produto.nome} adicionado ao carrinho.`);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        {...scrollProps}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {produto.imagem_url ? (
          <Image source={{ uri: produto.imagem_url }} style={styles.imagem} resizeMode="cover" />
        ) : (
          <View style={[styles.imagem, styles.imagemPlaceholder]}>
            <Text style={styles.imagemPlaceholderTexto}>ZeroGrau</Text>
          </View>
        )}

        <View style={styles.conteudo}>
          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.preco}>R$ {Number(produto.preco).toFixed(2)}</Text>
          <Text style={styles.descricao}>{produto.descricao || 'Sem descrição cadastrada.'}</Text>

          <View style={styles.estoqueBox}>
            <Text style={styles.estoque}>
              {produto.estoque > 0 ? `${produto.estoque} unidades em estoque` : 'Produto esgotado'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botao, produto.estoque === 0 && styles.botaoDesabilitado]}
            disabled={produto.estoque === 0}
            onPress={handleAdicionarCarrinho}
          >
            <Text style={styles.botaoTexto}>🛒  Adicionar ao carrinho</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {scrollbar}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  imagem: { width: '100%', height: 320, backgroundColor: '#EFEFF4' },
  imagemPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagemPlaceholderTexto: { color: '#aaa', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  conteudo: { padding: 24 },
  nome: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  preco: { fontSize: 22, fontWeight: '800', color: '#0f9d58', marginVertical: 8 },
  descricao: { fontSize: 15, color: '#555', marginBottom: 16, lineHeight: 22 },
  estoqueBox: {
    backgroundColor: '#F7F7FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  estoque: { fontSize: 13, color: '#555', fontWeight: '600' },
  botao: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 10 },
  botaoDesabilitado: { backgroundColor: '#ccc' },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, color: '#555' },
});
