'use client'

import { useState, useEffect } from 'react'

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false)
  const threshold = 100 // height of header
  
  useEffect(() => {
    let lastScrollY = window.scrollY
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      const passedThreshold = scrollY > threshold
      
      if (direction !== scrollDirection) {
        setScrollDirection(direction)
      }
      
      if (passedThreshold !== scrolledPastHeader) {
        setScrolledPastHeader(passedThreshold)
      }
      
      lastScrollY = scrollY > 0 ? scrollY : 0
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [scrollDirection, scrolledPastHeader])

  return { scrollDirection, scrolledPastHeader }
}