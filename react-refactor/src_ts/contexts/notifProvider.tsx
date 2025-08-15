import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { NotificationContextType, Notification, NotificationType } from '../types/notification';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const initialState: NotificationContextType = {
    notifications: [],
    queue: [],
    isShowing: false,
    addNotification: () => {},
    openNotification: () => {},
    removeNotification: () => {},
}

const NotificationContext = createContext<NotificationContextType>(initialState);

function notificationReducer(
    state: NotificationContextType,
    action: any
): NotificationContextType {
    // console.log(`Notification reducer called with action:`, action.type, action.payload);
    
    switch (action.type) {
        case 'ADD_TO_QUEUE':
            const newState = {
                ...state,
                queue: [...state.queue, action.payload],
            };
            // console.log(`Added to queue. New queue length:`, newState.queue.length);
            return newState;
        case 'SHOW_NOTIFICATION':
            return {
                ...state,
                notifications: [action.payload],
                isShowing: true,
                queue: state.queue.filter(n => n.id !== action.payload.id),
            };
        case 'OPEN_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload.id ? { ...n, open: true } : n
                ),
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload.id),
                isShowing: false,
            };
        default:
            return state;
    }
}

type NotificationProviderProps = {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const navigate = useNavigate();

    const getNotificationSettings = (type: NotificationType) => {
        switch (type) {
            case 'achievement':
                return {
                    showtime: 5000,
                    icon: 'award',
                    link: '/achievements'
                };
            case 'update':
                return {
                    showtime: 30000,
                    icon: 'update',
                    link: undefined // Will be set dynamically
                };
            case 'warning':
                return {
                    showtime: 15000,
                    icon: 'warning',
                    link: undefined
                };
            default:
                return {
                    showtime: 3000,
                    icon: 'warning',
                    link: undefined
                };
        }
    };

    const addNotification = useCallback((type: NotificationType, title: string, message: string, link?: string) => {
        // console.log(`🔔 addNotification called with:`, { type, title, message });
        
        const settings = getNotificationSettings(type);
        const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title,
            message,    
            ...settings,
            link: link || settings.link, // Use provided link or default
        };

        // console.log(`🔔 Created notification:`, newNotification);
        
        dispatch({ type: 'ADD_TO_QUEUE', payload: newNotification });
        
        // console.log(`🔔 Notification dispatched to queue`);
    }, []);

    // Add event listener for debug notifications
    // useEffect(() => {
    //     const handleTestNotification = (event: CustomEvent) => {
    //         const { type, title, message } = event.detail;
    //         addNotification(type, title, message);
    //     };

    //     window.addEventListener('testNotification' as any, handleTestNotification);
        
    //     return () => {
    //         window.removeEventListener('testNotification' as any, handleTestNotification);
    //     };
    // }, [addNotification]);

    // Process queue - show next notification when current one is done
    useEffect(() => {
        if (!state.isShowing && state.queue.length > 0) {
            const timer = setTimeout(() => {
                const nextNotification = state.queue[0];
                dispatch({ type: 'SHOW_NOTIFICATION', payload: nextNotification });

                // Auto-remove after showtime
                setTimeout(() => {
                    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id: nextNotification.id } });
                }, nextNotification.showtime);
            }, state.notifications.length > 0 ? 5500 : 0); // 5.5 seconds delay between notifications, immediate for first

            return () => clearTimeout(timer);
        }
    }, [state.isShowing, state.queue.length]);

    const openNotification = (id: string) => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
            if (notification.link) {
                if (notification.link.startsWith('http')) {
                    // Use electronAPI if available, otherwise fallback to window.open
                    if (typeof window !== 'undefined' && window.electronAPI) {
                        window.electronAPI.openExternal(notification.link);
                    } else {
                        window.open(notification.link, '_blank');
                    }
                } else {
                    navigate(notification.link);
                }
            }
            dispatch({ type: 'OPEN_NOTIFICATION', payload: { id } });
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
        }
    };

    const removeNotification = (id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
    };

    return (
        <NotificationContext.Provider
            value={{
                ...state,
                addNotification,
                openNotification,
                removeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};