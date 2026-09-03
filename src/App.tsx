import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './features/dashboard/DashboardPage'
import CustomersPage from './features/customers/CustomersPage'
import ProvidersPage from './features/providers/ProvidersPage'
import CategoriesPage from './features/categories/CategoriesPage'
import BookingsPage from './features/bookings/BookingsPage'
import SettingsPage from './features/settings/SettingsPage'
import SubcategoriesPage from './features/subcategories/SubcategoriesPage'
import ServicesPage from './features/services/ServicesPage'
import BannersPage from './features/banners/BannersPage'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="customers"   element={<CustomersPage />} />
          <Route path="providers"   element={<ProvidersPage />} />
          <Route path="categories"  element={<CategoriesPage />} />
          <Route path="bookings"    element={<BookingsPage />} />
          <Route path="settings"    element={<SettingsPage />} />
          <Route path="subcategories" element={<SubcategoriesPage />} />
          <Route path="services"    element={<ServicesPage />} />
          <Route path="banners"     element={<BannersPage />} />
          {/* Future routes added per phase */}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
