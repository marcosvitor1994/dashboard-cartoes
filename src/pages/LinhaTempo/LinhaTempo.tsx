"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { ResponsiveLine } from "@nivo/line"
import { Calendar, Filter, TrendingUp, Play, Info, DollarSign, MousePointer } from "lucide-react"
import { useCCBBData } from "../../services/api"
import Loading from "../../components/Loading/Loading"
import PDFDownloadButton from "../../components/PDFDownloadButton/PDFDownloadButton"
import AnaliseSemanal from "./components/AnaliseSemanal"

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

const LinhaTempo: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const { data: apiData, loading, error } = useCCBBData()
  const [processedData, setProcessedData] = useState<DataPoint[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([])
  const [isWeeklyAnalysis, setIsWeeklyAnalysis] = useState(false)
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]) // Initialize filteredData

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
          const clicksIndex = headers.indexOf("Link clicks")
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

  // Filtrar dados baseado nos filtros selecionados
  useEffect(() => {
    if (processedData) {
      if (selectedVehicles.length === 0) {
        setFilteredData(
          processedData.filter((item) => {
            const itemDate = new Date(item.date)
            const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0)
            const endDate = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000)
            return itemDate >= startDate && itemDate <= endDate
          }),
        )
      } else {
        setFilteredData(
          processedData.filter((item) => {
            const itemDate = new Date(item.date)
            const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0)
            const endDate = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000)

            const isInDateRange = itemDate >= startDate && itemDate <= endDate
            const isVehicleSelected = selectedVehicles.includes(item.platform)

            return isInDateRange && isVehicleSelected
          }),
        )
      }
    }
  }, [processedData, dateRange, selectedVehicles])

  // Preparar dados para o gráfico
  const chartData: ChartData[] = useMemo(() => {
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
  }, [filteredData])

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

  // Calcular estatísticas
  const totalInvestment = useMemo(() => {
    let total = 0
    filteredData.forEach((item) => {
      const costString = item.cost.replace("R$", "").replace(".", "").replace(",", ".").trim()
      const cost = Number.parseFloat(costString) || 0
      total += cost
    })
    return total
  }, [filteredData])

  const totalImpressions = filteredData.reduce((sum, item) => sum + item.impressions, 0)
  const totalClicks = filteredData.reduce((sum, item) => sum + (item.clicks || item.linkClicks || 0), 0)

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

  // Renderização condicional DEPOIS de todos os hooks
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

  // Se estiver no modo análise semanal, renderizar o componente separado
  if (isWeeklyAnalysis) {
    return (
      <div className="space-y-4">        
        <AnaliseSemanal
          processedData={processedData}
          availableVehicles={availableVehicles}
          platformColors={platformColors}
          onBack={() => setIsWeeklyAnalysis(false)}
        />
      </div>
    )
  }

  return (
    <div ref={contentRef} className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Linha do Tempo</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            <span>Evolução de Impressões</span>
          </div>
          <PDFDownloadButton contentRef={contentRef} fileName="linha-tempo" />
          <button
            onClick={() => setIsWeeklyAnalysis(true)}
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
          >
            Análise Semanal
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

          {/* Filtro de Veículos */}
          <div>
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

      {/* Área do Gráfico e Informações */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Gráfico */}
        <div className="lg:col-span-3 card-overlay rounded-lg shadow-lg p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolução de Impressões por Data</h3>
          <div className="flex-1" style={{ minHeight: "400px" }}>
            {chartData[0]?.data.length > 0 ? (
              <ResponsiveLine
                data={chartData}
                margin={{ top: 30, right: 30, bottom: 80, left: 100 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: "auto", max: "auto" }}
                yFormat=" >-.0f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 15,
                  tickRotation: -45,
                  legend: "Data",
                  legendOffset: 60,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: 0,
                  legend: "Impressões",
                  legendOffset: -85,
                  legendPosition: "middle",
                  format: (value) => value.toLocaleString("pt-BR"),
                }}
                pointSize={8}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                colors={["#3b82f6"]}
                lineWidth={3}
                enableArea={true}
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
                      Data: {new Date(point.data.x as string).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {point.seriesId}: {(point.data.y as number).toLocaleString("pt-BR")}
                    </div>
                  </div>
                )}
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

        {/* Painel Lateral - Entrada de Veículos */}
        <div className="card-overlay rounded-lg shadow-lg p-4 flex flex-col">
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
        </div>
      </div>
    </div>
  )
}

export default LinhaTempo