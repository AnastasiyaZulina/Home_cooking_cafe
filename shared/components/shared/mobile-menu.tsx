'use client'
import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    onSignInClick: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onSignInClick }) => {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (!isOpen) return null

    // Функция для проверки активного пути
    const isActive = (href: string) => pathname === href

    return (
        <div className="fixed inset-0 bg-white z-50 min-h-screen">
            <div className="flex flex-col h-full">
                {/* Верхняя часть с кнопкой назад и логотипом */}
                <div className="border-b p-4 relative">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-x-4" onClick={onClose}>
                            <Image
                                src="/logobig.png"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="w-12 h-12"
                            />
                            <div>
                                <h1 className="text-[16px] lg:text-xl uppercase font-black">Скатерь-самобранка</h1>
                                <p className="text-sm text-gray-400 leading-3">по-домашнему вкусно!</p>
                            </div>
                        </Link>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 p-2"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Навигация */}
                <div className="flex flex-col p-4 gap-6">
                    {/* Кнопка входа или профиля */}
                    <div className="pb-4 border-b">
                        {session ? (
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/profile"
                                    className={`text-lg font-bold ${isActive('/profile') ? 'text-primary' : ''}`}
                                    onClick={onClose}
                                >
                                    Личный кабинет
                                </Link>
                                <div className="flex flex-col pl-4 gap-2">
                                    <Link
                                        href="/profile"
                                        className={`text-base ${isActive('/profile') ? 'text-primary font-medium' : ''}`}
                                        onClick={onClose}
                                    >
                                        Мои заказы
                                    </Link>
                                    <Link
                                        href="/profile/data"
                                        className={`text-base ${isActive('/profile/data') ? 'text-primary font-medium' : ''}`}
                                        onClick={onClose}
                                    >
                                        Данные профиля
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    onSignInClick()
                                    onClose()
                                }}
                                className="text-lg font-bold"
                            >
                                Войти
                            </button>
                        )}
                    </div>

                    {/* Основные ссылки */}
                    {['/about', '/delivery', '/reviews', '/corporate'].map((href) => (
                        <Link
                            key={href}
                            href={href}
                            className={`text-lg font-bold ${isActive(href) ? 'text-primary' : ''}`}
                            onClick={onClose}
                        >
                            {href === '/about' && 'О нас'}
                            {href === '/delivery' && 'Доставка'}
                            {href === '/reviews' && 'Отзывы'}
                            {href === '/corporate' && 'Корпоративным клиентам'}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}