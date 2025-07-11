"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useOfflineData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

// Interfaces para tipagem
interface OfflineDataRow {
  meio: string
  rede: string
  praca: string
  valorDesembolso: string
  trp: string
  impactos: string
}

interface MeioData {
  nome: string
  valorTotal: number
  impactosTotal: number
  pracas: { [key: string]: PracaData }
}

interface PracaData {
  nome: string
  valorTotal: number
  impactosTotal: number
  redes: { [key: string]: RedeData }
}

interface RedeData {
  nome: string
  valorTotal: number
  impactosTotal: number
  trpTotal: number
}

// Função para converter string de valor para número
const parseValor = (valor: string): number => {
  if (!valor || valor === "-" || valor === "") return 0

  // Remove "R$", espaços, pontos (separadores de milhares) e substitui vírgula por ponto
  const cleanValue = valor
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim()

  const parsed = Number.parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

// Função para converter string de número para número
const parseNumero = (numero: string): number => {
  if (!numero || numero === "-" || numero === "") return 0

  // Remove pontos (separadores de milhares) e substitui vírgula por ponto
  const cleanValue = numero.replace(/\./g, "").replace(/,/g, ".").trim()

  const parsed = Number.parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

// Função para formatar valor em reais
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Função para formatar números
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR").format(value)
}

const VeiculacaoOffline: React.FC = () => {
  const { data, loading, error } = useOfflineData()
  const [expandedMeios, setExpandedMeios] = useState<{ [key: string]: boolean }>({})
  const [expandedPracas, setExpandedPracas] = useState<{ [key: string]: boolean }>({})

  // Processar dados da API
  const processedData = useMemo(() => {
    if (!data?.values || data.values.length <= 1) return {}

    const meiosData: { [key: string]: MeioData } = {}

    // Pular o cabeçalho (primeira linha)
    const rows = data.values.slice(1)

    rows.forEach((row: string[]) => {
      const meio = row[0] || ""
      const rede = row[1] || ""
      const praca = row[3] || ""
      const valorDesembolso = row[4] || "0"
      const trp = row[5] || "0"
      const impactos = row[6] || "0"

      if (!meio) return

      // Inicializar meio se não existir
      if (!meiosData[meio]) {
        meiosData[meio] = {
          nome: meio,
          valorTotal: 0,
          impactosTotal: 0,
          pracas: {},
        }
      }

      // Inicializar praça se não existir
      if (!meiosData[meio].pracas[praca]) {
        meiosData[meio].pracas[praca] = {
          nome: praca,
          valorTotal: 0,
          impactosTotal: 0,
          redes: {},
        }
      }

      // Inicializar rede se não existir
      if (!meiosData[meio].pracas[praca].redes[rede]) {
        meiosData[meio].pracas[praca].redes[rede] = {
          nome: rede,
          valorTotal: 0,
          impactosTotal: 0,
          trpTotal: 0,
        }
      }

      // Somar valores
      const valorNum = parseValor(valorDesembolso)
      const impactosNum = parseNumero(impactos)
      const trpNum = parseNumero(trp)

      meiosData[meio].valorTotal += valorNum
      meiosData[meio].impactosTotal += impactosNum
      meiosData[meio].pracas[praca].valorTotal += valorNum
      meiosData[meio].pracas[praca].impactosTotal += impactosNum
      meiosData[meio].pracas[praca].redes[rede].valorTotal += valorNum
      meiosData[meio].pracas[praca].redes[rede].impactosTotal += impactosNum
      meiosData[meio].pracas[praca].redes[rede].trpTotal += trpNum
    })

    return meiosData
  }, [data])

  const toggleMeio = (meio: string) => {
    setExpandedMeios((prev) => ({
      ...prev,
      [meio]: !prev[meio],
    }))
  }

  const togglePraca = (meioNome: string, pracaNome: string) => {
    const key = `${meioNome}-${pracaNome}`
    setExpandedPracas((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Veiculação off-line</h1>
              <p className="text-gray-600">
                Análise detalhada dos investimentos em mídia off-line por meio, praça e rede
              </p>
            </div>
            
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-4">
              {Object.values(processedData).map((meio) => (
                <div key={meio.nome} className="border border-gray-200 rounded-lg">
                  {/* Cabeçalho do Meio */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleMeio(meio.nome)}
                  >
                    <div className="flex items-center space-x-3">
                      {expandedMeios[meio.nome] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{meio.nome}</h3>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div className="text-right">
                        <p className="text-gray-500">Valor Total</p>
                        <p className="font-semibold text-green-600">{formatCurrency(meio.valorTotal)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Impactos Total</p>
                        <p className="font-semibold text-blue-600">{formatNumber(meio.impactosTotal)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Meio */}
                  {expandedMeios[meio.nome] && (
                    <div className="p-4 space-y-3">
                      {Object.values(meio.pracas).map((praca) => (
                        <div key={praca.nome} className="border border-gray-100 rounded-md">
                          {/* Cabeçalho da Praça */}
                          <div
                            className="flex items-center justify-between p-3 bg-gray-25 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => togglePraca(meio.nome, praca.nome)}
                          >
                            <div className="flex items-center space-x-3">
                              {expandedPracas[`${meio.nome}-${praca.nome}`] ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <h4 className="text-md font-medium text-gray-800">{praca.nome}</h4>
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <div className="text-right">
                                <p className="text-gray-500">Valor</p>
                                <p className="font-medium text-green-600">{formatCurrency(praca.valorTotal)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500">Impactos</p>
                                <p className="font-medium text-blue-600">{formatNumber(praca.impactosTotal)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Conteúdo da Praça - Redes */}
                          {expandedPracas[`${meio.nome}-${praca.nome}`] && (
                            <div className="p-3">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Rede</th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                                        Valor Desembolso
                                      </th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-700">Impactos</th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-700">TRP</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.values(praca.redes).map((rede) => (
                                      <tr key={rede.nome} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-medium text-gray-900">{rede.nome}</td>
                                        <td className="py-2 px-3 text-right text-green-600 font-medium">
                                          {formatCurrency(rede.valorTotal)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-blue-600 font-medium">
                                          {formatNumber(rede.impactosTotal)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-purple-600 font-medium">
                                          {rede.trpTotal > 0 ? formatNumber(rede.trpTotal) : "-"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VeiculacaoOffline