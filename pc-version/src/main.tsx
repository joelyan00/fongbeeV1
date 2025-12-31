import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import StandardServices from './pages/StandardServices'
import CustomServices from './pages/CustomServices.tsx'
import ProviderApply from './pages/ProviderApply'
import ArticleDetailPage from './pages/ArticleDetailPage'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import OrderList from './pages/OrderList'
import PaymentMethods from './pages/PaymentMethods'
import AddressList from './pages/AddressList'
import SalesDashboard from './pages/SalesDashboard'

import { ToastProvider } from './contexts/ToastContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/standard" element={<StandardServices />} />
          <Route path="/custom" element={<CustomServices />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
          <Route path="/provider-apply" element={<ProviderApply />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/addresses" element={<AddressList />} />
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)
