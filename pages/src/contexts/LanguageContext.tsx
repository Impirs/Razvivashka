import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ru' | 'sr'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  loading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper function to get nested object value by dot notation
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider = ({ children } : LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru' || savedLanguage === 'sr')) {
      return savedLanguage
    }

    // Check browser language to show appropriate content automatically
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.startsWith('ru')) {
      return 'ru'
    } else if (browserLanguage.startsWith('sr') || browserLanguage.startsWith('sr-')) {
      return 'sr'
    }
    
    return 'en'
  })

  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}locales/${language}.json`)
        if (response.ok) {
          const data = await response.json()
          setTranslations(data)
        } else {
          console.error(`Failed to load translations for ${language}`)
          setTranslations({})
        }
      } catch (error) {
        console.error(`Error loading translations for ${language}:`, error)
        setTranslations({})
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: string): string => {
    return getNestedValue(translations, key) || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}
