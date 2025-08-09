# 🚀 Razvivashka (Play & Learn)

An educational desktop app with a growing set of mini‑games for logic, counting, attention, and early reading skills. Optimized for kids in preschool and early grades, but fun for anyone to train brain basics.

![Latest Release](https://img.shields.io/github/v/release/Impirs/Razvivashka)
![Downloads](https://img.shields.io/github/downloads/Impirs/Razvivashka/total)
![Visitors](https://visitor-badge.glitch.me/badge?page_id=Impirs.Razvivashka)

---

## Quick links

- Download: latest build        → https://github.com/Impirs/Razvivashka/releases/latest
- All releases                  → https://github.com/Impirs/Razvivashka/releases
- Feedback & feature requests   → https://forms.gle/hQ3Fo3BozxDgZqeM6

---

## Vanilla edition (current stable)

The vanilla Electron edition is what most users run today. It ships as a Windows installer and includes:

- Games: Digit (arithmetic practice), Shulte (attention focus), Syllable (early reading basics)
- Catalog/Home/Settings/Achievements pages
- Local records saved on your device; per‑user name can be set in Settings to tag results
- Works fully offline after installation

Recent highlights (stable):
- Added user name field in Settings; your scores are labeled with it
- Improved record display for timed games
- Fixed issues in “Shulte table”

Download the latest installer from Releases (links above).

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Contact / Feedback

- Submit feedback or ideas: https://forms.gle/hQ3Fo3BozxDgZqeM6
- For bug reports, please include screenshots if possible. You can also email: `razvivashka.gh@gmail.com`

---

## Installation help

### English

Installer (recommended)
1. Open Releases and download the latest installer: `play_and_learn-Setup.exe` (no other files needed)
2. Run the installer and choose an install path
3. Windows may show a security warning; choose “Allow/Run”. The app is safe — the notice appears because the certificate isn’t from a commercial publisher
4. Finish the setup and start the app

ZIP archive
1. Download the latest `.zip` from Releases
2. Extract it into its own folder (don’t mix with unrelated files)
3. Run `Развивашка.exe`

Security warning (Windows)
- You are installing software, which modifies files on your machine (normal for installers)
- The signing certificate may not be trusted by Windows yet because this is not a commercial publisher; you can allow the app to run

### Русский

Установщик (рекомендуется)
1. Откройте страницу релизов и скачайте последний установщик: `play_and_learn-Setup.exe` *(другие файлы не нужны)*
2. Запустите установщик и выберите путь установки
3. Windows может показать предупреждение безопасности — выберите «Разрешить/Выполнить». Приложение безопасно; предупреждение возникает из‑за отсутствия коммерческого издателя
4. Завершите установку и запустите приложение

Архив ZIP
1. Скачайте последний `.zip` из релизов
2. Распакуйте архив в отдельную папку (не смешивайте с другими файлами)
3. Запустите `Развивашка.exe`

Предупреждение безопасности (Windows)
- Вы устанавливаете программу, что влечёт изменения на компьютере (это нормально для установщиков)
- Сертификат подписи может быть не «доверенным» для Windows, так как издатель не коммерческий; можно разрешить запуск

---

## Refactor (React + TypeScript) preview

We’re rebuilding the app with React + TypeScript, Vite, and a stronger architecture (Electron main + preload bridge; typed contexts for settings, language, user/records, game controller, notifications). Styling will gradually move to Tailwind CSS.

- Source: `react-refactor/` (renderer in `src_ts/`, Electron in `electron_ts/`)
- Architecture and refactoring notes: see `react-refactor/refactoring.md`

If you only want the stable app — use the Vanilla edition from Releases above. If you’re curious about the new architecture, start with the documentation linked above.
