// Sobe a API em uma porta de verdade. A configuração do Express em si
// mora em app.js, para poder ser reaproveitada pelos testes (item 2.6).
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API ZeroGrau (Node) rodando em http://localhost:${PORT}`);
});
