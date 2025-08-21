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

const translations = {
  en: {
    'nav.welcome': 'Welcome',
    'nav.preview': 'Preview',
    'nav.install': 'Install',
    'nav.docs': 'Documentation',
    'theme.toggle': 'Toggle theme',
    'language.toggle': 'Русский',
    'footer.description': 'Brain training games to improve memory, attention and cognitive skills',
    'footer.copyright': '© 2025 Razvivashka. Made with ❤️ for brain training',
    
    'update.title': 'Update Play and Learn',
    'update.loading': 'Loading update information...',
    'update.error': 'Error loading update information',
    'update.noReleases': 'No releases available',
    'update.downloadExe': 'Download .exe',
    'update.downloadZip': 'Download .zip',
    'update.backToHome': 'Back to Home',
    'update.releaseNotes': 'Release Notes',
    'update.currentVersion': 'Latest Version',
    'update.downloadLatest': 'Download Latest Version',

    'preview.title': 'Game Preview',
    'preview.achievements.title': 'Achievements System',
    'preview.achievements.description': 'Track your progress and unlock achievements as you complete different brain training exercises. Each game has its own set of challenges to keep you motivated.',
    'preview.digit.title': 'Digit Memory Game',
    'preview.digit.description': 'Train your working memory by remembering and reproducing sequences of numbers. This exercise improves concentration and short-term memory capacity.',
    'preview.queens.title': 'N-Queens Puzzle',
    'preview.queens.description': 'Solve the classic N-Queens problem to develop logical thinking and strategic planning skills. Place queens on a chessboard so none can attack each other.',
    'preview.shulte.title': 'Schulte Tables',
    'preview.shulte.description': 'Improve peripheral vision, speed reading, and attention span with these numbered grid exercises. Find numbers in sequence as quickly as possible.',
    'preview.subtitle': 'Discover our interactive exercises designed to enhance your cognitive abilities',
    'preview.cta.title': 'Ready to start training?',
    'preview.cta.description': 'Download the app and start developing your cognitive abilities today',
    
    'welcome.hero.title': 'Train Your Brain',
    'welcome.hero.subtitle': 'Improve memory, attention, and cognitive skills with our scientifically-designed exercises',
    'welcome.preview.title': 'Exercises',
    'welcome.preview.description': 'Explore our app and games before installation',
    'welcome.preview.button': 'Check it out',
    'welcome.updates.title': 'About Updates',
    'welcome.updates.description': 'Learn what\'s new in the latest version of the app',
    'welcome.updates.button': 'Check for Updates',
    'welcome.contact.title': 'Contact Us',
    'welcome.contact.description': 'If you encounter any issues or have questions, contact us',
    'welcome.contact.button': 'Open Form',
    
    'install.hero.title': 'Install Play and Learn',
    'install.hero.subtitle': 'Choose your platform and start training today',
    'install.desktop.title': 'Desktop Application',
    'install.windows.exe': 'Windows Installer',
    'install.windows.zip': 'Windows Portable',
    'install.macos': 'macOS Package',
    'install.coming.soon': 'Coming Soon',
    'install.download': 'Download latest version',
    'install.mobile.note': 'For desktop installation only - preview available on mobile',
    'docs.modal.title': 'Developer Documentation',
    'docs.modal.content': 'This section contains technical information about the development of this project. It is intended for developers who are interested in the project or want to contribute to the application development.',
    'docs.modal.language.note': 'Documentation is available in English only.',
    'docs.modal.button': 'Got it!',
  },
  ru: {
    'nav.welcome': 'Главная',
    'nav.preview': 'Упражнения',
    'nav.install': 'Установка',
    'nav.docs': 'Документация',
    'theme.toggle': 'Переключить тему',
    'language.toggle': 'English',
    'footer.description': 'Развивающие игры для тренировки мозга и улучшения когнитивных способностей',
    'footer.copyright': '© 2025 Razvivashka. Создано с ❤️ для тренировки мозга',
    
    'update.title': 'Обновление Развивашки',
    'update.loading': 'Загрузка информации об обновлении...',
    'update.error': 'Ошибка загрузки информации об обновлении',
    'update.noReleases': 'Нет доступных релизов',
    'update.downloadExe': 'Скачать .exe',
    'update.downloadZip': 'Скачать .zip',
    'update.backToHome': 'Вернуться на главную',
    'update.releaseNotes': 'Описание изменений',
    'update.currentVersion': 'Последняя версия',
    'update.downloadLatest': 'Скачать последнюю версию',

    'preview.title': 'Упражнения',
    'preview.digit.title': 'Состав числа',
    'preview.digit.description': 'Тренируйте рабочую память, запоминая и воспроизводя составы чисел. Это упражнение направлено на оттачивание понимания простых чисел, что непременно поможет при рещении более сложных задач.',
    'preview.queens.title': 'Головоломка Ферзи',
    'preview.queens.description': 'Решайте классическую задачу N-ферзей для развития логического мышления и навыков стратегического планирования. Расставьте ферзей на доске так, чтобы они не атаковали друг друга.',
    'preview.shulte.title': 'Таблицы Шульте',
    'preview.shulte.description': 'Улучшайте периферическое зрение, скорость чтения и концентрацию внимания с помощью этих упражнений с пронумерованной сеткой. Находите числа по порядку как можно быстрее.',
    'preview.achievements.title': 'Система достижений',
    'preview.achievements.description': 'Отслеживайте свой прогресс и получайте достижения, выполняя различные упражнения для тренировки мозга. Каждая игра имеет свой набор вызовов для поддержания мотивации.',
    'preview.subtitle': 'Познакомьтесь с нашими интерактивными упражнениями для развития когнитивных способностей',
    'preview.cta.title': 'Готовы начать тренировки?',
    'preview.cta.description': 'Скачайте приложение и начните развивать когнитивные способности уже сегодня',
    
    'welcome.hero.title': 'Тренируйте свой мозг',
    'welcome.hero.subtitle': 'Улучшайте память, внимание и когнитивные способности с помощью наших научно обоснованных упражнений',
    'welcome.preview.title': 'Упражнения',
    'welcome.preview.description': 'Ознакомьтесь с приложением и нашими играми перед установкой',
    'welcome.preview.button': 'Посмотреть',
    'welcome.updates.title': 'Об обновлениях',
    'welcome.updates.description': 'Узнайте что было добавлено в последней версии приложения',
    'welcome.updates.button': 'Проверить обновления',
    'welcome.contact.title': 'Связаться с нами',
    'welcome.contact.description': 'Если вы столкнулись с ошибкой или у вас есть вопросы, напишите нам',
    'welcome.contact.button': 'Открыть форму',
    
    'install.hero.title': 'Установить Развивашку',
    'install.hero.subtitle': 'Выберите свою платформу и начните упражнения уже сегодня',
    'install.desktop.title': 'Приложение для компьютера',
    'install.windows.exe': 'Установщик Windows',
    'install.windows.zip': 'Портативная версия Windows',
    'install.macos': 'Пакет macOS',
    'install.coming.soon': 'Скоро будет доступно',
    'install.download': 'Скачать последнюю версию',
    'install.mobile.note': 'Только для установки на компьютер - просмотр доступен на мобильном',
    'docs.modal.title': 'Документация для разработчиков',
    'docs.modal.content': 'В данном разделе находится техническая информация о разработке этого проекта. Она предназначена для разработчиков, которые интересуются проектом или хотят помочь развитию приложения.',
    'docs.modal.language.note': 'Документация доступна только на английском языке.',
    'docs.modal.button': 'Понятно!',
  }
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider = ({ children } : LanguageProviderProps) => {
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
