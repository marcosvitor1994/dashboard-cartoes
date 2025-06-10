"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Video, Calendar, Filter } from "lucide-react"
import { useCartaoTikTokData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface CreativeData {
  date: string
  campaignName: string
  adGroupName: string
  adName: string
  adText: string
  videoThumbnailUrl: string
  impressions: number
  clicks: number
  cost: number
  cpc: number
  cpm: number
  reach: number
  frequency: number
  results: number
  videoViews: number
  twoSecondVideoViews: number
  videoViews25: number
  videoViews50: number
  videoViews75: number
  videoViews100: number
  profileVisits: number
  paidLikes: number
  paidComments: number
  paidShares: number
  paidFollows: number
}

const CriativosTikTok: React.FC = () => {
  const { data: apiData, loading, error } = useCartaoTikTokData()
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
          const campaignName = row[headers.indexOf("Campaign name")] || ""
          const adGroupName = row[headers.indexOf("Ad group name")] || ""
          const adName = row[headers.indexOf("Ad name")] || ""
          const adText = row[headers.indexOf("Ad text")] || ""
          const videoThumbnailUrl = row[headers.indexOf("Video thumbnail URL")] || ""
          const impressions = parseInteger(row[headers.indexOf("Impressions")])
          const clicks = parseInteger(row[headers.indexOf("Clicks")])
          const cost = parseNumber(row[headers.indexOf("Cost")])
          const cpc = parseNumber(row[headers.indexOf("CPC")])
          const cpm = parseNumber(row[headers.indexOf("CPM")])
          const reach = parseInteger(row[headers.indexOf("Reach")])
          const frequency = parseNumber(row[headers.indexOf("Frequency")])
          const results = parseInteger(row[headers.indexOf("Results")])
          const videoViews = parseInteger(row[headers.indexOf("Video views")])
          const twoSecondVideoViews = parseInteger(row[headers.indexOf("2-second video views")])
          const videoViews25 = parseInteger(row[headers.indexOf("Video views at 25%")])
          const videoViews50 = parseInteger(row[headers.indexOf("Video views at 50%")])
          const videoViews75 = parseInteger(row[headers.indexOf("Video views at 75%")])
          const videoViews100 = parseInteger(row[headers.indexOf("Video views at 100%")])
          const profileVisits = parseInteger(row[headers.indexOf("Profile visits")])
          const paidLikes = parseInteger(row[headers.indexOf("Paid likes")])
          const paidComments = parseInteger(row[headers.indexOf("Paid comments")])
          const paidShares = parseInteger(row[headers.indexOf("Paid shares")])
          const paidFollows = parseInteger(row[headers.indexOf("Paid follows")])

          return {
            date,
            campaignName,
            adGroupName,
            adName,
            adText,
            videoThumbnailUrl,
            impressions,
            clicks,
            cost,
            cpc,
            cpm,
            reach,
            frequency,
            results,
            videoViews,
            twoSecondVideoViews,
            videoViews25,
            videoViews50,
            videoViews75,
            videoViews100,
            profileVisits,
            paidLikes,
            paidComments,
            paidShares,
            paidFollows,
          } as CreativeData
        })
        .filter((item: CreativeData) => item.date && item.impressions > 0)

      // NÃO agrupar aqui - manter dados individuais para filtragem correta
      setProcessedData(processed)

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

    // AGORA sim, agrupar por criativo APÓS a filtragem
    const groupedData: Record<string, CreativeData> = {}
    filtered.forEach((item) => {
      const key = `${item.adName}_${item.videoThumbnailUrl}`
      if (!groupedData[key]) {
        groupedData[key] = { ...item }
      } else {
        groupedData[key].impressions += item.impressions
        groupedData[key].clicks += item.clicks
        groupedData[key].cost += item.cost
        groupedData[key].reach += item.reach
        groupedData[key].results += item.results
        groupedData[key].videoViews += item.videoViews
        groupedData[key].twoSecondVideoViews += item.twoSecondVideoViews
        groupedData[key].videoViews25 += item.videoViews25
        groupedData[key].videoViews50 += item.videoViews50
        groupedData[key].videoViews75 += item.videoViews75
        groupedData[key].videoViews100 += item.videoViews100
        groupedData[key].profileVisits += item.profileVisits
        groupedData[key].paidLikes += item.paidLikes
        groupedData[key].paidComments += item.paidComments
        groupedData[key].paidShares += item.paidShares
        groupedData[key].paidFollows += item.paidFollows
      }
    })

    // Recalcular métricas derivadas
    const finalData = Object.values(groupedData).map((item) => ({
      ...item,
      cpm: item.impressions > 0 ? item.cost / (item.impressions / 1000) : 0,
      cpc: item.clicks > 0 ? item.cost / item.clicks : 0,
      frequency: item.reach > 0 ? item.impressions / item.reach : 0,
    }))

    // Ordenar por investimento (custo) decrescente
    finalData.sort((a, b) => b.cost - a.cost)

    return finalData
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
      videoViews: filteredData.reduce((sum, item) => sum + item.videoViews, 0),
      videoViews100: filteredData.reduce((sum, item) => sum + item.videoViews100, 0),
      paidLikes: filteredData.reduce((sum, item) => sum + item.paidLikes, 0),
      avgCpm: 0,
      avgCpc: 0,
      avgFrequency: 0,
      ctr: 0,
      vtr: 0,
    }
  }, [filteredData])

  // Calcular médias
  if (filteredData.length > 0) {
    totals.avgCpm = totals.impressions > 0 ? totals.investment / (totals.impressions / 1000) : 0
    totals.avgCpc = totals.clicks > 0 ? totals.investment / totals.clicks : 0
    totals.avgFrequency = totals.reach > 0 ? totals.impressions / totals.reach : 0
    totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    totals.vtr = totals.impressions > 0 ? (totals.videoViews100 / totals.impressions) * 100 : 0
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
    return <Loading message="Carregando criativos TikTok..." />
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
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Criativos TikTok</h1>
            <p className="text-gray-600">Performance dos criativos na plataforma TikTok</p>
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Total de Criativos</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {filteredData.length} criativos encontrados
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
          <div className="text-sm text-gray-600 mb-1">VTR</div>
          <div className="text-lg font-bold text-gray-900">{totals.vtr.toFixed(2)}%</div>
        </div>
      </div>

      {/* Tabela de Criativos */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-pink-600 text-white">
                <th className="text-left py-3 px-4 font-semibold w-[5rem]">Imagem</th>
                <th className="text-left py-3 px-4 font-semibold">Criativo</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">Investimento</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">Impressões</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">Alcance</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">Cliques</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">Views 100%</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">Likes</th>
                <th className="text-right py-3 px-4 font-semibold min-w-[7.5rem]">VTR</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((creative, index) => {
                const vtr = creative.impressions > 0 ? (creative.videoViews100 / creative.impressions) * 100 : 0

                return (
                  <tr key={index} className={index % 2 === 0 ? "bg-pink-50" : "bg-white"}>
                    <td className="py-3 px-4 w-[5rem]">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {creative.videoThumbnailUrl ? (
                          <img
                            src={creative.videoThumbnailUrl || "/placeholder.svg"}
                            alt="Criativo"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              // Adicionar verificação de segurança para o parentElement
                              if (target.parentElement) {
                                target.parentElement.innerHTML = '<div class="text-gray-400 text-xs">Sem imagem</div>'
                              }
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">Sem imagem</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="">
                        <p className="font-medium text-gray-900 text-sm leading-tight whitespace-normal break-words">
                          {creative.adName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-tight whitespace-normal break-words">
                          {creative.campaignName}
                        </p>
                        {creative.adText && (
                          <p className="text-xs text-gray-400 mt-1 leading-tight whitespace-normal break-words">
                            {creative.adText.length > 100 ? creative.adText.substring(0, 100) + "..." : creative.adText}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold min-w-[7.5rem]">
                      {formatCurrency(creative.cost)}
                    </td>
                    <td className="py-3 px-4 text-right min-w-[7.5rem]">{formatNumber(creative.impressions)}</td>
                    <td className="py-3 px-4 text-right min-w-[7.5rem]">{formatNumber(creative.reach)}</td>
                    <td className="py-3 px-4 text-right min-w-[7.5rem]">{formatNumber(creative.clicks)}</td>
                    <td className="py-3 px-4 text-right min-w-[7.5rem]">{formatNumber(creative.videoViews100)}</td>
                    <td className="py-3 px-4 text-right min-w-[7.5rem]">{formatNumber(creative.paidLikes)}</td>
                    <td className="py-3 px-4 text-right min-w-[7.5rem]">{vtr.toFixed(2)}%</td>
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

export default CriativosTikTok
