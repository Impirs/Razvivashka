import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useCurrentUser, useUserManagement, useTranslationFunction } from '@/hooks/useSelectiveContext';
import Button from '@/components/button/button';
import Icon from '../icon/icon';

interface UserManagerProps {
    className?: string;
}

// Separate component for user list items to optimize rendering
// React.memo prevents re-renders when other users in the list change
// useCallback ensures stable onClick reference for performance
const UserItem = React.memo<{
    user: string;
    isActive: boolean;
    onUserSwitch: (user: string) => void;
}>(({ user, isActive, onUserSwitch }) => {
    const handleClick = useCallback(() => {
        onUserSwitch(user);
    }, [user, onUserSwitch]);

    return (
        <div
            className={`user-item ${isActive ? 'active' : ''}`}
            onClick={handleClick}
        >
            {user}
        </div>
    );
});

UserItem.displayName = 'UserItem';

const UserManager = React.memo<UserManagerProps>(({ className }) => {
    const currentUser = useCurrentUser();
    const { listUsers, switchUser, createUser, deleteUser, renameCurrentUser } = useUserManagement();
    const t = useTranslationFunction(); // Only translation function, not full language context
    
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

    // useCallback for all handlers provides stable references
    // This prevents child components from re-rendering unnecessarily
    const commitRename = useCallback(async () => {
        const trimmed = username.trim();
        if (!currentUser || !trimmed || trimmed === currentUser.username) return;
        await renameCurrentUser(trimmed);
    }, [username, currentUser, renameCurrentUser]);

    const handleUserSwitch = useCallback(async (targetUsername: string) => {
        if (targetUsername !== currentUser?.username) {
            await switchUser(targetUsername);
        }
        setIsDropdownOpen(false);
    }, [currentUser?.username, switchUser]);

    const handleDeleteUser = useCallback(async (targetUsername: string) => {
        await deleteUser(targetUsername);
        setShowDeleteConfirm(null);
        setIsDropdownOpen(false);
    }, [deleteUser]);

    const handleCreateUser = useCallback(async () => {
        const trimmed = newUserName.trim();
        if (!trimmed) return;
        
        const success = await createUser(trimmed, true);
        if (success) {
            setShowCreateInput(false);
            setNewUserName('');
            setIsDropdownOpen(false);
        }
    }, [newUserName, createUser]);

    // useMemo for derived values prevents unnecessary recalculations
    const users = useMemo(() => listUsers(), [listUsers]);
    const canDeleteCurrentUser = useMemo(() => users.length > 1, [users.length]);

    // All event handlers are memoized to prevent child re-renders
    const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitRename();
        }
    }, [commitRename]);

    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(!isDropdownOpen);
    }, [isDropdownOpen]);

    const handleDeleteConfirm = useCallback(() => {
        currentUser && setShowDeleteConfirm(currentUser.username);
    }, [currentUser]);

    const handleNewUserNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUserName(e.target.value);
    }, []);

    const handleNewUserKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateUser();
        } else if (e.key === 'Escape') {
            setShowCreateInput(false);
            setNewUserName('');
        }
    }, [handleCreateUser]);

    const showCreateInputHandler = useCallback(() => {
        setShowCreateInput(true);
    }, []);

    const cancelCreateUser = useCallback(() => {
        setShowCreateInput(false);
        setNewUserName('');
    }, []);

    const handleDeleteConfirmClick = useCallback(() => {
        if (showDeleteConfirm) {
            handleDeleteUser(showDeleteConfirm);
        }
    }, [showDeleteConfirm, handleDeleteUser]);

    const cancelDeleteConfirm = useCallback(() => {
        setShowDeleteConfirm(null);
    }, []);

    return (
        <div className={`user-manager ${className || ''}`} ref={containerRef}>
            <div className="user-input-container">
                <input
                    type="text"
                    value={username}
                    className="user-input"
                    placeholder={t('settings.player.placeholder' as any)}
                    aria-label="current-user-name"
                    onChange={handleUsernameChange}
                    onBlur={commitRename}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="dropdown-toggle"
                    onClick={toggleDropdown}
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
                    onClick={handleDeleteConfirm}
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
                            <UserItem
                                key={user}
                                user={user}
                                isActive={user === currentUser?.username}
                                onUserSwitch={handleUserSwitch}
                            />
                        ))}
                        
                        {!showCreateInput ? (
                            <div
                                className="user-item create-user"
                                onClick={showCreateInputHandler}
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
                                    onChange={handleNewUserNameChange}
                                    onKeyDown={handleNewUserKeyDown}
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
                                        onClick={cancelCreateUser}
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
                                onClick={handleDeleteConfirmClick}
                            >
                                {t('settings.player.deleteConfirm.confirm' as any)}
                            </Button>
                            <Button
                                className="secondary-button"
                                onClick={cancelDeleteConfirm}
                            >
                                {t('settings.player.deleteConfirm.cancel' as any)}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

UserManager.displayName = 'UserManager';

export default UserManager;
