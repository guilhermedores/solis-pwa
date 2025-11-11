import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { healthService, caixaService, empresaService } from '../services/agente-pdv.service'
import { useCaixaStore } from '../stores/caixa.store'
import { useNavigate } from 'react-router-dom'
import AbrirCaixaModal from '../components/AbrirCaixaModal'
import FecharCaixaModal from '../components/FecharCaixaModal'
import ConsultaProdutosModal from '../components/ConsultaProdutosModal'
import SincronizacaoModal from '../components/SincronizacaoModal'
import ConnectionStatus from '../components/ConnectionStatus'
import InfoEmpresaModal from '../components/InfoEmpresaModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const { numeroTerminal } = useCaixaStore()
  const [modalAbrirCaixa, setModalAbrirCaixa] = useState(false)
  const [modalFecharCaixa, setModalFecharCaixa] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalConsultaProdutos, setModalConsultaProdutos] = useState(false)
  const [modalSincronizacao, setModalSincronizacao] = useState(false)
  const [modalInfoEmpresa, setModalInfoEmpresa] = useState(false)
  
  // Health check do Agente PDV
  const { isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: healthService.check,
    refetchInterval: 20000, // Refetch a cada 30s
    retry: 1, // Apenas 1 retry
    retryDelay: 1000, // 1 segundo entre retries
  })
  
  // Verificar caixa aberto
  const { data: caixa } = useQuery({
    queryKey: ['caixa-aberto', numeroTerminal],
    queryFn: () => caixaService.obterAberto(numeroTerminal),
    enabled: !!numeroTerminal,
  })

  // Buscar dados da empresa
  const { data: empresa } = useQuery({
    queryKey: ['empresa'],
    queryFn: empresaService.obter,
    enabled: !healthError,
    retry: false,
  })

  // Mostrar ícone se o endpoint responder (mesmo que null)
  const mostrarIconeEmpresa = empresa !== undefined
  
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Menu Lateral */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg flex-shrink-0 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Header Sidebar */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Solis PDV</h2>
            <p className="text-sm text-gray-600">Terminal {numeroTerminal}</p>
          </div>
          {/* Botão fechar mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              navigate('/venda')
              setSidebarOpen(false)
            }}
            disabled={!caixa || healthError}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <div className="font-semibold">Nova Venda</div>
              <div className="text-xs opacity-75">Iniciar venda</div>
            </div>
          </button>

          <button
            onClick={() => {
              setModalConsultaProdutos(true)
              setSidebarOpen(false)
            }}
            disabled={healthError}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div>
              <div className="font-semibold">Consultar Produtos</div>
              <div className="text-xs text-gray-500">Buscar produtos</div>
            </div>
          </button>

          <button
            onClick={() => {
              setModalSincronizacao(true)
              setSidebarOpen(false)
            }}
            disabled={healthError}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <div className="font-semibold">Sincronizar Dados</div>
              <div className="text-xs text-gray-500">Atualizar da nuvem</div>
            </div>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            disabled={healthError}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="font-semibold">Relatórios</div>
              <div className="text-xs text-gray-500">Vendas do dia</div>
            </div>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Desktop */}
        <header className="hidden lg:block bg-white shadow-sm flex-shrink-0 border-b">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Solis PDV</h1>
              <span className="text-sm text-gray-500">Terminal {numeroTerminal}</span>
            </div>
            <div className="flex items-center gap-4">
              {mostrarIconeEmpresa && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setModalInfoEmpresa(true)
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Informações da Empresa"
                >
                  <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              <ConnectionStatus />
            </div>
          </div>
        </header>

        {/* Header - Mobile */}
        <header className="bg-white shadow flex-shrink-0 lg:hidden">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-3">
                {/* Botão Menu Hamburguer */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Solis PDV</h1>
                  <p className="text-sm text-gray-600">Terminal {numeroTerminal}</p>
                </div>
              </div>
              
              {/* Botão Info Empresa - Mobile */}
              {mostrarIconeEmpresa && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setModalInfoEmpresa(true)
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Informações da Empresa"
                >
                  <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Status de Conexões - Mobile */}
            <div className="border-t pt-3">
              <ConnectionStatus />
            </div>
          </div>
        </header>
      
        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:py-8">
        {/* Alerta de Conexão */}
        {healthError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6">
            <div className="flex items-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-bold">Agente PDV desconectado!</strong>
                <span className="block sm:inline sm:ml-2">Verifique se o serviço está rodando</span>
              </div>
            </div>
          </div>
        )}

        {/* Status do Caixa */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Status do Caixa</h2>
          
          {caixa ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                  ABERTO
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Operador:</span>
                <span className="font-semibold">{caixa.operadorNome}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Abertura:</span>
                <span className="font-semibold">
                  {new Date(caixa.dataAbertura).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Valor Abertura:</span>
                <span className="font-semibold text-green-600">
                  R$ {caixa.valorAbertura.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Vendas:</span>
                <span className="font-semibold">{caixa.quantidadeVendas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Vendido:</span>
                <span className="font-semibold text-blue-600">
                  R$ {caixa.totalVendas.toFixed(2)}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <button 
                  onClick={() => setModalFecharCaixa(true)}
                  disabled={healthError}
                  className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Fechar Caixa
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-600 mb-4">Nenhum caixa aberto</p>
              <button 
                onClick={() => setModalAbrirCaixa(true)}
                disabled={healthError}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
              >
                Abrir Caixa
              </button>
            </div>
          )}
        </div>
        
        {/* Ações Mobile - visível apenas em telas menores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
          <button
            onClick={() => navigate('/venda')}
            disabled={!caixa || healthError}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">Nova Venda</h3>
            <p className="text-blue-100 text-sm">Iniciar nova venda</p>
          </button>
          
          <button 
            onClick={() => setModalConsultaProdutos(true)}
            disabled={healthError}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">Consultar</h3>
            <p className="text-green-100 text-sm">Buscar produtos</p>
          </button>

          <button 
            onClick={() => setModalSincronizacao(true)}
            disabled={healthError}
            className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">Sincronizar</h3>
            <p className="text-orange-100 text-sm">Atualizar dados</p>
          </button>
          
          <button 
            disabled={healthError}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">Relatórios</h3>
            <p className="text-purple-100 text-sm">Vendas do dia</p>
          </button>
        </div>
      </main>
      </div>

      {/* Modal Abrir Caixa */}
      <AbrirCaixaModal 
        isOpen={modalAbrirCaixa}
        onClose={() => setModalAbrirCaixa(false)}
      />

      {/* Modal Fechar Caixa */}
      {caixa && (
        <FecharCaixaModal 
          isOpen={modalFecharCaixa}
          onClose={() => setModalFecharCaixa(false)}
          caixa={caixa}
        />
      )}

      {/* Modal Consulta Produtos */}
      <ConsultaProdutosModal 
        isOpen={modalConsultaProdutos}
        onClose={() => setModalConsultaProdutos(false)}
      />

      {/* Modal Sincronização */}
      <SincronizacaoModal 
        isOpen={modalSincronizacao}
        onClose={() => setModalSincronizacao(false)}
      />

      {/* Modal Info Empresa */}
      <InfoEmpresaModal 
        isOpen={modalInfoEmpresa}
        onClose={() => setModalInfoEmpresa(false)}
      />
    </div>
  )
}
