import type React from "react"

const Capa: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Capa</h1>
      <div className="card-overlay rounded-lg shadow-lg p-6">
        <p className="text-gray-700">Conteúdo da página Capa</p>
        <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('/images/banner-background.webp')",
        }}
      ></div>
      </div>
    </div>
  )
}

export default Capa
