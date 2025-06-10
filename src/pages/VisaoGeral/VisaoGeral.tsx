"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { BarChart3, Calendar } from "lucide-react"
import { useConsolidadoData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface ProcessedData {
  date: string
  platform: string
  campaignName: string
  impressions: number
  cost: number
  reach: number
  clicks: number
  frequency: number
  cpm: number
}

interface PlatformMetrics {
  platform: string
  impressions: number
  cost: number
  reach: number
  clicks: number
  cpm: number
  frequency: number
  color: string
}

interface ChartDataPoint {
  platform: string
  value: number
  color: string
}

const VisaoGeral: React.FC = () => {
  const { data: apiData, loading, error } = useConsolidadoData()
  const [processedData, setProcessedData] = useState<ProcessedData[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  // Cores para as plataformas
  const platformColors: Record<string, string> = {
    Google: "#4285f4",
    Meta: "#0668E1",
    TikTok: "#ff0050",
    YouTube: "#ff0000",
    Kwai: "#ff6b35",
    "Globo.com": "#00a86b",
    Serasa: "#9b59b6",
    "Folha de SP": "#e91e63",
    Spotify: "#1DB954",
    Default: "#6366f1",
  }

  // Placeholder para dados de benchmark
  const benchmarkMetrics = {
    cpm: 5.0, // R$ 5,00
    cpc: 0.8, // R$ 0,80
    cpv: 0.05, // R$ 0,05 (Custo por Visualização de Vídeo - placeholder)
    ctr: 1.5, // 1.5%
    vtr: 70, // 70% (View-Through Rate - placeholder)
  }

  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>()
    processedData.forEach((item) => {
      platforms.add(item.platform)
    })
    return Array.from(platforms)
  }, [processedData])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform)
      } else {
        return [...prev, platform]
      }
    })
  }

  // Função para converter data brasileira DD/MM/YYYY para formato ISO YYYY-MM-DD
  const convertBrazilianDate = (dateStr: string): string => {
    if (!dateStr) return ""
    const [day, month, year] = dateStr.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  // Processar dados da API
  useEffect(() => {
    if (apiData?.values) {
      const headers = apiData.values[0]
      const rows = apiData.values.slice(1)

      const processed: ProcessedData[] = rows
        .map((row: string[]) => {
          const parseNumber = (value: string) => {
            if (!value) return 0
            return Number.parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".")) || 0
          }

          const parseInteger = (value: string) => {
            if (!value) return 0
            return Number.parseInt(value.replace(/[.\s]/g, "").replace(",", "")) || 0
          }

          return {
            date: row[headers.indexOf("Date")] || "",
            platform: row[headers.indexOf("Veículo")] || "Outros",
            campaignName: row[headers.indexOf("Campaign name")] || "",
            impressions: parseInteger(row[headers.indexOf("Impressions")]),
            cost: parseNumber(row[headers.indexOf("Total spent")]),
            reach: parseInteger(row[headers.indexOf("Reach")]),
            clicks: parseInteger(row[headers.indexOf("Clicks")]),
            frequency: parseNumber(row[headers.indexOf("Frequency")]) || 1,
            cpm: parseNumber(row[headers.indexOf("CPM")]),
          } as ProcessedData
        })
        .filter((item: ProcessedData) => item.date && item.impressions > 0)

      setProcessedData(processed)

      // Definir range de datas inicial
      if (processed.length > 0) {
        const validDates = processed
          .map((item) => convertBrazilianDate(item.date))
          .filter(Boolean)
          .sort()

        if (validDates.length > 0) {
          setDateRange({
            start: validDates[0],
            end: validDates[validDates.length - 1],
          })
        }
      }
    }
  }, [apiData])

  // Filtrar dados por data
  const filteredData = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return processedData

    return processedData
      .filter((item) => {
        const itemDateISO = convertBrazilianDate(item.date)
        if (!itemDateISO) return false

        const itemDate = new Date(itemDateISO)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return itemDate >= startDate && itemDate <= endDate
      })
      .filter((item) => selectedPlatforms.length === 0 || selectedPlatforms.includes(item.platform))
  }, [processedData, dateRange, selectedPlatforms])

  // Calcular métricas por plataforma
  const platformMetrics = useMemo(() => {
    const metrics: Record<string, PlatformMetrics> = {}

    filteredData.forEach((item) => {
      if (!metrics[item.platform]) {
        metrics[item.platform] = {
          platform: item.platform,
          impressions: 0,
          cost: 0,
          reach: 0,
          clicks: 0,
          cpm: 0,
          frequency: 0,
          color: platformColors[item.platform] || platformColors.Default,
        }
      }

      metrics[item.platform].impressions += item.impressions
      metrics[item.platform].cost += item.cost
      metrics[item.platform].reach += item.reach
      metrics[item.platform].clicks += item.clicks
    })

    // Calcular médias
    Object.values(metrics).forEach((metric) => {
      const platformData = filteredData.filter((item) => item.platform === metric.platform)
      if (platformData.length > 0) {
        metric.cpm = metric.cost / (metric.impressions / 1000)
        metric.frequency = metric.reach > 0 ? metric.impressions / metric.reach : 0
      }
    })

    return Object.values(metrics).sort((a, b) => b.impressions - a.impressions)
  }, [filteredData])

  // Calcular totais
  const totals = useMemo(() => {
    const investment = filteredData.reduce((sum, item) => sum + item.cost, 0)
    const impressions = filteredData.reduce((sum, item) => sum + item.impressions, 0)
    const reach = Math.max(...filteredData.map((item) => item.reach), 0)
    const clicks = filteredData.reduce((sum, item) => sum + item.clicks, 0)
    const frequency = filteredData.length > 0 && reach > 0 ? impressions / reach : 0
    const cpm = impressions > 0 ? investment / (impressions / 1000) : 0
    const cpc = clicks > 0 ? investment / clicks : 0 // Calcular CPC
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0 // Calcular CTR

    // CPV e VTR são placeholders, pois os dados brutos não contêm visualizações de vídeo ou conclusões.
    // Para valores reais, seria necessário adicionar essas métricas ao `apiData`.
    const cpv = 0.06 // Placeholder
    const vtr = 65 // Placeholder

    return {
      investment,
      impressions,
      reach,
      clicks,
      frequency,
      cpm,
      cpc, // Adicionar CPC
      ctr, // Adicionar CTR
      cpv, // Adicionar CPV placeholder
      vtr, // Adicionar VTR placeholder
    }
  }, [filteredData])

  // Preparar dados para gráficos
  const impressionsChartData: ChartDataPoint[] = platformMetrics.map((metric) => ({
    platform: metric.platform,
    value: metric.impressions,
    color: metric.color,
  }))

  const reachChartData: ChartDataPoint[] = platformMetrics.map((metric) => ({
    platform: metric.platform,
    value: metric.reach,
    color: metric.color,
  }))

  const frequencyChartData: ChartDataPoint[] = platformMetrics.map((metric) => ({
    platform: metric.platform,
    value: metric.frequency,
    color: metric.color,
  }))

  const cpmChartData: ChartDataPoint[] = platformMetrics.map((metric) => ({
    platform: metric.platform,
    value: metric.cpm,
    color: metric.color,
  }))

  const clicksChartData: ChartDataPoint[] = platformMetrics.map((metric) => ({
    platform: metric.platform,
    value: metric.clicks,
    color: metric.color,
  }))

  // Função para formatar números
  const formatNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} bi`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mi`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} mil`
    }
    return value.toLocaleString("pt-BR")
  }

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Componente de gráfico de barras horizontal
  const HorizontalBarChart: React.FC<{
    data: ChartDataPoint[]
    title: string
    format?: (value: number) => string
  }> = ({ data, title, format = formatNumber }) => {
    const maxValue = Math.max(...data.map((d) => d.value))

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-gray-600 truncate">{item.platform}</div>
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-100 rounded">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="absolute right-2 top-0 h-6 flex items-center">
                  <span className="text-xs font-medium text-gray-700">{format(item.value)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Componente para exibir métrica comparativa
  const MetricComparison: React.FC<{
    label: string
    value: number
    benchmark: number
    format: (val: number) => string
    isHigherBetter: boolean
  }> = ({ label, value, benchmark, format, isHigherBetter }) => {
    const isBetter = isHigherBetter ? value >= benchmark : value <= benchmark
    const colorClass = isBetter ? "text-green-600" : "text-red-600"
    const arrowIcon = isBetter ? "↑" : "↓" // Seta simples para indicar direção

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${colorClass}`}>{format(value)}</span>
          <span className="text-xs text-gray-500">
            ({format(benchmark)} {arrowIcon})
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return <Loading message="Carregando visão geral..." />
  }

  if (error) {
    return (
      <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Visão Geral da Campanha</h1>
            <p className="text-gray-600">Dashboard de performance</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Filtro de Data */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Período:
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="text-gray-500">até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {availablePlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                selectedPlatforms.includes(platform)
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedPlatforms.includes(platform) ? platformColors[platform] + "20" : undefined,
                borderColor: selectedPlatforms.includes(platform) ? platformColors[platform] : undefined,
                color: selectedPlatforms.includes(platform) ? platformColors[platform] : undefined,
              }}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Investimento Total</div>
          <div className="text-xl font-bold text-green-600">R$ {formatNumber(totals.investment)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Impressões</div>
          <div className="text-xl font-bold text-blue-600">{formatNumber(totals.impressions)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">CPM</div>
          <div className="text-xl font-bold text-purple-600">R$ {totals.cpm.toFixed(2)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Alcance</div>
          <div className="text-xl font-bold text-orange-600">{formatNumber(totals.reach)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Frequência</div>
          <div className="text-xl font-bold text-red-600">{totals.frequency.toFixed(2)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Cliques</div>
          <div className="text-xl font-bold text-teal-600">{formatNumber(totals.clicks)}</div>
        </div>
      </div>

      {/* Gráficos de Barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-1">
        {/* Impressões por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <HorizontalBarChart data={impressionsChartData} title="Impressões" />
        </div>

        {/* Alcance por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <HorizontalBarChart data={reachChartData} title="Alcance" />
        </div>

        {/* Frequência por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <HorizontalBarChart data={frequencyChartData} title="Frequência" format={(value) => value.toFixed(2)} />
        </div>

        {/* CPM por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <HorizontalBarChart data={cpmChartData} title="CPM Médio" format={(value) => formatCurrency(value)} />
        </div>

        {/* Cliques por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <HorizontalBarChart data={clicksChartData} title="Cliques" />
        </div>

        {/* Quadro Comparativo de Métricas com Benchmark */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Comparativo com Benchmark</h4>
          <div className="space-y-1">
            <MetricComparison
              label="CPM"
              value={totals.cpm}
              benchmark={benchmarkMetrics.cpm}
              format={(val) => `R$ ${val.toFixed(2)}`}
              isHigherBetter={false}
            />
            <MetricComparison
              label="CPC"
              value={totals.cpc}
              benchmark={benchmarkMetrics.cpc}
              format={(val) => `R$ ${val.toFixed(2)}`}
              isHigherBetter={false}
            />
            <MetricComparison
              label="CPV (Est.)"
              value={totals.cpv}
              benchmark={benchmarkMetrics.cpv}
              format={(val) => `R$ ${val.toFixed(2)}`}
              isHigherBetter={false}
            />
            <MetricComparison
              label="CTR"
              value={totals.ctr}
              benchmark={benchmarkMetrics.ctr}
              format={(val) => `${val.toFixed(2)}%`}
              isHigherBetter={true}
            />
            <MetricComparison
              label="VTR (Est.)"
              value={totals.vtr}
              benchmark={benchmarkMetrics.vtr}
              format={(val) => `${val.toFixed(2)}%`}
              isHigherBetter={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              *CPV e VTR são estimativas baseadas em dados limitados. Para precisão, dados de visualização de vídeo são
              necessários.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisaoGeral
