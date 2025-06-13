"use client"

import type React from "react"
import { useRef, useEffect, useState, useMemo } from "react"
import * as d3 from "d3"
import type { FeatureCollection, Feature, Geometry } from "geojson"

// Mapeamento de nomes de estados para abreviações e vice-versa
const STATE_NAMES_TO_ABBR: { [key: string]: string } = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
}

const ABBR_TO_STATE_NAMES: { [key: string]: string } = Object.entries(STATE_NAMES_TO_ABBR).reduce(
  (acc: { [key: string]: string }, [name, abbr]) => {
    acc[abbr] = name
    return acc
  },
  {},
)

// Tipos para as propriedades dos estados brasileiros
interface StateProperties {
  name: string
  sigla: string
  [key: string]: any
}

// Tipos para GeoJSON usando os tipos nativos
type StateFeature = Feature<Geometry, StateProperties>
type StatesCollection = FeatureCollection<Geometry, StateProperties>

interface BrazilMapProps {
  regionData: { [key: string]: number } // { "Bahia": 12345, ... }
  getIntensityColor: (sessions: number) => string
}

const BrazilMap: React.FC<BrazilMapProps> = ({ regionData, getIntensityColor }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [geoData, setGeoData] = useState<StatesCollection | null>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    stateName: string
    sessions: number
  }>({
    visible: false,
    x: 0,
    y: 0,
    stateName: "",
    sessions: 0,
  })

  // Load Brazil GeoJSON data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        // Assuming brazil-states.json is in the public folder
        const response = await fetch("/brazil-states.json")
        const data: StatesCollection = await response.json()
        setGeoData(data)

        // Log the GeoJSON structure for debugging
        console.log("GeoJSON loaded successfully")
        console.log("GeoJSON features count:", data.features.length)
        console.log(
          "First few state names from GeoJSON:",
          data.features.slice(0, 5).map((f) => f.properties.name),
        )
      } catch (error) {
        console.error("Error loading Brazil GeoJSON:", error)
      }
    }
    loadGeoData()
  }, [])

  // Debug: Log regionData para verificar os dados recebidos
  useEffect(() => {
    console.log("Region Data recebido pelo BrazilMap:", regionData)
  }, [regionData])

  // D3 map rendering
  useEffect(() => {
    if (!geoData || !svgRef.current) return

    console.log(
      "GeoJSON state names:",
      geoData.features.map((f) => f.properties.name),
    )
    console.log("Region data keys:", Object.keys(regionData))

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous render

    const width = 600
    const height = 500

    // Set up projection
    const projection = d3.geoMercator().fitSize([width, height], geoData)
    const path = d3.geoPath().projection(projection)

    // Create main group
    const g = svg.append("g")

    // Add states
    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", (d: StateFeature) => path(d) || "")
      .attr("fill", (d: StateFeature) => {
        const stateName = d.properties.name // Nome do estado do GeoJSON

        // Debug: Log para verificar o nome do estado e os dados correspondentes
        console.log(`Verificando estado: ${stateName}, Dados disponíveis:`, regionData[stateName])

        // Tenta encontrar os dados de sessão para este estado
        const sessions = regionData[stateName] || 0
        return getIntensityColor(sessions)
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function (this: SVGPathElement, event: MouseEvent, d: StateFeature) {
        const stateName = d.properties.name
        const sessions = regionData[stateName] || 0

        const [x, y] = d3.pointer(event, document.body)
        setTooltip({
          visible: true,
          x: x + 10,
          y: y - 10,
          stateName: stateName,
          sessions: sessions,
        })
        d3.select(this).attr("opacity", 0.8)
      })
      .on("mousemove", (event: MouseEvent) => {
        const [x, y] = d3.pointer(event, document.body)
        setTooltip((prev) => ({
          ...prev,
          x: x + 10,
          y: y - 10,
        }))
      })
      .on("mouseout", function (this: SVGPathElement) {
        setTooltip((prev) => ({ ...prev, visible: false }))
        d3.select(this).attr("opacity", 1)
      })

    // Add state labels for larger states (optional, can be removed if too cluttered)
    g.selectAll("text")
      .data(
        geoData.features.filter((d: StateFeature) => {
          const bounds = path.bounds(d)
          const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1])
          return area > 1000 // Only show labels for larger states
        }),
      )
      .enter()
      .append("text")
      .attr("x", (d: StateFeature) => {
        const centroid = path.centroid(d)
        return centroid[0]
      })
      .attr("y", (d: StateFeature) => {
        const centroid = path.centroid(d)
        return centroid[1]
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#2c3e50")
      .attr("pointer-events", "none")
      .text((d: StateFeature) => d.properties.sigla)
  }, [geoData, regionData, getIntensityColor])

  // Helper to format numbers for tooltip
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mi`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} mil`
    }
    return value.toLocaleString("pt-BR")
  }

  // Generate legend data
  const legendData = useMemo(
    () => [
      { label: "Sem dados", color: "#e5e7eb" },
      { label: "Muito Baixo", color: "#6b7280" }, // Cinza
      { label: "Baixo", color: "#10b981" }, // Verde
      { label: "Médio", color: "#eab308" }, // Amarelo
      { label: "Alto", color: "#f59e0b" }, // Laranja
      { label: "Muito Alto", color: "#dc2626" }, // Vermelho forte
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6">
        {/* Representação visual simplificada */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg text-center">
          <svg
            className="w-16 h-16 text-blue-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Distribuição Geográfica</h4>
          <p className="text-sm text-gray-600">
            Análise de {formatNumber(Object.values(regionData).reduce((a, b) => a + b, 0))} sessões distribuídas em{" "}
            {Object.keys(regionData).length} regiões
          </p>
        </div>

        {/* Mapa SVG */}
        <div className="relative w-full h-[500px] bg-gray-50 rounded-lg overflow-hidden">
          <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 500" className="block" />

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              style={{
                position: "fixed", // Use fixed to position relative to viewport
                left: tooltip.x,
                top: tooltip.y,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem", // rounded-md
                padding: "0.75rem", // p-3
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-lg
                fontSize: "0.875rem", // text-sm
                zIndex: 1000,
                maxWidth: "150px",
                pointerEvents: "none", // Ensures tooltip doesn't block mouse events on map
              }}
            >
              <div className="font-semibold text-gray-900 mb-1">{tooltip.stateName}</div>
              <div className="text-gray-700">Sessões: {formatNumber(tooltip.sessions)}</div>
            </div>
          )}
        </div>

        {/* Legenda de cores */}
        <div className="mt-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Intensidade de Sessões:</h5>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {legendData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas resumidas (mantidas, mas podem ser ajustadas se necessário) */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {Object.keys(regionData).length > 0
                ? Object.entries(regionData).sort(([, a], [, b]) => b - a)[0][0]
                : "N/A"}
            </div>
            <div className="text-xs text-gray-600">Região Líder</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {formatNumber(Object.values(regionData).reduce((acc, curr) => acc + curr, 0))}
            </div>
            <div className="text-xs text-gray-600">Total de Sessões</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {Object.keys(regionData).length > 0
                ? Math.round(
                    (Object.entries(regionData).sort(([, a], [, b]) => b - a)[0][1] /
                      Object.values(regionData).reduce((a, b) => a + b, 0)) *
                      100,
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-gray-600">% da Líder</div>
          </div>
        </div>

        {/* Nota sobre mapa geográfico */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Representação baseada nos dados do GA4. Para visualização geográfica completa,
            recomenda-se integração com bibliotecas especializadas como D3.js ou Mapbox.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BrazilMap
