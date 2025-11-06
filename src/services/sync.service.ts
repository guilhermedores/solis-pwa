import api from '../lib/api'

export interface SyncStatus {
  tipo: string
  nome: string
  descricao: string
  ultimaSincronizacao: string | null
  status: 'idle' | 'syncing' | 'success' | 'error'
  erro?: string
  total?: number
}

export interface SyncResponse {
  sucesso: boolean
  mensagem: string
  total?: number
  erros?: string[]
}

// ============================================================================
// SINCRONIZAÇÃO
// ============================================================================
export const syncService = {
  // Sincronizar produtos
  syncProdutos: async (): Promise<SyncResponse> => {
    const { data } = await api.post<SyncResponse>('/api/produtos/sync')
    return data
  },

  // Sincronizar formas de pagamento
  syncFormasPagamento: async (): Promise<SyncResponse> => {
    const { data } = await api.post<SyncResponse>('/api/formas-pagamento/sync')
    return data
  },

  // Sincronizar empresas
  syncEmpresas: async (): Promise<SyncResponse> => {
    const { data } = await api.post<SyncResponse>('/api/empresas/sincronizar')
    return data
  },

  // Enviar vendas pendentes
  enviarVendas: async (): Promise<SyncResponse> => {
    const { data } = await api.post<SyncResponse>('/api/vendas/enviar-pendentes')
    return data
  },

  // Obter status de todas as sincronizações (baseado no localStorage)
  obterStatus: async (): Promise<SyncStatus[]> => {
    return [
      {
        tipo: 'produtos',
        nome: 'Produtos e Preços',
        descricao: 'Sincronizar catálogo de produtos e tabela de preços',
        ultimaSincronizacao: localStorage.getItem('sync_produtos_ultima') || null,
        status: 'idle'
      },
      {
        tipo: 'empresas',
        nome: 'Dados da Empresa',
        descricao: 'Sincronizar informações da empresa para emissão de cupons fiscais',
        ultimaSincronizacao: localStorage.getItem('sync_empresas_ultima') || null,
        status: 'idle'
      },
      {
        tipo: 'formas-pagamento',
        nome: 'Formas de Pagamento',
        descricao: 'Sincronizar formas de pagamento disponíveis',
        ultimaSincronizacao: localStorage.getItem('sync_pagamento_ultima') || null,
        status: 'idle'
      },
      {
        tipo: 'vendas',
        nome: 'Enviar Vendas',
        descricao: 'Enviar vendas pendentes para a nuvem',
        ultimaSincronizacao: localStorage.getItem('sync_vendas_ultima') || null,
        status: 'idle'
      }
    ]
  },

  // Sincronizar tudo
  syncTudo: async (): Promise<{ resultados: SyncResponse[] }> => {
    const resultados: SyncResponse[] = []
    
    try {
      const produtos = await syncService.syncProdutos()
      resultados.push(produtos)
    } catch (error: any) {
      resultados.push({
        sucesso: false,
        mensagem: 'Erro ao sincronizar produtos',
        erros: [error.message]
      })
    }

    try {
      const empresas = await syncService.syncEmpresas()
      resultados.push(empresas)
    } catch (error: any) {
      resultados.push({
        sucesso: false,
        mensagem: 'Erro ao sincronizar empresas',
        erros: [error.message]
      })
    }

    try {
      const pagamentos = await syncService.syncFormasPagamento()
      resultados.push(pagamentos)
    } catch (error: any) {
      resultados.push({
        sucesso: false,
        mensagem: 'Erro ao sincronizar formas de pagamento',
        erros: [error.message]
      })
    }

    try {
      const vendas = await syncService.enviarVendas()
      resultados.push(vendas)
    } catch (error: any) {
      resultados.push({
        sucesso: false,
        mensagem: 'Erro ao enviar vendas',
        erros: [error.message]
      })
    }

    return { resultados }
  }
}
