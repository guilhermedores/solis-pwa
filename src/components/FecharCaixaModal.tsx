import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { caixaService } from '../services/agente-pdv.service'
import { useCaixaStore } from '../stores/caixa.store'
import type { FecharCaixaDto, Caixa } from '../types'

interface FecharCaixaModalProps {
  isOpen: boolean
  onClose: () => void
  caixa: Caixa
}

export default function FecharCaixaModal({ isOpen, onClose, caixa }: FecharCaixaModalProps) {
  const [valorFechamento, setValorFechamento] = useState<string>('')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  
  const queryClient = useQueryClient()
  const fecharCaixa = useCaixaStore((state) => state.fecharCaixa)

  // Calcular valores esperados
  const valorEsperado = caixa.valorAbertura + caixa.totalDinheiro
  const diferenca = valorFechamento ? parseFloat(valorFechamento) - valorEsperado : 0

  useEffect(() => {
    if (isOpen) {
      // Sugerir o valor esperado como padrão
      setValorFechamento(valorEsperado.toFixed(2))
      setObservacoes('')
      setError('')
    }
  }, [isOpen, valorEsperado])

  const fecharMutation = useMutation({
    mutationFn: async (dados: FecharCaixaDto) => {
      return await caixaService.fechar(dados)
    },
    onSuccess: () => {
      // Atualizar store Zustand
      fecharCaixa()
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['caixa-aberto'] })
      queryClient.invalidateQueries({ queryKey: ['caixa', caixa.id] })
      
      // Fechar modal
      onClose()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao fechar caixa. Tente novamente.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const valor = parseFloat(valorFechamento)

    if (!valorFechamento || isNaN(valor)) {
      setError('Informe o valor de fechamento')
      return
    }

    if (valor < 0) {
      setError('Valor de fechamento não pode ser negativo')
      return
    }

    const dados: FecharCaixaDto = {
      caixaId: caixa.id,
      valorFechamento: valor,
      observacoes: observacoes || undefined
    }

    fecharMutation.mutate(dados)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Fechar Caixa
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={fecharMutation.isPending}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações do Caixa */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Terminal:</span>
              <span className="font-semibold text-gray-900">{caixa.numeroTerminal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Operador:</span>
              <span className="font-semibold text-gray-900">{caixa.operadorNome}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data Abertura:</span>
              <span className="font-semibold text-gray-900">
                {new Date(caixa.dataAbertura).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h3 className="font-semibold text-gray-900">Resumo Financeiro</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Abertura:</span>
                <span className="font-semibold">
                  R$ {caixa.valorAbertura.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dinheiro:</span>
                  <span>R$ {caixa.totalDinheiro.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Débito:</span>
                  <span>R$ {caixa.totalDebito.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Crédito:</span>
                  <span>R$ {caixa.totalCredito.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PIX:</span>
                  <span>R$ {caixa.totalPix.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Outros:</span>
                  <span>R$ {caixa.totalOutros.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between font-semibold">
                <span>Total Vendas:</span>
                <span>R$ {caixa.totalVendas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantidade de Vendas:</span>
                <span>{caixa.quantidadeVendas}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-lg text-primary-600">
                <span>Valor Esperado (Dinheiro):</span>
                <span>R$ {valorEsperado.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Valor de Fechamento */}
          <div>
            <label htmlFor="valorFechamento" className="block text-sm font-medium text-gray-700 mb-2">
              Valor de Fechamento (Dinheiro no Caixa) *
            </label>
            <input
              type="number"
              id="valorFechamento"
              value={valorFechamento}
              onChange={(e) => setValorFechamento(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
              required
              disabled={fecharMutation.isPending}
            />
            
            {/* Diferença */}
            {valorFechamento && !isNaN(parseFloat(valorFechamento)) && (
              <div className={`mt-2 p-3 rounded-lg ${
                diferenca === 0 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : diferenca > 0 
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Diferença:</span>
                  <span className="text-lg font-bold">
                    {diferenca >= 0 ? '+' : ''}R$ {diferenca.toFixed(2)}
                  </span>
                </div>
                {diferenca === 0 && (
                  <p className="text-sm mt-1">✓ Caixa conferido corretamente</p>
                )}
                {diferenca > 0 && (
                  <p className="text-sm mt-1">Sobra de caixa</p>
                )}
                {diferenca < 0 && (
                  <p className="text-sm mt-1">Falta de caixa</p>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Observações sobre o fechamento do caixa (opcional)"
              disabled={fecharMutation.isPending}
            />
            <p className="text-xs text-gray-500 mt-1">
              {observacoes.length}/1000 caracteres
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={fecharMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              disabled={fecharMutation.isPending}
            >
              {fecharMutation.isPending ? 'Fechando...' : 'Fechar Caixa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
