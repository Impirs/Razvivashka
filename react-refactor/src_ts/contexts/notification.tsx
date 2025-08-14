import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { NotificationContextType, Notification } from '../types/notification';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for notifications
                                    // Actually we don't need it, but it is a good practice
import { useNavigate } from 'react-router-dom'; // For navigation
import type { ReactNode } from 'react';

const initialState: NotificationContextType = {
    notifications: [],
    addNotification: () => {},
    openNotification: () => {},
    removeNotification: () => {},
}

const NotificationContext = createContext<NotificationContextType>(initialState);

function notificationReducer(
    state: NotificationContextType,
    action: any
): NotificationContextType {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            const newNotification: Notification = {
                ...action.payload,
                id: Math.random().toString(36).substr(2, 9), // Generate a random ID
                showtime: action.payload.showtime ?? 3000, // Default to 3000ms if not provided
            };
            return {
                ...state,
                notifications: [...state.notifications, newNotification],
            };
        case 'OPEN_NOTIFICATION':
            // TODO:
            // go to website or to achievements page
            // This could be handled differently based on your app's routing
            // For now, we just mark it as open
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

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    };

    const openNotification = (id: string) => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
            if (notification.link) {
                navigate(notification.link); // Navigate to the link
            }
            dispatch({ type: 'OPEN_NOTIFICATION', payload: { id } });
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