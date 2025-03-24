'use client'

import { useEffect, useState } from 'react'

const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
}

export const useBreakpoint = (breakpoint: keyof typeof breakpoints) => {
    const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false)

    useEffect(() => {
        const checkBreakpoint = () => {
            setIsAboveBreakpoint(window.innerWidth >= breakpoints[breakpoint])
        }

        checkBreakpoint()
        window.addEventListener('resize', checkBreakpoint)

        return () => window.removeEventListener('resize', checkBreakpoint)
    }, [breakpoint])

    return isAboveBreakpoint
}