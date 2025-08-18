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
            <div className="mt-8 p-6 rounded-lg" 
                style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)' 
                }}
            >
                {/* <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {quickInstallText}
                </h3> */}
                <div className="grid md:grid-cols-4 gap-4">
                    <a 
                        href="https://github.com/Impirs/Razvivashka/releases/download/v1.2.5/play_and_learn-Setup-1.2.5.exe" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="text-3xl mb-2">💻</div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Windows .exe</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{windowsText}</p>
                    </a>
                    
                    <a 
                        href="https://github.com/Impirs/Razvivashka/releases/download/v1.2.5/play_and_learn-Setup-1.2.5.zip" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="text-3xl mb-2">💻</div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Windows .zip</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{winZIPtext}</p>
                    </a>

                    <a 
                        // href="https://github.com/Impirs/Razvivashka/releases" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="text-3xl mb-2">🍎</div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>macOS .dmg</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{macText}</p>
                    </a>
                </div>
            </div>
            <MarkdownRenderer content={content} />
        </div>
    )
}

export default Install
