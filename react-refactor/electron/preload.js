const {contextBridge, ipcRenderer} = require('electron');
const language = require('../../shared/data/language');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg) => ipcRenderer.send('message', msg),
    onMessage: (callback) => ipcRenderer.on('message', callback),

    onRequestLocalStorage: (callback) => ipcRenderer.on('request-localstorage', callback),
    sendLocalStorage:(data) => ipcRenderer.invoke('send-localstorage', data),

    quitApp: () => ipcRenderer.send('app-quit'),
    openExternal: (url) => ipcRenderer.send('open-external', url)
});

// default language can saved in settings.json later
language.loadLanguage('ru');

contextBridge.exposeInMainWorld('languageAPI', {
    t: (tag) => language.t(tag),
    setLanguage: (langCode) => language.setLanguage(langCode),
    getLanguage: () => language.getLanguage()
});

/*
in JSX

const { t } = HOOK();

const tagPrefix = `ach_${game}_${ach.id}`;

...<h2>{t(`${tagPrefix}_title`)}<h2>
...<p>{t(`${tagPrefix}_des`)}<p>
*/

/*
HOOK

const [lang, setLang] = useState(window.languageAPI.getLanguage());
const t = (tag) => windows.languageAPI.t(tag);

const setLanguage = (newLang) => {
    window.languageAPI.setLanguage(newLang);
    setLang(newLang); // prerender trigger    
}

return {t, lang, setLanguage};
*/