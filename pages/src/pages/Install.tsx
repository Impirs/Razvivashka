import React from 'react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { useMarkdownContent } from '../hooks/useMarkdownContent'
import { useLanguage } from '../contexts/LanguageContext'

const Install = () => {
    const { content, loading, error } = useMarkdownContent('install')
    const { language } = useLanguage()

    if (loading) {
        return (
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="animate-pulse">
                    <div className="h-8 rounded mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    <p>Error loading content: {error}</p>
                </div>
            </div>
        )
    }

    const desktopText = language === 'ru' ?
        '💻 Десктопное приложение' :
        '💻 Desktop Application'

    const installText = language === 'ru' ?
        '📦 Установка Play and Learn' : 
        '📦 Installing Play and Learn'
    
    const windowsText = language === 'ru' ? 
        'Скачать v2.0.0' : 
        'Download v2.0.0'
    const winZIPtext = language === 'ru' ? 
        'Скачать v2.0.0' : 
        'Download v2.0.0'

    const macText = language === 'ru' ?
        'Скачать v2.0.0' :
        'Download v2.0.0'

    const soonAvailable = language === 'ru' ?
        'Скоро будет доступно' :
        'Coming Soon'

    return (
        <div className="rounded-xl shadow-lg p-8" 
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <h1 className="text-xl font-semibold mb-4" 
                style={{ 
                    color: 'var(--text-primary)',
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    lineHeight: 1.1
                }}
            >
                {installText}
            </h1>
            <hr />
            <h2 className="text-3xl font-semibold text-gray-700 mt-8 mb-4"
                style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginTop: '2rem',
                        marginBottom: '1rem',
                        lineHeight: '1.2',
                    }}
            >
                {desktopText}
            </h2>
            <div className="mt-8 p-6 rounded-lg" 
                style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)' 
                }}
            >
                <div className="grid md:grid-cols-4 gap-4">
                    <a 
                        href="https://github.com/Impirs/Razvivashka/releases/download/v2.0.0/playandlearn_2.0.0_x64.exe" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-105"
                        style={{ 
                            backgroundColor: 'var(--bg-primary)', 
                            border: '1px solid var(--border-color)',
                            textDecoration: 'none'
                        }}
                    >
                        <div className="text-3xl mb-2">💠</div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Windows .exe</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{windowsText}</p>
                    </a>
                    
                    <a 
                        href="https://github.com/Impirs/Razvivashka/releases/download/v2.0.0/playandlearn_2.0.0_x64.zip" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-105"
                        style={{ 
                            backgroundColor: 'var(--bg-primary)', 
                            border: '1px solid var(--border-color)',
                            textDecoration: 'none'
                        }}
                    >
                        <div className="text-3xl mb-2">💠</div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Windows .zip</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{winZIPtext}</p>
                    </a>

                    <a 
                        // href="https://github.com/Impirs/Razvivashka/releases" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-105"
                        style={{ 
                            backgroundColor: 'var(--bg-primary)', 
                            border: '1px solid var(--border-color)',
                            textDecoration: 'none'
                        }}
                    >
                        <div className="text-3xl mb-2">🍎</div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>macOS .dmg</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}> {soonAvailable}</p>
                        {/* <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{macText}</p> */}
                    </a>
                </div>
            </div>
            <MarkdownRenderer content={content} />
        </div>
    )
}

export default Install
