import { useQuery } from '@tanstack/react-query'
import { statusService, type SystemStatus } from '../services/status.service'

export default function ConnectionStatus() {
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
    <div className="flex items-center gap-4">
      {/* Status PWA -> Agente */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status.agent.connected)} ${status.agent.connected ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-gray-600 font-medium">
            Conexão Local
          </span>
        </div>
        <span className={`text-xs ${status.agent.connected ? 'text-green-600' : 'text-red-600'}`}>
          {getStatusText(status.agent.connected)}
        </span>
      </div>

      {/* Divisor */}
      <div className="h-4 w-px bg-gray-300" />

      {/* Status Agente -> API */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status.api.connected)} ${status.api.connected ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-gray-600 font-medium">
            Conexão Internet
          </span>
        </div>
        <span className={`text-xs ${status.api.connected ? 'text-green-600' : 'text-red-600'}`}>
          {getStatusText(status.api.connected)}
        </span>
      </div>

      {/* Ícone de modo offline */}
      {!status.api.connected && status.agent.connected && (
        <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs font-medium">Modo Offline</span>
        </div>
      )}
    </div>
  )
}
