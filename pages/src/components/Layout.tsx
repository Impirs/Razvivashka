import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'

interface LayoutProps {
    children: React.ReactNode
}

const Layout    = ({ children } : LayoutProps) => {
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const { language, setLanguage, t } = useLanguage()

    const navItems = [
        { path: '/welcome', label: t('nav.welcome'), icon: '🎯' },
        { path: '/install', label: t('nav.install'), icon: '📦' },
        { path: '/docs', label: t('nav.docs'), icon: '📚' }
    ]

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ru' : 'en')
    }

    return (
        <div className="min-h-screen transition-colors duration-300" 
            style={{ background: 'linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))' }}
        >
            <header className="shadow-lg" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">🧠</div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Razvivashka</h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <nav className="flex space-x-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                            location.pathname === item.path
                                                ? 'text-white'
                                                : 'hover:opacity-80'
                                        }`}
                                        style={{
                                            backgroundColor: location.pathname === item.path ? 'var(--accent)' : 'transparent',
                                            color: location.pathname === item.path ? '#ffffff' : 'var(--text-secondary)'
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80"
                                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    title={t('theme.toggle')}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                                
                                <button
                                    onClick={toggleLanguage}
                                    className="px-3 py-2 rounded-lg transition-colors duration-200 hover:opacity-80 text-sm font-medium"
                                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    {t('language.toggle')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="max-w-6xl mx-auto px-4 py-8">
                {children}
            </main>
            
            <footer className="py-8 mt-16" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {t('footer.description')}
                    </p>
                    <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
                        {t('footer.copyright')}
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Layout
