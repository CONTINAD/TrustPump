import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Create from './pages/Create'
import Explore from './pages/Explore'
import Token from './pages/Token'

function App() {
  return (
    <div className="app">
      <div className="bg-grid"></div>
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/token/:address" element={<Token />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
