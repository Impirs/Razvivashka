import React from "react";
import "../../styles/notifications/update.scss";

export default function UpdNotif({ version, releaseNotes, releaseUrl, onClose }) {
    return (
        <div className="update-notification" onClick={() => {
            window.electronAPI.openExternal(releaseUrl);
            if (onClose) onClose();
        }}>
            <div 
                className="notification-icon" 
                id="warning"
            />
            <div className="notification-info">
                <h3>Доступно обновление до версии {version}</h3>
                <p>Нажмите, чтобы перейти к релизу</p>
            </div>
        </div>
    );
    // <div className="notif-body">{releaseNotes}</div>
}