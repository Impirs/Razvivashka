import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface GitHubAsset {
  name: string
  browser_download_url: string
  content_type: string
  size: number
}

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  assets: GitHubAsset[]
  published_at: string
  html_url: string
}

interface ParsedReleaseNotes {
  en: string
  ru: string
}

export const useGitHubRelease = () => {
  const { language } = useLanguage()
  const [release, setRelease] = useState<GitHubRelease | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const parseReleaseNotes = (body: string): ParsedReleaseNotes => {
    const enMatch = body.match(/en:\s*(.*?)(?=\s*ru:|$)/s)
    const ruMatch = body.match(/ru:\s*(.*?)(?=\s*en:|$)/s)
    
    return {
      en: enMatch ? enMatch[1].trim() : body,
      ru: ruMatch ? ruMatch[1].trim() : body
    }
  }

  const getLocalizedReleaseNotes = (body: string): string => {
    const parsed = parseReleaseNotes(body)
    return language === 'ru' ? parsed.ru : parsed.en
  }

  const getDownloadUrls = () => {
    if (!release) return { exe: null, zip: null }
    
    const exeAsset = release.assets.find(asset => 
      asset.name.endsWith('.exe') && asset.name.includes('playandlearn')
    )
    const zipAsset = release.assets.find(asset => 
      asset.name.endsWith('.zip') && asset.name.includes('playandlearn')
    )

    return {
      exe: exeAsset?.browser_download_url || null,
      zip: zipAsset?.browser_download_url || null
    }
  }

  useEffect(() => {
    const fetchLatestRelease = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          'https://api.github.com/repos/Impirs/Razvivashka/releases/latest'
        )

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }

        const releaseData: GitHubRelease = await response.json()
        setRelease(releaseData)
      } catch (err) {
        console.warn('GitHub API failed, trying fallback:', err)

        // Fallback: get local release info
        try {
          const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`
          const fallbackResponse = await fetch(`${baseUrl}release-info.json`)
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            // Transform local data to GitHub API format
            const githubFormatData: GitHubRelease = {
              tag_name: fallbackData.version,
              name: fallbackData.name,
              body: `en: ${fallbackData.releaseNotes.en} ru: ${fallbackData.releaseNotes.ru}`,
              published_at: fallbackData.publishedAt,
              html_url: `https://github.com/Impirs/Razvivashka/releases/tag/${fallbackData.version}`,
              assets: [
                {
                  name: `playandlearn_${fallbackData.version.replace('v', '')}_x64.exe`,
                  browser_download_url: fallbackData.downloads.exe,
                  content_type: 'application/x-msdownload',
                  size: 0
                },
                {
                  name: `playandlearn_${fallbackData.version.replace('v', '')}_x64.zip`,
                  browser_download_url: fallbackData.downloads.zip,
                  content_type: 'application/zip',
                  size: 0
                }
              ].filter(asset => asset.browser_download_url)
            }
            setRelease(githubFormatData)
          } else {
            throw new Error('Fallback data not available')
          }
        } catch (fallbackErr) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          console.error('Both GitHub API and fallback failed:', err, fallbackErr)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLatestRelease()
  }, [])

  return {
    release,
    loading,
    error,
    getLocalizedReleaseNotes,
    getDownloadUrls,
    version: release?.tag_name || null
  }
}
