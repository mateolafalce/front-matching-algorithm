import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Teoria from './components/Teoria.jsx'
import GestionarUsers from './components/GestionarUsers.jsx'
import Home from './components/Home.jsx'
import Reservas from './components/Reservas.jsx'

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar 
        onTheoryClick={() => navigate('/teoria')}
        onUsersClick={() => navigate('/users')}
        onHomeClick={() => navigate('/')}
        onCalendarClick={() => navigate('/reservar')}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teoria" element={<Teoria />} />
        <Route path="/users" element={<GestionarUsers />} />
        <Route path="/reservar" element={<Reservas />} />
      </Routes>
    </>
  )
}

export default App
