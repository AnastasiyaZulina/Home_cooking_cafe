'use client'

import { Loader2, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/shared/store'
import { cn } from '@/shared/lib/utils'
import { useBreakpoint } from '@/hooks'

export const FloatingCheckout = () => {
    const router = useRouter()
    const loading = useCartStore(state => state.loading)
    const items = useCartStore(state => state.items)

    const FloatingButton = () => (
    <button
        className={cn(
            "bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:scale-110 transition-colors relative",
            loading && "cursor-not-allowed opacity-70"
        )}
        onClick={() => !loading && router.push('/checkout')}
        disabled={loading}
    >
        {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
            <>
                <ShoppingCart className="w-6 h-6" />
                {items.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-gray-400 font-bold text-white text-[14px] rounded-full w-6 h-6 flex items-center justify-center">
                        {items.length}
                    </span>
                )}
            </>
        )}
    </button>)

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <FloatingButton />
        </div>
    )
}