import React from 'react';
import { useSettings } from '@/contexts/pref';
import { useLanguage } from '@/contexts/i18n';

const SettingsPage: React.FC = () => {
    const { get, set, useSetting } = useSettings();
    const { language, setLanguage } = useLanguage();

    const [notif, setNotif] = useSetting('volume');

    return (
        <div className="page-content">
            <div className="container-header" />
            <div className="container-content">
                <section className="general">
                    <div className="section-header"><h2>General</h2><hr /></div>
                    <div className="section-content">
                        <div className="settings-line-parameter">
                            <h3>Language</h3>
                            <select aria-label="language" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                                <option value="en">en</option>
                                <option value="ru">ru</option>
                                <option value="sb_lat">sb_lat</option>
                                <option value="sb_cy">sb_cy</option>
                            </select>
                        </div>
                        <div className="settings-line-parameter">
                            <h3>Notifications volume</h3>
                            <input
                                aria-label="volume-notifications"
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={notif.notifications}
                                onChange={(e) => set('volume', { ...notif, notifications: Number(e.target.value) })}
                            />
                        </div>
                        <div className="settings-line-parameter">
                            <h3>Effects volume</h3>
                            <input
                                aria-label="volume-effects"
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={notif.effects}
                                onChange={(e) => set('volume', { ...notif, effects: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
