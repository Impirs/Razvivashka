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
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="animate-pulse">
                    <div className="h-8 rounded mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                </div>
                <div className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
                    <p>{t('update.loading')}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    <p>{t('update.error')}: {error}</p>
                    <Link 
                        to="/welcome" 
                        className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            textDecoration: 'none'
                        }}
                    >
                        {t('update.backToHome')}
                    </Link>
                </div>
            </div>
        )
    }

    if (!release) {
        return (
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    <p>{t('update.noReleases')}</p>
                    <Link 
                        to="/welcome" 
                        className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            textDecoration: 'none'
                        }}
                    >
                        {t('update.backToHome')}
                    </Link>
                </div>
            </div>
        )
    }

    const downloadUrls = getDownloadUrls()
    const releaseNotes = getLocalizedReleaseNotes(release.body)

    return (
        <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 
                    className="text-4xl font-bold mb-4 sm:mb-0" 
                    style={{ 
                        color: 'var(--text-primary)',
                        lineHeight: 1.1
                    }}
                >
                    {t('update.title')}
                </h1>
                <Link 
                    to="/welcome" 
                    className="inline-flex items-center px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    ← {t('update.backToHome')}
                </Link>
            </div>

            {/* Release Notes */}
            {releaseNotes && (
                <div 
                    className="p-4 mb-8 rounded-lg"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)' 
                    }}
                >
                    <MarkdownRenderer content={releaseNotes} />
                </div>
            )}

            {/* Download Buttons */}
            <div 
                className="p-6 rounded-lg" 
                style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)' 
                }}
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    {downloadUrls.exe && (
                        <a 
                            href={downloadUrls.exe}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-105"
                            style={{ 
                                backgroundColor: 'var(--bg-primary)', 
                                border: '1px solid var(--border-color)',
                                textDecoration: 'none'
                            }}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-2">💠</div>
                                <h4 className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
                                    Windows .exe
                                </h4>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {t('update.downloadExe')}
                                </p>
                            </div>
                        </a>
                    )}
                    
                    {downloadUrls.zip && (
                        <a 
                            href={downloadUrls.zip}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 hover:scale-105"
                            style={{ 
                                backgroundColor: 'var(--bg-primary)', 
                                border: '1px solid var(--border-color)',
                                textDecoration: 'none'
                            }}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-2">📦</div>
                                <h4 className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
                                    Windows .zip
                                </h4>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {t('update.downloadZip')}
                                </p>
                            </div>
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Update
