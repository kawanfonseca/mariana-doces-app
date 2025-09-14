# Mariana Doces App

Frontend para o sistema de gerenciamento da confeitaria Mariana Doces, desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool rápida para desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento para SPAs
- **Zustand** - Gerenciamento de estado leve
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd mariana-doces-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🏃‍♂️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run preview      # Preview do build de produção

# Linting
npm run lint         # Executa ESLint
```

## 🎨 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── hooks/          # Hooks customizados
├── services/       # Serviços para API
├── store/          # Gerenciamento de estado (Zustand)
├── types/          # Definições de tipos TypeScript
├── utils/          # Utilitários e helpers
├── styles/         # Estilos globais
└── App.tsx         # Componente principal
```

## 📱 Páginas e Funcionalidades

### Autenticação
- **Login** - Autenticação de usuários (admin/operador)
- Persistência de sessão com localStorage
- Proteção de rotas baseada em autenticação

### Dashboard
- Resumo dos últimos 30 dias
- Cards com métricas principais:
  - Receita Bruta
  - Receita Líquida
  - Total de Pedidos
  - Ticket Médio
- Top 5 produtos mais vendidos
- Resumo financeiro detalhado
- Ações rápidas para navegação

### Produtos
- Listagem com busca e paginação
- Visualização de detalhes completos
- Informações de receita e custos
- Análise de preços e margens
- Cálculo automático de custos por:
  - Ingredientes (com % de desperdício)
  - Embalagens
  - Mão de obra
- Preços sugeridos para canais direto e iFood

### Diário de Vendas
- Interface inspirada no Google Sheets
- Duas abas: Pronta Entrega e iFood
- Seleção de data e canal
- Grid de produtos com controles de quantidade
- Cálculo automático de totais:
  - Receita Bruta
  - Taxas de plataforma (iFood)
  - Receita Líquida
- Funcionalidade de importação CSV (planejada)

### Relatórios
- Filtros por período e canal
- Resumo financeiro com cards
- Relatório detalhado por produtos:
  - Quantidade vendida
  - Receita
  - Custos
  - Lucro
  - Margem percentual
- Exportação para CSV

### Ingredientes
- CRUD completo (admin)
- Listagem com busca
- Informações de custo por unidade
- Status ativo/inativo

### Embalagens
- CRUD completo (admin)
- Listagem com busca
- Custo unitário
- Status ativo/inativo

### Configurações
- Configurações de negócio:
  - Taxa do iFood (%)
  - Taxa de mão de obra por hora (R$)
  - Margem padrão (%)
- Informações do usuário logado
- Informações do sistema

## 🎨 Design System

### Cores
- **Primary**: Tons de azul para ações principais
- **Secondary**: Tons de laranja para elementos secundários
- **Success**: Verde para estados de sucesso
- **Error**: Vermelho para erros e exclusões
- **Warning**: Amarelo para alertas

### Componentes
- **Buttons**: Variações primary, secondary, outline, ghost
- **Cards**: Container padrão com header e content
- **Tables**: Tabelas responsivas com paginação
- **Forms**: Inputs padronizados com validação
- **Modals**: Para ações que requerem confirmação

## 💰 Formatação Brasileira

- **Moeda**: Formato BRL (R$ 1.234,56)
- **Datas**: Formato DD/MM/YYYY
- **Números**: Separadores brasileiros
- **Canais**: "Direto" e "iFood"

## 🔐 Autenticação e Autorização

### Roles de Usuário
- **ADMIN**: Acesso completo (CRUD de produtos, ingredientes, embalagens, configurações)
- **OPERATOR**: Acesso limitado (visualização e vendas)

### Proteção de Rotas
- Redirecionamento automático para login se não autenticado
- Interceptador de requisições para adicionar token JWT
- Logout automático em caso de token expirado

## 🌐 Integração com API

- **Base URL**: Configurável via variável de ambiente
- **Interceptadores**: Token automático e tratamento de erros
- **Tipagem**: Interfaces TypeScript para todas as respostas
- **Loading States**: Estados de carregamento em todas as operações
- **Error Handling**: Tratamento centralizado de erros com notificações

## 📊 Estados e Persistência

### Zustand Store
- **Auth Store**: Usuário logado e token JWT
- Persistência no localStorage
- Estado global reativo

### Local Storage
- Sessão de autenticação
- Rascunhos de formulários (planejado)

## 🎯 Responsividade

- Design mobile-first
- Breakpoints: sm, md, lg, xl
- Sidebar colapsível em telas menores
- Tabelas com scroll horizontal
- Grid responsivo para cards e formulários

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Variáveis de Ambiente
```env
VITE_API_URL=https://sua-api-url.com
```

### Deploy em Vercel/Netlify
O projeto está configurado para deploy automático em plataformas de hospedagem estática.

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👥 Usuários de Teste

- **Admin**: admin@marianaDoces.com / admin123
- **Operador**: operador@marianaDoces.com / operador123
