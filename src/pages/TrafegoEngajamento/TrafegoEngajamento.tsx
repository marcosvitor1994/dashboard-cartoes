"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { TrendingUp, Calendar, Filter, MousePointer, Clock, Users } from "lucide-react"
import Loading from "../../components/Loading/Loading"
import { useGA4ResumoData, useGA4CompletoData } from "../../services/api" // Importar nova API
import BrazilMap from "../../components/BrazilMap/BrazilMap" // Importar novo componente de mapa

type TrafegoEngajamentoProps = {}

// Mapeamento explícito dos nomes dos estados da API para os nomes no GeoJSON
const API_TO_GEOJSON_STATE_NAMES: { [key: string]: string } = {
  Ceara: "Ceará",
  "Federal District": "Distrito Federal",
  "State of Acre": "Acre",
  "State of Alagoas": "Alagoas",
  "State of Amapa": "Amapá",
  "State of Amazonas": "Amazonas",
  "State of Bahia": "Bahia",
  "State of Espirito Santo": "Espírito Santo",
  "State of Goias": "Goiás",
  "State of Maranhao": "Maranhão",
  "State of Mato Grosso": "Mato Grosso",
  "State of Mato Grosso do Sul": "Mato Grosso do Sul",
  "State of Minas Gerais": "Minas Gerais",
  "State of Para": "Pará",
  "State of Paraiba": "Paraíba",
  "State of Parana": "Paraná",
  "State of Pernambuco": "Pernambuco",
  "State of Piaui": "Piauí",
  "State of Rio de Janeiro": "Rio de Janeiro",
  "State of Rio Grande do Norte": "Rio Grande do Norte",
  "State of Rio Grande do Sul": "Rio Grande do Sul",
  "State of Rondonia": "Rondônia",
  "State of Roraima": "Roraima",
  "State of Santa Catarina": "Santa Catarina",
  "State of Sao Paulo": "São Paulo",
  "State of Sergipe": "Sergipe",
  "State of Tocantins": "Tocantins",
  "Upper Takutu-Upper Essequibo": "Outros", // This isn't a Brazilian state
}

const TrafegoEngajamento: React.FC<TrafegoEngajamentoProps> = () => {
  const { data: ga4ResumoData, loading: resumoLoading, error: resumoError } = useGA4ResumoData()
  const { data: ga4CompletoData, loading: completoLoading, error: completoError } = useGA4CompletoData() // Nova API

  // Log raw API data for debugging
  useEffect(() => {
    if (ga4ResumoData?.values) {
      console.log("Raw GA4 Resumo Data:", ga4ResumoData.values)

      // Find the Region column index
      const headers = ga4ResumoData.values[0]
      const regionIndex = headers.indexOf("Region")

      if (regionIndex !== -1) {
        // Extract all unique regions from the data
        const uniqueRegions = new Set<string>()
        ga4ResumoData.values.slice(1).forEach((row: any[]) => {
          if (row[regionIndex] && row[regionIndex] !== "(not set)") {
            uniqueRegions.add(row[regionIndex])
          }
        })

        console.log("All unique regions from API:", Array.from(uniqueRegions))
      }
    }
  }, [ga4ResumoData])

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "2025-05-26",
    end: "2025-06-31",
  })
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // Função para obter cor do veículo
  const getVeiculoColor = (veiculo: string): string => {
    const colors: { [key: string]: string } = {
      "Google Ads": "#4285f4",
      GDN: "#4285f4",
      "Demand-Gen": "#4285f4",
      YouTube: "#ff0000",
      "Meta Ads": "#1877f2",
      "TikTok Ads": "#ff0050",
      Spotify: "#1DB954",
      Netflix: "#E50914",
      "Portal Forum": "#8b5cf6",
      "Brasil 247": "#10b981",
      Band: "#f59e0b",
    }
    return colors[veiculo] || "#6b7280"
  }

  // Processamento dos dados da API GA4 Resumo (para o mapa e gráficos existentes)
  const processedResumoData = useMemo(() => {
    if (!ga4ResumoData?.values || ga4ResumoData.values.length <= 1) {
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

    const headers = ga4ResumoData.values[0]
    const rows = ga4ResumoData.values.slice(1)

    // Índices das colunas
    const regionIndex = headers.indexOf("Region")
    const deviceIndex = headers.indexOf("Device category")
    const sessionsIndex = headers.indexOf("Sessions")
    const bounceRateIndex = headers.indexOf("Bounce rate")
    const avgDurationIndex = headers.indexOf("Average session duration")
    const saibaMaisIndex = headers.indexOf("Key event count for web_pvc_cartoes_useourocard_saibamais")
    const veiculoIndex = headers.indexOf("Veículo")

    console.log("Column indices:", {
      regionIndex,
      deviceIndex,
      sessionsIndex,
      bounceRateIndex,
      avgDurationIndex,
      saibaMaisIndex,
      veiculoIndex,
    })

    let totalSessions = 0
    let totalSaibaMais = 0
    let totalDuration = 0
    let totalBounceRate = 0
    let validRows = 0

    const deviceData: { [key: string]: number } = {}
    const veiculoData: { [key: string]: number } = {}
    const regionData: { [key: string]: number } = {}

    rows.forEach((row: any[]) => {
      const sessions = Number.parseInt(row[sessionsIndex]) || 0
      const saibaMais = Number.parseInt(row[saibaMaisIndex]) || 0
      const duration = Number.parseFloat(row[avgDurationIndex]) || 0
      const bounceRate = Number.parseFloat(row[bounceRateIndex]) || 0
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

        // Regiões - Converter o nome do estado para o formato esperado pelo mapa
        if (region !== "(not set)" && region.trim() !== "" && region !== " ") {
          // Usar o mapeamento para converter o nome do estado
          const normalizedRegion = API_TO_GEOJSON_STATE_NAMES[region] || region
          regionData[normalizedRegion] = (regionData[normalizedRegion] || 0) + sessions

          // Log the mapping for debugging
          console.log(`Mapping region: API "${region}" -> GeoJSON "${normalizedRegion}" (${sessions} sessions)`)
        }
      }
    })

    console.log("Final processed region data:", regionData)

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
  }, [ga4ResumoData])

  // Processamento dos dados da NOVA API GA4 Completo (para os novos cards)
  const processedCompletoData = useMemo(() => {
    if (!ga4CompletoData?.values || ga4CompletoData.values.length <= 1) {
      return {
        totalSessions: 0,
        totalEvents: 0,
      }
    }

    const headers = ga4CompletoData.values[0]
    const rows = ga4CompletoData.values.slice(1)

    const sessionsIndex = headers.indexOf("Sessions")
    const eventCountIndex = headers.indexOf("Event count")

    let totalSessions = 0
    let totalEvents = 0

    rows.forEach((row: any[]) => {
      totalSessions += Number.parseInt(row[sessionsIndex]) || 0
      totalEvents += Number.parseInt(row[eventCountIndex]) || 0
    })

    return {
      totalSessions,
      totalEvents,
    }
  }, [ga4CompletoData])

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
    // pega todos os valores de sessões já mapeados no mapa
    const values = Object.values(processedResumoData.dadosRegiao);
    const maxSessions = values.length > 0 ? Math.max(...values) : 0;
    if (sessions === 0) return "#e5e7eb" // Sem dados

    const intensity = sessions / maxSessions
    if (intensity > 0.7) return "#dc2626" // Vermelho forte (Muito Alto)
    if (intensity > 0.5) return "#f59e0b" // Laranja (Alto)
    if (intensity > 0.3) return "#eab308" // Amarelo (Médio)
    if (intensity > 0.1) return "#10b981" // Verde (Baixo)
    return "#6b7280" // Cinza (Muito Baixo)
  }

  if (resumoLoading || completoLoading) {
    return <Loading message="Carregando dados de tráfego e engajamento..." />
  }

  if (resumoError || completoError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-2">Erro ao carregar dados</div>
        <p className="text-gray-600">Não foi possível carregar os dados do GA4. Tente novamente.</p>
        {resumoError && <p className="text-xs text-red-400">{resumoError.message}</p>}
        {completoError && <p className="text-xs text-red-400">{completoError.message}</p>}
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

      {/* Cards de Métricas Principais - Ajustado para 5 cards em uma linha */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Sessões Campanha</p>
              <p className="text-2xl font-bold text-green-900">
                {formatNumber(processedResumoData.receptivo.sessoesCampanha)}
              </p>
            </div>
            <Users className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Cliques SaibaMais</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatNumber(processedResumoData.receptivo.cliquesSaibaMais)}
              </p>
            </div>
            <MousePointer className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Duração sessões</p>
              <p className="text-2xl font-bold text-purple-900">{processedResumoData.receptivo.duracaoSessoes}</p>
            </div>
            <Clock className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Sessões Totais</p>
              <p className="text-2xl font-bold text-yellow-900">{formatNumber(processedCompletoData.totalSessions)}</p>
            </div>
            <Users className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Eventos Totais</p>
              <p className="text-2xl font-bold text-red-900">{formatNumber(processedCompletoData.totalEvents)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Dispositivos */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Dispositivo" data={processedResumoData.dispositivos} />
        </div>

        {/* Veículos que Geraram Mais Sessões */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <HorizontalBarChart title="Veículos - Sessões no Receptivo" data={processedResumoData.veiculosSessoes} />
        </div>

        {/* Mapa de Calor - Usando o novo componente */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <BrazilMap
            regionData={processedResumoData.dadosRegiao}
            getIntensityColor={(sessions) => {
              const values = Object.values(processedResumoData.dadosRegiao);
              const max = values.length ? Math.max(...values) : 0;
              if (!max || sessions === 0) return "#e5e7eb";
              const i = sessions / max;
              return i > 0.7 ? "#dc2626"
                  : i > 0.5 ? "#f59e0b"
                  : i > 0.3 ? "#eab308"
                  : i > 0.1 ? "#10b981"
                  : "#6b7280";
            }}
          />
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
