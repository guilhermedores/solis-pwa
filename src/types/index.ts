// ============================================================================
// TIPOS BASEADOS NO AGENTE PDV (.NET)
// ============================================================================

// Status Venda
export interface StatusVenda {
  id: string
  codigo: 'ABERTA' | 'FINALIZADA' | 'CANCELADA'
  descricao: string
  cor: string
  ativa: boolean
  ordem: number
  permiteEdicao: boolean
  permiteCancelamento: boolean
  statusFinal: boolean
  sincronizado: boolean
  sincronizadoEm?: string
  createdAt: string
  updatedAt: string
}

// Forma de Pagamento
export enum TipoFormaPagamento {
  DINHEIRO = 'DINHEIRO',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
  PAGAMENTO_INSTANTANEO = 'PAGAMENTO_INSTANTANEO',
  VALE_ALIMENTACAO = 'VALE_ALIMENTACAO'
}

export interface FormaPagamento {
  id: string
  codigo: string
  descricao: string
  tipo: TipoFormaPagamento
  ativa: boolean
  ordem: number
  maximoParcelas?: number
  taxaJuros?: number
  permiteTroco: boolean
  requerTEF: boolean
  bandeira?: string
  sincronizado: boolean
  sincronizadoEm?: string
  createdAt: string
  updatedAt: string
}

// Produto
export interface Produto {
  id: string
  codigoBarras: string
  codigoInterno: string
  nome: string
  descricao: string
  ncm?: string
  cest?: string
  unidadeMedida: string
  ativo: boolean
  precoVenda: number
  criadoEm: string
  atualizadoEm: string
  sincronizadoEm?: string
}

// Venda
export interface VendaItem {
  id: string
  vendaId: string
  produtoId?: string
  sequencia: number
  codigoProduto: string
  nomeProduto: string
  quantidade: number
  precoUnitario: number
  descontoItem: number
  valorTotal: number
  createdAt: string
}

export interface VendaPagamento {
  id: string
  vendaId: string
  formaPagamentoId: string
  valor: number
  valorTroco: number
  parcelas?: number
  nsu?: string
  autorizacao?: string
  bandeira?: string
  createdAt: string
  formaPagamento?: FormaPagamento
}

export interface Venda {
  id: string
  numeroCupom: number
  estabelecimentoId?: string
  pdvId?: string
  usuarioId?: string
  caixaId?: string
  clienteCpf?: string
  clienteNome?: string
  clienteEmail?: string
  valorBruto: number
  valorDesconto: number
  valorLiquido: number
  statusVendaId: string
  observacoes?: string
  sincronizado: boolean
  sincronizadoEm?: string
  tentativasSync: number
  erroSync?: string
  createdAt: string
  updatedAt: string
  itens: VendaItem[]
  pagamentos: VendaPagamento[]
  statusVenda?: StatusVenda
  caixa?: Caixa
}

// Caixa
export interface Caixa {
  id: string
  numeroTerminal: number
  operadorNome: string
  dataAbertura: string
  dataFechamento?: string
  status: 'Aberto' | 'Fechado'
  valorAbertura: number
  valorFechamento?: number
  quantidadeVendas: number
  totalVendas: number
  totalDinheiro: number
  totalDebito: number
  totalCredito: number
  totalPix: number
  totalOutros: number
  diferenca: number
  observacoes?: string
  sincronizado: boolean
  sincronizadoEm?: string
  createdAt: string
  updatedAt: string
  vendas?: Venda[]
}

// DTOs para operações
export interface AbrirCaixaDto {
  numeroTerminal: number
  operadorNome: string
  valorAbertura: number
  observacoes?: string
}

export interface FecharCaixaDto {
  caixaId: string
  valorFechamento: number
  observacoes?: string
}

export interface CriarVendaDto {
  estabelecimentoId?: string
  pdvId?: string
  usuarioId?: string
  caixaId?: string
  clienteCpf?: string
  clienteNome?: string
  clienteEmail?: string
  valorBruto: number
  valorDesconto: number
  valorLiquido: number
  observacoes?: string
  itens: Omit<VendaItem, 'id' | 'vendaId' | 'createdAt'>[]
}

export interface FinalizarVendaDto {
  pagamentos: Omit<VendaPagamento, 'id' | 'vendaId' | 'createdAt' | 'formaPagamento'>[]
}

// Health Check
export interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  service: string
  version: string
}

// API Response padrão
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
