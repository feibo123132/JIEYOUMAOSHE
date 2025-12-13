import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'
import Navigation from '@/components/Navigation'
import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-warm-200">
          <Navigation />
          <main className="pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  )
}
