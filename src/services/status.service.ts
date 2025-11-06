import api from '../lib/api'

export interface ConnectionStatus {
  name: string
  connected: boolean
  message?: string
  statusCode?: number
  lastCheck: string
}

export interface SystemStatus {
  agent: ConnectionStatus
  api: ConnectionStatus
  timestamp: string
}

export const statusService = {
  // Obter status de todas as conexões
  getStatus: async (): Promise<SystemStatus> => {
    try {
      const { data } = await api.get<SystemStatus>('/api/status')
      return data
    } catch (error) {
      // Se o agente não responder, retornar status offline
      return {
        agent: {
          name: 'Agente PDV',
          connected: false,
          message: 'Agente não disponível',
          lastCheck: new Date().toISOString()
        },
        api: {
          name: 'API Solis',
          connected: false,
          message: 'Desconhecido (agente offline)',
          lastCheck: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    }
  }
}
