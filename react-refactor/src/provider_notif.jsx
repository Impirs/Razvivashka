import React, { createContext, useContext, useState, useCallback } from "react";
import AchNotif from "./components/notifications/ach_notif";

const NotifContext = createContext();

export function useAchNotif() {
    return useContext(NotifContext);
}

export function NotifProvider({ children }) {
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);
    // Добавить достижения в очередь
    const notifyAchievements = useCallback((achievements) => {
        setQueue(prev => [...prev, ...achievements]);
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

    return (
        <NotifContext.Provider value={{ notifyAchievements }}>
            {children}
            {current && <AchNotif achievement={current} />}
        </NotifContext.Provider>
    );
}