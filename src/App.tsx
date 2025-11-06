import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Pages
import Dashboard from './pages/Dashboard'
import Venda from './pages/Venda'
import Login from './pages/Login'
import ConfigurarAgente from './pages/ConfigurarAgente'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antes era cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rota de configuração (não protegida) */}
          <Route path="/configurar-agente" element={<ConfigurarAgente />} />
          
          {/* Rotas protegidas - só acessíveis se agente estiver configurado */}
          <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/venda" element={<ProtectedRoute><Venda /></ProtectedRoute>} />
          
          {/* Rota raiz redireciona para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Dev tools - só aparece em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
