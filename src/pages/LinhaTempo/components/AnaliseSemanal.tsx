"use client"

import type React from "react"
import { useState, useMemo, useRef } from "react"
import { ResponsiveLine } from "@nivo/line"
import {
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  MousePointer,
  Eye,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft,
} from "lucide-react"
import PDFDownloadButton from "../../../components/PDFDownloadButton/PDFDownloadButton"

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

interface AnaliseSemanalProps {
  processedData: DataPoint[]
  availableVehicles: string[]
  platformColors: Record<string, string>
}

const AnaliseSemanal: React.FC<AnaliseSemanalProps> = ({ processedData, availableVehicles, platformColors }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [selectedMetric, setSelectedMetric] = useState<
    "impressions" | "clicks" | "views" | "cpm" | "cpc" | "cpv" | "ctr" | "vtr"
  >("impressions")

  // Função para obter dados baseado no período selecionado
  const getFilteredDataByPeriod = (isCurrentPeriod: boolean): DataPoint[] => {
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      // Calcular período anterior com a mesma duração
      const periodDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStartDate = new Date(startDate);
      // Ajustar para o início do período anterior sem subtrair 1 dia manualmente
      previousStartDate.setDate(startDate.getDate() - periodDuration);
      const previousEndDate = new Date(previousStartDate);
      previousEndDate.setDate(previousStartDate.getDate() + periodDuration - 1);

      let targetStartDate: Date;
      let targetEndDate: Date;

      if (isCurrentPeriod) {
        // Período atual
        targetStartDate = startDate;
        targetEndDate = endDate;
      } else {
        // Período anterior
        targetStartDate = previousStartDate;
        targetEndDate = previousEndDate;
      }

      return processedData.filter((item) => {
        const itemDate = new Date(item.date);
        const isInDateRange = itemDate >= targetStartDate && itemDate <= targetEndDate;
        const isVehicleSelected = selectedVehicles.length === 0 || selectedVehicles.includes(item.platform);
        return isInDateRange && isVehicleSelected;
      });
    } else {
      // Lógica para últimos 7 dias
      const today = new Date();
      const endDate = new Date(today);
      const daysBack = isCurrentPeriod ? 0 : 7;
      endDate.setDate(today.getDate() - daysBack);

      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);

      return processedData.filter((item) => {
        const itemDate = new Date(item.date);
        const isInDateRange = itemDate >= startDate && itemDate <= endDate;
        const isVehicleSelected = selectedVehicles.length === 0 || selectedVehicles.includes(item.platform);
        return isInDateRange && isVehicleSelected;
      });
    }
  };

  // Calcular métricas semanais com tratamento de valores zerados
  const calculateWeeklyMetrics = (data: DataPoint[]): WeeklyMetrics => {
    const totalInvestment = data.reduce((sum, item) => {
      const costString = (item.cost || "R$ 0,00").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
      return sum + (Number.parseFloat(costString) || 0)
    }, 0)

    const totalImpressions = data.reduce((sum, item) => sum + (item.impressions || 0), 0)
    const totalClicks = data.reduce((sum, item) => sum + (item.clicks || item.linkClicks || 0), 0)
    const totalViews = data.reduce((sum, item) => sum + (item.visualizacoes || 0), 0)

    const cpm = totalImpressions > 0 ? (totalInvestment / totalImpressions) * 1000 : 0
    const cpc = totalClicks > 0 ? totalInvestment / totalClicks : 0
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const vtr = totalImpressions > 0 ? (totalViews / totalImpressions) * 100 : 0
    const cpv = totalViews > 0 ? totalInvestment / totalViews : 0

    return {
      investment: totalInvestment || 0,
      impressions: totalImpressions || 0,
      clicks: totalClicks || 0,
      views: totalViews || 0,
      cpm: cpm || 0,
      cpc: cpc || 0,
      ctr: ctr || 0,
      vtr: vtr || 0,
      cpv: cpv || 0,
    }
  }

  // Dados da análise semanal
  const weeklyComparison: WeeklyComparison = useMemo(() => {
    const currentWeekData = getFilteredDataByPeriod(true)
    const previousWeekData = getFilteredDataByPeriod(false)

    const current = calculateWeeklyMetrics(currentWeekData)
    const previous = calculateWeeklyMetrics(previousWeekData)

    const safeCalculatePercentage = (currentVal: number, previousVal: number): number => {
      if (!previousVal || previousVal === 0) return currentVal > 0 ? 100 : 0
      return ((currentVal - previousVal) / previousVal) * 100
    }

    const comparison = {
      investment: safeCalculatePercentage(current.investment, previous.investment),
      impressions: safeCalculatePercentage(current.impressions, previous.impressions),
      clicks: safeCalculatePercentage(current.clicks, previous.clicks),
      views: safeCalculatePercentage(current.views, previous.views),
      cpm: safeCalculatePercentage(current.cpm, previous.cpm),
      cpc: safeCalculatePercentage(current.cpc, previous.cpc),
      ctr: safeCalculatePercentage(current.ctr, previous.ctr),
      vtr: safeCalculatePercentage(current.vtr, previous.vtr),
      cpv: safeCalculatePercentage(current.cpv, previous.cpv),
    }

    return { current, previous, comparison }
  }, [processedData, selectedVehicles, dateRange])

  // Dados do gráfico semanal comparativo
  const weeklyChartData: ChartData[] = useMemo(() => {
    const currentWeekData = getFilteredDataByPeriod(true)
    const previousWeekData = getFilteredDataByPeriod(false)

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

      const safeParseFloat = (str: string): number => {
        const parsed = Number.parseFloat(str)
        return isNaN(parsed) ? 0 : parsed
      }

      switch (metric) {
        case "impressions":
          return dayData.reduce((sum, item) => sum + (item.impressions || 0), 0)
        case "clicks":
          return dayData.reduce((sum, item) => sum + (item.clicks || item.linkClicks || 0), 0)
        case "views":
          return dayData.reduce((sum, item) => sum + (item.visualizacoes || 0), 0)
        case "cpm":
          const totalCost = dayData.reduce((sum, item) => {
            const costString = (item.cost || "R$ 0,00").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
            return sum + safeParseFloat(costString)
          }, 0)
          const totalImpressions = dayData.reduce((sum, item) => sum + (item.impressions || 0), 0)
          return totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0
        case "cpc":
          const totalCostCpc = dayData.reduce((sum, item) => {
            const costString = (item.cost || "R$ 0,00").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
            return sum + safeParseFloat(costString)
          }, 0)
          const totalClicksCpc = dayData.reduce((sum, item) => sum + (item.clicks || item.linkClicks || 0), 0)
          return totalClicksCpc > 0 ? totalCostCpc / totalClicksCpc : 0
        case "cpv":
          const totalCostCpv = dayData.reduce((sum, item) => {
            const costString = (item.cost || "R$ 0,00").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
            return sum + safeParseFloat(costString)
          }, 0)
          const totalViewsCpv = dayData.reduce((sum, item) => sum + (item.visualizacoes || 0), 0)
          return totalViewsCpv > 0 ? totalCostCpv / totalViewsCpv : 0
        case "ctr":
          const totalImpressionsCtr = dayData.reduce((sum, item) => sum + (item.impressions || 0), 0)
          const totalClicksCtr = dayData.reduce((sum, item) => sum + (item.clicks || item.linkClicks || 0), 0)
          return totalImpressionsCtr > 0 ? (totalClicksCtr / totalImpressionsCtr) * 100 : 0
        case "vtr":
          const totalImpressionsVtr = dayData.reduce((sum, item) => sum + (item.impressions || 0), 0)
          const totalViewsVtr = dayData.reduce((sum, item) => sum + (item.visualizacoes || 0), 0)
          return totalImpressionsVtr > 0 ? (totalViewsVtr / totalImpressionsVtr) * 100 : 0
        default:
          return 0
      }
    }

    // Criar dados para o gráfico (apenas dias com dados)
    const currentData: Array<{ x: string; y: number }> = []
    const previousData: Array<{ x: string; y: number }> = []

    // Processar dados do período atual
    const currentDays = Object.keys(currentGrouped).sort((a, b) => {
      const [dayA, monthA] = a.split("/").map(Number);
      const [dayB, monthB] = b.split("/").map(Number);
      // Ajustar o mês para o índice baseado em 0
      const dateA = new Date(new Date().getFullYear(), monthA - 1, dayA);
      const dateB = new Date(new Date().getFullYear(), monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    currentDays.forEach((day) => {
      const value = getDayValue(currentGrouped[day], selectedMetric)
      if (value > 0) {
        currentData.push({ x: day, y: value })
      }
    })

    // Processar dados do período anterior
    const previousDays = Object.keys(previousGrouped).sort((a, b) => {
      const [dayA, monthA] = a.split("/").map(Number);
      const [dayB, monthB] = b.split("/").map(Number);
      // Ajustar o mês para o índice baseado em 0
      const dateA = new Date(new Date().getFullYear(), monthA - 1, dayA);
      const dateB = new Date(new Date().getFullYear(), monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });
    previousDays.forEach((day) => {
      const value = getDayValue(previousGrouped[day], selectedMetric)
      if (value > 0) {
        previousData.push({ x: day, y: value })
      }
    })

    const result: ChartData[] = []

    if (currentData.length > 0) {
      result.push({
        id: "Período Atual",
        data: currentData,
      })
    }

    if (previousData.length > 0) {
      result.push({
        id: "Período Anterior",
        data: previousData,
      })
    }

    return result
  }, [selectedMetric, processedData, selectedVehicles, dateRange])

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
    if (!value || isNaN(value)) return <Minus className="w-4 h-4 text-gray-400" />
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  // Função para obter cor da comparação
  const getComparisonColor = (value: number) => {
    if (!value || isNaN(value)) return "text-gray-400"
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-400"
  }

  // Função para obter escala do gráfico
  const getChartScale = (): { type: "linear"; min: "auto" | number; max: "auto" | number } => {
    if (["ctr", "vtr"].includes(selectedMetric)) {
      const maxValue = Math.min(
        100,
        Math.max(...weeklyChartData.flatMap((series) => series.data.map((d) => d.y))) * 1.002,
      )
      return { type: "linear", min: 0, max: maxValue }
    }

    return { type: "linear", min: "auto", max: "auto" }
  }

  return (
    <div ref={contentRef} className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Análise de Período</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            <span>Comparativo de Períodos</span>
          </div>
          
          <PDFDownloadButton contentRef={contentRef} fileName="analise-de-periodo" />
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

      {/* Cards da Análise de Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card Investimento */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center space-x-1">
              {renderComparisonIcon(weeklyComparison.comparison.investment)}
              <span className={`text-sm font-semibold ${getComparisonColor(weeklyComparison.comparison.investment)}`}>
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
              <span className={`text-sm font-semibold ${getComparisonColor(weeklyComparison.comparison.impressions)}`}>
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
              <span className={`text-sm font-semibold ${getComparisonColor(weeklyComparison.comparison.clicks)}`}>
                {Math.abs(weeklyComparison.comparison.clicks).toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Cliques</p>
            <p className="text-lg font-bold text-gray-900">{weeklyComparison.current.clicks.toLocaleString("pt-BR")}</p>
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
              <span className={`text-sm font-semibold ${getComparisonColor(weeklyComparison.comparison.views)}`}>
                {Math.abs(weeklyComparison.comparison.views).toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Views</p>
            <p className="text-lg font-bold text-gray-900">{weeklyComparison.current.views.toLocaleString("pt-BR")}</p>
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
            <p className="text-xs text-gray-500 mt-1">Comparativo período atual vs. anterior</p>
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

      {/* Área do Gráfico e Informações */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Gráfico */}
        <div className="lg:col-span-3 card-overlay rounded-lg shadow-lg p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Comparativo de Períodos - {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
          </h3>
          <div className="flex-1" style={{ minHeight: "400px" }}>
            {weeklyChartData.length > 0 && weeklyChartData.some(series => series.data.length > 0) ? (
              <ResponsiveLine
                data={weeklyChartData}
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
                  legend: "Dia/Mês",
                  legendOffset: 60,
                  legendPosition: "middle",
                  format: (value) => value, // Garantir que o valor seja exibido como está (DD/MM)
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: 0,
                  legend: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
                  legendOffset: -65,
                  legendPosition: "middle",
                  format: (value) => {
                    if (["ctr", "vtr"].includes(selectedMetric)) {
                      return `${value.toFixed(1)}%`
                    }
                    if (["cpm", "cpc", "cpv"].includes(selectedMetric)) {
                      return `R$ ${value.toFixed(2)}`
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
                colors={["#fbbf24", "#3b82f6"]}
                lineWidth={3}
                enableArea={false}
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
                    <div className="text-sm font-medium text-gray-900">Dia: {point.data.x}</div>
                    <div className="text-sm text-gray-600">
                      {point.seriesId}:{" "}
                      {["ctr", "vtr"].includes(selectedMetric)
                        ? `${(point.data.y as number).toFixed(2)}%`
                        : ["cpm", "cpc", "cpv"].includes(selectedMetric)
                          ? `R$ ${(point.data.y as number).toFixed(2)}`
                          : (point.data.y as number).toLocaleString("pt-BR")}
                    </div>
                  </div>
                )}
                legends={[
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
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Não há dados disponíveis para o período selecionado</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Painel de Controle da Métrica */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Métrica</h3>
          <div className="space-y-2">
            {[
              { key: "impressions", label: "Impressões", icon: TrendingUp },
              { key: "clicks", label: "Cliques", icon: MousePointer },
              { key: "views", label: "Visualizações", icon: Eye },
              { key: "cpm", label: "CPM", icon: DollarSign },
              { key: "cpc", label: "CPC", icon: DollarSign },
              { key: "cpv", label: "CPV", icon: DollarSign },
              { key: "ctr", label: "CTR", icon: BarChart3 },
              { key: "vtr", label: "VTR", icon: BarChart3 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as typeof selectedMetric)}
                className={`w-full p-3 rounded-lg text-left transition-colors duration-200 flex items-center space-x-3 ${
                  selectedMetric === key
                    ? "bg-blue-50 border-blue-200 text-blue-700 border-2"
                    : "bg-gray-50 border-gray-200 text-gray-600 border hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Resumo da Métrica Selecionada */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumo da Métrica</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Atual:</span>
                <span className="font-medium">
                  {selectedMetric === "impressions" &&
                    weeklyComparison.current.impressions.toLocaleString("pt-BR")}
                  {selectedMetric === "clicks" && weeklyComparison.current.clicks.toLocaleString("pt-BR")}
                  {selectedMetric === "views" && weeklyComparison.current.views.toLocaleString("pt-BR")}
                  {selectedMetric === "cpm" && formatCurrency(weeklyComparison.current.cpm)}
                  {selectedMetric === "cpc" && formatCurrency(weeklyComparison.current.cpc)}
                  {selectedMetric === "cpv" && formatCurrency(weeklyComparison.current.cpv)}
                  {selectedMetric === "ctr" && `${weeklyComparison.current.ctr.toFixed(2)}%`}
                  {selectedMetric === "vtr" && `${weeklyComparison.current.vtr.toFixed(2)}%`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Anterior:</span>
                <span className="font-medium">
                  {selectedMetric === "impressions" &&
                    weeklyComparison.previous.impressions.toLocaleString("pt-BR")}
                  {selectedMetric === "clicks" && weeklyComparison.previous.clicks.toLocaleString("pt-BR")}
                  {selectedMetric === "views" && weeklyComparison.previous.views.toLocaleString("pt-BR")}
                  {selectedMetric === "cpm" && formatCurrency(weeklyComparison.previous.cpm)}
                  {selectedMetric === "cpc" && formatCurrency(weeklyComparison.previous.cpc)}
                  {selectedMetric === "cpv" && formatCurrency(weeklyComparison.previous.cpv)}
                  {selectedMetric === "ctr" && `${weeklyComparison.previous.ctr.toFixed(2)}%`}
                  {selectedMetric === "vtr" && `${weeklyComparison.previous.vtr.toFixed(2)}%`}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Variação:</span>
                <span
                  className={`font-semibold ${getComparisonColor(
                    weeklyComparison.comparison[selectedMetric]
                  )}`}
                >
                  {weeklyComparison.comparison[selectedMetric] > 0 ? "+" : ""}
                  {weeklyComparison.comparison[selectedMetric].toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnaliseSemanal