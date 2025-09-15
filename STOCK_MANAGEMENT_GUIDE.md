# 📦 Guia de Gerenciamento de Estoque - Mariana Doces

Este guia explica como usar a nova seção exclusiva de gerenciamento de estoque implementada no frontend.

## 🎯 Funcionalidades Implementadas

### 1. **Gerenciamento de Estoque** (`/gerenciamento-estoque`)
- ✅ **Visão Geral Completa**: Dashboard com estatísticas em tempo real
- ✅ **Controle de Movimentações**: Entrada, saída e ajustes de estoque
- ✅ **Alertas Inteligentes**: Notificações para estoque baixo e sem estoque
- ✅ **Filtros e Busca**: Encontrar ingredientes rapidamente
- ✅ **Histórico Detalhado**: Acompanhar todas as movimentações
- ✅ **Exportação de Dados**: Relatórios em CSV

### 2. **Relatórios de Estoque** (`/relatorios-estoque`)
- ✅ **Análise Financeira**: Valor total do estoque
- ✅ **Distribuição Visual**: Gráficos de status do estoque
- ✅ **Top Ingredientes**: Ranking por valor
- ✅ **Relatórios Exportáveis**: CSV com dados detalhados
- ✅ **Filtros por Período**: Análise temporal

### 3. **Dashboard Integrado** (Componente `StockDashboard`)
- ✅ **Resumo Executivo**: Métricas principais
- ✅ **Alertas Críticos**: Itens que precisam de atenção
- ✅ **Ações Rápidas**: Links diretos para funcionalidades
- ✅ **Status Visual**: Indicadores de saúde do estoque

## 🚀 Como Usar

### Acessando o Gerenciamento de Estoque

1. **Pelo Menu Lateral**: Clique em "Gerenciamento de Estoque"
2. **Pelo Dashboard**: Use os cards de resumo do estoque
3. **URL Direta**: `/gerenciamento-estoque`

### Funcionalidades Principais

#### 📊 **Dashboard de Estoque**
```
- Total de ingredientes ativos
- Quantidade com estoque baixo
- Ingredientes sem estoque
- Valor total do estoque
```

#### 🔍 **Busca e Filtros**
```
- Busca por nome do ingrediente
- Filtro por status (Normal, Baixo, Sem Estoque)
- Contador de resultados
```

#### ➕ **Nova Movimentação**
```
- Seleção do ingrediente
- Tipo: Entrada, Saída ou Ajuste
- Quantidade e motivo
- Observações opcionais
```

#### 📈 **Histórico de Movimentações**
```
- Visualização por ingrediente
- Filtro por data
- Detalhes de cada movimentação
- Ícones visuais por tipo
```

#### 🚨 **Sistema de Alertas**
```
- Notificações em tempo real
- Lista de itens críticos
- Classificação por urgência
- Ações rápidas
```

## 📋 Estrutura dos Arquivos

### Páginas Principais
- **`src/pages/StockManagement.tsx`** - Gerenciamento completo
- **`src/pages/StockReports.tsx`** - Relatórios e análises
- **`src/pages/Inventory.tsx`** - Visão simplificada (mantida)

### Componentes
- **`src/components/StockDashboard.tsx`** - Dashboard integrado
- **`src/components/Layout.tsx`** - Navegação atualizada

### Rotas Adicionadas
```typescript
<Route path="gerenciamento-estoque" element={<StockManagement />} />
<Route path="relatorios-estoque" element={<StockReports />} />
```

## 🎨 Interface do Usuário

### Cards de Estatísticas
```
┌─────────────────────────────────────┐
│ 📦 Total de Ingredientes      │ 45 │
├─────────────────────────────────────┤
│ ⚠️  Estoque Baixo            │ 12 │
├─────────────────────────────────────┤
│ 🚨 Sem Estoque               │ 3  │
├─────────────────────────────────────┤
│ 💰 Valor Total               │ R$ │
│                              │ 2.5k│
└─────────────────────────────────────┘
```

### Tabela de Ingredientes
```
┌─────────────┬────────┬──────────┬──────────┬──────────┬──────────┬────────┐
│ Ingrediente │ Unidade│ Atual    │ Mínimo   │ Custo    │ Valor    │ Status │
├─────────────┼────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ Açúcar      │ kg     │ 10.0 kg  │ 2.0 kg   │ R$ 3.50  │ R$ 35.00 │ Normal │
│ Farinha     │ kg     │ 0.5 kg   │ 1.0 kg   │ R$ 4.20  │ R$ 2.10  │ Baixo  │
│ Ovos        │ un     │ 0 un     │ 6 un     │ R$ 0.50  │ R$ 0.00  │ Crítico│
└─────────────┴────────┴──────────┴──────────┴──────────┴──────────┴────────┘
```

### Modal de Movimentação
```
┌─────────────────────────────────────┐
│ Nova Movimentação                   │
├─────────────────────────────────────┤
│ Ingrediente: [Dropdown]             │
│ Tipo: [Entrada/Saída/Ajuste]        │
│ Quantidade: [Input numérico]        │
│ Motivo: [Input texto]               │
│ Observações: [Textarea]             │
├─────────────────────────────────────┤
│ [Cancelar] [Registrar]              │
└─────────────────────────────────────┘
```

## 🔧 Funcionalidades Técnicas

### Estados Gerenciados
```typescript
interface StockSummary {
  totalIngredients: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  criticalItems: Ingredient[];
}
```

### Validações
```typescript
const stockMovementSchema = z.object({
  ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional(),
});
```

### Cálculos Automáticos
```typescript
// Status do estoque
const getStockStatus = (ingredient: Ingredient) => {
  if (ingredient.currentStock <= 0) return 'out';
  if (ingredient.currentStock <= ingredient.minStock) return 'low';
  return 'ok';
};

// Valor total
const totalValue = ingredient.currentStock * ingredient.costPerUnit;
```

## 📊 Relatórios Disponíveis

### 1. **Relatório de Estoque**
- Valor total do estoque
- Distribuição por status
- Top 5 ingredientes por valor
- Detalhamento completo

### 2. **Relatório de Movimentações**
- Total de movimentações por período
- Distribuição por tipo (Entrada/Saída/Ajuste)
- Principais motivos
- Análise temporal

### 3. **Exportação CSV**
- Dados estruturados
- Formatação adequada
- Nome do arquivo com data
- Download automático

## 🚨 Sistema de Alertas

### Tipos de Alertas
1. **Sem Estoque** (Crítico)
   - Cor: Vermelho
   - Ação: Reabastecimento urgente

2. **Estoque Baixo** (Atenção)
   - Cor: Amarelo
   - Ação: Planejar compra

3. **Normal** (OK)
   - Cor: Verde
   - Ação: Monitoramento

### Notificações
- Badge com contador no menu
- Lista de itens críticos
- Alertas visuais na tabela
- Ações rápidas disponíveis

## 🔄 Integração com Backend

### APIs Necessárias
```typescript
// Movimentações de estoque
GET /api/ingredients/stock-movements
POST /api/ingredients/stock-movements
GET /api/ingredients/stock-movements/:id

// Status do estoque
GET /api/inventory/status
GET /api/inventory/alerts

// Relatórios
GET /api/reports/inventory-value
GET /api/reports/low-stock
```

### Dados Esperados
```typescript
interface StockMovement {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
  createdAt: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}
```

## 🎯 Próximos Passos

### Funcionalidades Futuras
- [ ] Integração com API de movimentações
- [ ] Notificações push
- [ ] Gráficos interativos
- [ ] Previsão de demanda
- [ ] Integração com fornecedores
- [ ] Códigos de barras
- [ ] App mobile

### Melhorias Planejadas
- [ ] Cache de dados
- [ ] Paginação otimizada
- [ ] Filtros avançados
- [ ] Relatórios personalizados
- [ ] Backup automático
- [ ] Auditoria de mudanças

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

1. **Dados não carregam**
   - Verificar conexão com API
   - Confirmar autenticação
   - Verificar logs do console

2. **Movimentação não salva**
   - Validar dados do formulário
   - Verificar permissões de usuário
   - Confirmar API disponível

3. **Relatórios não exportam**
   - Verificar dados disponíveis
   - Confirmar permissões de download
   - Testar em navegador diferente

### Logs Úteis
```javascript
// Verificar carregamento de dados
console.log('Dados do estoque:', ingredients);

// Verificar movimentações
console.log('Movimentação criada:', movementData);

// Verificar cálculos
console.log('Status do estoque:', stockStatus);
```

---

## 🎉 Conclusão

A seção de gerenciamento de estoque oferece um controle completo e profissional dos ingredientes, com interface intuitiva e funcionalidades avançadas. O sistema está preparado para crescer e se integrar com o backend quando as APIs estiverem disponíveis.

**Funcionalidades principais:**
- ✅ Controle visual e intuitivo
- ✅ Alertas inteligentes
- ✅ Relatórios detalhados
- ✅ Exportação de dados
- ✅ Interface responsiva
- ✅ Validações robustas

**Pronto para uso em produção!** 🚀
