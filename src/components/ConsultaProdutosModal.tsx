import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { produtoService } from '@/services/agente-pdv.service'
import type { Produto } from '@/types'

interface ConsultaProdutosModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduto?: (produto: Produto) => void
}

export default function ConsultaProdutosModal({ isOpen, onClose, onSelectProduto }: ConsultaProdutosModalProps) {
  const [termoBusca, setTermoBusca] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [tipoBusca, setTipoBusca] = useState<'nome' | 'codigo'>('codigo')
  const [page, setPage] = useState(0)
  const pageSize = 20
  const queryClient = useQueryClient()

  // Listagem inicial paginada (sempre ativa)
  const { data: produtosIniciais, isLoading: loadingIniciais, refetch: refetchProdutos } = useQuery({
    queryKey: ['produtos-listagem', page],
    queryFn: () => produtoService.listar(page * pageSize, pageSize),
    enabled: isOpen,
    refetchOnMount: 'always',
    staleTime: 0, // Sempre considerar dados como stale
  })

  // Invalidar cache e refetch quando abrir a modal
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ['produtos-listagem'] })
      refetchProdutos()
    }
  }, [isOpen, queryClient, refetchProdutos])

  // Busca por código de barras
  const { data: produtoPorCodigo, isLoading: loadingCodigo, refetch: refetchCodigo } = useQuery({
    queryKey: ['produto-codigo', codigoBarras],
    queryFn: () => produtoService.buscarPorCodigoBarras(codigoBarras),
    enabled: false,
  })

  // Busca por nome
  const { data: produtosPorNome, isLoading: loadingNome, refetch: refetchNome } = useQuery({
    queryKey: ['produto-busca', termoBusca],
    queryFn: () => produtoService.buscar(termoBusca),
    enabled: false,
  })

  const handleBuscarCodigo = (e: React.FormEvent) => {
    e.preventDefault()
    if (codigoBarras.trim()) {
      refetchCodigo()
    }
  }

  const handleBuscarNome = (e: React.FormEvent) => {
    e.preventDefault()
    if (termoBusca.trim().length >= 3) {
      refetchNome()
    } else {
      alert('Digite pelo menos 3 caracteres para buscar')
    }
  }

  const handleCodigoBarrasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCodigoBarras(value)
    
    // Auto-busca quando completar um código de barras típico (13 dígitos)
    if (value.length === 13) {
      setTimeout(() => refetchCodigo(), 100)
    }
  }

  const handleSelectProduto = (produto: Produto) => {
    if (onSelectProduto) {
      onSelectProduto(produto)
      onClose()
    }
  }

  // Determinar quais produtos exibir
  const produtosExibir: Produto[] = (() => {
    if (tipoBusca === 'codigo' && codigoBarras.trim()) {
      return produtoPorCodigo ? [produtoPorCodigo] : []
    }
    if (tipoBusca === 'nome' && termoBusca.trim()) {
      return produtosPorNome || []
    }
    // Se não há busca ativa, mostra listagem inicial
    return produtosIniciais || []
  })()

  const isLoading = tipoBusca === 'codigo' ? loadingCodigo : loadingNome
  const mostrarPaginacao = !codigoBarras.trim() && !termoBusca.trim() && produtosIniciais && produtosIniciais.length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Consulta de Produtos
            </h2>
            <p className="text-sm text-gray-600 mt-1">Busque produtos por código ou nome</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Tipo de Busca */}
          <div className="mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setTipoBusca('codigo')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                  tipoBusca === 'codigo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Código de Barras
              </button>
              <button
                onClick={() => setTipoBusca('nome')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                  tipoBusca === 'nome'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Nome do Produto
              </button>
            </div>
          </div>

          {/* Formulário de Busca por Código */}
          {tipoBusca === 'codigo' && (
            <form onSubmit={handleBuscarCodigo} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={handleCodigoBarrasChange}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Digite ou escaneie o código de barras"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!codigoBarras.trim() || loadingCodigo}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base transition-colors whitespace-nowrap"
                >
                  {loadingCodigo ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>
          )}

          {/* Formulário de Busca por Nome */}
          {tipoBusca === 'nome' && (
            <form onSubmit={handleBuscarNome} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Digite o nome do produto (mínimo 3 caracteres)"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={termoBusca.trim().length < 3 || loadingNome}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base transition-colors whitespace-nowrap"
                >
                  {loadingNome ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Digite pelo menos 3 caracteres para buscar
              </p>
            </form>
          )}

          {/* Resultados */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Buscando produtos...</p>
              </div>
            )}

            {!isLoading && !loadingIniciais && produtosExibir.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-600 mt-2">
                  {tipoBusca === 'codigo' && codigoBarras && 'Nenhum produto encontrado'}
                  {tipoBusca === 'nome' && termoBusca && 'Nenhum produto encontrado'}
                  {!codigoBarras && !termoBusca && 'Nenhum produto cadastrado'}
                </p>
              </div>
            )}

            {(loadingIniciais && !isLoading) && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Carregando produtos...</p>
              </div>
            )}

            {!isLoading && produtosExibir.length > 0 && (
              <div className="space-y-3">
                {produtosExibir.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => handleSelectProduto(produto)}
                    className="w-full border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {produto.nome}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          {produto.codigoBarras && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">EAN:</span> {produto.codigoBarras}
                            </p>
                          )}
                          {produto.codigoInterno && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Cód:</span> {produto.codigoInterno}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Un:</span> {produto.unidadeMedida}
                          </p>
                        </div>
                        {produto.descricao && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {produto.descricao}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          R$ {produto.precoVenda.toFixed(2)}
                        </p>
                        {onSelectProduto && (
                          <p className="text-xs text-blue-600 mt-1">Clique para adicionar</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {tipoBusca === 'nome' && termoBusca && produtosExibir.length > 0 && (
                  <p className="text-sm text-gray-500 text-center pt-4">
                    {produtosExibir.length} produto(s) encontrado(s)
                  </p>
                )}

                {/* Paginação */}
                {mostrarPaginacao && (
                  <div className="flex items-center justify-center gap-4 pt-6 border-t mt-6">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </button>
                    
                    <span className="text-sm text-gray-600 font-medium">
                      Página {page + 1}
                    </span>
                    
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={produtosIniciais && produtosIniciais.length < pageSize}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      Próxima
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
