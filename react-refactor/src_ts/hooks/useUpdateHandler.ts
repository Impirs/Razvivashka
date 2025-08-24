import { useEffect } from 'react';
import { useNotification } from '../contexts/notifProvider';
import { useLanguage } from '../contexts/i18n';

export const useUpdateHandler = () => {
    const { addNotification } = useNotification();
    const { t } = useLanguage();

    useEffect(() => {
        // Check if electronAPI is available (we're running in Electron)
        if (typeof window !== 'undefined' && window.electronAPI) {
            const handleUpdateAvailable = (_event: any, updateInfo: any) => {
                // Show notification about available update
                addNotification(
                    'update',
                    t('updates.update_available_title') || 'Доступно обновление',
                    `${t('updates.update_available_message') || 'Доступна новая версия'} ${updateInfo.version}. ${t('updates.click_to_download') || 'Нажмите для перехода на страницу загрузки.'}`,
                    updateInfo.releaseUrl
                );
            };

            // Add the event listener
            window.electronAPI.onUpdateAvailable(handleUpdateAvailable);

            // Cleanup on unmount
            return () => {
                if (window.electronAPI.removeUpdateListeners) {
                    window.electronAPI.removeUpdateListeners();
                }
            };
        }
    }, [addNotification, t]);
};
