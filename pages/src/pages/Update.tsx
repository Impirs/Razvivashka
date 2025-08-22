import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useGitHubRelease } from '../hooks/useGitHubRelease'
import MarkdownRenderer from '../components/MarkdownRenderer'

const Update = () => {
    const { t } = useLanguage()
    const { release, loading, error, getLocalizedReleaseNotes, getDownloadUrls, version } = useGitHubRelease()

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
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="skeleton h-24 rounded-xl"></div>
                        <div className="skeleton h-24 rounded-xl"></div>
                    </div>
                </div>
                <div className="text-center mt-8" style={{ color: 'var(--text-secondary)' }}>
                    <div className="text-4xl mb-4">🔄</div>
                    <p className="text-lg">{t('update.loading')}</p>
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
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {t('update.error')}
                </h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {error}
                </p>
                <Link 
                    to="/welcome" 
                    className="enhanced-button inline-block px-6 py-3 rounded-xl transition-all duration-300"
                    style={{ 
                        backgroundColor: 'var(--accent)', 
                        color: 'white',
                        textDecoration: 'none'
                    }}
                >
                    {t('update.backToHome')}
                </Link>
            </div>
        )
    }

    if (!release) {
        return (
            <div 
                className="rounded-2xl shadow-xl border p-8 text-center"
                style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {t('update.noReleases')}
                </h2>
                <Link 
                    to="/welcome" 
                    className="enhanced-button inline-block px-6 py-3 rounded-xl transition-all duration-300"
                    style={{ 
                        backgroundColor: 'var(--accent)', 
                        color: 'white',
                        textDecoration: 'none'
                    }}
                >
                    {t('update.backToHome')}
                </Link>
            </div>
        )
    }

    const downloadUrls = getDownloadUrls()
    const releaseNotes = getLocalizedReleaseNotes(release.body)

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
            <div className="update-hero px-8 pt-12 pb-8 rounded-t-2xl relative text-white">
                <div className="relative fade-in-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <div className="version-badge">
                                {version} • {t('update.currentVersion')}
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                                {t('update.title')}
                            </h1>
                        </div>
                        <Link 
                            to="/welcome" 
                            className="enhanced-button inline-flex items-center px-6 py-3 rounded-xl transition-all duration-300 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                            style={{ 
                                color: 'white',
                                textDecoration: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            ← {t('update.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
                {/* Download Section */}
                <div className="fade-in-up delay-200 mb-12">
                    <h2 
                        className="text-2xl font-bold mb-6 text-center"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {t('update.downloadLatest')}
                    </h2>
                    
                    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
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
                                <div className="platform-icon mb-4">💠</div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {t('install.windows.exe')}
                                </h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    {t('update.downloadExe')}
                                </p>
                                <div 
                                    className="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    {t('install.download')}
                                </div>
                            </a>
                        )}
                        
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
                                <div className="platform-icon mb-4">📦</div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {t('install.windows.zip')}
                                </h4>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    {t('update.downloadZip')}
                                </p>
                                <div 
                                    className="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        color: 'white'
                                    }}
                                >
                                    {t('install.download')}
                                </div>
                            </a>
                        )}
                    </div>
                </div>
                
                {/* Release Notes */}
                {releaseNotes && (
                    <div className="fade-in-up delay-500">
                        <div 
                            className="release-card p-6 rounded-2xl"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)', 
                                border: '1px solid var(--border-color)' 
                            }}
                        >
                            <MarkdownRenderer content={releaseNotes} />
                        </div>
                    </div>
                )}

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

export default Update
