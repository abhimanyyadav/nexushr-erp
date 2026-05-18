

import { BrowserRouter } from 'react-router-dom'
import Hero from './components/common/Hero'
import Navbar from './components/layout/Navbar'
import AppRoutes from './routes/AppRoutes'
import Landing from './pages/public/Landing'
import Register from './pages/public/Register'
import Login from './pages/public/Login'
function App() {


  return (
    <>
    
    <BrowserRouter>

      <AppRoutes />

    </BrowserRouter>
       
    </>
  )
}

export default App
