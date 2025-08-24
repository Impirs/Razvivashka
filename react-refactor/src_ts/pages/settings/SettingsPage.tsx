import React, { useCallback, useMemo } from 'react';
import { useSettings } from '@/contexts/pref';
import { useLanguageState, useTranslationFunction } from '@/hooks/useSelectiveContext';
import { useCurrentUser, useUserManagement } from '@/hooks/useSelectiveContext';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/button/button';
import Select from '@/components/select/select';
import Checkbox from '@/components/checkbox/checkbox';
import Slider from '@/components/slider/slider';
import UserManager from '@/components/usermanager/usermanager';

const SettingsPage = React.memo(() => {
    const { get, set, useSetting } = useSettings();
    const { language, setLanguage } = useLanguageState(); // Only language state, not translations
    const t = useTranslationFunction(); // Only translation function, better performance

    const [notif] = useSetting('volume');
    const [games] = useSetting('games');

    // All handlers are memoized to prevent unnecessary re-renders of child components
    const navigate = useNavigate();
    const handleGoBack = useCallback(() => navigate(-1), [navigate]);
    const handleGoHome = useCallback(() => navigate('/'), [navigate]);

    const handleLanguageChange = useCallback((value: string) => {
        setLanguage(value as typeof language);
    }, [setLanguage]);

    const handleNotificationVolumeChange = useCallback((value: number) => {
        set('volume', { ...notif, notifications: value });
    }, [notif, set]);

    const handleEffectsVolumeChange = useCallback((value: number) => {
        set('volume', { ...notif, effects: value });
    }, [notif, set]);

    // Factory function to avoid duplicating logic for each game type
    // Returns memoized handlers that prevent unnecessary re-renders
    const createGameSettingHandler = useCallback((gameType: 'digit' | 'shulte' | 'queens') => {
        return (checked: boolean) => {
            const defaultGames = { 
                digit: { view_modification: true }, 
                shulte: { view_modification: true },
                queens: { view_modification: true }
            };
            const g = games ?? defaultGames;
            set('games', {
                ...g,
                [gameType]: { ...g?.[gameType], view_modification: checked },
            });
        };
    }, [games, set]);

    // useMemo ensures game handlers are only recreated when factory function changes
    const handleDigitSettingChange = useMemo(() => createGameSettingHandler('digit'), [createGameSettingHandler]);
    const handleShulteSettingChange = useMemo(() => createGameSettingHandler('shulte'), [createGameSettingHandler]);
    const handleQueensSettingChange = useMemo(() => createGameSettingHandler('queens'), [createGameSettingHandler]);

    const langOptionLabel = (code: string) => {
        const optKey = code;
        const res = t(`settings.language.options.${optKey}` as any);
        return res.startsWith('settings.language.options.') ? code : res;
    };

    return (
        <div className="page-layout">
            <div className="page-content">
                <div className="container-header">
                    <div style={{ justifySelf: 'start' }}>
                    </div>
                    <div>
                        <h1>{t('routes.settings' as any)}</h1>
                    </div>
                    <div style={{ justifySelf: 'end' }}>
                        <Button aria-label="nav-back" 
                                size="small" 
                                leftIcon="left" 
                                className='nav-button'
                                onClick={handleGoBack} />
                        <Button aria-label="nav-home" 
                                size="small" 
                                leftIcon="home" 
                                className='nav-button'
                                onClick={handleGoHome} />
                    </div>
                </div>
                <div className="container-content">
                    <section className="general">
                        <div className="section-header">
                            <h2>{t('settings.general' as any)}</h2>
                            <hr />
                        </div>
                        <div className="section-content">
                            <div className="settings-line-parameter">
                                <h3>{t('settings.player.name' as any)}</h3>
                                <UserManager />
                            </div>
                            <div className="settings-line-parameter">
                                <h3>{t('settings.language.label' as any)}</h3>
                                <Select
                                    ariaLabel="language"
                                    translationKeyPrefix='settings.language.options'
                                    options={['en', 'ru', 'sb_lat', 'sb_cy']}
                                    value={language}
                                    onValueChange={handleLanguageChange}
                                />
                            </div>
                            <div className="settings-line-parameter">
                                <h3>{t('settings.volume.notifications' as any)}</h3>
                                <Slider
                                    ariaLabel="volume-notifications"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={notif.notifications}
                                    onChange={handleNotificationVolumeChange}
                                />
                            </div>
                            <div className="settings-line-parameter">
                                <h3>{t('settings.volume.effects' as any)}</h3>
                                <Slider
                                    ariaLabel="volume-effects"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={notif.effects}
                                    onChange={handleEffectsVolumeChange}
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
                                    ariaLabel="game-digit-view-modification"
                                    checked={Boolean(games?.digit?.view_modification)}
                                    onChange={handleDigitSettingChange}
                                />
                            </div>

                            {/* Shulte settings */}
                            <div className="settings-line-parameter">
                                <div>
                                    <h3>{t('settings.gameplay.shulte.label' as any)}</h3>
                                    <p>{t('settings.gameplay.shulte.description' as any)}</p>
                                </div>
                                <Checkbox
                                    ariaLabel="game-shulte-view-modification"
                                    checked={Boolean(games?.shulte?.view_modification)}
                                    onChange={handleShulteSettingChange}
                                />
                            </div>

                            {/* Queens settings */}
                            <div className="settings-line-parameter">
                                <div>
                                    <h3>{t('settings.gameplay.queens.label' as any)}</h3>
                                    <p>{t('settings.gameplay.queens.description' as any)}</p>
                                </div>
                                <Checkbox
                                    ariaLabel="game-queens-view-modification"
                                    checked={Boolean(games?.queens?.view_modification)}
                                    onChange={handleQueensSettingChange}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
