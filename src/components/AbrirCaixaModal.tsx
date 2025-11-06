import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { caixaService } from '@/services/agente-pdv.service'
import { useCaixaStore } from '@/stores/caixa.store'
import type { AbrirCaixaDto } from '@/types'

interface AbrirCaixaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AbrirCaixaModal({ isOpen, onClose }: AbrirCaixaModalProps) {
  const [nomeOperador, setNomeOperador] = useState('')
  const [valorAbertura, setValorAbertura] = useState('0.00')
  const { numeroTerminal, setCaixaAberto } = useCaixaStore()
  const queryClient = useQueryClient()

  const abrirCaixaMutation = useMutation({
    mutationFn: (dto: AbrirCaixaDto) => caixaService.abrir(dto),
    onSuccess: (caixa) => {
      setCaixaAberto(caixa)
      queryClient.invalidateQueries({ queryKey: ['caixa-aberto'] })
      setNomeOperador('')
      setValorAbertura('0.00')
      onClose()
    },
    onError: (error: any) => {
      alert(`Erro ao abrir caixa: ${error.response?.data?.message || error.message}`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nomeOperador.trim()) {
      alert('Por favor, informe o nome do operador')
      return
    }

    const valor = parseFloat(valorAbertura)
    if (isNaN(valor) || valor < 0) {
      alert('Por favor, informe um valor válido')
      return
    }

    abrirCaixaMutation.mutate({
      numeroTerminal,
      operadorNome: nomeOperador.trim(),
      valorAbertura: valor
    })
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
    setValorAbertura(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Abrir Caixa</h2>
          <p className="text-gray-600 mt-1">Terminal {numeroTerminal}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Operador *
            </label>
            <input
              type="text"
              value={nomeOperador}
              onChange={(e) => setNomeOperador(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite seu nome"
              autoFocus
              disabled={abrirCaixaMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor de Abertura (R$)
            </label>
            <input
              type="text"
              value={valorAbertura}
              onChange={handleValorChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              disabled={abrirCaixaMutation.isPending}
            />
            <p className="text-sm text-gray-500 mt-1">
              Valor em dinheiro no caixa
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={abrirCaixaMutation.isPending}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={abrirCaixaMutation.isPending}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {abrirCaixaMutation.isPending ? 'Abrindo...' : 'Abrir Caixa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
