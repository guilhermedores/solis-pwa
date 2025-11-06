import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Caixa } from '../types'

interface CaixaState {
  // Estado
  caixaAberto: Caixa | null
  numeroTerminal: number
  
  // Actions
  setCaixaAberto: (caixa: Caixa | null) => void
  setNumeroTerminal: (numero: number) => void
  limparCaixa: () => void
  fecharCaixa: () => void
}

export const useCaixaStore = create<CaixaState>()(
  persist(
    (set) => ({
      // Estado inicial
      caixaAberto: null,
      numeroTerminal: 1, // Terminal padrão
      
      // Actions
      setCaixaAberto: (caixa) => set({ caixaAberto: caixa }),
      setNumeroTerminal: (numero) => set({ numeroTerminal: numero }),
      limparCaixa: () => set({ caixaAberto: null }),
      fecharCaixa: () => set({ caixaAberto: null }),
    }),
    {
      name: 'solis-caixa-storage', // Nome no localStorage
    }
  )
)
