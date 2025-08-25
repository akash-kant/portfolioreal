import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Layout Components
import Header from './components/common/Header'
import Footer from './components/common/Footer'

// Pages
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Social from './pages/Social'
import Resources from './pages/Resources'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
// Add this line with the other page imports
// Special Pages
import DownloadResource from './pages/DownloadResource'
import BookingSuccess from './pages/BookingSuccess'
import BookingPage from './pages/BookingPage'
import NotFound from './pages/NotFound'

function App() {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-screen"
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/social" element={<Social />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard/*" element={<Dashboard />} />
                        <Route path="/download/:token" element={<DownloadResource />} />
                        <Route path="/booking-success" element={<BookingSuccess />} />
                        <Route path="/booking/:serviceId" element={<BookingPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </motion.main>
            </AnimatePresence>

            <Footer />
        </div>
    )
}

export default App