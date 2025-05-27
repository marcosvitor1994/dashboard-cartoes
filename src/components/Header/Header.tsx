"use client"

import type React from "react"
import { useAuth } from "../../contexts/AuthContext"
import { LogOut } from "lucide-react"

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3 mb-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={user.picture || "/placeholder.svg"}
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-gray-200"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </div>
  )
}

export default Header
