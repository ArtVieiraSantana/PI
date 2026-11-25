import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, axes = plt.subplots(1, 3, figsize=(12, 6))
titles = ["Tela de Login", "Tela de Cadastro", "Listagem de Produtos"]

def phone_frame(ax):
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 20)
    ax.invert_yaxis()
    ax.add_patch(patches.Rectangle((0, 0), 10, 20, fill=False, linewidth=2))
    ax.axis('off')

def box(ax, x, y, w, h, text, fontsize=8):
    ax.add_patch(patches.Rectangle((x, y), w, h, fill=False, linewidth=1.2, linestyle='--'))
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize)

# Login
ax = axes[0]
phone_frame(ax)
box(ax, 1, 1, 8, 2, "ZeroGrau (logo)")
box(ax, 1, 4.5, 8, 1.5, "Campo: Email")
box(ax, 1, 6.5, 8, 1.5, "Campo: Senha")
box(ax, 1, 8.5, 8, 1.5, "[ Botão Entrar ]")
box(ax, 1, 10.5, 8, 1, "Link: Cadastre-se")

# Cadastro
ax = axes[1]
phone_frame(ax)
box(ax, 1, 1, 8, 1.5, "Criar conta")
box(ax, 1, 3, 8, 1.5, "Campo: Nome")
box(ax, 1, 5, 8, 1.5, "Campo: Email")
box(ax, 1, 7, 8, 1.5, "Campo: Senha")
box(ax, 1, 9, 8, 1.5, "[ Botão Cadastrar ]")
box(ax, 1, 11, 8, 1, "Link: Já tenho conta")

# Listagem de produtos
ax = axes[2]
phone_frame(ax)
box(ax, 1, 0.8, 8, 1.2, "Produtos          [Sair]")
box(ax, 1, 2.5, 8, 2.3, "Produto 1 - R$ 79,90\n[+Carrinho][Editar][Excluir]", fontsize=6.5)
box(ax, 1, 5.2, 8, 2.3, "Produto 2 - R$ 49,90\n[+Carrinho][Editar][Excluir]", fontsize=6.5)
box(ax, 1, 7.9, 8, 2.3, "Produto 3 - R$ ...\n[+Carrinho][Editar][Excluir]", fontsize=6.5)
box(ax, 1, 11, 3.5, 1.3, "[Carrinho]")
box(ax, 5.5, 11, 3.5, 1.3, "[+ Produto]")

for ax, t in zip(axes, titles):
    ax.set_title(t, fontsize=11, fontweight='bold')

plt.tight_layout()
plt.savefig("wireframes-baixa-fidelidade.png", dpi=150)
print("ok")
