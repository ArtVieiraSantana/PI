# Dashboard ZeroGrau (Python) — item 2.5 do roteiro

Gera gráficos de análise de vendas a partir do JSON exportado pelo app
(botão **"Exportar dados (JSON)"**, visível somente para o usuário
ADMIN na tela principal — ver item 2.2 do roteiro).

## Como usar

1. Instale as dependências:
   ```bash
   cd dashboard
   pip install -r requirements.txt
   ```
2. Pelo app (logado como admin@zerograu.com), toque em **"Exportar
   dados (JSON)"** na Home. No celular isso abre o menu de
   compartilhar — envie o arquivo para o computador (ex.: por e-mail,
   Drive, ou cabo USB) e salve dentro da pasta `dashboard/entrada/`.
   Na versão web (`npm run web`), o arquivo já baixa direto na pasta de
   downloads do navegador — só mover para `dashboard/entrada/`.
3. Rode o script:
   ```bash
   python gerar_dashboard.py
   ```
   (ele pega automaticamente o JSON mais recente da pasta `entrada/`;
   também dá pra apontar um arquivo específico: `python gerar_dashboard.py caminho/arquivo.json`)
4. Os gráficos (.png) e um resumo em texto são salvos em `dashboard/saida/`.

## Gráficos gerados

1. `1_faturamento_por_pedido.png` — total de cada pedido, em ordem cronológica
2. `2_produtos_mais_vendidos.png` — ranking de produtos por unidades vendidas
3. `3_faturamento_por_categoria.png` — fatia do faturamento por categoria
4. `4_pedidos_por_status.png` — quantidade de pedidos por status (pendente, pago, etc.)
5. `resumo.txt` — total de pedidos, faturamento total, ticket médio e unidades vendidas
