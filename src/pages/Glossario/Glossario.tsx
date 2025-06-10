import type React from "react"
import { BookOpenText } from "lucide-react"

interface GlossaryTerm {
  term: string
  definition: string
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "CPM (Custo por Mil Impressões)",
    definition:
      "O custo médio que você paga por mil impressões (visualizações) do seu anúncio. É uma métrica de eficiência para campanhas de alcance e reconhecimento de marca.",
  },
  {
    term: "CPC (Custo por Clique)",
    definition:
      "O custo médio que você paga por cada clique no seu anúncio. É uma métrica importante para campanhas focadas em tráfego e conversão.",
  },
  {
    term: "CPV (Custo por Visualização)",
    definition:
      "O custo médio que você paga por cada visualização de um vídeo. Usado principalmente em campanhas de vídeo.",
  },
  {
    term: "CTR (Click-Through Rate)",
    definition:
      "A porcentagem de pessoas que clicam no seu anúncio depois de vê-lo. Calculado como (Cliques / Impressões) * 100. Indica a relevância do anúncio.",
  },
  {
    term: "VTR (View-Through Rate)",
    definition:
      "A porcentagem de pessoas que assistem a um vídeo até o fim (ou uma parte significativa) após uma impressão. Usado para medir o engajamento com conteúdo de vídeo.",
  },
  {
    term: "Alcance",
    definition:
      "O número total de pessoas únicas que viram seu anúncio. Diferente de impressões, que podem contar múltiplas visualizações pela mesma pessoa.",
  },
  {
    term: "Frequência",
    definition:
      "O número médio de vezes que uma pessoa única viu seu anúncio. Calculado como Impressões / Alcance. Uma frequência muito alta pode levar à fadiga do anúncio.",
  },
  {
    term: "Impressões",
    definition: "O número total de vezes que seu anúncio foi exibido, independentemente de ter sido clicado ou não.",
  },
  {
    term: "Investimento",
    definition: "O valor total gasto na campanha durante um período específico.",
  },
  {
    term: "Tráfego",
    definition: "O número de visitas ou usuários que chegam a um site ou página de destino a partir dos anúncios.",
  },
  {
    term: "Engajamento",
    definition: "Interações dos usuários com o conteúdo, como curtidas, comentários, compartilhamentos e cliques.",
  },
  {
    term: "Criativo",
    definition: "O material visual (imagem, vídeo) e textual (copy) do anúncio.",
  },
  {
    term: "Benchmark",
    definition:
      "Um ponto de referência ou padrão de desempenho usado para comparar e avaliar o sucesso de uma campanha ou métrica.",
  },
]

const Glossario: React.FC = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <BookOpenText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Glossário de Métricas</h1>
          <p className="text-gray-600">Entenda os termos técnicos do seu dashboard</p>
        </div>
      </div>

      {/* Glossary Content */}
      <div className="card-overlay rounded-lg shadow-lg p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {glossaryTerms.map((item, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.term}</h3>
              <p className="text-gray-600 text-sm">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Glossario
