import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
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
    const [isClientMobile, setIsClientMobile] = useState(false)

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
        setIsClosing(false)
    }, [location.pathname])

    // Determine client mobile after mount to avoid flash on desktop
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClientMobile(window.innerWidth <= 840)
        }
    }, [])

    // Handle page transitions with immediate scroll reset
    useEffect(() => {
        // Force scroll to absolute top with multiple methods
        const forceScrollToTop = () => {
            // Method 1: Standard window scroll
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto'
            })
            
            // Method 2: Direct property assignment
            window.pageYOffset = 0
            document.documentElement.scrollTop = 0
            document.body.scrollTop = 0
            
            // Method 3: Reset all possible scroll containers
            const scrollableElements = [
                document.documentElement,
                document.body,
                document.querySelector('.layout-container'),
                document.querySelector('.main-content'),
                document.querySelector('.main-content-inner'),
                document.querySelector('.content-wrapper')
            ]
            
            scrollableElements.forEach(element => {
                if (element) {
                    (element as HTMLElement).scrollTop = 0
                }
            })
        }
        
        // Disable smooth scrolling temporarily
        const html = document.documentElement
        const body = document.body
        const originalHtmlScrollBehavior = html.style.scrollBehavior
        const originalBodyScrollBehavior = body.style.scrollBehavior
        
        html.style.scrollBehavior = 'auto'
        body.style.scrollBehavior = 'auto'
        
        // Immediate reset
        forceScrollToTop()
        
        // Multiple resets with increasing delays
        const timers = [0, 1, 10, 25, 50, 100, 150].map(delay => 
            setTimeout(forceScrollToTop, delay)
        )
        
        // Final restore of scroll behavior
        const restoreTimer = setTimeout(() => {
            html.style.scrollBehavior = originalHtmlScrollBehavior || 'smooth'
            body.style.scrollBehavior = originalBodyScrollBehavior || 'auto'
        }, 200)
        
        return () => {
            timers.forEach(timer => clearTimeout(timer))
            clearTimeout(restoreTimer)
        }
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
                                
                                {isClientMobile && (
                                    <button
                                        onClick={toggleMobileMenu}
                                        className="mobile-nav-toggle"
                                    >
                                        ☰
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {isClientMobile && isMobileMenuOpen && (
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
                    <TransitionGroup>
                        <CSSTransition
                            key={location.pathname}
                            timeout={window.innerWidth <= 768 ? 300 : 600}
                            classNames="page"
                        >
                            <div className="content-wrapper">
                                {children}
                            </div>
                        </CSSTransition>
                    </TransitionGroup>
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
