import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { empresaService } from '@/services/agente-pdv.service'

interface InfoEmpresaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InfoEmpresaModal({ isOpen, onClose }: InfoEmpresaModalProps) {
  const { data: empresa, isLoading, error } = useQuery({
    queryKey: ['empresa'],
    queryFn: empresaService.obter,
    enabled: isOpen,
    retry: false,
  })

  if (!isOpen) return null

  const formatCNPJ = (cnpj?: string) => {
    if (!cnpj) return ''
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  const formatCEP = (cep?: string) => {
    if (!cep) return ''
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
  }

  const formatTelefone = (telefone?: string) => {
    if (!telefone) return ''
    if (telefone.length === 11) {
      return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    }
    return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Dados da Empresa</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 mb-2">Erro ao carregar dados da empresa</p>
              <p className="text-sm text-gray-500">{(error as any)?.message || 'Tente novamente mais tarde'}</p>
            </div>
          ) : empresa ? (
            <div className="space-y-6">
              {/* Identificação */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Identificação</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">CNPJ</label>
                      <p className="text-gray-900 font-mono">{formatCNPJ(empresa.cnpj)}</p>
                    </div>
                    {empresa.inscricaoEstadual && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Inscrição Estadual</label>
                        <p className="text-gray-900">{empresa.inscricaoEstadual}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Razão Social</label>
                    <p className="text-gray-900 font-semibold">{empresa.razaoSocial}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome Fantasia</label>
                    <p className="text-gray-900">{empresa.nomeFantasia}</p>
                  </div>
                  
                  {empresa.regimeTributario && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Regime Tributário</label>
                      <p className="text-gray-900">{empresa.regimeTributario}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contato */}
              {(empresa.telefone || empresa.email) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
                  <div className="space-y-3">
                    {empresa.telefone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telefone</label>
                        <p className="text-gray-900">{formatTelefone(empresa.telefone)}</p>
                      </div>
                    )}
                    {empresa.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">E-mail</label>
                        <p className="text-gray-900">{empresa.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Endereço */}
              {empresa.logradouro && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Logradouro</label>
                      <p className="text-gray-900">
                        {empresa.logradouro}{empresa.numero ? `, ${empresa.numero}` : ''}
                        {empresa.complemento ? ` - ${empresa.complemento}` : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {empresa.bairro && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bairro</label>
                          <p className="text-gray-900">{empresa.bairro}</p>
                        </div>
                      )}
                      {empresa.cidade && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Cidade</label>
                          <p className="text-gray-900">{empresa.cidade}</p>
                        </div>
                      )}
                      {empresa.uf && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">UF</label>
                          <p className="text-gray-900">{empresa.uf}</p>
                        </div>
                      )}
                    </div>
                    {empresa.cep && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">CEP</label>
                        <p className="text-gray-900 font-mono">{formatCEP(empresa.cep)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info de Sincronização */}
              {empresa.sincronizadoEm && (
                <div className="border-t pt-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Última sincronização: {new Date(empresa.sincronizadoEm).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-600 mb-2">Nenhum dado de empresa encontrado</p>
              <p className="text-sm text-gray-500">Sincronize os dados da empresa para visualizar as informações</p>
            </div>
          )}
        </div>

        {/* Botão Fechar */}
        <div className="p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
