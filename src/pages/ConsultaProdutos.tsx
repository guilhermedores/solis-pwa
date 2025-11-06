import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { produtoService } from '@/services/agente-pdv.service'
import { useNavigate } from 'react-router-dom'
import type { Produto } from '@/types'

export default function ConsultaProdutos() {
  const navigate = useNavigate()
  const [termoBusca, setTermoBusca] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [tipoBusca, setTipoBusca] = useState<'nome' | 'codigo'>('codigo')

  // Busca por código de barras
  const { data: produtoPorCodigo, isLoading: loadingCodigo, refetch: refetchCodigo } = useQuery({
    queryKey: ['produto-codigo', codigoBarras],
    queryFn: () => produtoService.buscarPorCodigoBarras(codigoBarras),
    enabled: false, // Só busca quando chamar refetch
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

  const produtosExibir: Produto[] = tipoBusca === 'codigo' 
    ? (produtoPorCodigo ? [produtoPorCodigo] : [])
    : (produtosPorNome || [])

  const isLoading = tipoBusca === 'codigo' ? loadingCodigo : loadingNome

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-md flex-shrink-0">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Consulta de Produtos</h1>
              <p className="text-xs sm:text-sm text-gray-600">Buscar produtos por código ou nome</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Tipo de Busca */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => setTipoBusca('codigo')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                tipoBusca === 'codigo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Buscar por Código de Barras
            </button>
            <button
              onClick={() => setTipoBusca('nome')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                tipoBusca === 'nome'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Buscar por Nome
            </button>
          </div>

          {/* Formulário de Busca por Código */}
          {tipoBusca === 'codigo' && (
            <form onSubmit={handleBuscarCodigo} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Barras
                </label>
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
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
                  >
                    {loadingCodigo ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Formulário de Busca por Nome */}
          {tipoBusca === 'nome' && (
            <form onSubmit={handleBuscarNome} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto
                </label>
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
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
                  >
                    {loadingNome ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Digite pelo menos 3 caracteres para buscar
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Resultados</h2>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Buscando produtos...</p>
            </div>
          )}

          {!isLoading && produtosExibir.length === 0 && (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
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
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                {tipoBusca === 'codigo' && !codigoBarras && 'Digite um código de barras para buscar'}
                {tipoBusca === 'codigo' && codigoBarras && 'Nenhum produto encontrado'}
                {tipoBusca === 'nome' && !termoBusca && 'Digite um termo para buscar'}
                {tipoBusca === 'nome' && termoBusca && 'Nenhum produto encontrado'}
              </p>
            </div>
          )}

          {!isLoading && produtosExibir.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {produtosExibir.map((produto) => (
                <div
                  key={produto.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {produto.nome}
                      </h3>
                      {produto.codigoInterno && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Código: {produto.codigoInterno}
                        </p>
                      )}
                      {produto.codigoBarras && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          Código de Barras: {produto.codigoBarras}
                        </p>
                      )}
                      {produto.descricao && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          Descrição: {produto.descricao}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Unidade: {produto.unidadeMedida}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        R$ {produto.precoVenda.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {tipoBusca === 'nome' && produtosExibir.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 text-center pt-3 sm:pt-4">
                  {produtosExibir.length} produto(s) encontrado(s)
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
