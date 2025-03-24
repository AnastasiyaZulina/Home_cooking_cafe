'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    onSignInClick: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onSignInClick }) => {
    const { data: session } = useSession()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-white z-50 min-h-screen">
            <div className="flex flex-col h-full">
                {/* Верхняя часть с кнопкой назад и логотипом */}
                <div className="border-b p-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2">
                            <X className="w-6 h-6" />
                        </button>
                        <Link href="/" className="flex items-center gap-x-4" onClick={onClose}>
                            <Image
                                src="/logobig.png"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="w-12 h-12"
                            />
                            <div>
                                <h1 className="text-xl uppercase font-black">Скатерь-самобранка</h1>
                                <p className="text-sm text-gray-400 leading-3">по-домашнему вкусно!</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Навигация */}
                <div className="flex flex-col p-4 gap-6">
                    {/* Кнопка входа или профиля */}
                    <div className="pb-4 border-b">
                        {session ? (
                            <Link
                                href="/profile"
                                className="text-lg font-bold"
                                onClick={onClose}
                            >
                                Личный кабинет
                            </Link>
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
                    <Link
                        href="/about"
                        className="text-lg font-bold"
                        onClick={onClose}
                    >
                        О нас
                    </Link>
                    <Link
                        href="/delivery"
                        className="text-lg font-bold"
                        onClick={onClose}
                    >
                        Доставка
                    </Link>
                    <Link
                        href="/reviews"
                        className="text-lg font-bold"
                        onClick={onClose}
                    >
                        Отзывы
                    </Link>
                    <Link
                        href="/corporate"
                        className="text-lg font-bold"
                        onClick={onClose}
                    >
                        Корпоративным клиентам
                    </Link>
                </div>
            </div>
        </div>
    )
}