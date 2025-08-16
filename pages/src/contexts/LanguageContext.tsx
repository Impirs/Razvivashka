import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ru'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Переводы для интерфейса
const translations = {
  en: {
    'nav.welcome': 'Welcome',
    'nav.install': 'Install',
    'nav.docs': 'Documentation',
    'theme.toggle': 'Toggle theme',
    'language.toggle': 'Русский',
    'footer.description': 'Brain training games to improve memory, attention and cognitive skills',
    'footer.copyright': '© 2025 Razvivashka. Made with ❤️ for brain training'
  },
  ru: {
    'nav.welcome': 'Главная',
    'nav.install': 'Установка',
    'nav.docs': 'Документация',
    'theme.toggle': 'Переключить тему',
    'language.toggle': 'English',
    'footer.description': 'Развивающие игры для тренировки мозга и улучшения когнитивных способностей',
    'footer.copyright': '© 2025 Razvivashka. Создано с ❤️ для тренировки мозга'
  }
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
      return savedLanguage
    }

    // Check browser language to show appropriate content automatically
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.startsWith('ru')) {
      return 'ru'
    }
    
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
