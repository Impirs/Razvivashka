import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface VideoContainerProps {
    videoSrc: string
    title: string
    description: string
    isReversed?: boolean
    index: number
}

const VideoContainer = ({ videoSrc, title, description, isReversed = false, index }: VideoContainerProps) => {
    return (
        <div 
            className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center mb-8 lg:mb-10`}
        >
            {/* Video Container */}
            <div className="w-full lg:w-1/2">
                <div 
                    className="relative rounded-2xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105" 
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <video 
                        className="w-full h-auto"
                        controls
                        preload="metadata"
                        style={{ maxHeight: '400px' }}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                            Your browser does not support the video tag.
                        </div>
                    </video>
                </div>
            </div>
            
            {/* Text Container */}
            <div className="w-full lg:w-1/2">
                <div className="p-2 lg:p-6">
                    {/* Section number */}
                    <div className="flex items-center mb-4">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4"
                            style={{ 
                                backgroundColor: 'var(--accent)'
                            }}
                        >
                            {index + 1}
                        </div>
                        <div 
                            className="h-px flex-1 opacity-30"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                    </div>
                    
                    <h2 
                        className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 leading-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {title}
                    </h2>
                    
                    <div 
                        className="w-16 h-1 rounded-full mb-4 lg:mb-6"
                        style={{ backgroundColor: 'var(--accent)' }}
                    ></div>
                    
                    <p 
                        className="text-base lg:text-lg leading-relaxed lg:leading-loose"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {description}
                    </p>
                    
                    {/* Decorative elements */}
                    <div className="flex items-center mt-6 lg:mt-8 space-x-2 opacity-60">
                        <div 
                            className="w-2 h-2 rounded-full"
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

const Preview = () => {
    const { t } = useLanguage()

    // Build absolute URLs using the configured BASE_URL so paths match
    const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`

    const gamePreviewData = [
        {
            videoSrc: `${baseUrl}preview/digit_preview.mp4`,
            titleKey: 'preview.digit.title',
            descriptionKey: 'preview.digit.description',
        },
        {
            videoSrc: `${baseUrl}preview/queens_preview.mp4`,
            titleKey: 'preview.queens.title',
            descriptionKey: 'preview.queens.description',
        },
        {
            videoSrc: `${baseUrl}preview/shulte_preview.mp4`,
            titleKey: 'preview.shulte.title',
            descriptionKey: 'preview.shulte.description',
        },
        {
            videoSrc: `${baseUrl}preview/tango_preview.mp4`,
            titleKey: 'preview.tango.title',
            descriptionKey: 'preview.tango.description',
        },
        {
            videoSrc: `${baseUrl}preview/achievements_preview.mp4`,
            titleKey: 'preview.achievements.title',
            descriptionKey: 'preview.achievements.description',
        },
    ]

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
            <div 
                className="relative px-8 pt-12 pb-8 rounded-t-2xl overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, var(--bg-gradient-from) 0%, var(--bg-gradient-to) 100%)`
                }}
            >
                <div className="relative text-center">
                    <h1 
                        className="text-4xl lg:text-5xl font-bold mb-4 lg:mb-6"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {t('preview.title')}
                    </h1>
                    
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <div 
                            className="w-16 h-1 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-3 h-3 rounded-full"
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
                        {t('preview.subtitle')}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    {gamePreviewData.map((game, index) => (
                        <React.Fragment key={index}>
                            <VideoContainer
                                index={index}
                                videoSrc={game.videoSrc}
                                title={t(game.titleKey)}
                                description={t(game.descriptionKey)}
                                isReversed={index % 2 === 1}
                            />
                            {index < gamePreviewData.length - 1 && (
                                <div className="section-divider"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                
                {/* Bottom CTA section */}
                <div className="text-center mt-16 pt-12 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="max-w-2xl mx-auto">
                        <h3 
                            className="text-2xl lg:text-3xl font-bold mb-4"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {t('preview.cta.title')}
                        </h3>
                        <p 
                            className="text-lg mb-8 leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {t('preview.cta.description')}
                        </p>
                        
                        {/* Decorative elements */}
                        <div className="flex items-center justify-center space-x-3 mb-8">
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i}
                                    className={`w-2 h-2 rounded-full`}
                                    style={{ 
                                        backgroundColor: 'var(--accent)'
                                    }}
                                ></div>
                            ))}
                        </div>
                        
                        {/* Additional visual element */}
                        <div className="mx-auto w-20 h-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Preview
