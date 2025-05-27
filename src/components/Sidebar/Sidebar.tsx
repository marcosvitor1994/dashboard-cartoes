"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, FileText, Clock, Globe, Eye, TrendingUp, Video, Share2, BarChart3, Users } from "lucide-react"

interface MenuItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    id: "capa",
    label: "Capa",
    path: "/capa",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "estrategia-documentacao",
    label: "Estratégia Documentação",
    path: "/estrategia-documentacao",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "linha-tempo",
    label: "Linha do tempo",
    path: "/linha-tempo",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: "estrategia-online",
    label: "Estratégia Online",
    path: "/estrategia-online",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: "visao-geral",
    label: "Visão Geral",
    path: "/visao-geral",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "alcance",
    label: "Alcance",
    path: "/alcance",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "visualizacoes",
    label: "Visualizações",
    path: "/visualizacoes",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "trafego-engajamento",
    label: "Tráfego e Engajamento",
    path: "/trafego-engajamento",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: "criativos-tiktok",
    label: "Criativos - TikTok",
    path: "/criativos-tiktok",
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: "criativos-meta-ads",
    label: "Criativos - Meta Ads",
    path: "/criativos-meta-ads",
    icon: <Share2 className="w-5 h-5" />,
  },
]

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <span className="ml-3 font-semibold text-gray-800 whitespace-nowrap">Dashboard Cartões</span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {isExpanded && <span className="ml-3 whitespace-nowrap overflow-hidden">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
