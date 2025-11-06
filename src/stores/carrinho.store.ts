import { create } from 'zustand'
import type { Produto, VendaItem } from '../types'

interface CarrinhoState {
  // Estado
  itens: VendaItem[]
  
  // Computed
  valorBruto: () => number
  valorDesconto: () => number
  valorLiquido: () => number
  quantidadeItens: () => number
  
  // Actions
  adicionarProduto: (produto: Produto, quantidade: number) => void
  removerItem: (sequencia: number) => void
  atualizarQuantidade: (sequencia: number, quantidade: number) => void
  aplicarDesconto: (sequencia: number, desconto: number) => void
  limparCarrinho: () => void
}

export const useCarrinhoStore = create<CarrinhoState>((set, get) => ({
  // Estado inicial
  itens: [],
  
  // Computed values
  valorBruto: () => {
    return get().itens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0)
  },
  
  valorDesconto: () => {
    return get().itens.reduce((sum, item) => sum + item.descontoItem, 0)
  },
  
  valorLiquido: () => {
    return get().valorBruto() - get().valorDesconto()
  },
  
  quantidadeItens: () => {
    return get().itens.reduce((sum, item) => sum + item.quantidade, 0)
  },
  
  // Actions
  adicionarProduto: (produto: Produto, quantidade: number) => set((state) => {
    const novoItem: VendaItem = {
      id: crypto.randomUUID(),
      vendaId: '', // Será preenchido ao criar a venda
      produtoId: produto.id,
      sequencia: state.itens.length + 1,
      codigoProduto: produto.codigoInterno,
      nomeProduto: produto.nome,
      quantidade,
      precoUnitario: produto.precoVenda,
      descontoItem: 0,
      valorTotal: produto.precoVenda * quantidade,
      createdAt: new Date().toISOString()
    }
    
    return { itens: [...state.itens, novoItem] }
  }),
  
  removerItem: (sequencia) => set((state) => ({
    itens: state.itens
      .filter(item => item.sequencia !== sequencia)
      .map((item, index) => ({ ...item, sequencia: index + 1 }))
  })),
  
  atualizarQuantidade: (sequencia, quantidade) => set((state) => ({
    itens: state.itens.map(item =>
      item.sequencia === sequencia
        ? { ...item, quantidade, valorTotal: item.precoUnitario * quantidade - item.descontoItem }
        : item
    )
  })),
  
  aplicarDesconto: (sequencia, desconto) => set((state) => ({
    itens: state.itens.map(item =>
      item.sequencia === sequencia
        ? { ...item, descontoItem: desconto, valorTotal: (item.precoUnitario * item.quantidade) - desconto }
        : item
    )
  })),
  
  limparCarrinho: () => set({ itens: [] }),
}))
