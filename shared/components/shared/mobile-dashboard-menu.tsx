'use client'
import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface MobileDashboardMenuProps {
    isOpen: boolean
    onClose: () => void
    onSignInClick: () => void
}

export const MobileDashboardMenu: React.FC<MobileDashboardMenuProps> = ({ isOpen, onClose, onSignInClick }) => {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (!isOpen) return null

    // Функция для проверки активного пути
    const isActive = (href: string) => pathname === href
    if (!session?.user || session.user.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-white z-50 min-h-screen">
            <div className="flex flex-col h-full">
                
                    <div className="border-b p-4 relative">
                        <div className="relative flex items-center gap-4">
                            <Link href="/" title="На главную" className="flex flex-col items-center gap-y-1 sm:gap-y-2">
                                <Image
                                    src="/logobig.png"
                                    alt="Logo"
                                    width={55}
                                    height={55}
                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                />
                                <h1 className="text-[14px] uppercase font-black text-center">
                                    Скатерть-<br />самобранка
                                </h1>
                            </Link>

                            <Link
                                href="/admin"
                                className="flex flex-col items-center gap-y-1 sm:gap-y-2 ml-25 sm:ml-0"
                                title="Панель управления"
                            >
                                <Image
                                    src="/dashboard.png"
                                    alt="Dashboard"
                                    width={60}
                                    height={60}
                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                />
                                <h1 className="text-[14px] uppercase font-black text-center">
                                    Админ-панель
                                </h1>
                            </Link>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-10 right-2 p-2"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                {/* Навигация */}
                <div className="flex flex-col p-4 gap-6">
                    {/* Кнопка входа или профиля */}
                    <div className="pb-4 border-b">
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
                                    href="/profile/data"
                                    className={`text-base ${isActive('/profile/data') ? 'text-primary font-medium' : ''}`}
                                    onClick={onClose}
                                >
                                    Данные профиля
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Основные ссылки */}
                    {['/categories', '/products', '/orders', '/stock', '/users', '/corporate', '/feedback', '/content'].map((href) => (
                        <Link
                            key={href}
                            href={href}
                            className={`text-lg font-bold ${isActive(href) ? 'text-primary' : ''}`}
                            onClick={onClose}
                        >
                            {href === '/new' && 'Новое'}
                            {href === '/categories' && 'Категории'}
                            {href === '/products' && 'Товары'}
                            {href === '/orders' && 'Заказы'}
                            {href === '/stock' && 'Ассортимент'}
                            {href === '/users' && 'Пользователи'}
                            {href === '/corporate' && 'Заявки на корп. питание'}
                            {href === '/feedback' && 'Отзывы'}
                            {href === '/content' && 'Контент'}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}