"use client"

import type React from "react"
import { useRef, useEffect, useState, useMemo } from "react"
import * as d3 from "d3"

// Mapeamento de nomes de estados para abreviações e vice-versa
const STATE_NAMES_TO_ABBR: { [key: string]: string } = {
  "State of Acre": "AC",
  "State of Alagoas": "AL",
  "State of Amapa": "AP",
  "State of Amazonas": "AM",
  "State of Bahia": "BA",
  "State of Ceara": "CE",
  "Federal District": "DF", // Distrito Federal
  "State of Espirito Santo": "ES",
  "State of Goias": "GO",
  "State of Maranhao": "MA",
  "State of Mato Grosso": "MT",
  "State of Mato Grosso do Sul": "MS",
  "State of Minas Gerais": "MG",
  "State of Para": "PA",
  "State of Paraiba": "PB",
  "State of Parana": "PR",
  "State of Pernambuco": "PE",
  "State of Piaui": "PI",
  "State of Rio de Janeiro": "RJ",
  "State of Rio Grande do Norte": "RN",
  "State of Rio Grande do Sul": "RS",
  "State of Rondonia": "RO",
  "State of Roraima": "RR",
  "State of Santa Catarina": "SC",
  "State of Sao Paulo": "SP",
  "State of Sergipe": "SE",
  "State of Tocantins": "TO",
}

const ABBR_TO_STATE_NAMES: { [key: string]: string } = Object.entries(STATE_NAMES_TO_ABBR).reduce(
  (acc: { [key: string]: string }, [name, abbr]) => {
    // Explicitly type acc
    acc[abbr] = name.replace("State of ", "") // Remove "State of " para exibição
    if (name === "Federal District") acc[abbr] = "Distrito Federal"
    return acc
  },
  {},
)

interface BrazilMapProps {
  regionData: { [key: string]: number } // { "State of Bahia": 12345, ... }
  getIntensityColor: (sessions: number) => string
}

const BrazilMap: React.FC<BrazilMapProps> = ({ regionData, getIntensityColor }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
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
        const data = await response.json()
        setGeoData(data)
      } catch (error) {
        console.error("Error loading Brazil GeoJSON:", error)
      }
    }
    loadGeoData()
  }, [])

  // D3 map rendering
  useEffect(() => {
    if (!geoData || !svgRef.current) return

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
      .attr("d", path)
      .attr("fill", (d: any) => {
        const stateFullName = d.properties.name // GeoJSON might have full name
        const stateAbbr = d.properties.sigla // GeoJSON might have abbreviation

        // Try to match using full name first, then abbreviation
        const sessions =
          regionData[stateFullName] || regionData[`State of ${stateFullName}`] || regionData[stateAbbr] || 0
        return getIntensityColor(sessions)
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function (event: MouseEvent, d: any) {
        // Explicitly type event
        const stateFullName = d.properties.name
        const stateAbbr = d.properties.sigla
        const sessions =
          regionData[stateFullName] || regionData[`State of ${stateFullName}`] || regionData[stateAbbr] || 0

        const [x, y] = d3.pointer(event, document.body)
        setTooltip({
          visible: true,
          x: x + 10,
          y: y - 10,
          stateName: ABBR_TO_STATE_NAMES[stateAbbr] || stateFullName,
          sessions: sessions,
        })
        d3.select(this as SVGPathElement).attr("opacity", 0.8) // Explicitly cast 'this'
      })
      .on("mousemove", (event: MouseEvent) => {
        // Explicitly type event
        const [x, y] = d3.pointer(event, document.body)
        setTooltip((prev) => ({
          ...prev,
          x: x + 10,
          y: y - 10,
        }))
      })
      .on("mouseout", function () {
        setTooltip((prev) => ({ ...prev, visible: false }))
        d3.select(this as SVGPathElement).attr("opacity", 1) // Explicitly cast 'this'
      })

    // Add state labels for larger states (optional, can be removed if too cluttered)
    g.selectAll("text")
      .data(
        geoData.features.filter((d: any) => {
          const bounds = path.bounds(d)
          const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1])
          return area > 1000 // Only show labels for larger states
        }),
      )
      .enter()
      .append("text")
      .attr("x", (d: any) => path.centroid(d)[0])
      .attr("y", (d: any) => path.centroid(d)[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#2c3e50")
      .attr("pointer-events", "none")
      .text((d: any) => d.properties.sigla)
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
                ? Object.entries(regionData)
                    .sort(([, a], [, b]) => b - a)[0][0]
                    .replace("State of ", "")
                    .replace("Federal District", "Distrito Federal")
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
