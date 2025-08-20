import React from 'react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { useMarkdownContent } from '../hooks/useMarkdownContent'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'

const Welcome = () => {
    const { content, loading, error } = useMarkdownContent('welcome')
    const { language, t } = useLanguage()
    const navigate = useNavigate()

    const handleDownloadClick = () => {
        window.open('https://github.com/Impirs/Razvivashka/releases', '_blank')
    }

    const handleContactFormClick = () => {
        window.open('https://forms.gle/hQ3Fo3BozxDgZqeM6', '_blank')
    }

    const handleDocsClick = () => {
        navigate('/docs')
    }

    const handleUpdateClick = () => {
        navigate('/update')
    }

    if (loading) {
        return (
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="animate-pulse">
                    <div className="h-8 rounded mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
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

    const startTrainingText = language === 'ru' ? '🎯 Начать тренировку' : '🎯 Start Training'
    const startTrainingDesc = language === 'ru' ? 'Скачайте приложение и начните развивать свой мозг.' :
        'Download the app and start developing your brain.'
    const downloadText = language === 'ru' ? 'Скачать приложение' : 'Download App'

    const contactFormText = language === 'ru' ? '✍️ Связаться с нами' : '✍️ Contact Us'
    const contactFormDesc = language === 'ru' ? 'Если вы столкнулись с ошибкой или у вас есть вопросы, напишите нам.' :
        'If you encounter any issues or have questions, contact us.'
    const contactFormButton = language === 'ru' ? 'Открыть форму' : 'Open Form'

    const studyDocsText = language === 'ru' ? '📚 Изучить документацию' : '📚 Study Documentation'
    const studyDocsDesc = language === 'ru' ? 'Узнайте больше о структуре, возможностях и настройках.' :
        'Learn more about technology features and settings.'
    const docsText = language === 'ru' ? 'Открыть документацию' : 'Open Documentation'

    return (
        <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <MarkdownRenderer content={content} />
            
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-white p-6 rounded-lg" 
                    style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}>
                    <h3 className="text-xl font-bold mb-3">{startTrainingText}</h3>
                    <p className="mb-4">{startTrainingDesc}</p>
                    <button className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors" 
                            style={{ color: '#059669' }}
                            onClick={handleDownloadClick}>
                        {downloadText}
                    </button>
                </div>

                <div className="text-white p-6 rounded-lg"
                    style={{ background: 'linear-gradient(to right, #8b5cf6, #7c3aed)' }}>
                    <h3 className="text-xl font-bold mb-3">{t('welcome.updateApp')}</h3>
                    <p className="mb-4">{t('welcome.updateAppDesc')}</p>
                    <button className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            style={{ color: '#7c3aed' }}
                            onClick={handleUpdateClick}>
                        {t('welcome.checkUpdates')}
                    </button>
                </div>

                <div className="text-white p-6 rounded-lg"
                    style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)' }}>
                    <h3 className="text-xl font-bold mb-3">{contactFormText}</h3>
                    <p className="mb-4">{contactFormDesc}</p>
                    <button className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            style={{ color: '#dc2626' }}
                            onClick={handleContactFormClick}>
                        {contactFormButton}
                    </button>
                </div>
                
                <div className="text-white p-6 rounded-lg" 
                    style={{ background: 'linear-gradient(to right, #3b82f6, #6366f1)' }}>
                    <h3 className="text-xl font-bold mb-3">{studyDocsText}</h3>
                    <p className="mb-4">{studyDocsDesc}</p>
                    <button className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors" 
                            style={{ color: '#6366f1' }}
                            onClick={handleDocsClick}>
                        {docsText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Welcome
