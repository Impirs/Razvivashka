import React from 'react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { useMarkdownContent } from '../hooks/useMarkdownContent'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'

const Welcome = () => {
    const { content, loading, error } = useMarkdownContent('welcome')
    const { t } = useLanguage()
    const navigate = useNavigate()

    const handlePreviewClick = () => {
        navigate('/preview')
    }

    const handleContactFormClick = () => {
        window.open('https://forms.gle/hQ3Fo3BozxDgZqeM6', '_blank')
    }

    const handleUpdateClick = () => {
        navigate('/update')
    }

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
                    <div className="skeleton h-6 rounded-lg w-3/4"></div>
                    <div className="skeleton h-6 rounded-lg w-1/2"></div>
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
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Oops! Something went wrong
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Error loading content: {error}
                </p>
            </div>
        )
    }

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
            <div className="welcome-hero px-8 pt-12 pb-8 rounded-t-2xl relative">
                <div 
                    className="absolute inset-0 rounded-t-2xl"
                    style={{
                        background: `linear-gradient(135deg, var(--bg-gradient-from) 0%, var(--bg-gradient-to) 100%)`
                    }}
                ></div>
                
                <div className="relative text-center fade-in-up">
                    <h1 
                        className="text-4xl lg:text-6xl font-bold mb-6"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {t('welcome.hero.title')}
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
                        className="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {t('welcome.hero.subtitle')}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
                <div className="fade-in-up delay-200">
                    <MarkdownRenderer content={content} />
                </div>
                
                {/* Action Cards */}
                <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Preview Card */}
                    <div 
                        className="welcome-action-card fade-in-up delay-300 text-white p-8 rounded-2xl cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        onClick={handlePreviewClick}
                    >
                        <div className="welcome-header-flex">
                            <div className="text-4xl">🎯</div>
                            <h3 className="text-xl font-bold">{t('welcome.preview.title')}</h3>
                        </div>
                        <p className="mb-6 opacity-90">{t('welcome.preview.description')}</p>
                        <button className="welcome-action-button enhanced-button bg-white text-green-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50">
                            {t('welcome.preview.button')}
                        </button>
                    </div>

                    {/* Updates Card */}
                    <div 
                        className="welcome-action-card fade-in-up delay-400 text-white p-8 rounded-2xl cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                        onClick={handleUpdateClick}
                    >
                        <div className="welcome-header-flex">
                            <div className="text-4xl">🔄</div>
                            <h3 className="text-xl font-bold">{t('welcome.updates.title')}</h3>
                        </div>
                        <p className="mb-6 opacity-90">{t('welcome.updates.description')}</p>
                        <button className="welcome-action-button enhanced-button bg-white text-red-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50">
                            {t('welcome.updates.button')}
                        </button>
                    </div>

                    {/* Contact Card */}
                    <div 
                        className="welcome-action-card fade-in-up delay-500 text-white p-8 rounded-2xl cursor-pointer md:col-span-2 lg:col-span-1"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
                        onClick={handleContactFormClick}
                    >
                        <div className="welcome-header-flex">
                            <div className="text-4xl">✍️</div>
                            <h3 className="text-xl font-bold">{t('welcome.contact.title')}</h3>
                        </div>
                        <p className="mb-6 opacity-90">{t('welcome.contact.description')}</p>
                        <button className="welcome-action-button enhanced-button bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50">
                            {t('welcome.contact.button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Welcome
