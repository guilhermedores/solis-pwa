export default function Login() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Solis PDV</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Sistema de Ponto de Venda</p>
        </div>
        
        <form className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operador
            </label>
            <input
              type="text"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Nome do operador"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminal
            </label>
            <input
              type="number"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Número do terminal"
              defaultValue="1"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base shadow-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
