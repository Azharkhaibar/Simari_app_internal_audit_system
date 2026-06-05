// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { DarkModeProvider } from './shared/components/Darkmodecontext.jsx';
import DarkModeToggle from './shared/components/Toggledarkmode.jsx';
import ProtectedRoute from './features/Dashboard/routes/ProtectedAuthRoute.routes.jsx';
import PublicRoute from './features/Dashboard/routes/PublicRoute.jsx';
import Mainpage from './pages/mainpage/home';
import LoginPage from './features/auth/pages/loginform';
import RegisterPage from './features/auth/pages/registform.jsx';
import ForgotPassword from './features/auth/pages/forgot-password.jsx';
import DashboardLayout from './features/Dashboard/main.jsx';
import Dashboard from './features/Dashboard/layout/dashboard.jsx';
import Investasi from './features/Dashboard/pages/RiskProfile/pages/investasi/Investasi.jsx';
import Pasar from './features/Dashboard/pages/RiskProfile/pages/pasar/pasarPage.jsx';
import Likuiditas from './features/Dashboard/pages/RiskProfile/pages/likuiditas/Likuiditas.jsx';
import Hukum from './features/Dashboard/pages/RiskProfile/pages/hukum/Hukum.jsx';
import Kepatuhan from './features/Dashboard/pages/RiskProfile/pages/kepatuhan/Kepatuhan.jsx';
import Reputasi from './features/Dashboard/pages/RiskProfile/reputasi/Reputasi.jsx';
import Report from './features/Dashboard/report/report.jsx';
import Settings from './features/Dashboard/pages/RiskProfile/setting/setting.jsx';
import ProfilePage from './features/Dashboard/pages/profile/pages/userprofile.jsx';
import NotificationPage from './features/Dashboard/pages/notification/pages/notification.jsx';
import { useAuth } from './features/auth/hooks/useAuth.hook.js';
import { AuditLog } from './features/Dashboard/pages/audit-log/pages/audit-log-page.jsx';
import OperasionalOJK from './features/Dashboard/pages/OJK/pages/regulatory/operasional/tabs/operasional';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Stratejik from './features/Dashboard/pages/RiskProfile/pages/stratejik/stratejik.jsx';
import Ras from './features/Dashboard/pages/RAS/pages/ras.jsx';
import Operasional from './features/Dashboard/pages/RiskProfile/pages/operational/operasional.jsx';
import RiskProfileRepository from './features/Dashboard/pages/RiskProfile/pages/riskResikoProfile/pages/riskprofilerepository.jsx';
import RasPageDummy from './features/Dashboard/pages/RAS/pages/ras.jsx';
import PasarProdukOJK from './features/Dashboard/pages/OJK/pages/produk/pasar-produk/tabs/pasar-produk.jsx';
import LikuiditasProdukOJK from './features/Dashboard/pages/OJK/pages/produk/likuiditas-produk/tabs/likuiditas-produk';
import KreditProdukOJK from './features/Dashboard/pages/OJK/pages/produk/kredit-produk/tabs/kredit-produk';
import KonsentrasiProdukOJK from './features/Dashboard/pages/OJK/pages/produk/konsentrasi-produk/tabs/konsentrasi-produk';
import KepatuhanOJK from './features/Dashboard/pages/OJK/pages/regulatory/kepatuhan/tabs/kepatuhan';
import HukumOJK from './features/Dashboard/pages/OJK/pages/regulatory/hukum/tabs/hukum';

import Ringkasan from './features/Dashboard/pages/RiskProfile/pages/ringkasan/ringkasan';

// ✅ IMPORT REKAP 1
import Rekap1Page from './features/Dashboard/pages/RiskProfile/pages/rekapdata1/rekap1page';
import RekapData2 from './features/Dashboard/pages/RiskProfile/pages/rekapdata2/rekapdata2';
import RekapData from './features/Dashboard/pages/RiskProfile/pages/rekapdata/rekapdata';
import ReputasiOJK from './features/Dashboard/pages/OJK/pages/regulatory/reputasi/tabs/reputasi';
import StrategisOJK from './features/Dashboard/pages/OJK/pages/regulatory/strategis/tabs/strategis';
import InvestasiOJK from './features/Dashboard/pages/OJK/pages/regulatory/investasi/tabs/investasi';
import RentabilitasOJK from './features/Dashboard/pages/OJK/pages/regulatory/rentabilitas/tabs/rentabilitas';
import PermodalanOJK from './features/Dashboard/pages/OJK/pages/regulatory/permodalan/tabs/permodalan';
import TatakelolaOJK from './features/Dashboard/pages/OJK/pages/regulatory/tatakelola/tabs/tatakelola';
import RekapDataOjk from './features/Dashboard/pages/OJK/pages/rekap-data/rekap-data-main';
import RekapData1Ojk from './features/Dashboard/pages/OJK/pages/rekap-data-1/rekap-data-1';
import RingkasanOjk from './features/Dashboard/pages/OJK/pages/ringkasan/ringkasan';
import RekapData2Ojk from './features/Dashboard/pages/OJK/pages/rekap-data-2/rekap-data-2';
import PeringkatKompositOjk from './features/Dashboard/pages/OJK/pages/peringkat-komposit/peringkat-komposit';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <div className="fixed top-4 right-4 z-50">
          <DarkModeToggle />
        </div>

        <div className="min-h-screen transition-colors">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="risk-form" element={<Investasi />} />
              <Route path="repository" element={<RiskProfileRepository />} />
              <Route path="risk-form/investasi" element={<Investasi />} />
              <Route path="risk-form/pasar" element={<Pasar />} />
              <Route path="risk-form/likuiditas" element={<Likuiditas />} />
              <Route path="risk-form/operasional" element={<Operasional />} />
              <Route path="risk-form/hukum" element={<Hukum />} />
              <Route path="risk-form/kepatuhan" element={<Kepatuhan />} />
              <Route path="risk-form/stratejik" element={<Stratejik />} />
              <Route path="risk-form/reputasi" element={<Reputasi />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="report" element={<Report />} />
              {/* ✅ REKAP 1 - ROUTE */}
              <Route path="rekap1" element={<Rekap1Page />} />
              <Route path="rekapdata2" element={<RekapData2 />} />
              <Route path="rekap-data" element={<RekapData />} />
              <Route path="ringkasan" element={<Ringkasan />} />
              {/* RAS ASLI - Sistem Terintegrasi */}
              <Route path="ras" element={<Ras />} />
              {/* RAS DUMMY - Halaman Testing Terpisah */}
              <Route path="dummy" element={<RasPageDummy />} />
              <Route path="notification" element={<NotificationPage />} />
              <Route path="audit-log" element={<AuditLog />} />
              <Route path="settings" element={<Settings />} />
              {/* ROUTE UNTUK OJK */}
              <Route path="ojk/pasar-produk" element={<PasarProdukOJK />} />
              <Route path="ojk/likuiditas-produk" element={<LikuiditasProdukOJK />} />
              <Route path="ojk/kredit-produk" element={<KreditProdukOJK />} />
              <Route path="ojk/konsentrasi-produk" element={<KonsentrasiProdukOJK />} />
              <Route path="ojk/operasional" element={<OperasionalOJK />} />
              <Route path="ojk/hukum" element={<HukumOJK />} />
              <Route path="ojk/kepatuhan" element={<KepatuhanOJK />} />
              <Route path="ojk/reputasi" element={<ReputasiOJK />} />
              <Route path="ojk/strategis" element={<StrategisOJK />} />
              <Route path="ojk/investasi" element={<InvestasiOJK />} />
              <Route path="ojk/rentabilitas" element={<RentabilitasOJK />} />
              <Route path="ojk/permodalan" element={<PermodalanOJK />} />
              <Route path="ojk/tata-kelola" element={<TatakelolaOJK />} />
              <Route path="ojk/rekap-data" element={<RekapDataOjk />} />
              <Route path="ojk/rekap-data-1" element={<RekapData1Ojk />} />
              <Route path="ojk/ringkasan" element={<RingkasanOjk />} />
              <Route path="ojk/rekap-data-2" element={<RekapData2Ojk />} />
              <Route path="ojk/peringkat-komposit" element={<PeringkatKompositOjk />} />
            </Route>

            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Mainpage />} />

            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </div>
      </DarkModeProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
