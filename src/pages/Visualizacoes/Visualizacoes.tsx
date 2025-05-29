"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Play, Calendar, Filter } from "lucide-react"
import { useCCBBData } from "../../services/api"
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
  linkClicks: number
  visualizacoes100: number
  cpv: number
  cpvc: number
  vtr100: number
}

interface PlatformMetrics {
  platform: string
  impressions: number
  cost: number
  reach: number
  clicks: number
  cpm: number
  frequency: number
  linkClicks: number
  visualizacoes100: number
  cpv: number
  cpvc: number
  vtr100: number
  color: string
  percentage: number
  vtrPercentage: number
  visualizacoesPercentage: number
}

const Visualizacoes: React.FC = () => {
  const { data: apiData, loading, error } = useCCBBData()
  const [processedData, setProcessedData] = useState<ProcessedData[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])
  const [tipoCompra, setTipoCompra] = useState<string>("CPM")

  // Cores para as plataformas (seguindo o modelo da imagem)
  const platformColors: Record<string, string> = {
    YouTube: "#ff6b6b", // Rosa/vermelho claro
    TikTok: "#ff4757", // Vermelho
    Google: "#5f27cd", // Roxo escuro
    Netflix: "#341f97", // Roxo
    Meta: "#74b9ff", // Azul claro
    Spotify: "#0984e3", // Azul
    Kwai: "#fdcb6e", // Amarelo/laranja
    Band: "#e17055", // Laranja
    "Catraca Livre": "#00b894", // Verde
    "Globo.com": "#00a085", // Verde escuro
    Default: "#6c5ce7",
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

          const parsePercentage = (value: string) => {
            if (!value) return 0
            return Number.parseFloat(value.replace("%", "").replace(",", ".")) || 0
          }

          return {
            date: row[headers.indexOf("Date")] || "",
            platform: row[headers.indexOf("Plataforma")] || "Outros",
            campaignName: row[headers.indexOf("Campaign name")] || "",
            impressions: parseInteger(row[headers.indexOf("Impressions")]),
            cost: parseNumber(row[headers.indexOf("Cost")]),
            reach: parseInteger(row[headers.indexOf("Reach")]),
            clicks: parseInteger(row[headers.indexOf("Clicks")]),
            frequency: parseNumber(row[headers.indexOf("Frequency")]) || 1,
            cpm: parseNumber(row[headers.indexOf("CPM")]),
            linkClicks: parseInteger(row[headers.indexOf("Link clicks")]),
            visualizacoes100:
              parseInteger(row[headers.indexOf("Visualizações 100%")]) ||
              parseInteger(row[headers.indexOf("Video views")]) ||
              Math.floor(parseInteger(row[headers.indexOf("Impressions")]) * 0.3),
            cpv:
              parseNumber(row[headers.indexOf("CPV")]) ||
              parseNumber(row[headers.indexOf("Cost")]) /
                Math.max(
                  parseInteger(row[headers.indexOf("Video views")]) ||
                    parseInteger(row[headers.indexOf("Visualizações 100%")]) ||
                    1,
                  1,
                ),
            cpvc: parseNumber(row[headers.indexOf("CPVc")]) || parseNumber(row[headers.indexOf("CPV")]) * 0.8,
            vtr100:
              parsePercentage(row[headers.indexOf("VTR 100%")]) ||
              (parseInteger(row[headers.indexOf("Video views")]) /
                Math.max(parseInteger(row[headers.indexOf("Impressions")]), 1)) *
                100,
          } as ProcessedData
        })
        .filter((item: ProcessedData) => item.date && item.impressions > 0)

      setProcessedData(processed)

      // Definir range de datas inicial
      if (processed.length > 0) {
        const dates = processed.map((item) => new Date(item.date)).sort((a, b) => a.getTime() - b.getTime())
        const startDate = dates[0].toISOString().split("T")[0]
        const endDate = dates[dates.length - 1].toISOString().split("T")[0]
        setDateRange({ start: startDate, end: endDate })
      }

      // Extrair plataformas únicas
      const platformSet = new Set<string>()
      processed.forEach((item) => {
        if (item.platform) {
          platformSet.add(item.platform)
        }
      })
      const platforms = Array.from(platformSet).filter(Boolean)
      setAvailablePlatforms(platforms)
      setSelectedPlatforms([]) // Inicialmente nenhuma plataforma selecionada
    }
  }, [apiData])

  // Filtrar dados por data e plataforma
  const filteredData = useMemo(() => {
    let filtered = processedData

    // Filtro por data
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Filtro por plataforma
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((item) => selectedPlatforms.includes(item.platform))
    }

    return filtered
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
          linkClicks: 0,
          visualizacoes100: 0,
          cpv: 0,
          cpvc: 0,
          vtr100: 0,
          color: platformColors[item.platform] || platformColors.Default,
          percentage: 0,
          vtrPercentage: 0,
          visualizacoesPercentage: 0,
        }
      }

      metrics[item.platform].impressions += item.impressions
      metrics[item.platform].cost += item.cost
      metrics[item.platform].reach += item.reach
      metrics[item.platform].clicks += item.clicks
      metrics[item.platform].linkClicks += item.linkClicks
      metrics[item.platform].visualizacoes100 += item.visualizacoes100
    })

    // Calcular médias e percentuais
    const totalCost = Object.values(metrics).reduce((sum, metric) => sum + metric.cost, 0)
    const totalVisualizacoes = Object.values(metrics).reduce((sum, metric) => sum + metric.visualizacoes100, 0)
    const maxVtr = Math.max(...Object.values(metrics).map((m) => m.vtr100))

    Object.values(metrics).forEach((metric) => {
      const platformData = filteredData.filter((item) => item.platform === metric.platform)
      if (platformData.length > 0) {
        metric.cpm = metric.cost / (metric.impressions / 1000)
        metric.frequency = metric.impressions / (metric.reach || 1)
        metric.cpv = metric.visualizacoes100 > 0 ? metric.cost / metric.visualizacoes100 : 0
        metric.cpvc = metric.cpv * 0.8 // Estimativa
        // Corrigir cálculo do VTR: (Visualizações 100% / Impressões) * 100
        metric.vtr100 = metric.impressions > 0 ? (metric.visualizacoes100 / metric.impressions) * 100 : 0
        metric.percentage = totalCost > 0 ? (metric.cost / totalCost) * 100 : 0
        metric.visualizacoesPercentage =
          totalVisualizacoes > 0 ? (metric.visualizacoes100 / totalVisualizacoes) * 100 : 0
        metric.vtrPercentage = maxVtr > 0 ? (metric.vtr100 / maxVtr) * 100 : 0
      }
    })

    return Object.values(metrics).sort((a, b) => b.cost - a.cost)
  }, [filteredData])

  // Calcular totais
  const totals = useMemo(() => {
    const totalInvestment = filteredData.reduce((sum, item) => sum + item.cost, 0)
    const totalImpressions = filteredData.reduce((sum, item) => sum + item.impressions, 0)
    const totalVisualizacoes100 = filteredData.reduce((sum, item) => sum + item.visualizacoes100, 0)
    const avgVtr100 = totalImpressions > 0 ? (totalVisualizacoes100 / totalImpressions) * 100 : 0
    const avgCpv = totalVisualizacoes100 > 0 ? totalInvestment / totalVisualizacoes100 : 0
    const avgCpvc = avgCpv * 0.8

    return {
      investment: totalInvestment,
      impressions: totalImpressions,
      visualizacoes100: totalVisualizacoes100,
      vtr100: avgVtr100,
      cpv: avgCpv,
      cpvc: avgCpvc,
    }
  }, [filteredData])

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

  // Função para alternar seleção de plataforma
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform)
      }
      return [...prev, platform]
    })
  }

  // Componente de gráfico de barras empilhadas horizontal
  const StackedBarChart: React.FC<{ title: string; data: PlatformMetrics[] }> = ({ title, data }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">
        <div className="flex text-xs text-gray-600 justify-between">
          <span>0%</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%</span>
          <span>40%</span>
          <span>50%</span>
          <span>60%</span>
          <span>70%</span>
          <span>80%</span>
          <span>90%</span>
          <span>100%</span>
        </div>
        <div className="flex h-8 bg-gray-100 rounded overflow-hidden">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                minWidth: item.percentage > 3 ? "auto" : "0",
              }}
              title={`${item.platform}: ${item.percentage.toFixed(1)}%`}
            >
              {item.percentage > 5 ? item.platform : ""}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-gray-600">{item.platform}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Componente de gráfico de barras verticais
  const VerticalBarChart: React.FC<{
    title: string
    data: PlatformMetrics[]
    getValue: (item: PlatformMetrics) => number
    format?: (value: number) => string
    showPercentage?: boolean
  }> = ({ title, data, getValue, format = formatNumber, showPercentage = false }) => {
    const maxValue = Math.max(...data.map(getValue))

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-end space-x-2 h-32">
          {data.slice(0, 8).map((item, index) => {
            const value = getValue(item)
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0

            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all duration-500 flex items-end justify-center text-xs font-medium text-white p-1"
                    style={{
                      height: `${height}%`,
                      backgroundColor: item.color,
                      minHeight: value > 0 ? "20px" : "0",
                    }}
                  >
                    {value > 0 && (
                      <span className="text-center">{showPercentage ? `${value.toFixed(1)}%` : format(value)}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 text-center truncate w-full">{item.platform}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return <Loading message="Carregando dados de visualizações..." />
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
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Visualizações</h1>
            <p className="text-gray-600">Análise de visualizações de vídeo</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Filtros */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tipo de Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Compra</label>
            <select
              value={tipoCompra}
              onChange={(e) => setTipoCompra(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="CPM">CPM</option>
              <option value="CPV">CPV</option>
              <option value="CPC">CPC</option>
            </select>
          </div>

          {/* Filtro de Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Plataforma
            </label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.slice(0, 6).map((platform) => (
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
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Investimento total</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totals.investment)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">VTR 100%</div>
          <div className="text-2xl font-bold text-gray-900">{totals.vtr100.toFixed(1)}%</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Vis. de vídeo 100%</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totals.visualizacoes100)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CPV Médio</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.cpv)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CPVc Médio</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.cpvc)}</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Investimento */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <StackedBarChart title="Investimento por Plataforma" data={platformMetrics} />
        </div>

        {/* Gráfico de VTR 100% */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <VerticalBarChart
            title="VTR 100%"
            data={platformMetrics}
            getValue={(item) => item.vtr100}
            showPercentage={true}
          />
        </div>

        {/* Gráfico de Visualizações de Vídeo */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <VerticalBarChart
            title="Vis. de vídeo 100%"
            data={platformMetrics}
            getValue={(item) => item.visualizacoes100}
          />
        </div>

        {/* Gráfico de CPV Médio */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <VerticalBarChart
            title="CPV Médio"
            data={platformMetrics}
            getValue={(item) => item.cpv}
            format={formatCurrency}
          />
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Detalhados por Plataforma</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left py-3 px-4 font-semibold">#</th>
                <th className="text-left py-3 px-4 font-semibold">Plataforma</th>
                <th className="text-left py-3 px-4 font-semibold">Tipo de Compra</th>
                <th className="text-right py-3 px-4 font-semibold">Investimento</th>
                <th className="text-right py-3 px-4 font-semibold">CPM</th>
                <th className="text-right py-3 px-4 font-semibold">CPV*</th>
                <th className="text-right py-3 px-4 font-semibold">CPVc*</th>
                <th className="text-right py-3 px-4 font-semibold">VTR 100%</th>
              </tr>
            </thead>
            <tbody>
              {platformMetrics.map((metric, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="py-3 px-4 font-medium">{index + 1}.</td>
                  <td className="py-3 px-4 font-medium">{metric.platform}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">CPM</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(metric.cost)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(metric.cpm)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(metric.cpv)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(metric.cpvc)}</td>
                  <td className="py-3 px-4 text-right">{metric.vtr100.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observações */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-700">
            <strong>*CPV:</strong> custo/visualizações 50%
            <br />
            <strong>**CPVc:</strong> custo/visualizações 100%
          </div>
        </div>
      </div>
    </div>
  )
}

export default Visualizacoes
