import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/react-app/components/Layout";
import Dashboard from "@/react-app/pages/Dashboard";
import Transactions from "@/react-app/pages/Transactions";
import NewTransaction from "@/react-app/pages/NewTransaction";
import EditTransaction from "@/react-app/pages/EditTransaction";
import Reports from "@/react-app/pages/Reports";
import MonthlyReport from "@/react-app/pages/MonthlyReport";
import PeriodReport from "@/react-app/pages/PeriodReport";
import CategoryAnalysis from "@/react-app/pages/CategoryAnalysis";
import TrendsProjections from "@/react-app/pages/TrendsProjections";
import GoalsTracking from "@/react-app/pages/GoalsTracking";
import FrequentExpenses from "@/react-app/pages/FrequentExpenses";
import Profile from "@/react-app/pages/Profile";
import Settings from "@/react-app/pages/Settings";

import Help from "@/react-app/pages/Help";
import Login from "@/react-app/pages/Login";
import AuthCallback from "@/react-app/pages/AuthCallback";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import TestMenu from "@/react-app/components/TestMenu";
import MigrationModal from "@/react-app/components/MigrationModal";
import { ThemeProvider } from "@/react-app/contexts/ThemeContext";
import { EditModeProvider } from "@/react-app/contexts/EditModeContext";
import { ExportProvider } from "@/react-app/contexts/ExportContext";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExportProvider>
          <EditModeProvider>
            <Router>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Rota de teste do menu */}
                <Route path="/test-menu" element={<TestMenu />} />
                
                {/* Rotas principais - acesso livre */}
                <Route path="/" element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                } />
                <Route path="/transacoes" element={
                  <Layout>
                    <Transactions />
                  </Layout>
                } />
                <Route path="/nova-transacao" element={
                  <Layout>
                    <NewTransaction />
                  </Layout>
                } />
                <Route path="/editar-transacao/:id" element={
                  <Layout>
                    <EditTransaction />
                  </Layout>
                } />
                <Route path="/relatorios" element={
                  <Layout>
                    <Reports />
                  </Layout>
                } />
                <Route path="/relatorios/mensal" element={
                  <Layout>
                    <MonthlyReport />
                  </Layout>
                } />
                <Route path="/relatorios/periodo" element={
                  <Layout>
                    <PeriodReport />
                  </Layout>
                } />
                <Route path="/relatorios/categorias" element={
                  <Layout>
                    <CategoryAnalysis />
                  </Layout>
                } />
                <Route path="/relatorios/tendencias" element={
                  <Layout>
                    <TrendsProjections />
                  </Layout>
                } />
                <Route path="/relatorios/metas" element={
                  <Layout>
                    <GoalsTracking />
                  </Layout>
                } />
                <Route path="/relatorios/frequentes" element={
                  <Layout>
                    <FrequentExpenses />
                  </Layout>
                } />
                <Route path="/perfil" element={
                  <Layout>
                    <Profile />
                  </Layout>
                } />
                <Route path="/perfil/configuracoes" element={
                  <Layout>
                    <Settings />
                  </Layout>
                } />

                <Route path="/perfil/ajuda" element={
                  <Layout>
                    <Help />
                  </Layout>
                } />
              </Routes>
            </Router>
            <MigrationModal />
            <Toaster position="top-right" richColors />
          </EditModeProvider>
        </ExportProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
