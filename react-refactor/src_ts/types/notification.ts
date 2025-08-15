export type NotificationType = 'update' | 'achievement' | 'warning'; // | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string; // Optional URL or path to navigate when clicked
    open?: boolean; // Optional, to indicate if the notification is currently open
    // timestamp: number; // Optional, if not provided, default to current time
    showtime?: number; // Optional, if not provided, default to 3000ms
    icon?: string; // Optional, if not provided, default to a generic icon
}

export interface NotificationState {
    notifications: Notification[];
    queue: Notification[];
    isShowing: boolean;
}

export interface NotificationAction {
    addNotification: (type: NotificationType, title: string, message: string, link?: string) => void;
    openNotification: (id: string) => void;
    removeNotification: (id: string) => void;
}

export type NotificationContextType = NotificationState & NotificationAction;