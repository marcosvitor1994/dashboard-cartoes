"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"

const API_BASE_URL = "https://api-google-sheets-7zph.vercel.app"

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error)
    return Promise.reject(error)
  },
)

// Função para buscar dados consolidados dos cartões
export const fetchConsolidadoData = async () => {
  try {
    const response = await api.get("/cartao/consolidado")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados consolidados:", error)
    throw error
  }
}

// Função para buscar dados do resumo dos cartões
export const fetchResumoData = async () => {
  try {
    const response = await api.get("/cartao/resumo")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do resumo:", error)
    throw error
  }
}

// Função para buscar dados do GA4 resumo
export const fetchGA4ResumoData = async () => {
  try {
    const response = await api.get("/cartao/ga4-resumo")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do GA4 resumo:", error)
    throw error
  }
}

// NOVAS FUNÇÕES PARA OS CRIATIVOS
// Função para buscar dados do Meta
export const fetchCartaoMetaData = async () => {
  try {
    const response = await api.get("/cartao/meta")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do Meta:", error)
    throw error
  }
}

// Função para buscar dados do TikTok
export const fetchCartaoTikTokData = async () => {
  try {
    const response = await api.get("/cartao/tiktok")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do TikTok:", error)
    throw error
  }
}

// Função para buscar dados do Pinterest
export const fetchCartaoPinterestData = async () => {
  try {
    const response = await api.get("/cartao/pinterest")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do Pinterest:", error)
    throw error
  }
}

// Função para buscar dados do LinkedIn
export const fetchCartaoLinkedInData = async () => {
  try {
    const response = await api.get("/cartao/linkedin")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do LinkedIn:", error)
    throw error
  }
}

// Função para buscar dados do CCBB (manter compatibilidade)
export const fetchCCBBData = async () => {
  try {
    const response = await api.get("/ccbb")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do CCBB:", error)
    throw error
  }
}

// Função para buscar dados do Share CCBB
export const fetchShareCCBBData = async () => {
  try {
    const response = await api.get("/ShareCcbb")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do Share CCBB:", error)
    throw error
  }
}

// Função para buscar dados do Meta CCBB
export const fetchMetaCCBBData = async () => {
  try {
    const response = await api.get("/ccbbMeta")
    return response.data
  } catch (error) {
    console.error("Erro ao buscar dados do Meta CCBB:", error)
    throw error
  }
}

// Hook personalizado para usar os dados consolidados
export const useConsolidadoData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchConsolidadoData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook personalizado para usar os dados do resumo
export const useResumoData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchResumoData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// NOVOS HOOKS PARA OS CRIATIVOS
// Hook personalizado para usar os dados do Meta
export const useCartaoMetaData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchCartaoMetaData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook personalizado para usar os dados do TikTok
export const useCartaoTikTokData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchCartaoTikTokData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook personalizado para usar os dados do LinkedIn
export const useCartaoLinkedInData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchCartaoLinkedInData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook personalizado para usar os dados da API CCBB (manter compatibilidade)
export const useCCBBData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchCCBBData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook personalizado para usar os dados da API Share CCBB
export const useShareCCBBData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchShareCCBBData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook personalizado para usar os dados da API Meta CCBB
export const useMetaCCBBData = () => {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchMetaCCBBData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

// Hook combinado para usar ambas as APIs
export const useCombinedData = () => {
  const ccbbData = useCCBBData()
  const shareData = useShareCCBBData()

  const loading = ccbbData.loading || shareData.loading
  const error = ccbbData.error || shareData.error

  return {
    ccbbData: ccbbData.data,
    shareData: shareData.data,
    loading,
    error,
    refetch: () => {
      ccbbData.refetch()
      shareData.refetch()
    },
  }
}


// Tipos de dados para as APIs
interface GA4ResumoData {
  range: string
  majorDimension: string
  values: string[][]
}

interface GA4CompletoData {
  range: string
  majorDimension: string
  values: string[][]
}

interface CartaoPinterestData {
  range: string
  majorDimension: string
  values: string[][]
}

interface PinterestImageData {
  range: string
  majorDimension: string
  values: string[][]
}

// Hook para dados GA4 Resumo (mantido para o mapa de calor de região)
export const useGA4ResumoData = () => {
  const [data, setData] = useState<GA4ResumoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Simulação de fetch de dados
        const response = await fetch("/resposta-ga4-resumo-KQBK42rFNR4n5j515BaYJSwATFRea7.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: GA4ResumoData = await response.json()
        setData(result)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

// NOVO Hook para dados GA4 Completo
export const useGA4CompletoData = () => {
  const [data, setData] = useState<GA4CompletoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/resposta-ga4-completo-5ZWtavjiY5Ry8YPkM7UsdAgbQ4uBK4.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: GA4CompletoData = await response.json()
        setData(result)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

// Hook para dados do Pinterest (mantido)
export const useCartaoPinterestData = () => {
  const [data, setData] = useState<CartaoPinterestData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/resposta-pinterest-uGiEeWePZ9Z3prfCm2dauvWm3gUKAq.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: CartaoPinterestData = await response.json()
        setData(result)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

// NOVO Hook para dados de Imagem do Pinterest
export const usePinterestImageData = () => {
  const [data, setData] = useState<PinterestImageData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/resposta-pinterest-imagem-tyjIrb2WqS2vNjvjFoBC1FwYqtegOY.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: PinterestImageData = await response.json()
        setData(result)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}
