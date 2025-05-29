import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"
import Layout from "./components/Layout/Layout"
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

// Substitua pelo seu Google Client ID
const GOOGLE_CLIENT_ID = "SEU_GOOGLE_CLIENT_ID_AQUI"

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Redirecionar para Capa ao invés de Dashboard */}
                <Route path="/" element={<Navigate to="/capa" replace />} />
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
          </ProtectedRoute>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
