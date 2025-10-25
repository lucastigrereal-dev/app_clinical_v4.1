export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-bold mb-4">🚧</h1>
        <h2 className="text-4xl font-bold mb-4">Em Manutenção</h2>
        <p className="text-xl mb-8">
          Estamos trabalhando em melhorias.
          <br />
          Voltaremos em breve!
        </p>
        <div className="animate-pulse">
          <div className="h-2 w-32 bg-white/50 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
