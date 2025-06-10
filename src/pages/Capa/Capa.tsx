import type React from "react"
import { Link } from "react-router-dom"
import {
  Clock,
  Globe,
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  Video,
  ArrowRight,
  Calendar,
  Target,
  User,
  TargetIcon as Bullseye,
  Linkedin,
  ImageIcon as MetaIcon,
  PinIcon as Pinterest,
  BookOpenText,
} from "lucide-react"

interface NavigationCard {
  title: string
  description: string
  path: string
  icon: React.ReactNode
  color: string
}

const navigationCards: NavigationCard[] = [
  // Card "Estratégia Documentação" removido conforme solicitação
  {
    title: "Linha do Tempo",
    description: "Cronograma e marcos importantes da campanha",
    path: "/linha-tempo",
    icon: <Clock className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    title: "Estratégia Online",
    description: "Planejamento e execução da estratégia digital",
    path: "/estrategia-online",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    title: "Visão Geral",
    description: "Panorama geral das métricas e resultados",
    path: "/visao-geral",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-indigo-500",
  },
  {
    title: "Alcance",
    description: "Métricas de alcance e impressões da campanha",
    path: "/alcance",
    icon: <Users className="w-6 h-6" />,
    color: "bg-cyan-500",
  },
  {
    title: "Visualizações",
    description: "Dados de visualizações e engajamento visual",
    path: "/visualizacoes",
    icon: <Eye className="w-6 h-6" />,
    color: "bg-orange-500",
  },
  {
    title: "Tráfego e Engajamento",
    description: "Análise de tráfego e interações dos usuários",
    path: "/trafego-engajamento",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-red-500",
  },
  {
    title: "Criativos - TikTok",
    description: "Performance dos criativos na plataforma TikTok",
    path: "/criativos-tiktok",
    icon: <Video className="w-6 h-6" />,
    color: "bg-pink-500",
  },
  {
    title: "Criativos - Meta Ads",
    description: "Análise dos criativos no Facebook e Instagram",
    path: "/criativos-meta-ads",
    icon: <MetaIcon className="w-6 h-6" />, // Ícone do Meta
    color: "bg-blue-600",
  },
  {
    title: "Criativos - Pinterest",
    description: "Performance dos criativos na plataforma Pinterest",
    path: "/criativos-pinterest",
    icon: <Pinterest className="w-6 h-6" />, // Novo card para Pinterest
    color: "bg-red-400",
  },
  {
    title: "Criativos - LinkedIn",
    description: "Performance dos criativos na plataforma LinkedIn",
    path: "/criativos-linkedin",
    icon: <Linkedin className="w-6 h-6" />, // Novo card para LinkedIn
    color: "bg-blue-700",
  },
  {
    title: "Glossário",
    description: "Entenda os termos técnicos e métricas do dashboard",
    path: "/glossario",
    icon: <BookOpenText className="w-6 h-6" />, // Novo card para Glossário
    color: "bg-purple-600",
  },
]

const Capa: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Hero Section com Imagem da Campanha */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl h-48">
        <div className="relative h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
          <img
            src="/images/banner-background.webp"
            alt="Campanha Cartões - Colecione Momentos"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard - Campanha Cartões</h1>
              <p className="text-base text-gray-700">Colecione momentos • Análise completa de performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações da Campanha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detalhes da Campanha */}
        <div className="card-overlay rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Informações da Campanha
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Campanha:</p>
                <p className="text-gray-700 text-sm">Cartões</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Códigos</p>
                <p className="text-gray-700 text-sm">Nº Ação: A2025/00002</p>
                <p className="text-gray-700 text-sm">Nº Projeto: P2024/00854</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="w-3 h-3 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Assessora:</p>
                <p className="text-gray-700 text-sm">Isis Azevedo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos e Público */}
        <div className="card-overlay rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2 text-green-600" />
            Objetivos e Público
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Users className="w-3 h-3 text-orange-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Público Alvo:</p>
                <p className="text-gray-700 text-sm">AS - 18 +</p>
                <p className="text-gray-700 text-sm">AS - 18 a 40 anos + Interesses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Bullseye className="w-3 h-3 text-red-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Objetivo de Campanha:</p>
                <p className="text-gray-700 text-sm">Mercadológica - Negocial</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-3 h-3 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Objetivo de Mídia:</p>
                <p className="text-gray-700 text-sm">Alcance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu de Navegação */}
      <div className="flex-1 min-h-0">
        <h2 className="text-xl font-bold text-gray-900 mb-3 text-enhanced">Navegação do Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-y-auto">
          {navigationCards.map((card, index) => (
            <Link
              key={index}
              to={card.path}
              className="group card-overlay rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 h-fit"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`${card.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{card.description}</p>
                  <div className="flex items-center mt-2 text-blue-600 group-hover:text-blue-700">
                    <span className="text-xs font-medium">Acessar</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Capa
