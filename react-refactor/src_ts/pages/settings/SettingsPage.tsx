import React from 'react';
import { useSettings } from '@/contexts/pref';
import { useLanguage } from '@/contexts/i18n';
import { useGameStore } from '@/contexts/gamestore';

import Checkbox from '@/components/checkbox/checkbox';

const SettingsPage: React.FC = () => {
    const { get, set, useSetting } = useSettings();
    const { language, setLanguage, t } = useLanguage();
    const { currentUser, renameCurrentUser } = useGameStore();

    const [notif] = useSetting('volume');
    const [games] = useSetting('games');

    const [username, setUsername] = React.useState<string>(currentUser?.username ?? 'user');

    React.useEffect(() => {
        setUsername(currentUser?.username ?? 'user');
    }, [currentUser?.username]);

    const commitRename = async () => {
        const trimmed = username.trim();
        if (!currentUser || !trimmed || trimmed === currentUser.username) return;
        await renameCurrentUser(trimmed);
    };

    const langOptionLabel = (code: string) => {
        const optKey = code;
        const res = t(`settings.language.options.${optKey}` as any);
        return res.startsWith('settings.language.options.') ? code : res;
    };

    return (
        <div className="page-content">
            <div className="container-header" />
            <div className="container-content">
                <section className="general">
                    <div className="section-header"><h2>{t('settings.general' as any)}</h2><hr /></div>
                    <div className="section-content">
                        <div className="settings-line-parameter">
                            <h3>{t('settings.player.name' as any)}</h3>
                            <input
                                aria-label="current-user-name"
                                type="text"
                                value={username}
                                placeholder={t('settings.player.placeholder' as any)}
                                onChange={(e) => setUsername(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); }}
                            />
                        </div>
                        <div className="settings-line-parameter">
                            <h3>{t('settings.language.label' as any)}</h3>
                            <select aria-label="language" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                                <option value="en">{langOptionLabel('en')}</option>
                                <option value="ru">{langOptionLabel('ru')}</option>
                                <option value="sb_lat">{langOptionLabel('sb_lat')}</option>
                                <option value="sb_cy">{langOptionLabel('sb_cy')}</option>
                            </select>
                        </div>
                        <div className="settings-line-parameter">
                            <h3>{t('settings.volume.notifications' as any)}</h3>
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
                            <h3>{t('settings.volume.effects' as any)}</h3>
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

                <section className="gameplay">
                    <div className="section-header"><h2>{t('settings.gameplay.label' as any)}</h2><hr /></div>
                    <div className="section-content">
                        {/* Digit settings */}
                        <div className="settings-line-parameter">
                            <div>
                                <h3>{t('settings.gameplay.digit.label' as any)}</h3>
                                <p>{t('settings.gameplay.digit.description' as any)}</p>
                            </div>
                            <Checkbox
                                ariaLabel="game-digit-show-available"
                                checked={Boolean(games?.digit?.show_available)}
                                onChange={(checked) => {
                                    const g = games;
                                    set('games', {
                                        ...g,
                                        digit: { ...g?.digit, show_available: checked },
                                    });
                                }}
                            />
                        </div>

                        {/* Shulte settings */}
                        <div className="settings-line-parameter">
                            <div>
                                <h3>{t('settings.gameplay.shulte.label' as any)}</h3>
                                <p>{t('settings.gameplay.shulte.description' as any)}</p>
                            </div>
                            <Checkbox
                                ariaLabel="game-shulte-check-all-letters-tested"
                                checked={Boolean(games?.shulte?.check_all_letters_tested)}
                                onChange={(checked) => {
                                    const g = games;
                                    set('games', {
                                        ...g,
                                        shulte: { ...g?.shulte, check_all_letters_tested: checked },
                                    });
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
