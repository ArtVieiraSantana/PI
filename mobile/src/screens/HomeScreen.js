import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { api } from '../services/api';
import { adicionarAoCarrinho, salvarProdutosCache } from '../database/localDb';
import { useAuth } from '../context/AuthContext';
import useThickScrollbar from '../hooks/useThickScrollbar';
import ConfirmModal from '../components/ConfirmModal';

export default function HomeScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', estoque: '', imagemUrl: '' });
  const { usuario, sair } = useAuth();
  const { scrollRef, scrollProps, scrollbar } = useThickScrollbar();

  const carregarProdutos = useCallback(async () => {
    try {
      const dados = await api.listarProdutos();
      setProdutos(dados);
      await salvarProdutosCache(dados);
      setUltimaSincronizacao(new Date());
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  // Item 2.1 do roteiro: sincronização explícita entre o app e o
  // servidor/backend (rebusca o catálogo e atualiza o cache local usado
  // offline pelo expo-sqlite, igual a um app de rastreio tipo Correios
  // que o usuário atualiza manualmente para ver o status mais recente).
  async function handleSincronizar() {
    setSincronizando(true);
    await carregarProdutos();
    setSincronizando(false);
  }

  // Item 2.2 do roteiro: botão que gera os dados em JSON (pedidos, itens
  // e produtos) para o dashboard em Python (item 2.5). No celular, salva
  // o arquivo e abre o menu de compartilhar; na versão web, baixa o
  // arquivo .json direto no navegador.
  async function handleExportarJson() {
    setExportando(true);
    try {
      const dados = await api.exportarRelatorioJson();
      const conteudo = JSON.stringify(dados, null, 2);
      const nomeArquivo = `relatorio-zerograu-${Date.now()}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([conteudo], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const caminho = `${FileSystem.documentDirectory}${nomeArquivo}`;
        await FileSystem.writeAsStringAsync(caminho, conteudo, { encoding: FileSystem.EncodingType.UTF8 });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(caminho, { mimeType: 'application/json', dialogTitle: 'Exportar dados do ZeroGrau' });
        } else {
          Alert.alert('Exportado', `Arquivo salvo em: ${caminho}`);
        }
      }
    } catch (err) {
      Alert.alert('Erro ao exportar', err.message);
    } finally {
      setExportando(false);
    }
  }

  async function handleSair() {
    await sair();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  function abrirModalNovo() {
    setProdutoEditando(null);
    setForm({ nome: '', descricao: '', preco: '', estoque: '', imagemUrl: '' });
    setModalVisivel(true);
  }

  function abrirModalEdicao(produto) {
    setProdutoEditando(produto);
    setForm({
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: String(produto.preco),
      estoque: String(produto.estoque),
      imagemUrl: produto.imagem_url || '',
    });
    setModalVisivel(true);
  }

  async function salvarProduto() {
    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: parseFloat(form.preco),
      estoque: parseInt(form.estoque, 10) || 0,
      imagemUrl: form.imagemUrl || null,
    };
    try {
      if (produtoEditando) {
        await api.alterarProduto(produtoEditando.id, payload);
      } else {
        await api.inserirProduto(payload);
      }
      setModalVisivel(false);
      carregarProdutos();
    } catch (err) {
      Alert.alert('Erro ao salvar', err.message);
    }
  }

  async function excluirProduto(produto) {
    try {
      await api.excluirProduto(produto.id);
      await carregarProdutos();
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert(`Erro ao excluir produto: ${err.message}`);
      } else {
        Alert.alert('Erro ao excluir produto', err.message);
      }
    }
  }

  function confirmarExclusao(produto) {
    setProdutoParaExcluir(produto);
  }

  async function confirmarExclusaoProduto() {
    if (!produtoParaExcluir) return;
    const produto = produtoParaExcluir;
    setProdutoParaExcluir(null);
    await excluirProduto(produto);
  }

  async function handleAdicionarCarrinho(produto) {
    await adicionarAoCarrinho(produto);
    Alert.alert('Carrinho', `${produto.nome} adicionado ao carrinho.`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Produtos</Text>
          {ultimaSincronizacao && (
            <Text style={styles.sincronizadoEm}>
              Sincronizado às {ultimaSincronizacao.toLocaleTimeString().slice(0, 5)}
            </Text>
          )}
        </View>
        <View style={styles.headerAcoes}>
          <TouchableOpacity onPress={handleSincronizar} disabled={sincronizando} style={styles.botaoIcone}>
            <Text style={styles.botaoIconeTexto}>{sincronizando ? '…' : '🔄'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSair}>
            <Text style={styles.sair}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {usuario?.perfil === 'ADMIN' && (
        <TouchableOpacity
          style={styles.botaoExportar}
          onPress={handleExportarJson}
          disabled={exportando}
        >
          <Text style={styles.botaoExportarTexto}>
            {exportando ? 'Gerando JSON…' : '📊 Exportar dados (JSON) para o dashboard'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.listaComBarra}>
        <FlatList
          ref={scrollRef}
          {...scrollProps}
          data={produtos}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.colunas}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
            <TouchableOpacity onPress={() => navigation.navigate('DetalheProduto', { produto: item })} activeOpacity={0.85}>
              <View style={styles.imagemWrapper}>
                {item.imagem_url ? (
                  <Image source={{ uri: item.imagem_url }} style={styles.imagem} resizeMode="cover" />
                ) : (
                  <View style={[styles.imagem, styles.imagemPlaceholder]}>
                    <Text style={styles.imagemPlaceholderTexto}>ZeroGrau</Text>
                  </View>
                )}
                {item.estoque <= 5 && item.estoque > 0 && (
                  <View style={styles.badgeEstoqueBaixo}>
                    <Text style={styles.badgeTexto}>Últimas unidades</Text>
                  </View>
                )}
                {item.estoque === 0 && (
                  <View style={styles.badgeEsgotado}>
                    <Text style={styles.badgeTexto}>Esgotado</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.nomeProduto} numberOfLines={2}>{item.nome}</Text>
                <Text style={styles.precoProduto}>R$ {Number(item.preco).toFixed(2)}</Text>
                <Text style={styles.estoqueProduto}>{item.estoque} em estoque</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoCarrinho, item.estoque === 0 && styles.botaoDesabilitado]}
              disabled={item.estoque === 0}
              onPress={() => handleAdicionarCarrinho(item)}
            >
              <Text style={styles.botaoCarrinhoTexto}>🛒  Adicionar</Text>
            </TouchableOpacity>

            {usuario?.perfil === 'ADMIN' && (
              <View style={styles.acoesAdmin}>
                <TouchableOpacity onPress={() => abrirModalEdicao(item)}>
                  <Text style={styles.acaoTexto}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmarExclusao(item)}>
                  <Text style={[styles.acaoTexto, { color: '#c0392b' }]}>Excluir</Text>
                </TouchableOpacity>
              </View>
            )}
            </View>
          )}
        />
        {scrollbar}
      </View>

      <TouchableOpacity style={styles.fabCarrinho} onPress={() => navigation.navigate('Carrinho')}>
        <Text style={styles.fabTexto}>🛒 Carrinho</Text>
      </TouchableOpacity>

      {usuario?.perfil === 'ADMIN' && (
        <TouchableOpacity style={styles.fabNovo} onPress={abrirModalNovo}>
          <Text style={styles.fabTexto}>+ Produto</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>{produtoEditando ? 'Alterar produto' : 'Inserir produto'}</Text>
            <TextInput style={styles.input} placeholder="Nome" value={form.nome} onChangeText={(v) => setForm({ ...form, nome: v })} />
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={form.descricao}
              onChangeText={(v) => setForm({ ...form, descricao: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço"
              keyboardType="decimal-pad"
              value={form.preco}
              onChangeText={(v) => setForm({ ...form, preco: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Estoque"
              keyboardType="number-pad"
              value={form.estoque}
              onChangeText={(v) => setForm({ ...form, estoque: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="URL da foto do produto"
              autoCapitalize="none"
              value={form.imagemUrl}
              onChangeText={(v) => setForm({ ...form, imagemUrl: v })}
            />

            <TouchableOpacity style={styles.botao} onPress={salvarProduto}>
              <Text style={styles.botaoTexto}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisivel(false)}>
              <Text style={styles.link}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={Boolean(produtoParaExcluir)}
        title="Excluir produto"
        message={
          produtoParaExcluir
            ? `Tem certeza que deseja excluir ${produtoParaExcluir.nome}?`
            : ''
        }
        confirmText="Excluir"
        onCancel={() => setProdutoParaExcluir(null)}
        onConfirm={confirmarExclusaoProduto}
      />
    </View>
  );
}

const LARGURA_CARD = '48%';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FA', paddingTop: 48, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerAcoes: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  botaoIcone: { padding: 4 },
  botaoIconeTexto: { fontSize: 20 },
  sincronizadoEm: { color: '#888', fontSize: 11, marginTop: 2 },
  botaoExportar: {
    backgroundColor: '#eef6ff',
    borderWidth: 1,
    borderColor: '#bcd9f7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  botaoExportarTexto: { color: '#1a1a2e', textAlign: 'center', fontWeight: '700', fontSize: 12 },
  listaComBarra: { flex: 1, flexDirection: 'row' },
  titulo: { fontSize: 26, fontWeight: '800', color: '#1a1a2e', letterSpacing: 0.3 },
  sair: { color: '#c0392b', fontWeight: '600' },
  colunas: { justifyContent: 'space-between' },
  card: {
    width: LARGURA_CARD,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imagemWrapper: { position: 'relative' },
  imagem: { width: '100%', height: 130, backgroundColor: '#EFEFF4' },
  imagemPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagemPlaceholderTexto: { color: '#aaa', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  badgeEstoqueBaixo: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F5A623',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeEsgotado: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#c0392b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeTexto: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardInfo: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  nomeProduto: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', minHeight: 34 },
  precoProduto: { fontSize: 16, fontWeight: '800', color: '#0f9d58', marginTop: 4 },
  estoqueProduto: { color: '#888', fontSize: 11, marginTop: 2, marginBottom: 8 },
  botaoCarrinho: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  botaoDesabilitado: { backgroundColor: '#ccc' },
  botaoCarrinhoTexto: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 12 },
  acoesAdmin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  acaoTexto: { color: '#1a1a2e', fontSize: 12, fontWeight: '600' },
  fabCarrinho: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    backgroundColor: '#1a1a2e',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  fabNovo: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#0f9d58',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  fabTexto: { color: '#fff', fontWeight: 'bold' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  botao: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 8, marginTop: 4 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 12, color: '#555' },
});
