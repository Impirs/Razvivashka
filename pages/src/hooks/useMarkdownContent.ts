import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export const useMarkdownContent = (baseName: string) => {
  const { language } = useLanguage()
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const fileName = `${baseName}_${language}.md`
        const response = await fetch(`/src/content/${fileName}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load ${fileName}`)
        }
        
        const text = await response.text()
        setContent(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error(`Error loading content for ${baseName}:`, err)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [baseName, language])

  return { content, loading, error }
}
