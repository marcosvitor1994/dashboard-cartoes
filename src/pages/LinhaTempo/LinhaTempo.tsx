"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { ResponsiveLine } from "@nivo/line"
import {
  Calendar,
  Filter,
  TrendingUp,
  Play,
  Info,
  DollarSign,
  MousePointer,
  Eye,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { useCCBBData } from "../../services/api"
import Loading from "../../components/Loading/Loading"
import PDFDownloadButton from "../../components/PDFDownloadButton/PDFDownloadButton"

interface DataPoint {
  date: string
  campaignName: string
  platform: string
  impressions: number
  cost: string
  reach: number
  linkClicks: number
  clicks: number
  visualizacoes: number
}

interface ChartData {
  id: string
  data: Array<{
    x: string
    y: number
  }>
}

interface VehicleEntry {
  platform: string
  firstDate: string
  color: string
}

interface WeeklyMetrics {
  investment: number
  impressions: number
  clicks: number
  views: number
  cpm: number
  cpc: number
  ctr: number
  vtr: number
  cpv: number
}

interface WeeklyComparison {
  current: WeeklyMetrics
  previous: WeeklyMetrics
  comparison: {
    investment: number
    impressions: number
    clicks: number
    views: number
    cpm: number
    cpc: number
    ctr: number
    vtr: number
    cpv: number
  }
}

const LinhaTempo: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const { data: apiData, loading, error } = useCCBBData()
  const [processedData, setProcessedData] = useState<DataPoint[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([])
  const [isWeeklyAnalysis, setIsWeeklyAnalysis] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<"impressions" | "clicks" | "cpm" | "views">("impressions")

  // Cores para diferentes plataformas
  const platformColors: Record<string, string> = {
    TikTok: "#ff0050",
    Facebook: "#1877f2",
    Instagram: "#e4405f",
    YouTube: "#ff0000",
    Google: "#4285f4",
    LinkedIn: "#0077b5",
    Twitter: "#1da1f2",
    "Catraca Livre": "#3498db",
    Spotify: "#1DB954",
    Netflix: "#E50914",
    Meta: "#0668E1",
    Default: "#6366f1",
  }

  // Processar dados da API
  useEffect(() => {
    if (apiData?.values) {
      const headers = apiData.values[0]
      const rows = apiData.values.slice(1)

      const processed: DataPoint[] = rows
        .map((row: any[]) => {
          const dateIndex = headers.indexOf("Date")
          const campaignIndex = headers.indexOf("Campaign name")
          const platformIndex = headers.indexOf("Plataforma")
          const impressionsIndex = headers.indexOf("Impressions")
          const costIndex = headers.indexOf("Cost")
          const reachIndex = headers.indexOf("Reach")
          const linkClicksIndex = headers.indexOf("Link clicks")
          const clicksIndex = headers.indexOf("Clicks")
          const visualizacoesIndex = headers.indexOf("Visualizacoes")

          if (
            dateIndex !== -1 &&
            campaignIndex !== -1 &&
            platformIndex !== -1 &&
            impressionsIndex !== -1 &&
            row[dateIndex] &&
            row[impressionsIndex]
          ) {
            return {
              date: row[dateIndex],
              campaignName: row[campaignIndex] || "",
              platform: row[platformIndex] || "Outros",
              impressions: Number.parseInt(row[impressionsIndex]?.replace(/\./g, "").replace(/,/g, "") || "0"),
              cost: row[costIndex] || "R$ 0,00",
              reach: Number.parseInt(row[reachIndex]?.replace(/\./g, "").replace(/,/g, "") || "0"),
              linkClicks: Number.parseInt(row[linkClicksIndex]?.replace(/\./g, "").replace(/,/g, "") || "0"),
              clicks: Number.parseInt(row[clicksIndex]?.replace(/\./g, "").replace(/,/g, "") || "0"),
              visualizacoes: Number.parseInt(row[visualizacoesIndex]?.replace(/\./g, "").replace(/,/g, "") || "0"),
            }
          }
          return null
        })
        .filter(Boolean) as DataPoint[]

      // Ordenar por data
      processed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setProcessedData(processed)

      // Configurar range de datas
      if (processed.length > 0) {
        const firstDate = processed[0].date
        const lastDate = processed[processed.length - 1].date
        setDateRange({ start: firstDate, end: lastDate })
      }

      // Extrair veículos únicos
      const platformSet = new Set<string>()
      processed.forEach((item) => {
        if (item.platform) {
          platformSet.add(item.platform)
        }
      })
      const vehicles = Array.from(platformSet).filter(Boolean)
      setAvailableVehicles(vehicles)
      setSelectedVehicles([])
    }
  }, [apiData])

  // Função para obter dados da semana
  const getWeekData = (daysBack: number): DataPoint[] => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() - daysBack)

    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - 6)

    return processedData.filter((item) => {
      const itemDate = new Date(item.date)
      const isInDateRange = itemDate >= startDate && itemDate <= endDate
      const isVehicleSelected = selectedVehicles.length === 0 || selectedVehicles.includes(item.platform)
      return isInDateRange && isVehicleSelected
    })
  }

  // Calcular métricas semanais
  const calculateWeeklyMetrics = (data: DataPoint[]): WeeklyMetrics => {
    const totalInvestment = data.reduce((sum, item) => {
      const costString = item.cost.replace("R$", "").replace(".", "").replace(",", ".").trim()
      return sum + (Number.parseFloat(costString) || 0)
    }, 0)

    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)
    const totalViews = data.reduce((sum, item) => sum + item.visualizacoes, 0)

    const cpm = totalImpressions > 0 ? (totalInvestment / totalImpressions) * 1000 : 0
    const cpc = totalClicks > 0 ? totalInvestment / totalClicks : 0
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const vtr = totalImpressions > 0 ? (totalViews / totalImpressions) * 100 : 0
    const cpv = totalViews > 0 ? totalInvestment / totalViews : 0

    return {
      investment: totalInvestment,
      impressions: totalImpressions,
      clicks: totalClicks,
      views: totalViews,
      cpm,
      cpc,
      ctr,
      vtr,
      cpv,
    }
  }

  // Dados da análise semanal
  const weeklyComparison: WeeklyComparison = useMemo(() => {
    const currentWeekData = getWeekData(1)
    const previousWeekData = getWeekData(8)

    const current = calculateWeeklyMetrics(currentWeekData)
    const previous = calculateWeeklyMetrics(previousWeekData)

    const comparison = {
      investment:
        previous.investment > 0 ? ((current.investment - previous.investment) / previous.investment) * 100 : 0,
      impressions:
        previous.impressions > 0 ? ((current.impressions - previous.impressions) / previous.impressions) * 100 : 0,
      clicks: previous.clicks > 0 ? ((current.clicks - previous.clicks) / previous.clicks) * 100 : 0,
      views: previous.views > 0 ? ((current.views - previous.views) / previous.views) * 100 : 0,
      cpm: previous.cpm > 0 ? ((current.cpm - previous.cpm) / previous.cpm) * 100 : 0,
      cpc: previous.cpc > 0 ? ((current.cpc - previous.cpc) / previous.cpc) * 100 : 0,
      ctr: previous.ctr > 0 ? ((current.ctr - previous.ctr) / previous.ctr) * 100 : 0,
      vtr: previous.vtr > 0 ? ((current.vtr - previous.vtr) / previous.vtr) * 100 : 0,
      cpv: previous.cpv > 0 ? ((current.cpv - previous.cpv) / previous.cpv) * 100 : 0,
    }

    return { current, previous, comparison }
  }, [processedData, selectedVehicles])

  // Dados do gráfico semanal comparativo
  const weeklyChartData: ChartData[] = useMemo(() => {
    if (!isWeeklyAnalysis) return []

    const currentWeekData = getWeekData(1)
    const previousWeekData = getWeekData(8)

    // Agrupar por dia da semana
    const groupByDay = (data: DataPoint[]) => {
      const grouped: Record<string, DataPoint[]> = {}
      data.forEach((item) => {
        const date = new Date(item.date)
        const dayKey = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`
        if (!grouped[dayKey]) grouped[dayKey] = []
        grouped[dayKey].push(item)
      })
      return grouped
    }

    const currentGrouped = groupByDay(currentWeekData)
    const previousGrouped = groupByDay(previousWeekData)

    const getDayValue = (dayData: DataPoint[], metric: string) => {
      if (!dayData || dayData.length === 0) return 0

      switch (metric) {
        case "impressions":
          return dayData.reduce((sum, item) => sum + item.impressions, 0)
        case "clicks":
          return dayData.reduce((sum, item) => sum + item.clicks, 0)
        case "views":
          return dayData.reduce((sum, item) => sum + item.visualizacoes, 0)
        case "cpm":
          const totalCost = dayData.reduce((sum, item) => {
            const costString = item.cost.replace("R$", "").replace(".", "").replace(",", ".").trim()
            return sum + (Number.parseFloat(costString) || 0)
          }, 0)
          const totalImpressions = dayData.reduce((sum, item) => sum + item.impressions, 0)
          return totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0
        default:
          return 0
      }
    }

    // Criar dados para o gráfico
    const allDays = new Set([...Object.keys(currentGrouped), ...Object.keys(previousGrouped)])
    const sortedDays = Array.from(allDays).sort((a, b) => {
      const [dayA, monthA] = a.split("/").map(Number)
      const [dayB, monthB] = b.split("/").map(Number)
      return new Date(2024, monthA - 1, dayA).getTime() - new Date(2024, monthB - 1, dayB).getTime()
    })

    const currentData = sortedDays.map((day) => ({
      x: day,
      y: getDayValue(currentGrouped[day], selectedMetric),
    }))

    const previousData = sortedDays.map((day) => ({
      x: day,
      y: getDayValue(previousGrouped[day], selectedMetric),
    }))

    return [
      {
        id: "Semana Atual",
        data: currentData,
      },
      {
        id: "Semana Anterior",
        data: previousData,
      },
    ]
  }, [isWeeklyAnalysis, selectedMetric, processedData, selectedVehicles])

  // Filtrar dados baseado nos filtros selecionados (modo normal)
  const filteredData = useMemo(() => {
    if (isWeeklyAnalysis) return []

    if (selectedVehicles.length === 0) {
      return processedData.filter((item) => {
        const itemDate = new Date(item.date)
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0)
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    return processedData.filter((item) => {
      const itemDate = new Date(item.date)
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0)
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000)

      const isInDateRange = itemDate >= startDate && itemDate <= endDate
      const isVehicleSelected = selectedVehicles.includes(item.platform)

      return isInDateRange && isVehicleSelected
    })
  }, [processedData, dateRange, selectedVehicles, isWeeklyAnalysis])

  // Preparar dados para o gráfico normal
  const chartData: ChartData[] = useMemo(() => {
    if (isWeeklyAnalysis) return weeklyChartData

    const groupedByDate = filteredData.reduce(
      (acc, item) => {
        const date = item.date
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += item.impressions
        return acc
      },
      {} as Record<string, number>,
    )

    const data = Object.entries(groupedByDate)
      .map(([date, impressions]) => ({
        x: date,
        y: impressions,
      }))
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())

    return [
      {
        id: "Impressões",
        data,
      },
    ]
  }, [filteredData, isWeeklyAnalysis, weeklyChartData])

  // Identificar entradas de veículos
  const vehicleEntries: VehicleEntry[] = useMemo(() => {
    const entries: Record<string, string> = {}

    processedData.forEach((item) => {
      if (!entries[item.platform]) {
        entries[item.platform] = item.date
      } else if (new Date(item.date) < new Date(entries[item.platform])) {
        entries[item.platform] = item.date
      }
    })

    return Object.entries(entries)
      .map(([platform, date]) => ({
        platform,
        firstDate: date,
        color: platformColors[platform] || platformColors.Default,
      }))
      .sort((a, b) => new Date(a.firstDate).getTime() - new Date(b.firstDate).getTime())
  }, [processedData])

  // Calcular estatísticas normais
  const totalInvestment = useMemo(() => {
    if (isWeeklyAnalysis) return 0
    let total = 0
    filteredData.forEach((item) => {
      const costString = item.cost.replace("R$", "").replace(".", "").replace(",", ".").trim()
      const cost = Number.parseFloat(costString) || 0
      total += cost
    })
    return total
  }, [filteredData, isWeeklyAnalysis])

  const totalImpressions = isWeeklyAnalysis ? 0 : filteredData.reduce((sum, item) => sum + item.impressions, 0)
  const totalClicks = isWeeklyAnalysis ? 0 : filteredData.reduce((sum, item) => sum + (item.clicks || 0), 0)

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Função para alternar seleção de veículo
  const toggleVehicle = (vehicle: string) => {
    setSelectedVehicles((prev) => {
      if (prev.includes(vehicle)) {
        return prev.filter((v) => v !== vehicle)
      }
      return [...prev, vehicle]
    })
  }

  // Função para renderizar ícone de comparação
  const renderComparisonIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  // Função para obter cor da comparação
  const getComparisonColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-400"
  }

  // Função para obter escala do gráfico
  const getChartScale = (): { type: 'linear'; min: 'auto' | number; max: 'auto' | number } => {
    if (!isWeeklyAnalysis) return { type: 'linear', min: 'auto', max: 'auto' }

    if (["ctr", "vtr"].includes(selectedMetric)) {
      const maxValue = Math.min(
        100,
        Math.max(...weeklyChartData.flatMap((series) => series.data.map((d) => d.y))) * 1.002
      )
      return { type: 'linear', min: 0, max: maxValue }
    }

    return { type: 'linear', min: 'auto', max: 'auto' }
  }

  if (loading) {
    return <Loading message="Carregando dados da linha do tempo..." />
  }

  if (error) {
    return (
      <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
      </div>
    )
  }

  return (
    <div ref={contentRef} className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 text-enhanced">
          {isWeeklyAnalysis ? "Análise Semanal" : "Linha do Tempo"}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            <span>{isWeeklyAnalysis ? "Comparativo Semanal" : "Evolução de Impressões"}</span>
          </div>
          <PDFDownloadButton contentRef={contentRef} fileName="linha-tempo" />
          <button
            onClick={() => setIsWeeklyAnalysis(!isWeeklyAnalysis)}
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
          >
            {isWeeklyAnalysis ? "Linha do Tempo" : "Análise Semanal"}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Filtro de Data - apenas no modo normal */}
          {!isWeeklyAnalysis && (
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
          )}

          {/* Filtro de Veículos */}
          <div className={isWeeklyAnalysis ? "lg:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Veículos de Mídia
            </label>
            <div className="flex flex-wrap gap-2">
              {availableVehicles.map((vehicle) => (
                <button
                  key={vehicle}
                  onClick={() => toggleVehicle(vehicle)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    selectedVehicles.includes(vehicle)
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: selectedVehicles.includes(vehicle) ? platformColors[vehicle] + "20" : undefined,
                    borderColor: selectedVehicles.includes(vehicle) ? platformColors[vehicle] : undefined,
                    color: selectedVehicles.includes(vehicle) ? platformColors[vehicle] : undefined,
                  }}
                >
                  {vehicle}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {isWeeklyAnalysis ? (
        /* Cards da Análise Semanal */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card Investimento */}
          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center space-x-1">
                {renderComparisonIcon(weeklyComparison.comparison.investment)}
                <span className={`text-xs font-medium ${getComparisonColor(weeklyComparison.comparison.investment)}`}>
                  {Math.abs(weeklyComparison.comparison.investment).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Investimento</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(weeklyComparison.current.investment)}</p>
            </div>
          </div>

          {/* Card Impressões e CPM */}
          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1">
                {renderComparisonIcon(weeklyComparison.comparison.impressions)}
                <span className={`text-xs font-medium ${getComparisonColor(weeklyComparison.comparison.impressions)}`}>
                  {Math.abs(weeklyComparison.comparison.impressions).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Impressões</p>
              <p className="text-lg font-bold text-gray-900">
                {weeklyComparison.current.impressions.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-gray-500">CPM: {formatCurrency(weeklyComparison.current.cpm)}</p>
            </div>
          </div>

          {/* Card Cliques, CPC e CTR */}
          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center space-x-1">
                {renderComparisonIcon(weeklyComparison.comparison.clicks)}
                <span className={`text-xs font-medium ${getComparisonColor(weeklyComparison.comparison.clicks)}`}>
                  {Math.abs(weeklyComparison.comparison.clicks).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cliques</p>
              <p className="text-lg font-bold text-gray-900">
                {weeklyComparison.current.clicks.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-gray-500">
                CPC: {formatCurrency(weeklyComparison.current.cpc)} | CTR: {weeklyComparison.current.ctr.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Card Views, VTR e CPV */}
          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex items-center space-x-1">
                {renderComparisonIcon(weeklyComparison.comparison.views)}
                <span className={`text-xs font-medium ${getComparisonColor(weeklyComparison.comparison.views)}`}>
                  {Math.abs(weeklyComparison.comparison.views).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Views</p>
              <p className="text-lg font-bold text-gray-900">
                {weeklyComparison.current.views.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-gray-500">
                VTR: {weeklyComparison.current.vtr.toFixed(2)}% | CPV: {formatCurrency(weeklyComparison.current.cpv)}
              </p>
            </div>
          </div>

          {/* Card Resumo */}
          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resumo</p>
              <p className="text-xs text-gray-500 mt-1">Comparativo da semana atual vs. semana anterior</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>CPM:</span>
                  <span className={getComparisonColor(weeklyComparison.comparison.cpm)}>
                    {weeklyComparison.comparison.cpm > 0 ? "+" : ""}
                    {weeklyComparison.comparison.cpm.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>CPC:</span>
                  <span className={getComparisonColor(weeklyComparison.comparison.cpc)}>
                    {weeklyComparison.comparison.cpc > 0 ? "+" : ""}
                    {weeklyComparison.comparison.cpc.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Cards Normais */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Investimento Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalInvestment)}</p>
              </div>
            </div>
          </div>

          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total de Impressões</p>
                <p className="text-xl font-bold text-gray-900">{totalImpressions.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </div>

          <div className="card-overlay rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total de Cliques</p>
                <p className="text-xl font-bold text-gray-900">{totalClicks.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área do Gráfico e Informações */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Gráfico */}
        <div className="lg:col-span-3 card-overlay rounded-lg shadow-lg p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isWeeklyAnalysis
              ? `Comparativo Semanal - ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`
              : "Evolução de Impressões por Data"}
          </h3>
          <div className="flex-1" style={{ minHeight: "400px" }}>
            {chartData[0]?.data.length > 0 ? (
              <ResponsiveLine
                data={chartData}
                margin={{ top: 30, right: 30, bottom: 80, left: 80 }}
                xScale={{ type: "point" }}
                yScale={getChartScale()}
                yFormat=" >-.0f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 15,
                  tickRotation: -45,
                  legend: isWeeklyAnalysis ? "Dia/Mês" : "Data",
                  legendOffset: 60,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: 0,
                  legend: isWeeklyAnalysis
                    ? selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                    : "Impressões",
                  legendOffset: -65,
                  legendPosition: "middle",
                  format: (value) => {
                    if (isWeeklyAnalysis && ["ctr", "vtr"].includes(selectedMetric)) {
                      return `${value.toFixed(1)}%`
                    }
                    return value.toLocaleString("pt-BR")
                  },
                }}
                pointSize={8}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                colors={isWeeklyAnalysis ? ["#3b82f6", "#fbbf24"] : ["#3b82f6"]}
                lineWidth={3}
                enableArea={!isWeeklyAnalysis}
                areaOpacity={0.1}
                enableGridX={false}
                enableGridY={true}
                gridYValues={5}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 11,
                        fill: "#6b7280",
                      },
                    },
                    legend: {
                      text: {
                        fontSize: 12,
                        fill: "#374151",
                        fontWeight: 600,
                      },
                    },
                  },
                  grid: {
                    line: {
                      stroke: "#e5e7eb",
                      strokeWidth: 1,
                    },
                  },
                }}
                tooltip={({ point }) => (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <div className="text-sm font-medium text-gray-900">
                      {isWeeklyAnalysis
                        ? `Dia: ${point.data.x}`
                        : `Data: ${new Date(point.data.x as string).toLocaleDateString("pt-BR")}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {point.seriesId}:{" "}
                      {isWeeklyAnalysis && ["ctr", "vtr"].includes(selectedMetric)
                        ? `${(point.data.y as number).toFixed(2)}%`
                        : (point.data.y as number).toLocaleString("pt-BR")}
                    </div>
                  </div>
                )}
                legends={
                  isWeeklyAnalysis
                    ? [
                        {
                          anchor: "bottom-right",
                          direction: "column",
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: "left-to-right",
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: "circle",
                          symbolBorderColor: "rgba(0, 0, 0, .5)",
                          effects: [
                            {
                              on: "hover",
                              style: {
                                itemBackground: "rgba(0, 0, 0, .03)",
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]
                    : []
                }
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="card-overlay rounded-lg shadow-lg p-4 flex flex-col">
          {isWeeklyAnalysis ? (
            /* Seletor de Métricas */
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Métricas
              </h3>
              <div className="space-y-2 flex-1">
                {[
                  { key: "impressions", label: "Impressões", icon: TrendingUp },
                  { key: "clicks", label: "Cliques", icon: MousePointer },
                  { key: "cpm", label: "CPM", icon: DollarSign },
                  { key: "views", label: "Views", icon: Eye },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                      selectedMetric === key
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Entrada de Veículos */
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Entrada de Veículos
              </h3>
              <div className="space-y-3 flex-1 overflow-auto">
                {vehicleEntries.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Play className="w-3 h-3" style={{ color: entry.color }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{entry.platform}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.firstDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LinhaTempo