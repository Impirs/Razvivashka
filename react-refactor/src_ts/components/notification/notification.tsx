import React from 'react';
import { useNotification } from '../../contexts/notifProvider';
import Icon from '@/components/icon/icon';

const NotificationDisplay = React.memo(() => {
    const { notifications, openNotification, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    const notification = notifications[0]; // Show only the first notification

    return (
        <article className={`notification notification-${notification.type}`} >
            <div 
                className="notification-content" 
                onClick={() => openNotification(notification.id)}    
            >
                <span className={`notification-icon`}>
                    <Icon
                        name={`${notification.icon}`}
                        masked
                    />
                </span>
                <section className="notification-text">
                    <h3 className="notification-title">
                        { notification.title }
                    </h3>
                    <p className="notification-message">
                        { notification.message }
                    </p>
                </section>
            </div>
            <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
                aria-label="Close notification"
            >
                ✕
            </button>
        </article>
    );
});

NotificationDisplay.displayName = 'NotificationDisplay';

export default NotificationDisplay;
