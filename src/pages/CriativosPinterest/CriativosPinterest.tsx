"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Calendar, Filter } from "lucide-react"
import { useCartaoPinterestData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface CreativeData {
  date: string
  advertiserName: string
  campaignName: string
  adGroupName: string
  destinationUrl: string
  promotedPinName: string
  promotedPinStatus: string
  creativeType: string
  impressions: number
  reach: number
  frequency: number
  clicks: number
  ctr: number
  outboundClicks: number
  cpm: number
  cpc: number
  cost: number
  videoStartsPaid: number
  videoViewsPaid: number
  videoAvgWatchTime: number
  videoViews100Paid: number
  videoViews25Paid: number
  videoViews50Paid: number
  videoViews75Paid: number
  engagements: number
}

const CriativosPinterest: React.FC = () => {
  const { data: apiData, loading, error } = useCartaoPinterestData()
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
            if (!value || value === "") return 0
            return Number.parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".")) || 0
          }

          const parseInteger = (value: string) => {
            if (!value || value === "") return 0
            return Number.parseInt(value.replace(/[.\s]/g, "").replace(",", "")) || 0
          }

          const date = row[headers.indexOf("Date")] || ""
          const advertiserName = row[headers.indexOf("Advertiser name")] || ""
          const campaignName = row[headers.indexOf("Campaign name")] || ""
          const adGroupName = row[headers.indexOf("Ad group name")] || ""
          const destinationUrl = row[headers.indexOf("Destination URL")] || ""
          const promotedPinName = row[headers.indexOf("Promoted pin name")] || ""
          const promotedPinStatus = row[headers.indexOf("Promoted pin status")] || ""
          const creativeType = row[headers.indexOf("Creative type")] || ""
          const impressions = parseInteger(row[headers.indexOf("Impressions")])
          const reach = parseInteger(row[headers.indexOf("Reach")])
          const frequency = parseNumber(row[headers.indexOf("Frequency")])
          const clicks = parseInteger(row[headers.indexOf("Clicks")])
          const ctr = parseNumber(row[headers.indexOf("CTR")])
          const outboundClicks = parseInteger(row[headers.indexOf("Outbound clicks")])
          const cpm = parseNumber(row[headers.indexOf("CPM")])
          const cpc = parseNumber(row[headers.indexOf("CPC")])
          const cost = parseNumber(row[headers.indexOf("Cost")])
          const videoStartsPaid = parseInteger(row[headers.indexOf("Video starts paid")])
          const videoViewsPaid = parseInteger(row[headers.indexOf("Video views paid")])
          const videoAvgWatchTime = parseNumber(row[headers.indexOf("Video avg. watch time (s) paid")])
          const videoViews100Paid = parseInteger(row[headers.indexOf("Video views at 100% paid")])
          const videoViews25Paid = parseInteger(row[headers.indexOf("Video views at 25% paid")])
          const videoViews50Paid = parseInteger(row[headers.indexOf("Video views at 50% paid")])
          const videoViews75Paid = parseInteger(row[headers.indexOf("Video views at 75% paid")])
          const engagements = parseInteger(row[headers.indexOf("Engagements")])

          return {
            date,
            advertiserName,
            campaignName,
            adGroupName,
            destinationUrl,
            promotedPinName,
            promotedPinStatus,
            creativeType,
            impressions,
            reach,
            frequency,
            clicks,
            ctr,
            outboundClicks,
            cpm,
            cpc,
            cost,
            videoStartsPaid,
            videoViewsPaid,
            videoAvgWatchTime,
            videoViews100Paid,
            videoViews25Paid,
            videoViews50Paid,
            videoViews75Paid,
            engagements,
          } as CreativeData
        })
        .filter((item: CreativeData) => item.date && item.impressions > 0)

      // Agrupar por criativo (mesmo promoted pin name) e somar métricas
      const groupedData: Record<string, CreativeData> = {}
      processed.forEach((item) => {
        const key = `${item.promotedPinName}_${item.campaignName}`
        if (!groupedData[key]) {
          groupedData[key] = { ...item }
        } else {
          groupedData[key].impressions += item.impressions
          groupedData[key].reach += item.reach
          groupedData[key].clicks += item.clicks
          groupedData[key].cost += item.cost
          groupedData[key].outboundClicks += item.outboundClicks
          groupedData[key].videoStartsPaid += item.videoStartsPaid
          groupedData[key].videoViewsPaid += item.videoViewsPaid
          groupedData[key].videoViews100Paid += item.videoViews100Paid
          groupedData[key].videoViews25Paid += item.videoViews25Paid
          groupedData[key].videoViews50Paid += item.videoViews50Paid
          groupedData[key].videoViews75Paid += item.videoViews75Paid
          groupedData[key].engagements += item.engagements
        }
      })

      // Recalcular métricas derivadas
      const finalData = Object.values(groupedData).map((item) => ({
        ...item,
        cpm: item.impressions > 0 ? item.cost / (item.impressions / 1000) : 0,
        cpc: item.clicks > 0 ? item.cost / item.clicks : 0,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        frequency: item.reach > 0 ? item.impressions / item.reach : 0,
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

    // Filtro por período
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Filtro por campanha
    if (selectedCampaign) {
      filtered = filtered.filter((item) => item.campaignName.includes(selectedCampaign))
    }

    return filtered
  }, [processedData, selectedCampaign, dateRange])

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
      clicks: filteredData.reduce((sum, item) => sum + item.clicks, 0),
      outboundClicks: filteredData.reduce((sum, item) => sum + item.outboundClicks, 0),
      engagements: filteredData.reduce((sum, item) => sum + item.engagements, 0),
      avgCpm: 0,
      avgCpc: 0,
      avgFrequency: 0,
      ctr: 0,
    }
  }, [filteredData])

  // Calcular médias
  if (filteredData.length > 0) {
    totals.avgCpm = totals.impressions > 0 ? totals.investment / (totals.impressions / 1000) : 0
    totals.avgCpc = totals.clicks > 0 ? totals.investment / totals.clicks : 0
    totals.avgFrequency = totals.reach > 0 ? totals.impressions / totals.reach : 0
    totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
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
    return <Loading message="Carregando criativos Pinterest..." />
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
          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.813 1.604.813 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.027-4.625 4.235 0 1.027.547 2.305 1.422 2.712.142.062.217.035.251-.097l.296-1.154c.038-.148.023-.196-.088-.322-.243-.275-.425-.713-.425-1.197 0-1.292.967-2.531 2.608-2.531 1.423 0 2.408.973 2.408 2.361 0 1.588-.632 2.713-1.425 2.713-.456 0-.796-.387-.687-.857l.313-1.228c.092-.366.277-1.495.277-1.854 0-.428-.229-.784-.706-.784-.559 0-1.006.577-1.006 1.35 0 .493.167.827.167.827s-.574 2.43-.675 2.85c-.128.538-.057 1.319-.03 1.742C5.867 18.06 2 15.414 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Criativos Pinterest</h1>
            <p className="text-gray-600">Performance dos criativos na plataforma Pinterest</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
            Última atualização: {new Date().toLocaleString("pt-BR")}
          </div>
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">Todas as campanhas</option>
              {availableCampaigns.map((campaign, index) => (
                <option key={index} value={campaign}>
                  {truncateText(campaign, 50)}
                </option>
              ))}
            </select>
          </div>

          {/* Informações adicionais */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total de Pins</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {filteredData.length} pins encontrados
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
          <div className="text-sm text-gray-600 mb-1">Cliques</div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totals.clicks)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Cliques Saída</div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totals.outboundClicks)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CPM</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(totals.avgCpm)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CPC</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(totals.avgCpc)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">CTR</div>
          <div className="text-lg font-bold text-gray-900">{totals.ctr.toFixed(2)}%</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Engajamentos</div>
          <div className="text-lg font-bold text-gray-900">{formatNumber(totals.engagements)}</div>
        </div>
      </div>

      {/* Tabela de Criativos */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="text-left py-3 px-4 font-semibold">Pin</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-right py-3 px-4 font-semibold">Investimento</th>
                <th className="text-right py-3 px-4 font-semibold">Impressões</th>
                <th className="text-right py-3 px-4 font-semibold">Alcance</th>
                <th className="text-right py-3 px-4 font-semibold">Cliques</th>
                <th className="text-right py-3 px-4 font-semibold">Cliques Saída</th>
                <th className="text-right py-3 px-4 font-semibold">Engajamentos</th>
                <th className="text-right py-3 px-4 font-semibold">CTR</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((creative, index) => {
                return (
                  <tr key={index} className={index % 2 === 0 ? "bg-red-50" : "bg-white"}>
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 text-sm">{truncateText(creative.promotedPinName, 60)}</p>
                        <p className="text-xs text-gray-500 mt-1">{truncateText(creative.campaignName, 40)}</p>
                        <p className="text-xs text-gray-400 mt-1">{creative.creativeType || "REGULAR"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        creative.promotedPinStatus === "ACTIVE" 
                          ? "bg-green-100 text-green-800" 
                          : creative.promotedPinStatus === "PAUSED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {creative.promotedPinStatus || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{formatCurrency(creative.cost)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(creative.impressions)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(creative.reach)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(creative.clicks)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(creative.outboundClicks)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(creative.engagements)}</td>
                    <td className="py-3 px-4 text-right">{creative.ctr.toFixed(2)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} pins
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

export default CriativosPinterest