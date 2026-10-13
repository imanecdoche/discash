import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onComplete?: () => void
  durationMs?: number
}

export function SplashScreen({ onComplete, durationMs = 2200 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onComplete) {
        onComplete()
      }
    }, durationMs)

    return () => clearTimeout(timer)
  }, [durationMs, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          key="splash-screen"
          aria-label="Loading application"
          role="status"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000] select-none"
        >
          <div className="relative flex flex-col items-center justify-center max-w-full max-h-full p-4">
            <img
              src="/splash/splash.gif"
              alt="Discash Loading"
              className="w-auto h-auto max-w-[340px] max-h-[340px] object-contain pointer-events-none"
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
