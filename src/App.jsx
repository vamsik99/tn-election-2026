import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ConstituenciesPage from './pages/ConstituenciesPage'
import ConstituencyPage from './pages/ConstituencyPage'
import CandidatePage from './pages/CandidatePage'
import PartiesPage from './pages/PartiesPage'
import PartyPage from './pages/PartyPage'
import SearchPage from './pages/SearchPage'
import NotFoundPage from './pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="constituencies" element={<ConstituenciesPage />} />
              <Route path="constituency/:slug" element={<ConstituencyPage />} />
              <Route path="candidate/:slug" element={<CandidatePage />} />
              <Route path="parties" element={<PartiesPage />} />
              <Route path="party/:slug" element={<PartyPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
