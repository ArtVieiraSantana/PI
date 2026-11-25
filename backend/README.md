# ZeroGrau Mobile — PI IV (Desenvolvimento para Dispositivos Móveis)

Adaptação do projeto de e-commerce **ZeroGrau** (originalmente Angular + Spring
Boot) para o escopo do roteiro do PI IV: aplicativo **React Native** com
backend **Node**, carrinho de compras e integração com a **API do Mercado
Pago**.

## Estrutura

```
zerograu-mobile-pi4/
├── backend/          # API Node (Express) - item 1.5 do roteiro
│   └── src/
├── mobile/           # App React Native (Expo) - item 1.4 do roteiro
│   └── src/
├── database/
│   └── schema.sql    # Script SQL do banco (DER) - item 1.5 do roteiro
└── docs/
    └── der-zerograu-mobile.png   # Diagrama Entidade-Relacionamento
```

## Como executar

Requer Node.js 18 ou mais recente (LTS recomendado).

### Backend (Node)
```bash
cd backend
npm install
copy .env.example .env  # Windows (use "cp" no Git Bash)
npm run init-db     # cria as tabelas a partir de database/schema.sql
npm start            # API em http://localhost:3000
```

Confirme em http://localhost:3000/api/health que a API respondeu com
`{"status":"ok",...}`.

### Navegador
```bash
cd mobile
npm install
npm run web
```

Abra http://localhost:8081. O app usa automaticamente a API em
`http://localhost:3000/api`.

### Celular físico com Expo Go

1. Instale o Expo Go no Android ou iOS.
2. Conecte o computador e o celular à mesma rede Wi-Fi.
3. Mantenha o backend em execução e libere a porta 3000 no Firewall do
   Windows caso seja solicitado.
4. Em `mobile`, execute `npm start` e leia o QR Code com o Expo Go (Android)
   ou com a câmera (iOS).

O app obtém automaticamente o IP do computador a partir do endereço do Expo.
Se a rede impedir a conexão LAN, execute `npm run tunnel` e defina a API
manualmente antes de iniciar:

```bash
set EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:3000/api
npm run tunnel
```

No emulador Android, o fallback da API é `http://10.0.2.2:3000/api`. Também é
possível sobrescrevê-lo com `EXPO_PUBLIC_API_URL`.

## Telas implementadas (mínimo exigido no roteiro)
1. **Login** (`LoginScreen.js`)
2. **Cadastro** (`CadastroScreen.js`)
3. **Tela principal / produtos** (`HomeScreen.js`) — listar, inserir, alterar e
   excluir produtos, além de consultar (`DetalheProdutoScreen.js`)
4. **Carrinho de compras** (`CarrinhoScreen.js`)
5. **Formulário de pagamento** (`CheckoutScreen.js`) — integrado à API do
   Mercado Pago via backend Node
