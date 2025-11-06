import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

const AGENTE_API_URL = import.meta.env.VITE_AGENTE_API_URL || 'http://localhost:5000'

interface ConfigStatus {
  configurado: boolean
  tokenValido: boolean
  mensagem: string
  tenantId?: string
  nomeAgente?: string
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Componente que verifica se o agente está configurado antes de permitir acesso às rotas
 * Se não estiver configurado, redireciona para tela de configuração
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    checkAgentConfiguration()
  }, [])

  const checkAgentConfiguration = async () => {
    try {
      const response = await axios.get<ConfigStatus>(
        `${AGENTE_API_URL}/api/config/status`,
        { timeout: 5000 }
      )

      setIsConfigured(response.data.configurado && response.data.tokenValido)
    } catch (err: any) {
      console.error('Erro ao verificar configuração do agente:', err)
      
      // Se o agente não está acessível, assume que não está configurado
      setIsConfigured(false)
    } finally {
      setChecking(false)
    }
  }

  // Mostra loading enquanto verifica
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Verificando configuração do agente...</p>
        </div>
      </div>
    )
  }

  // Se não está configurado, redireciona para tela de configuração
  if (!isConfigured) {
    return <Navigate to="/configurar-agente" replace />
  }

  // Se está configurado, mostra o conteúdo protegido
  return <>{children}</>
}
