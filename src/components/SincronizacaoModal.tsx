import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService } from '../services/sync.service'
import { statusService, type SystemStatus } from '../services/status.service'
import type { SyncStatus } from '../services/sync.service'

interface SincronizacaoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SincronizacaoModal({ isOpen, onClose }: SincronizacaoModalProps) {
  const [syncItems, setSyncItems] = useState<SyncStatus[]>([])
  const [syncingAll, setSyncingAll] = useState(false)
  const queryClient = useQueryClient()

  // Verificar status de conexão com a internet
  const { data: connectionStatus } = useQuery<SystemStatus>({
    queryKey: ['system-status'],
    queryFn: statusService.getStatus,
    refetchInterval: 5000,
    retry: false,
    enabled: isOpen
  })

  const isOnline = connectionStatus?.api.connected ?? false

  // Buscar status das sincronizações
  const { data: statusData, refetch } = useQuery({
    queryKey: ['sync-status'],
    queryFn: syncService.obterStatus,
    enabled: isOpen,
    refetchInterval: isOpen ? 5000 : false // Atualizar a cada 5s quando aberto
  })

  useEffect(() => {
    if (statusData) {
      setSyncItems(statusData)
    }
  }, [statusData])

  // Mutation para sincronizar produtos
  const syncProdutosMutation = useMutation({
    mutationFn: syncService.syncProdutos,
    onMutate: () => {
      updateItemStatus('produtos', 'syncing')
    },
    onSuccess: (data) => {
      updateItemStatus('produtos', 'success', undefined, data.total)
      localStorage.setItem('sync_produtos_ultima', new Date().toISOString())
      setTimeout(() => refetch(), 1000)
    },
    onError: (error: any) => {
      updateItemStatus('produtos', 'error', error.message)
    }
  })

  // Mutation para sincronizar empresas
  const syncEmpresasMutation = useMutation({
    mutationFn: syncService.syncEmpresas,
    onMutate: () => {
      updateItemStatus('empresas', 'syncing')
    },
    onSuccess: (data) => {
      updateItemStatus('empresas', 'success', undefined, data.total)
      localStorage.setItem('sync_empresas_ultima', new Date().toISOString())
      setTimeout(() => {
        refetch()
        // Invalidar query da empresa para atualizar no Dashboard
        queryClient.invalidateQueries({ queryKey: ['empresa'] })
      }, 1000)
    },
    onError: (error: any) => {
      console.error('Erro ao sincronizar empresas:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      updateItemStatus('empresas', 'error', errorMessage)
    }
  })

  // Mutation para sincronizar formas de pagamento
  const syncPagamentoMutation = useMutation({
    mutationFn: syncService.syncFormasPagamento,
    onMutate: () => {
      updateItemStatus('formas-pagamento', 'syncing')
    },
    onSuccess: (data) => {
      updateItemStatus('formas-pagamento', 'success', undefined, data.total)
      localStorage.setItem('sync_pagamento_ultima', new Date().toISOString())
      setTimeout(() => refetch(), 1000)
    },
    onError: (error: any) => {
      updateItemStatus('formas-pagamento', 'error', error.message)
    }
  })

  // Mutation para enviar vendas
  const enviarVendasMutation = useMutation({
    mutationFn: syncService.enviarVendas,
    onMutate: () => {
      updateItemStatus('vendas', 'syncing')
    },
    onSuccess: (data) => {
      updateItemStatus('vendas', 'success', undefined, data.total)
      localStorage.setItem('sync_vendas_ultima', new Date().toISOString())
      setTimeout(() => refetch(), 1000)
    },
    onError: (error: any) => {
      updateItemStatus('vendas', 'error', error.message)
    }
  })

  // Mutation para sincronizar tudo
  const syncTudoMutation = useMutation({
    mutationFn: syncService.syncTudo,
    onMutate: () => {
      setSyncingAll(true)
      syncItems.forEach(item => {
        updateItemStatus(item.tipo, 'syncing')
      })
    },
    onSuccess: () => {
      setSyncingAll(false)
      setTimeout(() => refetch(), 1000)
    },
    onError: () => {
      setSyncingAll(false)
    }
  })

  const updateItemStatus = (tipo: string, status: SyncStatus['status'], erro?: string, total?: number) => {
    setSyncItems(prev => prev.map(item => 
      item.tipo === tipo 
        ? { 
            ...item, 
            status, 
            erro, 
            total,
            ultimaSincronizacao: status === 'success' ? new Date().toISOString() : item.ultimaSincronizacao
          } 
        : item
    ))
  }

  const handleSyncItem = (tipo: string) => {
    switch (tipo) {
      case 'produtos':
        syncProdutosMutation.mutate()
        break
      case 'empresas':
        syncEmpresasMutation.mutate()
        break
      case 'formas-pagamento':
        syncPagamentoMutation.mutate()
        break
      case 'vendas':
        enviarVendasMutation.mutate()
        break
    }
  }

  const handleSyncAll = () => {
    syncTudoMutation.mutate()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca sincronizado'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return (
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        )
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getStatusColor = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-white border-gray-200'
    }
  }

  const handleClose = () => {
    const isAnySyncing = syncItems.some(item => item.status === 'syncing') || syncingAll
    if (!isAnySyncing) {
      onClose()
    }
  }

  if (!isOpen) return null

  const anySyncing = syncItems.some(item => item.status === 'syncing') || syncingAll

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sincronização de Dados</h2>
            <p className="text-sm text-gray-600 mt-1">Gerencie a sincronização com a nuvem</p>
          </div>
          <button
            onClick={handleClose}
            disabled={anySyncing}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de Sincronizações */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {syncItems.map((item) => (
            <div
              key={item.tipo}
              className={`border rounded-lg p-4 transition-colors ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.descricao}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>
                      <strong>Última sincronização:</strong> {formatDate(item.ultimaSincronizacao)}
                    </span>
                    {item.total !== undefined && (
                      <span className="text-green-600">
                        <strong>{item.total}</strong> registro{item.total !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {item.status === 'error' && item.erro && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                      <strong>Erro:</strong> {item.erro}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSyncItem(item.tipo)}
                  disabled={item.status === 'syncing' || syncingAll || !isOnline}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center space-x-2"
                  title={!isOnline ? 'Sem conexão com a internet' : ''}
                >
                  {item.status === 'syncing' ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Sincronizando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sincronizar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer com botão Sincronizar Tudo */}
        <div className="p-6 border-t bg-gray-50">
          {/* Aviso de sem conexão */}
          {!isOnline && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Sem conexão com a internet.</strong> A sincronização está desabilitada.
              </span>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleSyncAll}
              disabled={anySyncing || !isOnline}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center space-x-2"
              title={!isOnline ? 'Sem conexão com a internet' : ''}
            >
              {syncingAll ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Sincronizando Tudo...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sincronizar Tudo</span>
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={anySyncing}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
