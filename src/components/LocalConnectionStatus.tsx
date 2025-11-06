import { useQuery } from '@tanstack/react-query'
import { statusService, type SystemStatus } from '../services/status.service'

/**
 * Componente simplificado que mostra apenas status da conexão local (PWA -> Agente)
 * Usado na tela de configuração do agente
 */
export default function LocalConnectionStatus() {
  const { data: status } = useQuery<SystemStatus>({
    queryKey: ['system-status'],
    queryFn: statusService.getStatus,
    refetchInterval: 10000, // Atualizar a cada 10 segundos
    retry: false
  })

  if (!status) return null

  const getStatusColor = (connected: boolean) => {
    return connected ? 'bg-green-500' : 'bg-red-500'
  }

  const getStatusText = (connected: boolean) => {
    return connected ? 'Conectado' : 'Desconectado'
  }

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status.agent.connected)} ${status.agent.connected ? 'animate-pulse' : ''}`} />
        <span className="text-sm text-gray-600 font-medium">
          Conexão Local
        </span>
      </div>
      <span className={`text-sm font-semibold ${status.agent.connected ? 'text-green-600' : 'text-red-600'}`}>
        {getStatusText(status.agent.connected)}
      </span>
    </div>
  )
}
