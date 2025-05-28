"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Globe, TrendingUp, Target, BarChart3, Tv, Radio, Smartphone, Monitor, Volume2, Eye, Play } from "lucide-react"
import { useCombinedData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface VehicleData {
  platform: string
  investimentoPrevisto: number
  custoTotal: number
  shareInternet: number
  shareInvestimentoTotal: number
  shareInvestimentoUtilizado: number
  totalPrevisto: number
  custoUtilizado: number
  shareTotal: number
  pacing: number
}

interface CampaignSummary {
  totalInvestimentoPrevisto: number
  totalCustoTotal: number
  totalCustoUtilizado: number
  impressoesTotais: number
  vtr: number
  sessoesGerais: number
}

const EstrategiaOnline: React.FC = () => {
  const { ccbbData, shareData, loading, error } = useCombinedData()
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([])
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary>({
    totalInvestimentoPrevisto: 0,
    totalCustoTotal: 0,
    totalCustoUtilizado: 0,
    impressoesTotais: 0,
    vtr: 0,
    sessoesGerais: 0,
  })

  // Ícones para diferentes plataformas
  const getPlatformIcon = (platform: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Meta: <Smartphone className="w-5 h-5" />,
      Google: <Globe className="w-5 h-5" />,
      TikTok: <Play className="w-5 h-5" />,
      YouTube: <Tv className="w-5 h-5" />,
      Spotify: <Volume2 className="w-5 h-5" />,
      Netflix: <Monitor className="w-5 h-5" />,
      "Catraca Livre": <Eye className="w-5 h-5" />,
      Uber: <Smartphone className="w-5 h-5" />,
      Radio: <Radio className="w-5 h-5" />,
    }
    return iconMap[platform] || <Globe className="w-5 h-5" />
  }

  // Cores para diferentes plataformas
  const getPlatformColor = (platform: string) => {
    const colorMap: Record<string, string> = {
      Meta: "#1877f2",
      Google: "#4285f4",
      TikTok: "#ff0050",
      YouTube: "#ff0000",
      Spotify: "#1DB954",
      Netflix: "#E50914",
      "Catraca Livre": "#3498db",
      Uber: "#000000",
    }
    return colorMap[platform] || "#6366f1"
  }

  // Processar dados das APIs
  useEffect(() => {
    if (shareData?.values && ccbbData?.values) {
      const shareHeaders = shareData.values[0]
      const shareRows = shareData.values.slice(1)

      // Processar dados de share
      const processedVehicles: VehicleData[] = shareRows
        .map((row: any[]) => {
          const parseValue = (value: string) => {
            if (!value) return 0
            return Number.parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".")) || 0
          }

          const parsePercentage = (value: string) => {
            if (!value) return 0
            return Number.parseFloat(value.replace("%", "").replace(",", ".")) || 0
          }

          return {
            platform: row[0] || "",
            investimentoPrevisto: parseValue(row[1]),
            custoTotal: parseValue(row[2]),
            shareInternet: parsePercentage(row[3]),
            shareInvestimentoTotal: parsePercentage(row[4]),
            shareInvestimentoUtilizado: parsePercentage(row[5]),
            totalPrevisto: parseValue(row[6]),
            custoUtilizado: parseValue(row[7]),
            shareTotal: parsePercentage(row[8]),
            pacing: 0, // Será calculado
          }
        })
        .filter((vehicle: VehicleData) => vehicle.platform)

      // Calcular pacing (percentual de entrega)
      processedVehicles.forEach((vehicle: VehicleData) => {
        if (vehicle.investimentoPrevisto > 0) {
          vehicle.pacing = (vehicle.custoTotal / vehicle.investimentoPrevisto) * 100
        }
      })

      setVehicleData(processedVehicles)

      // Calcular resumo da campanha
      const summary: CampaignSummary = {
        totalInvestimentoPrevisto: processedVehicles.reduce((sum, v) => sum + v.investimentoPrevisto, 0),
        totalCustoTotal: processedVehicles.reduce((sum, v) => sum + v.custoTotal, 0),
        totalCustoUtilizado: processedVehicles.reduce((sum, v) => sum + v.custoUtilizado, 0),
        impressoesTotais: 0, // Será calculado dos dados do CCBB
        vtr: 85, // Valor exemplo
        sessoesGerais: 0, // Será calculado dos dados do CCBB
      }

      // Processar dados do CCBB para impressões
      if (ccbbData?.values) {
        const ccbbHeaders = ccbbData.values[0]
        const ccbbRows = ccbbData.values.slice(1)

        const impressionsIndex = ccbbHeaders.indexOf("Impressions")
        if (impressionsIndex !== -1) {
          summary.impressoesTotais = ccbbRows.reduce((sum: number, row: any[]) => {
            const impressions = Number.parseInt(row[impressionsIndex]?.replace(/\./g, "").replace(/,/g, "") || "0")
            return sum + impressions
          }, 0)
        }
      }

      setCampaignSummary(summary)
    }
  }, [shareData, ccbbData])

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
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

  if (loading) {
    return <Loading message="Carregando estratégia online..." />
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
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Estratégia Online</h1>
            <p className="text-gray-600">Massiva</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Resumo da Campanha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impressões</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(campaignSummary.impressoesTotais)}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessões Gerais</p>
              <p className="text-xl font-bold text-gray-900">-</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">VTR 100%</p>
              <p className="text-xl font-bold text-gray-900">{campaignSummary.vtr}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Realizado</p>
              <p className="text-xl font-bold text-gray-900">23,56%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="lg:col-span-1 card-overlay rounded-lg shadow-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Valor Total da Campanha</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(campaignSummary.totalInvestimentoPrevisto)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Veículos */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Estratégia e Execução</h2>
          <div className="text-sm text-gray-500">
            Observações que foram pertinentes para a estratégia, ou que possam ser afetado o uso dos veículos e
            orçamentos abaixo.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Meio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Veículo</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Orçamento Previsto</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Share (%)</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Orçamento Realizado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Share (%)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Pacing</th>
              </tr>
            </thead>
            <tbody>
              {vehicleData.map((vehicle, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${getPlatformColor(vehicle.platform)}20` }}
                      >
                        <div style={{ color: getPlatformColor(vehicle.platform) }}>
                          {getPlatformIcon(vehicle.platform)}
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">Internet</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{vehicle.platform}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(vehicle.investimentoPrevisto)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-700">{vehicle.shareInvestimentoTotal.toFixed(2)}%</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(vehicle.custoTotal)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-700">{vehicle.shareInternet.toFixed(2)}%</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(vehicle.pacing, 100)}%`,
                            backgroundColor:
                              vehicle.pacing > 100 ? "#ef4444" : vehicle.pacing > 80 ? "#f59e0b" : "#22c55e",
                          }}
                        />
                        {vehicle.pacing > 100 && (
                          <div
                            className="absolute top-0 h-full bg-red-500 opacity-70"
                            style={{
                              left: "100%",
                              width: `${Math.min(vehicle.pacing - 100, 50)}%`,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
                        {vehicle.pacing.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50/50">
                <td className="py-4 px-4 font-bold text-gray-900">Total</td>
                <td className="py-4 px-4 font-bold text-gray-900">TT</td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">
                  {formatCurrency(campaignSummary.totalInvestimentoPrevisto)}
                </td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">100,00%</td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">
                  {formatCurrency(campaignSummary.totalCustoTotal)}
                </td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">
                  {((campaignSummary.totalCustoTotal / campaignSummary.totalInvestimentoPrevisto) * 100).toFixed(2)}%
                </td>
                <td className="py-4 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Observações */}
        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Observações Importantes:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • Dados de resultados apresentados, podendo sofrer alterações mais ou para menos após finalização da
              campanha.
            </li>
            <li>
              • Por integração não sendo 100% compatível com as diversas plataformas de entrega, há diferenças entre os
              criativos e o valor de todos os veículos.
            </li>
            <li>
              • Imagens dos dados acompanhamento da mídia das diferentes na agenda mensal, não são os mesmos exibidos na
              campanha.
            </li>
            <li>
              • Dados de dados de veículos das diferentes na agenda mensalmente todas as segundas-feiras são atualizados
              de acordo com dados internos.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EstrategiaOnline
