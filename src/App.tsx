import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Display from './pages/Display'
import Challenge from './pages/Challenge'
import Review from './pages/Review'
import DisplayStage from './pages/DisplayStage'
import ChallengeStage from './pages/ChallengeStage'
import ReviewStage from './pages/ReviewStage'

export default function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/display/:courseId" element={<Display />} />
          <Route path="/challenge/:courseId" element={<Challenge />} />
          <Route path="/review/:courseId" element={<Review />} />
          <Route path="/display-stage" element={<DisplayStage />} />
          <Route path="/challenge-stage" element={<ChallengeStage />} />
          <Route path="/review-stage" element={<ReviewStage />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
