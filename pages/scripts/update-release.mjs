#!/usr/bin/env node

/**
 * Скрипт для автоматического обновления данных о релизах
 * Может быть запущен как GitHub Action или как CLI команда
 */

import fs from 'fs'
import path from 'path'
import { ReleaseUpdater } from '../src/utils/releaseUpdater.js'

const RELEASE_JSON_PATH = path.join(process.cwd(), 'public', 'release-info.json')
const INDEX_HTML_PATH = path.join(process.cwd(), 'dist', 'index.html')

async function updateReleaseInfo() {
  console.log('🔄 Updating release information...')
  
  const updater = new ReleaseUpdater({
    owner: 'Impirs',
    repo: 'Razvivashka',
    updateTarget: 'both'
  })

  try {
    const result = await updater.updateReleaseData()
    
    if (!result.success) {
      console.error('❌ Failed to fetch release data:', result.error)
      process.exit(1)
    }

    console.log(`✅ Fetched release data for version: ${result.data.version}`)

    // Сохраняем JSON файл
    if (result.data.json) {
      const publicDir = path.dirname(RELEASE_JSON_PATH)
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }
      
      fs.writeFileSync(RELEASE_JSON_PATH, result.data.json, 'utf8')
      console.log('📝 Updated release-info.json')
    }

    // Обновляем HTML если файл существует
    if (result.data.html && fs.existsSync(INDEX_HTML_PATH)) {
      let htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8')
      
      // Удаляем старые meta теги релиза
      htmlContent = htmlContent.replace(
        /<!-- Release Information Meta Tags -->[\s\S]*?<\/script>/g,
        ''
      )
      
      // Добавляем новые meta теги в head
      htmlContent = htmlContent.replace(
        '</head>',
        `${result.data.html}\n</head>`
      )
      
      fs.writeFileSync(INDEX_HTML_PATH, htmlContent, 'utf8')
      console.log('📝 Updated index.html with release meta tags')
    }

    console.log('🎉 Release information updated successfully!')
    
  } catch (error) {
    console.error('❌ Error updating release information:', error)
    process.exit(1)
  }
}

// Запускаем скрипт если он вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  updateReleaseInfo()
}

export default updateReleaseInfo
