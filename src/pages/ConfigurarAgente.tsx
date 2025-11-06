import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import LocalConnectionStatus from '../components/LocalConnectionStatus'

const AGENTE_API_URL = import.meta.env.VITE_AGENTE_API_URL || 'http://localhost:5000'

export default function ConfigurarAgente() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  // URL da API configurada internamente
  const API_URL = import.meta.env.VITE_SOLIS_API_URL || 'http://localhost:3000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Envia token para o agente configurar
      const response = await axios.post<{
        success: boolean
        message: string
        tenantId: string
        nomeAgente: string
        tokenValidoAte: string
      }>(`${AGENTE_API_URL}/api/config/setup`, {
        token: token.trim(),
        apiBaseUrl: API_URL
      })

      setSuccess(`✅ Agente configurado com sucesso! Tenant: ${response.data.tenantId} | Nome: ${response.data.nomeAgente}`)
      
      // Aguarda 2 segundos e redireciona para dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error('Erro ao configurar agente:', err)
      
      if (err.response?.data?.error) {
        setError(`❌ ${err.response.data.error}`)
      } else if (err.message) {
        setError(`❌ Erro: ${err.message}`)
      } else {
        setError('❌ Erro ao configurar agente. Verifique se o agente está rodando.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuração Inicial
          </h1>
          <p className="text-gray-600">
            Configure o terminal vinculando-o ao seu estabelecimento
          </p>
        </div>

        {/* Status de Conexão */}
        <div className="flex justify-center mb-6">
          <LocalConnectionStatus />
        </div>

        {/* Alert de Informação */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Como obter o código:</strong>
                <br />
                1. Acesse o Solis Admin
                <br />
                2. Gere um código para este terminal
                <br />
                3. Cole o código abaixo
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token */}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Código de acesso <span className="text-red-500">*</span>
            </label>
            <textarea
              id="token"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Cole aqui o código gerado pelo sistema para este terminal
            </p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Configurando...
              </span>
            ) : (
              'Configurar Terminal'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ Esta configuração só precisa ser feita uma vez por terminal
          </p>
        </div>
      </div>
    </div>
  )
}
