import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/contexts/gamestore';
import { useLanguage } from '@/contexts/i18n';
import Button from '@/components/button/button';
import Icon from '../icon/icon';

interface UserManagerProps {
    className?: string;
}

const UserManager= ({ className } : UserManagerProps ) => {
    const { currentUser, listUsers, switchUser, createUser, deleteUser, renameCurrentUser } = useGameStore();
    const { t } = useLanguage();
    
    const [username, setUsername] = useState<string>(currentUser?.username ?? 'user');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [newUserName, setNewUserName] = useState('');
    const [showCreateInput, setShowCreateInput] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync username with current user
    useEffect(() => {
        setUsername(currentUser?.username ?? 'user');
    }, [currentUser?.username]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setShowCreateInput(false);
                setNewUserName('');
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const commitRename = async () => {
        const trimmed = username.trim();
        if (!currentUser || !trimmed || trimmed === currentUser.username) return;
        await renameCurrentUser(trimmed);
    };

    const handleUserSwitch = async (targetUsername: string) => {
        if (targetUsername !== currentUser?.username) {
            await switchUser(targetUsername);
        }
        setIsDropdownOpen(false);
    };

    const handleDeleteUser = async (targetUsername: string) => {
        await deleteUser(targetUsername);
        setShowDeleteConfirm(null);
        setIsDropdownOpen(false);
    };

    const handleCreateUser = async () => {
        const trimmed = newUserName.trim();
        if (!trimmed) return;
        
        const success = await createUser(trimmed, true);
        if (success) {
            setShowCreateInput(false);
            setNewUserName('');
            setIsDropdownOpen(false);
        }
    };

    const users = listUsers();
    const canDeleteCurrentUser = users.length > 1;

    return (
        <div className={`user-manager ${className || ''}`} ref={containerRef}>
            <div className="user-input-container">
                <input
                    type="text"
                    value={username}
                    className="user-input"
                    placeholder={t('settings.player.placeholder' as any)}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            commitRename();
                        }
                    }}
                />
                <button
                    className="dropdown-toggle"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="toggle-user-list"
                >
                    <span className='ui-button__icon' aria-hidden>
                        <Icon name={isDropdownOpen ? "up-arrow" : "down-arrow"} 
                            masked
                        />
                    </span>
                </button>
            </div>
            
            <button className="delete-button" 
                    disabled={!canDeleteCurrentUser}
                    onClick={() => currentUser && setShowDeleteConfirm(currentUser.username)}
                    aria-label="delete-current-user"
            >
                <span className='ui-button__icon' aria-hidden>
                    <Icon name="delete" masked/>
                </span>
            </button>

            {isDropdownOpen && (
                <div className="user-dropdown" ref={dropdownRef}>
                    <div className="user-list">
                        {users.map((user) => (
                            <div
                                key={user}
                                className={`user-item ${user === currentUser?.username ? 'active' : ''}`}
                                onClick={() => handleUserSwitch(user)}
                            >
                                {user}
                                {/* {user === currentUser?.username && (
                                    <span className="current-indicator">★</span>
                                )} */}
                            </div>
                        ))}
                        
                        {!showCreateInput ? (
                            <div
                                className="user-item create-user"
                                onClick={() => setShowCreateInput(true)}
                            >
                                <span className="plus-icon">+</span>
                                {t('settings.player.createNew' as any)}
                            </div>
                        ) : (
                            <div className="create-user-input">
                                <input
                                    type="text"
                                    value={newUserName}
                                    placeholder={t('settings.player.newUserPlaceholder' as any)}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleCreateUser();
                                        } else if (e.key === 'Escape') {
                                            setShowCreateInput(false);
                                            setNewUserName('');
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="create-user-buttons">
                                    <button
                                        className='ui-button'
                                        onClick={handleCreateUser}
                                        disabled={!newUserName.trim()}
                                    >
                                        {t('buttons.create' as any)}
                                    </button>
                                    <button
                                        className='ui-button'
                                        onClick={() => {
                                            setShowCreateInput(false);
                                            setNewUserName('');
                                        }}
                                    >
                                        {t('buttons.cancel' as any)}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-dialog">
                        <h3>{t('settings.player.deleteConfirm.title' as any)}</h3>
                        <p>
                            {t('settings.player.deleteConfirm.message' as any)} {showDeleteConfirm}.
                        </p>
                        <p className="warning">
                            {t('settings.player.deleteConfirm.warning' as any)}
                        </p>
                        <div className="confirm-buttons">
                            <Button
                                className="danger-button"
                                onClick={() => handleDeleteUser(showDeleteConfirm)}
                            >
                                {t('settings.player.deleteConfirm.confirm' as any)}
                            </Button>
                            <Button
                                className="secondary-button"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                {t('settings.player.deleteConfirm.cancel' as any)}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
