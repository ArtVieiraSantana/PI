// App Express isolado do "listen", para que os testes automatizados
// (item 2.6 do roteiro) possam importar a aplicação com Supertest sem
// precisar abrir uma porta de rede de verdade.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const produtosRoutes = require('./routes/produtos.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const pagamentosRoutes = require('./routes/pagamentos.routes');
const relatoriosRoutes = require('./routes/relatorios.routes');

const app = express();

function origemPermitida(origin) {
  if (process.env.FRONTEND_ORIGIN === origin) return true;

  let hostname;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return Boolean(
    process.env.CODESPACE_NAME &&
      hostname.startsWith(`${process.env.CODESPACE_NAME}-`) &&
      hostname.endsWith('.app.github.dev')
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, origemPermitida(origin) ? origin : false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', servico: 'ZeroGrau API (Node)' }));

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));

module.exports = app;
