"""
ZeroGrau Mobile - Dashboard de Análise de Dados (PI IV, Sprint 2, item 2.5)

Disciplina: Análise de Dados e Estatística.

Lê o arquivo JSON exportado pelo botão "Exportar dados (JSON)" da tela
principal do app (item 2.2 do roteiro — o endpoint que gera esse arquivo
é GET /api/relatorios/export-json no backend), e gera um conjunto de
gráficos sobre as vendas da loja ZeroGrau:

  1. Faturamento por pedido, em ordem cronológica
  2. Produtos mais vendidos (por quantidade)
  3. Faturamento por categoria de produto
  4. Distribuição dos pedidos por status (pendente, pago, etc.)
  5. Ticket médio por pedido

Como usar:
    pip install -r requirements.txt
    python gerar_dashboard.py caminho/para/relatorio-zerograu-*.json

Se nenhum caminho for passado, o script procura automaticamente o JSON
mais recente dentro da pasta "entrada/" (ver README.md desta pasta).

Os gráficos são salvos como arquivos .png dentro da pasta "saida/", para
serem anexados ao documento final (PDF) do projeto, conforme pede o
item 2.2 do roteiro ("Acrescentar a(s) tela(s) desse dashboard e o
código, ao documento final").
"""

import json
import sys
import glob
import os
from datetime import datetime

import pandas as pd
import matplotlib

matplotlib.use("Agg")  # gera os PNGs sem precisar de tela/display
import matplotlib.pyplot as plt

PASTA_SCRIPT = os.path.dirname(os.path.abspath(__file__))
PASTA_ENTRADA = os.path.join(PASTA_SCRIPT, "entrada")
PASTA_SAIDA = os.path.join(PASTA_SCRIPT, "saida")

COR_PRINCIPAL = "#1a1a2e"
COR_DESTAQUE = "#0f9d58"


def localizar_arquivo_entrada():
    """Se o usuário não passar um caminho, usa o JSON mais recente da pasta entrada/."""
    candidatos = sorted(glob.glob(os.path.join(PASTA_ENTRADA, "relatorio-zerograu-*.json")))
    if not candidatos:
        sys.exit(
            "Nenhum arquivo JSON encontrado. Exporte os dados pelo app (botão "
            "'Exportar dados (JSON)', visível para o usuário ADMIN) e coloque o "
            f"arquivo baixado dentro de: {PASTA_ENTRADA}"
        )
    return candidatos[-1]


def carregar_dados(caminho_json):
    with open(caminho_json, "r", encoding="utf-8") as f:
        dados = json.load(f)

    pedidos = pd.DataFrame(dados.get("pedidos", []))
    itens = pd.DataFrame(dados.get("itensPedido", []))
    produtos = pd.DataFrame(dados.get("produtos", []))
    categorias = pd.DataFrame(dados.get("categorias", []))

    if not pedidos.empty:
        pedidos["criado_em"] = pd.to_datetime(pedidos["criado_em"])

    return pedidos, itens, produtos, categorias


def grafico_faturamento_por_pedido(pedidos):
    if pedidos.empty:
        return
    dados = pedidos.sort_values("criado_em")

    plt.figure(figsize=(9, 4.5))
    plt.plot(dados["numero_pedido"], dados["total"], marker="o", color=COR_PRINCIPAL)
    plt.title("Faturamento por pedido (ordem cronológica)")
    plt.ylabel("Total (R$)")
    plt.xticks(rotation=60, ha="right", fontsize=7)
    plt.tight_layout()
    plt.savefig(os.path.join(PASTA_SAIDA, "1_faturamento_por_pedido.png"), dpi=150)
    plt.close()


def grafico_produtos_mais_vendidos(itens, produtos, top_n=10):
    if itens.empty or produtos.empty:
        return
    unidos = itens.merge(produtos[["id", "nome"]], left_on="produto_id", right_on="id", how="left")
    ranking = (
        unidos.groupby("nome")["quantidade"].sum().sort_values(ascending=False).head(top_n)
    )

    plt.figure(figsize=(9, 4.5))
    ranking.sort_values().plot(kind="barh", color=COR_DESTAQUE)
    plt.title(f"Top {min(top_n, len(ranking))} produtos mais vendidos (unidades)")
    plt.xlabel("Unidades vendidas")
    plt.tight_layout()
    plt.savefig(os.path.join(PASTA_SAIDA, "2_produtos_mais_vendidos.png"), dpi=150)
    plt.close()


def grafico_faturamento_por_categoria(itens, produtos, categorias):
    if itens.empty or produtos.empty:
        return
    unidos = itens.merge(produtos[["id", "categoria_id"]], left_on="produto_id", right_on="id", how="left")
    if not categorias.empty:
        unidos = unidos.merge(
            categorias[["id", "nome"]].rename(columns={"id": "categoria_id", "nome": "categoria_nome"}),
            on="categoria_id",
            how="left",
        )
    else:
        unidos["categoria_nome"] = "Sem categoria"
    unidos["categoria_nome"] = unidos["categoria_nome"].fillna("Sem categoria")

    por_categoria = unidos.groupby("categoria_nome")["subtotal"].sum().sort_values(ascending=False)

    plt.figure(figsize=(7, 5))
    plt.pie(por_categoria, labels=por_categoria.index, autopct="%1.0f%%", startangle=90)
    plt.title("Faturamento por categoria de produto")
    plt.tight_layout()
    plt.savefig(os.path.join(PASTA_SAIDA, "3_faturamento_por_categoria.png"), dpi=150)
    plt.close()


def grafico_pedidos_por_status(pedidos):
    if pedidos.empty:
        return
    contagem = pedidos["status"].value_counts()

    plt.figure(figsize=(6, 4))
    contagem.plot(kind="bar", color=COR_PRINCIPAL)
    plt.title("Pedidos por status")
    plt.ylabel("Quantidade de pedidos")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(os.path.join(PASTA_SAIDA, "4_pedidos_por_status.png"), dpi=150)
    plt.close()


def resumo_texto(pedidos, itens, produtos):
    total_pedidos = len(pedidos)
    faturamento = pedidos["total"].sum() if not pedidos.empty else 0
    ticket_medio = pedidos["total"].mean() if not pedidos.empty else 0
    unidades_vendidas = itens["quantidade"].sum() if not itens.empty else 0

    linhas = [
        "ZeroGrau Mobile - Resumo do Dashboard",
        f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        "-" * 40,
        f"Total de pedidos:        {total_pedidos}",
        f"Faturamento total:       R$ {faturamento:,.2f}",
        f"Ticket médio:            R$ {ticket_medio:,.2f}",
        f"Unidades vendidas:       {int(unidades_vendidas)}",
        f"Produtos no catálogo:    {len(produtos)}",
    ]
    texto = "\n".join(linhas)

    with open(os.path.join(PASTA_SAIDA, "resumo.txt"), "w", encoding="utf-8") as f:
        f.write(texto + "\n")

    print(texto)


def main():
    os.makedirs(PASTA_ENTRADA, exist_ok=True)
    os.makedirs(PASTA_SAIDA, exist_ok=True)

    caminho_json = sys.argv[1] if len(sys.argv) > 1 else localizar_arquivo_entrada()
    print(f"Lendo dados de: {caminho_json}\n")

    pedidos, itens, produtos, categorias = carregar_dados(caminho_json)

    grafico_faturamento_por_pedido(pedidos)
    grafico_produtos_mais_vendidos(itens, produtos)
    grafico_faturamento_por_categoria(itens, produtos, categorias)
    grafico_pedidos_por_status(pedidos)
    resumo_texto(pedidos, itens, produtos)

    print(f"\nGráficos salvos em: {PASTA_SAIDA}")


if __name__ == "__main__":
    main()
