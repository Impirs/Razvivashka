interface UpdateConfig {
  owner: string
  repo: string
  updateTarget: 'html' | 'json' | 'both'
}

interface ReleaseData {
  tag_name: string
  name: string
  body: string
  published_at: string
  assets: Array<{
    name: string
    browser_download_url: string
    content_type: string
    size: number
  }>
}

export class ReleaseUpdater {
  private config: UpdateConfig

  constructor(config: UpdateConfig = {
    owner: 'Impirs',
    repo: 'Razvivashka',
    updateTarget: 'both'
  }) {
    this.config = config
  }

  async fetchLatestRelease(): Promise<ReleaseData | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/releases/latest`
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching release data:', error)
      return null
    }
  }

  parseReleaseNotes(body: string): { en: string; ru: string } {
    const enMatch = body.match(/en:\s*(.*?)(?=\s*ru:|$)/s)
    const ruMatch = body.match(/ru:\s*(.*?)(?=\s*en:|$)/s)
    
    return {
      en: enMatch ? enMatch[1].trim() : body,
      ru: ruMatch ? ruMatch[1].trim() : body
    }
  }

  generateReleaseJSON(release: ReleaseData): string {
    const releaseNotes = this.parseReleaseNotes(release.body)
    
    const exeAsset = release.assets.find(asset => 
      asset.name.endsWith('.exe') && asset.name.includes('playandlearn')
    )
    const zipAsset = release.assets.find(asset => 
      asset.name.endsWith('.zip') && asset.name.includes('playandlearn')
    )

    return JSON.stringify({
      version: release.tag_name,
      name: release.name,
      publishedAt: release.published_at,
      releaseNotes,
      downloads: {
        exe: exeAsset?.browser_download_url || null,
        zip: zipAsset?.browser_download_url || null
      },
      lastUpdated: new Date().toISOString()
    }, null, 2)
  }

  updateHTMLMeta(release: ReleaseData): string {
    const releaseNotes = this.parseReleaseNotes(release.body)
    
    return `
    <!-- Release Information Meta Tags -->
    <meta name="latest-version" content="${release.tag_name}">
    <meta name="release-date" content="${release.published_at}">
    <meta property="og:title" content="Play and Learn ${release.tag_name} - Brain Training Games">
    <meta property="og:description" content="${releaseNotes.en.substring(0, 160)}">
    <meta name="description" content="${releaseNotes.en.substring(0, 160)}">
    <meta name="keywords" content="brain training, memory games, cognitive skills, ${release.tag_name}">
    
    <!-- JSON-LD Structured Data for Software Application -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Play and Learn",
      "version": "${release.tag_name}",
      "datePublished": "${release.published_at}",
      "description": "${releaseNotes.en.replace(/"/g, '\\"')}",
      "operatingSystem": "Windows",
      "applicationCategory": "GameApplication",
      "downloadUrl": "${release.assets.find(a => a.name.endsWith('.exe'))?.browser_download_url || ''}",
      "publisher": {
        "@type": "Organization",
        "name": "Razvivashka"
      }
    }
    </script>
    `
  }

  async updateReleaseData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const release = await this.fetchLatestRelease()
      
      if (!release) {
        return { success: false, error: 'Failed to fetch release data' }
      }

      const result: any = {
        success: true,
        data: {
          version: release.tag_name,
          publishedAt: release.published_at
        }
      }

      if (this.config.updateTarget === 'json' || this.config.updateTarget === 'both') {
        result.data.json = this.generateReleaseJSON(release)
      }

      if (this.config.updateTarget === 'html' || this.config.updateTarget === 'both') {
        result.data.html = this.updateHTMLMeta(release)
      }

      return result
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

export default ReleaseUpdater

// Пример использования:
/*
const updater = new ReleaseUpdater()
updater.updateReleaseData().then(result => {
  if (result.success) {
    console.log('Release data updated successfully:', result.data)
    // Здесь можно записать данные в файл или обновить базу данных
  } else {
    console.error('Failed to update release data:', result.error)
  }
})
*/
