import React from 'react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { useMarkdownContent } from '../hooks/useMarkdownContent'
import { useLanguage } from '../contexts/LanguageContext'
import { useGitHubRelease } from '../hooks/useGitHubRelease'

const Install = () => {
    const { content, loading, error } = useMarkdownContent('install')
    const { t } = useLanguage()
    const { getDownloadUrls } = useGitHubRelease()

    if (loading) {
        return (
            <div 
                className="rounded-2xl shadow-xl border p-8"
                style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <div className="space-y-4">
                    <div className="skeleton h-12 rounded-xl"></div>
                    <div className="skeleton h-6 rounded-lg"></div>
                    <div className="skeleton h-32 rounded-xl"></div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="skeleton h-24 rounded-xl"></div>
                        <div className="skeleton h-24 rounded-xl"></div>
                        <div className="skeleton h-24 rounded-xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div 
                className="rounded-2xl shadow-xl border p-8 text-center"
                style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <div className="text-6xl mb-4">📱</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Installation Guide Unavailable
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Error loading content: {error}
                </p>
            </div>
        )
    }

    const downloadUrls = getDownloadUrls()

    return (
        <div 
            className="rounded-2xl shadow-xl border"
            style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 20px 40px var(--shadow-light)'
            }}
        >
            {/* Hero Section */}
            <div className="install-hero px-8 pt-12 pb-8 rounded-t-2xl relative">
                <div className="relative text-center fade-in-up">
                    <h1 
                        className="text-4xl lg:text-5xl font-bold mb-6"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {t('install.hero.title')}
                    </h1>
                    
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <div 
                            className="w-16 h-1 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-16 h-1 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                    </div>
                    
                    <p 
                        className="text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {t('install.hero.subtitle')}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
                {/* Desktop Apps Section */}
                <div className="fade-in-up delay-200 mb-12">
                    <h2 
                        className="text-3xl font-bold mb-8 text-center"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {t('install.desktop.title')}
                    </h2>
                    
                    {/* Desktop version - full cards */}
                    <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Windows EXE */}
                        {downloadUrls.exe && (
                            <a 
                                href={downloadUrls.exe}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="download-card fade-in-up delay-300 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none'
                                }}
                            >
                                <img className=" inline-block platform-icon mb-4" 
                                    src={`${import.meta.env.BASE_URL}windows-applications-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {t('install.windows.exe')}
                                </h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    {t('install.download')}
                                </p>
                                <div 
                                    className="download-button inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    Download
                                </div>
                            </a>
                        )}
                        
                        {/* Windows ZIP */}
                        {downloadUrls.zip && (
                            <a 
                                href={downloadUrls.zip}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="download-card fade-in-up delay-400 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none'
                                }}
                            >
                                <img className=" inline-block platform-icon mb-4" 
                                    src={`${import.meta.env.BASE_URL}zip-document-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {t('install.windows.zip')}
                                </h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    {t('install.download')}
                                </p>
                                <div 
                                    className="download-button inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    Download
                                </div>
                            </a>
                        )}

                        {/* macOS - Coming Soon */}
                        { downloadUrls.dmg ? (
                            <a 
                                href={downloadUrls.dmg}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="download-card fade-in-up delay-400 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none'
                                }}
                            >
                                <img className=" inline-block platform-icon mb-4" 
                                    src={`${import.meta.env.BASE_URL}apple-document-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {t('install.macos.dmg')}
                                </h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    {t('install.download')}
                                </p>
                                <div 
                                    className="download-button inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    Download
                                </div>
                            </a>
                        ) : (
                            <div 
                                className="download-card fade-in-up delay-500 p-6 rounded-2xl shadow-lg text-center opacity-60"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    cursor: 'not-allowed'
                                }}
                            >
                                <img className=" inline-block platform-icon mb-4" 
                                    src={`${import.meta.env.BASE_URL}apple-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {t('install.macos.dmg')}
                                </h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    {t('install.coming.soon')}
                                </p>
                                <div 
                                    className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
                                    style={{ 
                                        backgroundColor: 'var(--bg-tertiary)',
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    Soon
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile version - compact layout */}
                    <div className="md:hidden">
                        {/* Mobile info note */}
                        <div 
                            className="mb-4 p-3 rounded-lg text-center text-sm"
                            style={{ 
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            📱 {t('install.mobile.note')}
                        </div>
                        
                        <div className="download-grid-mobile">
                            {/* Mobile version - Windows EXE */}
                            <a 
                                href="https://github.com/Impirs/Razvivashka/releases/download/v2.0.0/playandlearn_2.0.0_x64.exe" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="download-card fade-in-up delay-300 rounded-xl shadow-md transition-all duration-300 text-center"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none'
                                }}
                            >
                                <img className=" inline-block platform-icon" 
                                    src={`${import.meta.env.BASE_URL}windows-applications-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Windows
                                </h4>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Installer
                                </p>
                                <div 
                                    className="download-button inline-block rounded font-semibold"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    .exe
                                </div>
                            </a>
                            
                            {/* Mobile version - Windows ZIP */}
                            <a 
                                href="https://github.com/Impirs/Razvivashka/releases/download/v2.0.0/playandlearn_2.0.0_x64.zip" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="download-card fade-in-up delay-400 rounded-xl shadow-md transition-all duration-300 text-center"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none'
                                }}
                            >
                                <img className=" inline-block platform-icon" 
                                    src={`${import.meta.env.BASE_URL}zip-document-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Windows
                                </h4>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Portable
                                </p>
                                <div 
                                    className="download-button inline-block rounded font-semibold"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    .zip
                                </div>
                            </a>

                            {/* Mobile version - macOS - Coming Soon (compact) */}
                            <div 
                                className="download-card coming-soon fade-in-up delay-500 rounded-xl shadow-md"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    cursor: 'not-allowed'
                                }}
                            >
                                <img className=" inline-block platform-icon" 
                                    src={`${import.meta.env.BASE_URL}apple-svgrepo-com.svg`}
                                    alt="web_icon" />
                                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                    macOS
                                </h4>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {t('install.coming.soon')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Installation Instructions */}
                <div className="fade-in-up delay-600">
                    <MarkdownRenderer content={content} />
                </div>

                {/* Bottom decoration */}
                <div className="text-center mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-center space-x-3 opacity-60">
                        <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-8 h-px"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-8 h-px"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Install
