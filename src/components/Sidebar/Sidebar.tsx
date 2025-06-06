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
  Linkedin,
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
    id: "criativos-meta-ads",
    label: "Criativos - Meta",
    path: "/criativos-meta-ads",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "criativos-tiktok",
    label: "Criativos - TikTok",
    path: "/criativos-tiktok",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  {
    id: "criativos-pinterest",
    label: "Criativos - Pinterest",
    path: "/criativos-pinterest",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.813 1.604.813 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.027-4.625 4.235 0 1.027.547 2.305 1.422 2.712.142.062.217.035.251-.097l.296-1.154c.038-.148.023-.196-.088-.322-.243-.275-.425-.713-.425-1.197 0-1.292.967-2.531 2.608-2.531 1.423 0 2.408.973 2.408 2.361 0 1.588-.632 2.713-1.425 2.713-.456 0-.796-.387-.687-.857l.313-1.228c.092-.366.277-1.495.277-1.854 0-.428-.229-.784-.706-.784-.559 0-1.006.577-1.006 1.35 0 .493.167.827.167.827s-.574 2.43-.675 2.85c-.128.538-.057 1.319-.03 1.742C5.867 18.06 2 15.414 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    id: "criativos-linkedin",
    label: "Criativos - LinkedIn",
    path: "/criativos-linkedin",
    icon: <Linkedin className="w-5 h-5" />,
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
        <nav className="flex-1 py-4 overflow-y-auto">
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