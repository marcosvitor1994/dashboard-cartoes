"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  FileText,
  Clock,
  Globe,
  Eye,
  TrendingUp,
  Video,
  Share2,
  BarChart3,
  Users,
  LogOut,
  User,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

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
  const [imageError, setImageError] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img
                    src="/images/nacional.gif"
                    alt='Gif Nacional'
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
              
            </div>
            {isExpanded && (
              <span className="ml-3 font-semibold text-gray-800 whitespace-nowrap">Dashboard Cartões</span>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              {/* Avatar com fallback */}
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0 overflow-hidden bg-gray-100">
                {user.picture && !imageError ? (
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
              {isExpanded && (
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg"
            title="Sair"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="ml-3 whitespace-nowrap">Sair</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
