import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'

interface LayoutProps {
    children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const { language, setLanguage, t } = useLanguage()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    const navItems = [
        { path: '/welcome', label: t('nav.welcome'), icon: '🎯' },
        { path: '/install', label: t('nav.install'), icon: '📦' },
        { path: '/docs', label: t('nav.docs'), icon: '📚' }
    ]

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ru' : 'en')
    }

    const toggleMobileMenu = () => {
        if (isMobileMenuOpen) {
            closeMobileMenu()
        } else {
            setIsMobileMenuOpen(true)
            setIsClosing(false)
        }
    }

    const closeMobileMenu = () => {
        setIsClosing(true)
        setTimeout(() => {
            setIsMobileMenuOpen(false)
            setIsClosing(false)
        }, 300) // Duration should match CSS animation
    }

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    return (
        <div className="layout-container">
            <header className="header">
                <div className="header-content">
                    <div className="header-container">
                        <div className="header-logo">
                            <div className="header-logo-icon">🧠</div>
                            <h1 className="header-logo-text">Razvivashka</h1>
                        </div>
                        
                        <div className="header-nav">
                            <nav className="nav-links">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                            
                            <div className="header-controls">
                                <button
                                    onClick={toggleTheme}
                                    className="control-button"
                                    title={t('theme.toggle')}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                                
                                <button
                                    onClick={toggleLanguage}
                                    className="control-button language-button"
                                >
                                    {t('language.toggle')}
                                </button>
                                
                                <button
                                    onClick={toggleMobileMenu}
                                    className="mobile-nav-toggle"
                                >
                                    ☰
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div 
                    className={`mobile-nav ${isClosing ? 'closing' : 'open'}`}
                    onClick={closeMobileMenu}
                >
                    <div 
                        className={`mobile-nav-content ${isClosing ? 'closing' : 'open'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mobile-nav-header">
                            <div className="header-logo">
                                <div className="header-logo-icon">🧠</div>
                                <h2 className="header-logo-text">Razvivashka</h2>
                            </div>
                            <button
                                onClick={closeMobileMenu}
                                className="mobile-nav-close"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <nav className="mobile-nav-links">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        
                        <div className="mobile-nav-controls">
                            <button
                                onClick={toggleTheme}
                                className="control-button"
                                title={t('theme.toggle')}
                            >
                                {theme === 'light' ? '🌙' : '☀️'} {t('theme.toggle')}
                            </button>
                            
                            <button
                                onClick={toggleLanguage}
                                className="control-button language-button"
                            >
                                🌐 {t('language.toggle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <main className="main-content">
                <div className="main-content-inner">
                    <div className="content-wrapper">
                        {children}
                    </div>
                </div>
                <footer className="footer">
                    <div className="footer-content">
                        <p className="footer-description">
                            {t('footer.description')}
                        </p>
                        <p className="footer-copyright">
                            {t('footer.copyright')}
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default Layout
