# 💰 ZetaFin - Gestão Financeira para Casais

<img src="https://img.shields.io/badge/React-19.0.0-blue" alt="React Version">
<img src="https://img.shields.io/badge/TypeScript-5.8.3-blue" alt="TypeScript Version">
<img src="https://img.shields.io/badge/Vite-7.1.3-purple" alt="Vite Version">
<img src="https://img.shields.io/badge/Tailwind-3.4.17-cyan" alt="Tailwind Version">

ZetaFin é uma aplicação moderna de gestão financeira desenvolvida especialmente para casais que desejam organizar suas finanças de forma colaborativa e intuitiva.

## 🎯 Sobre o Projeto

O ZetaFin oferece uma solução completa para controle financeiro pessoal e familiar, com foco na experiência do usuário e funcionalidades específicas para casais. A aplicação permite acompanhar receitas, despesas, gerar relatórios detalhados e manter um controle eficiente das finanças domésticas.

### ✨ Principais Funcionalidades

- 📊 **Dashboard Interativo**: Visão geral das finanças com estatísticas em tempo real
- 💰 **Gestão de Transações**: Cadastro, edição e controle completo de receitas e despesas
- 📈 **Relatórios Avançados**: Gráficos e análises detalhadas do comportamento financeiro
- 👥 **Perfil Personalizado**: Configurações específicas para casais
- 🔔 **Notificações**: Alertas e lembretes financeiros
- 📱 **Interface Responsiva**: Otimizada para desktop e dispositivos móveis

## 🛠️ Stack Tecnológica

### Frontend
- **React 19.0.0** - Biblioteca para interfaces de usuário
- **TypeScript 5.8.3** - Tipagem estática para JavaScript
- **Vite 7.1.3** - Build tool e servidor de desenvolvimento
- **Tailwind CSS 3.4.17** - Framework CSS utilitário
- **React Router 7.5.3** - Roteamento para aplicações React
- **Recharts 3.2.1** - Biblioteca de gráficos para React
- **Lucide React** - Ícones modernos e elegantes

### Backend & Deploy
- **Hono 4.7.7** - Framework web rápido e leve
- **Cloudflare Workers** - Plataforma serverless para deploy
- **Zod 3.24.3** - Validação de esquemas TypeScript

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/zetafin.git
cd zetafin
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto em modo desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
```
http://localhost:5173
```

## 📁 Estrutura do Projeto

```
ZetaFin/
├── src/
│   ├── react-app/           # Aplicação React principal
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── BalanceEvolution.tsx
│   │   │   ├── ExpensesByCategory.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── TransactionForm.tsx
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── NewTransaction.tsx
│   │   │   ├── EditTransaction.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Profile.tsx
│   │   ├── App.tsx          # Componente principal
│   │   ├── main.tsx         # Ponto de entrada
│   │   └── index.css        # Estilos globais
│   ├── shared/              # Tipos e utilitários compartilhados
│   │   └── types.ts
│   └── worker/              # Cloudflare Worker
│       ├── index.ts
│       └── types.ts
├── public/                  # Arquivos estáticos
├── .trae/                   # Documentação do projeto
└── package.json
```

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa verificação de código
- `npm run check` - Verifica TypeScript e build
- `npm run cf-typegen` - Gera tipos do Cloudflare

## 🎨 Design e Interface

### Características do Design
- **Cores Principais**: Azul (#3B82F6) e Roxo (#8B5CF6)
- **Estilo**: Moderno, minimalista com cantos arredondados
- **Tipografia**: Inter (sistema padrão)
- **Layout**: Card-based com navegação inferior
- **Responsividade**: Mobile-first design

### Componentes Principais
- **BalanceCard**: Exibe estatísticas financeiras
- **BalanceEvolution**: Gráfico de evolução do saldo
- **ExpensesByCategory**: Análise de gastos por categoria
- **TransactionForm**: Formulário para transações
- **Layout**: Template base com navegação

## 🔧 Configuração e Personalização

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações da aplicação
VITE_APP_NAME=ZetaFin
VITE_APP_VERSION=1.0.0

# Cloudflare (se necessário)
CLOUDFLARE_API_TOKEN=seu_token_aqui
```

### Customização de Cores
Edite o arquivo `tailwind.config.js` para personalizar as cores:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    }
  }
}
```

## 📊 Funcionalidades Detalhadas

### Dashboard
- Visão geral do saldo atual
- Estatísticas de receitas e despesas
- Gráfico de evolução financeira
- Últimas transações

### Gestão de Transações
- Cadastro de receitas e despesas
- Categorização automática
- Filtros avançados
- Edição e exclusão

### Relatórios
- Análise por categorias
- Tendências mensais
- Projeções financeiras
- Exportação de dados

### Perfil
- Configurações pessoais
- Dados do casal
- Notificações
- Suporte e ajuda

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

Desenvolvido com ❤️ para casais que querem organizar suas finanças juntos.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@zetafin.com
- 💬 Discord: [ZetaFin Community](https://discord.gg/zetafin)
- 📖 Documentação: [docs.zetafin.com](https://docs.zetafin.com)

---

**ZetaFin** - Transformando a gestão financeira de casais, uma transação por vez! 💙