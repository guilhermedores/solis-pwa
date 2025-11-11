import api from '../lib/api'
import type { 
  Produto, 
  FormaPagamento, 
  Venda, 
  CriarVendaDto, 
  FinalizarVendaDto,
  Caixa,
  AbrirCaixaDto,
  FecharCaixaDto,
  HealthCheck,
  Empresa
} from '../types'

// ============================================================================
// HEALTH CHECK
// ============================================================================
export const healthService = {
  check: async (): Promise<HealthCheck> => {
    const { data } = await api.get<HealthCheck>('/health')
    return data
  }
}

// ============================================================================
// PRODUTOS
// ============================================================================
export const produtoService = {
  // Buscar por código de barras
  buscarPorCodigoBarras: async (codigoBarras: string): Promise<Produto> => {
    const { data } = await api.get<Produto>(`/api/produtos/codigo-barras/${codigoBarras}`)
    return data
  },

  // Buscar por termo (nome)
  buscar: async (termo: string): Promise<Produto[]> => {
    const { data } = await api.get<Produto[]>(`/api/produtos/buscar`, {
      params: { termo }
    })
    return data
  },

  // Listar produtos com paginação
  listar: async (skip = 0, take = 50): Promise<Produto[]> => {
    const { data } = await api.get<Produto[]>('/api/produtos', {
      params: { skip, take }
    })
    return data
  },

  // Sincronizar produtos da nuvem
  sincronizar: async (): Promise<void> => {
    await api.post('/api/produtos/sync')
  }
}

// ============================================================================
// FORMAS DE PAGAMENTO
// ============================================================================
export const formaPagamentoService = {
  // Listar todas
  listar: async (ativas?: boolean, tipo?: string): Promise<FormaPagamento[]> => {
    const { data } = await api.get<FormaPagamento[]>('/api/formas-pagamento', {
      params: { ativas, tipo }
    })
    return data
  },

  // Listar apenas ativas
  listarAtivas: async (): Promise<FormaPagamento[]> => {
    const { data } = await api.get<FormaPagamento[]>('/api/formas-pagamento/ativas')
    return data
  },

  // Obter por ID
  obter: async (id: string): Promise<FormaPagamento> => {
    const { data } = await api.get<FormaPagamento>(`/api/formas-pagamento/${id}`)
    return data
  },

  // Obter tipos disponíveis
  obterTipos: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/api/formas-pagamento/tipos')
    return data
  }
}

// ============================================================================
// VENDAS
// ============================================================================
export const vendaService = {
  // Criar nova venda
  criar: async (venda: CriarVendaDto): Promise<Venda> => {
    const { data } = await api.post<Venda>('/api/vendas', venda)
    return data
  },

  // Obter venda por ID
  obter: async (id: string): Promise<Venda> => {
    const { data } = await api.get<Venda>(`/api/vendas/${id}`)
    return data
  },

  // Listar vendas pendentes de sincronização
  listarPendentes: async (): Promise<Venda[]> => {
    const { data } = await api.get<Venda[]>('/api/vendas/pendentes')
    return data
  },

  // Finalizar venda (registrar pagamentos)
  finalizar: async (id: string, pagamentos: FinalizarVendaDto): Promise<void> => {
    await api.post(`/api/vendas/${id}/finalizar`, pagamentos)
  },

  // Cancelar venda
  cancelar: async (id: string, motivo: string): Promise<void> => {
    await api.post(`/api/vendas/${id}/cancelar`, JSON.stringify(motivo), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ============================================================================
// CAIXA
// ============================================================================
export const caixaService = {
  // Abrir caixa
  abrir: async (dados: AbrirCaixaDto): Promise<Caixa> => {
    const { data } = await api.post<Caixa>('/api/caixa/abrir', dados)
    return data
  },

  // Fechar caixa
  fechar: async (dados: FecharCaixaDto): Promise<Caixa> => {
    const { data } = await api.post<Caixa>('/api/caixa/fechar', dados)
    return data
  },

  // Obter caixa aberto do terminal
  obterAberto: async (numeroTerminal: number): Promise<Caixa | null> => {
    const { data } = await api.get<Caixa | null>(`/api/caixa/aberto/${numeroTerminal}`)
    return data
  },

  // Verificar se tem caixa aberto
  verificarAberto: async (numeroTerminal: number): Promise<boolean> => {
    const { data } = await api.get<boolean>(`/api/caixa/verificar-aberto/${numeroTerminal}`)
    return data
  },

  // Obter resumo do caixa
  obterResumo: async (id: string): Promise<Caixa> => {
    const { data } = await api.get<Caixa>(`/api/caixa/${id}`)
    return data
  },

  // Listar caixas
  listar: async (numeroTerminal?: number, dataInicio?: string, dataFim?: string): Promise<Caixa[]> => {
    const { data } = await api.get<Caixa[]>('/api/caixa', {
      params: { numeroTerminal, dataInicio, dataFim }
    })
    return data
  }
}

// ============================================================================
// EMPRESAS
// ============================================================================
export const empresaService = {
  // Obter dados da empresa
  obter: async (): Promise<Empresa | null> => {
    const { data } = await api.get<Empresa | null>('/api/empresas')
    return data
  }
}
