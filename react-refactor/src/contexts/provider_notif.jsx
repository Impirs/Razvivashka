import React, { createContext, useContext, useState, useCallback } from "react";
import AchNotif from "../components/notifications/ach_notif";
import UpdNotif from "../components/notifications/upd_notif";

const NotifContext = createContext();

export function useAchNotif() {
    return useContext(NotifContext);
}

export function NotifProvider({ children }) {
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);

    const [updateNotif, setUpdateNotif] = useState(null);

    const notifyAchievements = useCallback((achievements) => {
        setQueue(prev => [...prev, ...achievements]);
    }, []);

    const notifyUpdate = useCallback((data) => {
        setUpdateNotif(data);
    }, []);

    React.useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0]);
            setQueue(q => q.slice(1));
        }
    }, [queue, current]);

    React.useEffect(() => {
        if (current) {
            const timeout = setTimeout(() => setCurrent(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [current]);

    React.useEffect(() => {
        if (window.electronAPI?.onUpdateAvailable) {
            window.electronAPI.onUpdateAvailable((data) => {
                notifyUpdate(data);
            });
        }
        // For Dev
        if (window.electronAPI?.onUpdateTesting) {
            window.electronAPI.onUpdateTesting((data) => {
                notifyUpdate(data);
            });
        }
    }, [notifyUpdate]);

    React.useEffect(() => {
        if (updateNotif) {
            const timeout = setTimeout(() => setUpdateNotif(null), 60000);
            return () => clearTimeout(timeout);
        }
    }, [updateNotif]);

    return (
        <NotifContext.Provider value={{ notifyAchievements }}>
            {children}
            {current && <AchNotif achievement={current} />}
            {updateNotif && (
                <UpdNotif
                    {...updateNotif}
                    onClose={() => setUpdateNotif(null)}
                />
            )}
        </NotifContext.Provider>
    );
}