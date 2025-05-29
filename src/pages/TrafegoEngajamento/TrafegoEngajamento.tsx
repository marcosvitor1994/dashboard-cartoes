"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { TrendingUp, Calendar, Filter, MousePointer, Clock, Users, MapPin, Target } from "lucide-react"
import Loading from "../../components/Loading/Loading"

// Dados mockados para demonstração
const mockData = {
  receptivo: {
    sessoesCampanha: 67939,
    cliquesEuQuero: 88330,
    duracaoSessoes: "00:00:50",
    taxaRejeicao: 78.38,
  },
  dispositivos: [
    { tipo: "Mobile", sessoes: 58912, percentual: 86.7, cor: "#3b82f6" },
    { tipo: "Desktop", sessoes: 6784, percentual: 10.0, cor: "#8b5cf6" },
    { tipo: "Tablet", sessoes: 2243, percentual: 3.3, cor: "#06b6d4" },
  ],
  interesses: [
    { categoria: "News & Politics/Agr", sessoes: 15420, percentual: 22.7, cor: "#3b82f6" },
    { categoria: "News Readers", sessoes: 13567, percentual: 20.0, cor: "#8b5cf6" },
    { categoria: "Media & Entertainment", sessoes: 10191, percentual: 15.0, cor: "#06b6d4" },
    { categoria: "Games/Casual Games", sessoes: 8152, percentual: 12.0, cor: "#10b981" },
    { categoria: "Food & Dining", sessoes: 6794, percentual: 10.0, cor: "#f59e0b" },
    { categoria: "Cooking Enthusiasts", sessoes: 5435, percentual: 8.0, cor: "#ef4444" },
    { categoria: "Aspiring Chefs", sessoes: 4077, percentual: 6.0, cor: "#ec4899" },
    { categoria: "Technology/Mobile", sessoes: 2718, percentual: 4.0, cor: "#84cc16" },
    { categoria: "Shoppers/Shopping", sessoes: 1359, percentual: 2.0, cor: "#f97316" },
  ],
  cidades: [
    {
      posicao: 1,
      cidade: "São Paulo",
      sessoes: 8353,
      usuarios: 7988,
      engajadas: 8303,
      porUsuario: 1.05,
      cliques: 10397,
      duracao: "00:00:42",
    },
    {
      posicao: 2,
      cidade: "Rio de Janeiro",
      sessoes: 3843,
      usuarios: 3667,
      engajadas: 3818,
      porUsuario: 1.05,
      cliques: 4797,
      duracao: "00:00:43",
    },
    {
      posicao: 3,
      cidade: "Belo Horizonte",
      sessoes: 1841,
      usuarios: 1794,
      engajadas: 1833,
      porUsuario: 1.03,
      cliques: 2446,
      duracao: "00:00:45",
    },
    {
      posicao: 4,
      cidade: "Salvador",
      sessoes: 1690,
      usuarios: 1600,
      engajadas: 1685,
      porUsuario: 1.06,
      cliques: 2162,
      duracao: "00:00:46",
    },
    {
      posicao: 5,
      cidade: "Curitiba",
      sessoes: 1536,
      usuarios: 1481,
      engajadas: 1525,
      porUsuario: 1.04,
      cliques: 1918,
      duracao: "00:00:40",
    },
    {
      posicao: 6,
      cidade: "Porto Alegre",
      sessoes: 1306,
      usuarios: 1265,
      engajadas: 1301,
      porUsuario: 1.03,
      cliques: 1697,
      duracao: "00:00:44",
    },
    {
      posicao: 7,
      cidade: "Brasília",
      sessoes: 1185,
      usuarios: 1141,
      engajadas: 1180,
      porUsuario: 1.04,
      cliques: 1475,
      duracao: "00:00:43",
    },
    {
      posicao: 8,
      cidade: "Fortaleza",
      sessoes: 1176,
      usuarios: 1136,
      engajadas: 1168,
      porUsuario: 1.04,
      cliques: 1499,
      duracao: "00:00:44",
    },
  ],
  veiculosSessoes: [
    { veiculo: "Google Ads", sessoes: 25847, percentual: 38.1, cor: "#4285f4" },
    { veiculo: "Meta Ads", sessoes: 18562, percentual: 27.3, cor: "#1877f2" },
    { veiculo: "TikTok Ads", sessoes: 12235, percentual: 18.0, cor: "#ff0050" },
    { veiculo: "YouTube Ads", sessoes: 6794, percentual: 10.0, cor: "#ff0000" },
    { veiculo: "Spotify", sessoes: 2718, percentual: 4.0, cor: "#1DB954" },
    { veiculo: "Netflix", sessoes: 1783, percentual: 2.6, cor: "#E50914" },
  ],
}

type TrafegoEngajamentoProps = {}

const TrafegoEngajamento: React.FC<TrafegoEngajamentoProps> = () => {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "2025-05-01",
    end: "2025-05-31",
  })
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Função para formatar números
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString("pt-BR")
  }

  // Componente de gráfico de barras horizontais
  const HorizontalBarChart: React.FC<{
    title: string
    data: Array<{
      categoria?: string
      tipo?: string
      veiculo?: string
      sessoes: number
      percentual: number
      cor: string
    }>
    showValues?: boolean
  }> = ({ title, data, showValues = true }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{item.categoria || item.tipo || item.veiculo}</span>
              {showValues && (
                <span className="text-sm text-gray-600">
                  {formatNumber(item.sessoes)} ({item.percentual.toFixed(1)}%)
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentual}%`,
                  backgroundColor: item.cor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Componente do mapa de calor (simplificado)
  const BrazilHeatMap: React.FC = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Perfil Geográfico</h3>
      <div className="relative bg-gray-100 rounded-lg p-6 h-80 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="w-16 h-16 text-blue-500 mx-auto" />
          <div>
            <p className="text-lg font-semibold text-gray-900">Mapa de Calor - Brasil</p>
            <p className="text-sm text-gray-600">Distribuição de sessões por estado</p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Baixo</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Médio</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Alto</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Mapa interativo será implementado quando os dados estiverem disponíveis
          </p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <Loading message="Carregando dados de tráfego e engajamento..." />
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Tráfego e Engajamento</h1>
            <p className="text-gray-600">Receptivo da campanha</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Filtros */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Filtro de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filtro de Dispositivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Dispositivo
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Todos os dispositivos</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          {/* Filtro de Fonte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fonte de Tráfego</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option>Todas as fontes</option>
              <option>Orgânico</option>
              <option>Pago</option>
              <option>Social</option>
              <option>Direto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Sessões Campanha</p>
              <p className="text-3xl font-bold text-green-900">{formatNumber(mockData.receptivo.sessoesCampanha)}</p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Cliques botão EU QUERO</p>
              <p className="text-3xl font-bold text-blue-900">{formatNumber(mockData.receptivo.cliquesEuQuero)}</p>
            </div>
            <MousePointer className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Duração sessões</p>
              <p className="text-3xl font-bold text-purple-900">{mockData.receptivo.duracaoSessoes}</p>
            </div>
            <Clock className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Tx de Rejeição</p>
              <p className="text-3xl font-bold text-orange-900">{mockData.receptivo.taxaRejeicao}%</p>
            </div>
            <Target className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>      

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Dispositivos */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Dispositivo" data={mockData.dispositivos} />
        </div>

        {/* Veículos que Geraram Mais Sessões */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Veículos - Sessões no Receptivo" data={mockData.veiculosSessoes} />
        </div>

        {/* Mapa de Calor */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <BrazilHeatMap />
        </div>
      </div>

      {/* Tabela de Cidades */}
      <div className="card-overlay rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados por Cidade</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Cidade</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sessões</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total de usuários</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sessões engajadas</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sessões por usuário</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Cliques no Botão - EU QU...</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Duração média da sessão</th>
              </tr>
            </thead>
            <tbody>
              {mockData.cidades.map((cidade, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium">{cidade.posicao}.</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{cidade.cidade}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(cidade.sessoes)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(cidade.usuarios)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(cidade.engajadas)}</td>
                  <td className="py-3 px-4 text-right">{cidade.porUsuario.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(cidade.cliques)}</td>
                  <td className="py-3 px-4 text-right">{cidade.duracao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Mostrando 1 - 8 de 100+ cidades</div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Próximo</button>
          </div>
        </div>
      </div>

      {/* Interesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Interesses (campanha)" data={mockData.interesses} />
        </div>

        {/* Gráfico de Engajamento por Hora */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engajamento por Hora do Dia</h3>
          <div className="h-48 flex items-end justify-between space-x-1">
            {Array.from({ length: 24 }, (_, i) => {
              const height = Math.random() * 80 + 20
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-600 mt-1">{i}h</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Fontes:</strong> GA4. Os dados, via api são atualizados todos os dias às 6 horas da manhã.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <strong>CPC Médio*:</strong> Está filtrado com o foco nas campanhas otimizadas para este tipo de compra.
        </p>
      </div>
    </div>
  )
}

export default TrafegoEngajamento
