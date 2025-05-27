import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import Dashboard from "./pages/Dashboard/Dashboard"
import Capa from "./pages/Capa/Capa"
import EstrategiaDocumentacao from "./pages/EstrategiaDocumentacao/EstrategiaDocumentacao"
import LinhaTempo from "./pages/LinhaTempo/LinhaTempo"
import EstrategiaOnline from "./pages/EstrategiaOnline/EstrategiaOnline"
import VisaoGeral from "./pages/VisaoGeral/VisaoGeral"
import Alcance from "./pages/Alcance/Alcance"
import Visualizacoes from "./pages/Visualizacoes/Visualizacoes"
import TrafegoEngajamento from "./pages/TrafegoEngajamento/TrafegoEngajamento"
import CriativosTikTok from "./pages/CriativosTikTok/CriativosTikTok"
import CriativosMetaAds from "./pages/CriativosMetaAds/CriativosMetaAds"
import "./App.css"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/capa" element={<Capa />} />
          <Route path="/estrategia-documentacao" element={<EstrategiaDocumentacao />} />
          <Route path="/linha-tempo" element={<LinhaTempo />} />
          <Route path="/estrategia-online" element={<EstrategiaOnline />} />
          <Route path="/visao-geral" element={<VisaoGeral />} />
          <Route path="/alcance" element={<Alcance />} />
          <Route path="/visualizacoes" element={<Visualizacoes />} />
          <Route path="/trafego-engajamento" element={<TrafegoEngajamento />} />
          <Route path="/criativos-tiktok" element={<CriativosTikTok />} />
          <Route path="/criativos-meta-ads" element={<CriativosMetaAds />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
