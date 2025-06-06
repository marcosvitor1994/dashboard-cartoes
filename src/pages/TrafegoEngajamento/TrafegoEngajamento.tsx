"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { TrendingUp, Calendar, Filter, MousePointer, Clock, Users, MapPin, Target } from "lucide-react"
import Loading from "../../components/Loading/Loading"
import { useGA4ResumoData } from "../../services/api"

type TrafegoEngajamentoProps = {}

const TrafegoEngajamento: React.FC<TrafegoEngajamentoProps> = () => {
  const { data: ga4Data, loading, error } = useGA4ResumoData()
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "2025-05-26",
    end: "2025-06-31",
  })
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // Função para obter cor do veículo
  const getVeiculoColor = (veiculo: string): string => {
    const colors: { [key: string]: string } = {
      "Google Ads": "#4285f4",
      "GDN": "#4285f4",
      "Demand-Gen": "#4285f4",
      "YouTube": "#ff0000",
      "Meta Ads": "#1877f2",
      "TikTok Ads": "#ff0050",
      "Spotify": "#1DB954",
      "Netflix": "#E50914",
      "Portal Forum": "#8b5cf6",
      "Brasil 247": "#10b981",
      "Band": "#f59e0b",
    }
    return colors[veiculo] || "#6b7280"
  }

  // Processamento dos dados da API
  const processedData = useMemo(() => {
    if (!ga4Data?.values || ga4Data.values.length <= 1) {
      return {
        receptivo: {
          sessoesCampanha: 0,
          cliquesSaibaMais: 0,
          duracaoSessoes: "00:00:00",
          taxaRejeicao: 0,
        },
        dispositivos: [],
        veiculosSessoes: [],
        dadosRegiao: {},
      }
    }

    const headers = ga4Data.values[0]
    const rows = ga4Data.values.slice(1)

    // Índices das colunas
    const regionIndex = headers.indexOf("Region")
    const deviceIndex = headers.indexOf("Device category")
    const sessionsIndex = headers.indexOf("Sessions")
    const bounceRateIndex = headers.indexOf("Bounce rate")
    const avgDurationIndex = headers.indexOf("Average session duration")
    const saibaMaisIndex = headers.indexOf("Key event count for web_pvc_cartoes_useourocard_saibamais")
    const veiculoIndex = headers.indexOf("Veículo")

    let totalSessions = 0
    let totalSaibaMais = 0
    let totalDuration = 0
    let totalBounceRate = 0
    let validRows = 0

    const deviceData: { [key: string]: number } = {}
    const veiculoData: { [key: string]: number } = {}
    const regionData: { [key: string]: number } = {}

    rows.forEach((row: any[]) => {
      const sessions = parseInt(row[sessionsIndex]) || 0
      const saibaMais = parseInt(row[saibaMaisIndex]) || 0
      const duration = parseFloat(row[avgDurationIndex]) || 0
      const bounceRate = parseFloat(row[bounceRateIndex]) || 0
      const device = row[deviceIndex] || "Outros"
      const veiculo = row[veiculoIndex] || "Outros"
      const region = row[regionIndex] || "Outros"

      if (sessions > 0) {
        totalSessions += sessions
        totalSaibaMais += saibaMais
        totalDuration += duration * sessions
        totalBounceRate += bounceRate * sessions
        validRows += sessions

        // Dispositivos
        deviceData[device] = (deviceData[device] || 0) + sessions

        // Veículos
        if (veiculo.trim() !== "" && veiculo !== " ") {
          veiculoData[veiculo] = (veiculoData[veiculo] || 0) + sessions
        }

        // Regiões
        if (region !== "(not set)" && region.trim() !== "" && region !== " ") {
          regionData[region] = (regionData[region] || 0) + sessions
        }
      }
    })

    // Converter em arrays ordenados
    const dispositivos = Object.entries(deviceData)
      .map(([tipo, sessoes]) => ({
        tipo,
        sessoes,
        percentual: totalSessions > 0 ? (sessoes / totalSessions) * 100 : 0,
        cor: tipo === "mobile" ? "#3b82f6" : tipo === "desktop" ? "#8b5cf6" : "#06b6d4",
      }))
      .sort((a, b) => b.sessoes - a.sessoes)

    const veiculosSessoes = Object.entries(veiculoData)
      .map(([veiculo, sessoes]) => ({
        veiculo,
        sessoes,
        percentual: totalSessions > 0 ? (sessoes / totalSessions) * 100 : 0,
        cor: getVeiculoColor(veiculo),
      }))
      .sort((a, b) => b.sessoes - a.sessoes)
      .slice(0, 6) // Top 6

    // Converter duração para formato hh:mm:ss
    const avgDurationSec = validRows > 0 ? totalDuration / validRows : 0
    const hours = Math.floor(avgDurationSec / 3600)
    const minutes = Math.floor((avgDurationSec % 3600) / 60)
    const seconds = Math.floor(avgDurationSec % 60)
    const duracaoFormatada = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    const avgBounceRate = validRows > 0 ? (totalBounceRate / validRows) * 100 : 0

    return {
      receptivo: {
        sessoesCampanha: totalSessions,
        cliquesSaibaMais: totalSaibaMais,
        duracaoSessoes: duracaoFormatada,
        taxaRejeicao: avgBounceRate,
      },
      dispositivos,
      veiculosSessoes,
      dadosRegiao: regionData,
    }
  }, [ga4Data])  

  // Função para formatar números
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mi`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} mil`
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
              <span className="text-sm font-medium text-gray-700">
                {item.categoria || item.tipo || item.veiculo}
              </span>
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
                  width: `${Math.min(item.percentual, 100)}%`,
                  backgroundColor: item.cor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const getIntensityColor = (sessions: number): string => {
      const maxSessions = Math.max(...Object.values(processedData.dadosRegiao))
      if (sessions === 0) return "#e5e7eb"
      
      const intensity = sessions / maxSessions
      if (intensity > 0.7) return "#dc2626" // Vermelho forte
      if (intensity > 0.5) return "#f59e0b" // Laranja
      if (intensity > 0.3) return "#eab308" // Amarelo
      if (intensity > 0.1) return "#10b981" // Verde
      return "#6b7280" // Cinza
    }

  // Componente do mapa do Brasil
  const BrazilHeatMap: React.FC = () => {
    const topRegioes = Object.entries(processedData.dadosRegiao)
      .filter(([region]) => region !== "(not set)" && region.trim() !== "")
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([region, sessions]) => ({
        name: region.replace("State of ", ""),
        sessions,
        color: getIntensityColor(sessions)
      }))
    

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6">
          {/* Representação visual simplificada */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg text-center">
            <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Distribuição Geográfica</h4>
            <p className="text-sm text-gray-600">
              Análise de {formatNumber(Object.values(processedData.dadosRegiao).reduce((a, b) => a + b, 0))} sessões
              distribuídas em {Object.keys(processedData.dadosRegiao).length} regiões
            </p>
          </div>

          {/* Legenda de cores */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Intensidade de Sessões:</h5>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Sem dados</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>Muito Baixo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Baixo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Médio</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Alto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Muito Alto</span>
              </div>
            </div>
          </div>

          {/* Top Regiões */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Top Regiões por Sessões</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {topRegioes.map((regiao, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4"
                  style={{ borderLeftColor: regiao.color }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-semibold text-gray-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{regiao.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: regiao.color }}
                    />
                    <span className="font-bold text-blue-600">
                      {formatNumber(regiao.sessions)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas resumidas */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {topRegioes.length > 0 ? topRegioes[0].name : "N/A"}
              </div>
              <div className="text-xs text-gray-600">Região Líder</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {formatNumber(topRegioes.reduce((acc, curr) => acc + curr.sessions, 0))}
              </div>
              <div className="text-xs text-gray-600">Total Top 10</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {topRegioes.length > 0 ? Math.round((topRegioes[0].sessions / Object.values(processedData.dadosRegiao).reduce((a, b) => a + b, 0)) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-600">% da Líder</div>
            </div>
          </div>

          {/* Nota sobre mapa geográfico */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Nota:</strong> Representação baseada nos dados do GA4. 
              Para visualização geográfica completa, recomenda-se integração com bibliotecas especializadas como D3.js ou Mapbox.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <Loading message="Carregando dados de tráfego e engajamento..." />
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-2">Erro ao carregar dados</div>
        <p className="text-gray-600">Não foi possível carregar os dados do GA4. Tente novamente.</p>
      </div>
    )
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
              <p className="text-3xl font-bold text-green-900">
                {formatNumber(processedData.receptivo.sessoesCampanha)}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Cliques SaibaMais</p>
              <p className="text-3xl font-bold text-blue-900">
                {formatNumber(processedData.receptivo.cliquesSaibaMais)}
              </p>
            </div>
            <MousePointer className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Duração sessões</p>
              <p className="text-3xl font-bold text-purple-900">{processedData.receptivo.duracaoSessoes}</p>
            </div>
            <Clock className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Tx de Rejeição</p>
              <p className="text-3xl font-bold text-orange-900">
                {processedData.receptivo.taxaRejeicao.toFixed(1)}%
              </p>
            </div>
            <Target className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Dispositivos */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Dispositivo" data={processedData.dispositivos} />
        </div>

        {/* Veículos que Geraram Mais Sessões */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Veículos - Sessões no Receptivo" data={processedData.veiculosSessoes} />
        </div>

        {/* Mapa de Calor */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <BrazilHeatMap />
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