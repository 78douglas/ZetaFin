import { BrowserRouter as Router, Routes, Route } from "react-router";
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
import CoupleData from "@/react-app/pages/CoupleData";
import Help from "@/react-app/pages/Help";
import Login from "@/react-app/pages/Login";
import Register from "@/react-app/pages/Register";
import ForgotPassword from "@/react-app/pages/ForgotPassword";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
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
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Rotas protegidas */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/transacoes" element={
                  <ProtectedRoute>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/nova-transacao" element={
                  <ProtectedRoute>
                    <Layout>
                      <NewTransaction />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/editar-transacao/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <EditTransaction />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios" element={
                  <ProtectedRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios/mensal" element={
                  <ProtectedRoute>
                    <Layout>
                      <MonthlyReport />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios/periodo" element={
                  <ProtectedRoute>
                    <Layout>
                      <PeriodReport />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios/categorias" element={
                  <ProtectedRoute>
                    <Layout>
                      <CategoryAnalysis />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios/tendencias" element={
                  <ProtectedRoute>
                    <Layout>
                      <TrendsProjections />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios/metas" element={
                  <ProtectedRoute>
                    <Layout>
                      <GoalsTracking />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/relatorios/frequentes" element={
                  <ProtectedRoute>
                    <Layout>
                      <FrequentExpenses />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/perfil" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/perfil/configuracoes" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/perfil/dados-casal" element={
                  <ProtectedRoute>
                    <Layout>
                      <CoupleData />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/perfil/ajuda" element={
                  <ProtectedRoute>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
            <Toaster position="top-right" richColors />
          </EditModeProvider>
        </ExportProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
