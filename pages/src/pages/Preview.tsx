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
    const animationDelay = `${(index + 1) * 0.1}s`;
    
    return (
        <div 
            className={`preview-video-container slide-in-up flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center mb-16 lg:mb-20`}
            style={{ animationDelay }}
        >
            {/* Video Container */}
            <div className="w-full lg:w-1/2">
                <div 
                    className="group relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]" 
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    {/* Video overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 pointer-events-none z-10"></div>
                    
                    <video 
                        className="preview-video w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        controls
                        preload="metadata"
                        style={{ maxHeight: '400px' }}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                            Your browser does not support the video tag.
                        </div>
                    </video>
                    
                    {/* Decorative corner accent */}
                    <div 
                        className="floating-decoration absolute top-0 right-0 w-20 h-20 opacity-20"
                        style={{
                            background: `linear-gradient(-45deg, var(--accent) 0%, transparent 70%)`
                        }}
                    ></div>
                </div>
            </div>
            
            {/* Text Container */}
            <div className="w-full lg:w-1/2">
                <div className="p-2 lg:p-6">
                    {/* Section number */}
                    <div className="flex items-center mb-4">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 pulse-animation"
                            style={{ 
                                backgroundColor: 'var(--accent)',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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
                        className="gradient-text text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 leading-tight"
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
                            className="w-2 h-2 rounded-full pulse-animation"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-8 h-px"
                            style={{ backgroundColor: 'var(--accent)' }}
                        ></div>
                        <div 
                            className="w-2 h-2 rounded-full pulse-animation"
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

    const gamePreviewData = [
        {
            videoSrc: '/preview/digit_preview.mp4',
            titleKey: 'preview.digit.title',
            descriptionKey: 'preview.digit.description',
        },
        {
            videoSrc: '/preview/queens_preview.mp4',
            titleKey: 'preview.queens.title',
            descriptionKey: 'preview.queens.description',
        },
        {
            videoSrc: '/preview/shulte_preview.mp4',
            titleKey: 'preview.shulte.title',
            descriptionKey: 'preview.shulte.description',
        },
        {
            videoSrc: '/preview/achievements_preview.mp4',
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
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-white/20 translate-x-1/3 translate-y-1/3"></div>
                </div>
                
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
                            className="gradient-text text-2xl lg:text-3xl font-bold mb-4"
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
                                    className={`w-2 h-2 rounded-full pulse-animation`}
                                    style={{ 
                                        backgroundColor: 'var(--accent)',
                                        animationDelay: `${i * 0.2}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                        
                        {/* Additional visual element */}
                        <div className="floating-decoration mx-auto w-20 h-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Preview
