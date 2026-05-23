import { Routes, Route } from 'react-router'

// Landing page sections
import Navigation from './sections/Navigation'
import Hero from './sections/Hero'
import PainPoints from './sections/PainPoints'
import AiTeam from './sections/AiTeam'
import HowItWorks from './sections/HowItWorks'
import Pricing from './sections/Pricing'
import Testimonials from './sections/Testimonials'
import Faq from './sections/Faq'
import CtaBanner from './sections/CtaBanner'
import Footer from './sections/Footer'

// Pages
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ChatPage from './pages/dashboard/ChatPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import ProductsPage from './pages/dashboard/ProductsPage'
import KnowledgePage from './pages/dashboard/KnowledgePage'
import MarketingPage from './pages/dashboard/MarketingPage'
import AdminPage from './pages/dashboard/AdminPage'
import SettingsPage from './pages/dashboard/SettingsPage'

function LandingPage() {
  return (
    <div>
      <Navigation />
      <Hero />
      <PainPoints />
      <AiTeam />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="ai-training" element={<KnowledgePage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
