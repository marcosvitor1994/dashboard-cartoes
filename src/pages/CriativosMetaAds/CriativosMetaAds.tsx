"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Share2, Calendar, Filter, ExternalLink } from "lucide-react"
import { useMetaCCBBData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface CreativeData {
  date: string
  campaignName: string
  adName: string
  destinationUrl: string
  imageUrl: string
  impressions: number
  reach: number
  linkClicks: number
  cost: number
  videoWatches100: number
  videoWatches50: number
  threeSecondViews: number
  cpm: number
  ctr: number
  vtr: number
}

const CriativosMetaAds: React.FC = () => {
  const { data: apiData, loading, error } = useMetaCCBBData()
  const [processedData, setProcessedData] = useState<CreativeData[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Processar dados da API
  useEffect(() => {
    if (apiData?.values) {
      const headers = apiData.values[0]
      const rows = apiData.values.slice(1)

      const processed: CreativeData[] = rows
        .map((row: string[]) => {
          const parseNumber = (value: string) => {
            if (!value) return 0
            return Number.parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".")) || 0
          }

          const parseInteger = (value: string) => {
            if (!value) return 0
            return Number.parseInt(value.replace(/[.\s]/g, "").replace(",", "")) || 0
          }

          const impressions = parseInteger(row[headers.indexOf("Impressions")])
          const reach = parseInteger(row[headers.indexOf("Reach")])
          const linkClicks = parseInteger(row[headers.indexOf("Link clicks")])
          const cost = parseNumber(row[headers.indexOf("Cost")])
          const videoWatches100 = parseInteger(row[headers.indexOf("Video watches at 100%")])
          const videoWatches50 = parseInteger(row[headers.indexOf("Video watches at 50%")])
          const threeSecondViews = parseInteger(row[headers.indexOf("Three-second video views")])

          return {
            date: row[headers.indexOf("Date")] || "",
            campaignName: row[headers.indexOf("Campaign name")] || "",
            adName: row[headers.indexOf("Ad name")] || "",
            destinationUrl: row[headers.indexOf("Destination URL")] || "",
            imageUrl: row[headers.indexOf("Ad creative image URL")] || "",
            impressions,
            reach,
            linkClicks,
            cost,
            videoWatches100,
            videoWatches50,
            threeSecondViews,
            cpm: impressions > 0 ? cost / (impressions / 1000) : 0,
            ctr: impressions > 0 ? (linkClicks / impressions) * 100 : 0,
            // Corrigir cálculo do VTR: (Visualizações 100% / Impressões) * 100
            vtr: impressions > 0 ? (videoWatches100 / impressions) * 100 : 0,
          } as CreativeData
        })
        .filter((item: CreativeData) => item.date && item.impressions > 0)

      // Agrupar por criativo (mesmo ad name) e somar métricas
      const groupedData: Record<string, CreativeData> = {}
      processed.forEach((item) => {
        const key = `${item.adName}_${item.imageUrl}`
        if (!groupedData[key]) {
          groupedData[key] = { ...item }
        } else {
          groupedData[key].impressions += item.impressions
          groupedData[key].reach += item.reach
          groupedData[key].linkClicks += item.linkClicks
          groupedData[key].cost += item.cost
          groupedData[key].videoWatches100 += item.videoWatches100
          groupedData[key].videoWatches50 += item.videoWatches50
          groupedData[key].threeSecondViews += item.threeSecondViews
        }
      })

      // Recalcular métricas derivadas
      const finalData = Object.values(groupedData).map((item) => ({
        ...item,
        cpm: item.impressions > 0 ? item.cost / (item.impressions / 1000) : 0,
        ctr: item.impressions > 0 ? (item.linkClicks / item.impressions) * 100 : 0,
        // Corrigir cálculo do VTR: (Visualizações 100% / Impressões) * 100
        vtr: item.impressions > 0 ? (item.videoWatches100 / item.impressions) * 100 : 0,
      }))

      // Ordenar por investimento (custo) decrescente
      finalData.sort((a, b) => b.cost - a.cost)

      setProcessedData(finalData)

      // Definir range de datas inicial
      if (processed.length > 0) {
        const dates = processed.map((item) => new Date(item.date)).sort((a, b) => a.getTime() - b.getTime())
        const startDate = dates[0].toISOString().split("T")[0]
        const endDate = dates[dates.length - 1].toISOString().split("T")[0]
        setDateRange({ start: startDate, end: endDate })
      }

      // Extrair campanhas únicas
      const campaignSet = new Set<string>()
      processed.forEach((item) => {
        if (item.campaignName) {
          campaignSet.add(item.campaignName)
        }
      })
      const campaigns = Array.from(campaignSet).filter(Boolean)
      setAvailableCampaigns(campaigns)
    }
  }, [apiData])

  // Filtrar dados
  const filteredData = useMemo(() => {
    let filtered = processedData

    // Filtro por campanha
    if (selectedCampaign) {
      filtered = filtered.filter((item) => item.campaignName.includes(selectedCampaign))
    }

    return filtered
  }, [processedData, selectedCampaign])

  // Paginação
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Calcular totais
  const totals = useMemo(() => {
    return {
      investment: filteredData.reduce((sum, item) => sum + item.cost, 0),
      impressions: filteredData.reduce((sum, item) => sum + item.impressions, 0),
      reach: filteredData.reduce((sum, item) => sum + item.reach, 0),
      linkClicks: filteredData.reduce((sum, item) => sum + item.linkClicks, 0),
      avgCpm: 0,
      avgCtr: 0,
      avgVtr: 0,
    }
  }, [filteredData])

  // Calcular médias
  if (filteredData.length > 0) {
    totals.avgCpm = totals.impressions > 0 ? totals.investment / (totals.impressions / 1000) : 0
    totals.avgCtr = totals.impressions > 0 ? (totals.linkClicks / totals.impressions) * 100 : 0
    totals.avgVtr = filteredData.reduce((sum, item) => sum + item.vtr, 0) / filteredData.length
  }

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

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Função para truncar texto
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return <Loading message="Carregando criativos Meta Ads..." />
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
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Criativos Meta</h1>
            <p className="text-gray-600">Performance dos criativos no Facebook e Instagram</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
            Última atualização: {new Date().toLocaleString("pt-BR")}
          </div>
          <select
            value={`${dateRange.start} - ${dateRange.end}`}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Selecionar período</option>
          </select>
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

          {/* Filtro de Campanha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Campanha
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Todas as campanhas</option>
              {availableCampaigns.map((campaign, index) => (
                <option key={index} value={campaign}>
                  {truncateText(campaign, 50)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Criativo</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option>Todos os tipos</option>
              <option>Display</option>
              <option>Vídeo</option>
              <option>Carrossel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Investimento</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(totals.investment)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Impressões</div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totals.impressions)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Alcance</div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totals.reach)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Cliques no Link</div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totals.linkClicks)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CPM</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(totals.avgCpm)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CTR</div>
          <div className="text-lg font-bold text-gray-900">{totals.avgCtr.toFixed(2)}%</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">VTR</div>
          <div className="text-lg font-bold text-gray-900">{totals.avgVtr.toFixed(2)}%</div>
        </div>
      </div>

      {/* Tabela de Criativos */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left py-3 px-4 font-semibold">Imagem</th>
                <th className="text-left py-3 px-4 font-semibold">Criativo</th>
                <th className="text-right py-3 px-4 font-semibold">Investimento</th>
                <th className="text-right py-3 px-4 font-semibold">Impressões</th>
                <th className="text-right py-3 px-4 font-semibold">Alcance</th>
                <th className="text-right py-3 px-4 font-semibold">Cliques no Link</th>
                <th className="text-right py-3 px-4 font-semibold">CPM</th>
                <th className="text-right py-3 px-4 font-semibold">VTR</th>
                <th className="text-center py-3 px-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((creative, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="py-3 px-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {creative.imageUrl ? (
                        <img
                          src={creative.imageUrl || "/placeholder.svg"}
                          alt="Criativo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.parentElement!.innerHTML = '<div class="text-gray-400 text-xs">Sem imagem</div>'
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">Sem imagem</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 text-sm">{truncateText(creative.adName, 60)}</p>
                      <p className="text-xs text-gray-500 mt-1">{truncateText(creative.campaignName, 40)}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(creative.cost)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(creative.impressions)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(creative.reach)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(creative.linkClicks)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(creative.cpm)}</td>
                  <td className="py-3 px-4 text-right">{creative.vtr.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center">
                    {creative.destinationUrl && (
                      <a
                        href={creative.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Abrir URL de destino"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} criativos
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CriativosMetaAds
