import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserManager from './usermanager';

// Mock the hooks
const mockUseCurrentUser = jest.fn();
const mockUseUserManagement = jest.fn();
const mockUseTranslationFunction = jest.fn();

jest.mock('@/hooks/useSelectiveContext', () => ({
    useCurrentUser: () => mockUseCurrentUser(),
    useUserManagement: () => mockUseUserManagement(),
    useTranslationFunction: () => mockUseTranslationFunction(),
}));

// Mock the Button component
jest.mock('@/components/button/button', () => {
    return function MockButton({ children, className, onClick, ...props }: any) {
        return (
            <button className={className} onClick={onClick} {...props}>
                {children}
            </button>
        );
    };
});

// Mock the Icon component
jest.mock('../icon/icon', () => {
    return function MockIcon({ name, masked, ...props }: any) {
        return <span data-testid={`icon-${name}`} data-masked={masked} {...props} />;
    };
});

describe('UserManager', () => {
    const mockUserManagement = {
        listUsers: jest.fn(),
        switchUser: jest.fn(),
        createUser: jest.fn(),
        deleteUser: jest.fn(),
        renameCurrentUser: jest.fn(),
    };

    const mockTranslationFunction = jest.fn();
    
    const mockUser = {
        username: 'testuser',
        achievements: [],
        gameRecords: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUseCurrentUser.mockReturnValue(mockUser);
        mockUseUserManagement.mockReturnValue(mockUserManagement);
        mockUseTranslationFunction.mockReturnValue(mockTranslationFunction);
        
        // Default translations
        mockTranslationFunction.mockImplementation((key: string) => {
            const translations: Record<string, string> = {
                'settings.player.placeholder': 'Enter username',
                'settings.player.createNew': 'Create New User',
                'settings.player.newUserPlaceholder': 'New user name',
                'buttons.create': 'Create',
                'buttons.cancel': 'Cancel',
                'settings.player.deleteConfirm.title': 'Delete User',
                'settings.player.deleteConfirm.message': 'Are you sure you want to delete user',
                'settings.player.deleteConfirm.warning': 'This action cannot be undone.',
                'settings.player.deleteConfirm.confirm': 'Delete',
                'settings.player.deleteConfirm.cancel': 'Cancel',
            };
            return translations[key] || key;
        });

        mockUserManagement.listUsers.mockReturnValue(['testuser', 'user2']);
        mockUserManagement.switchUser.mockResolvedValue(true);
        mockUserManagement.createUser.mockResolvedValue(true);
        mockUserManagement.deleteUser.mockResolvedValue(true);
        mockUserManagement.renameCurrentUser.mockResolvedValue(true);
    });

    describe('Basic rendering', () => {
        it('renders without crashing', () => {
            render(<UserManager />);
            
            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
            expect(screen.getByLabelText('current-user-name')).toBeInTheDocument();
            expect(screen.getByLabelText('toggle-user-list')).toBeInTheDocument();
            expect(screen.getByLabelText('delete-current-user')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(<UserManager className="custom-class" />);
            
            expect(container.firstChild).toHaveClass('user-manager', 'custom-class');
        });

        it('displays current user username in input', () => {
            render(<UserManager />);
            
            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
        });

        it('displays fallback username when no current user', () => {
            mockUseCurrentUser.mockReturnValue(null);
            render(<UserManager />);
            
            expect(screen.getByDisplayValue('user')).toBeInTheDocument();
        });
    });

    describe('Username input', () => {
        it('allows typing in username input', async () => {
            render(<UserManager />);
            
            const input = screen.getByLabelText('current-user-name');
            
            fireEvent.change(input, { target: { value: 'newname' } });
            
            expect(input).toHaveValue('newname');
        });

        it('commits rename on blur', async () => {
            render(<UserManager />);
            
            const input = screen.getByLabelText('current-user-name');
            
            fireEvent.change(input, { target: { value: 'newname' } });
            fireEvent.blur(input);
            
            await waitFor(() => {
                expect(mockUserManagement.renameCurrentUser).toHaveBeenCalledWith('newname');
            });
        });

        it('commits rename on Enter key', async () => {
            render(<UserManager />);
            
            const input = screen.getByLabelText('current-user-name');
            
            fireEvent.change(input, { target: { value: 'newname' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            
            await waitFor(() => {
                expect(mockUserManagement.renameCurrentUser).toHaveBeenCalledWith('newname');
            });
        });

        it('does not rename when username is same as current', async () => {
            render(<UserManager />);
            
            const input = screen.getByLabelText('current-user-name');
            
            fireEvent.blur(input); // Just blur without changing
            
            expect(mockUserManagement.renameCurrentUser).not.toHaveBeenCalled();
        });

        it('does not rename when username is empty', async () => {
            render(<UserManager />);
            
            const input = screen.getByLabelText('current-user-name');
            
            fireEvent.change(input, { target: { value: '' } });
            fireEvent.blur(input);
            
            expect(mockUserManagement.renameCurrentUser).not.toHaveBeenCalled();
        });
    });

    describe('Dropdown functionality', () => {
        it('opens and closes dropdown on toggle button click', async () => {
            render(<UserManager />);
            
            const toggleButton = screen.getByLabelText('toggle-user-list');
            
            // Initially closed
            expect(screen.queryByText('user2')).not.toBeInTheDocument();
            expect(screen.getByTestId('icon-down-arrow')).toBeInTheDocument();
            
            // Open dropdown
            fireEvent.click(toggleButton);
            
            expect(screen.getByText('user2')).toBeInTheDocument();
            expect(screen.getByTestId('icon-up-arrow')).toBeInTheDocument();
            
            // Close dropdown
            fireEvent.click(toggleButton);
            
            expect(screen.queryByText('user2')).not.toBeInTheDocument();
            expect(screen.getByTestId('icon-down-arrow')).toBeInTheDocument();
        });

        it('displays all users in dropdown', async () => {
            mockUserManagement.listUsers.mockReturnValue(['user1', 'user2', 'user3']);
            
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            
            expect(screen.getByText('user1')).toBeInTheDocument();
            expect(screen.getByText('user2')).toBeInTheDocument();
            expect(screen.getByText('user3')).toBeInTheDocument();
        });

        it('highlights active user in dropdown', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            
            const activeUserItem = screen.getByText('testuser').closest('.user-item');
            const inactiveUserItem = screen.getByText('user2').closest('.user-item');
            
            expect(activeUserItem).toHaveClass('active');
            expect(inactiveUserItem).not.toHaveClass('active');
        });

        it('switches user when clicking on user item', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('user2'));
            
            expect(mockUserManagement.switchUser).toHaveBeenCalledWith('user2');
            
            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByText('user2')).not.toBeInTheDocument();
            });
        });

        it('does not switch when clicking on current user', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('testuser'));
            
            expect(mockUserManagement.switchUser).not.toHaveBeenCalled();
            
            // Dropdown should still close
            await waitFor(() => {
                expect(screen.queryByText('testuser')).not.toBeInTheDocument();
            });
        });
    });

    describe('Create new user', () => {
        it('shows create user option in dropdown', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            
            expect(screen.getByText('Create New User')).toBeInTheDocument();
            expect(screen.getByText('+')).toBeInTheDocument();
        });

        it('shows create input when clicking create user', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            expect(screen.getByPlaceholderText('New user name')).toBeInTheDocument();
            expect(screen.getByText('Create')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
            expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
        });

        it('creates user when clicking create button', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            const input = screen.getByPlaceholderText('New user name');
            fireEvent.change(input, { target: { value: 'newuser' } });
            fireEvent.click(screen.getByText('Create'));
            
            await waitFor(() => {
                expect(mockUserManagement.createUser).toHaveBeenCalledWith('newuser', true);
            });
        });

        it('creates user on Enter key', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            const input = screen.getByPlaceholderText('New user name');
            fireEvent.change(input, { target: { value: 'newuser' } });
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
            
            await waitFor(() => {
                expect(mockUserManagement.createUser).toHaveBeenCalledWith('newuser', true);
            });
        });

        it('cancels creation on Escape key', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            const input = screen.getByPlaceholderText('New user name');
            fireEvent.change(input, { target: { value: 'newuser' } });
            fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
            
            expect(screen.queryByPlaceholderText('New user name')).not.toBeInTheDocument();
            expect(screen.getByText('Create New User')).toBeInTheDocument();
        });

        it('cancels creation when clicking cancel button', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            fireEvent.click(screen.getByText('Cancel'));
            
            expect(screen.queryByPlaceholderText('New user name')).not.toBeInTheDocument();
            expect(screen.getByText('Create New User')).toBeInTheDocument();
        });

        it('disables create button when input is empty', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            const createButton = screen.getByText('Create');
            expect(createButton).toBeDisabled();
            
            const input = screen.getByPlaceholderText('New user name');
            fireEvent.change(input, { target: { value: 'newuser' } });
            
            expect(createButton).not.toBeDisabled();
        });

        it('closes dropdown and resets state after successful creation', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            const input = screen.getByPlaceholderText('New user name');
            fireEvent.change(input, { target: { value: 'newuser' } });
            fireEvent.click(screen.getByText('Create'));
            
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('New user name')).not.toBeInTheDocument();
            });
        });
    });

    describe('Delete user', () => {
        it('enables delete button when there are multiple users', () => {
            mockUserManagement.listUsers.mockReturnValue(['user1', 'user2']);
            render(<UserManager />);
            
            const deleteButton = screen.getByLabelText('delete-current-user');
            expect(deleteButton).not.toBeDisabled();
        });

        it('disables delete button when there is only one user', () => {
            mockUserManagement.listUsers.mockReturnValue(['user1']);
            render(<UserManager />);
            
            const deleteButton = screen.getByLabelText('delete-current-user');
            expect(deleteButton).toBeDisabled();
        });

        it('shows delete confirmation dialog when clicking delete button', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('delete-current-user'));
            
            expect(screen.getByText('Delete User')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete user.*testuser/)).toBeInTheDocument();
            expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
        });

        it('deletes user when confirming deletion', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('delete-current-user'));
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(mockUserManagement.deleteUser).toHaveBeenCalledWith('testuser');
            });
        });

        it('cancels deletion when clicking cancel', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('delete-current-user'));
            fireEvent.click(screen.getByText('Cancel'));
            
            expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
            expect(mockUserManagement.deleteUser).not.toHaveBeenCalled();
        });
    });

    describe('Click outside behavior', () => {
        it('closes dropdown when clicking outside', async () => {
            render(
                <div>
                    <UserManager />
                    <div data-testid="outside">Outside element</div>
                </div>
            );
            
            // Open dropdown
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            expect(screen.getByText('user2')).toBeInTheDocument();
            
            // Click outside using mousedown event (which the component listens for)
            fireEvent.mouseDown(screen.getByTestId('outside'));
            
            await waitFor(() => {
                expect(screen.queryByText('user2')).not.toBeInTheDocument();
            });
        });

        it('closes create input when clicking outside', async () => {
            render(
                <div>
                    <UserManager />
                    <div data-testid="outside">Outside element</div>
                </div>
            );
            
            // Open dropdown and show create input
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            expect(screen.getByPlaceholderText('New user name')).toBeInTheDocument();
            
            // Click outside using mousedown event
            fireEvent.mouseDown(screen.getByTestId('outside'));
            
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('New user name')).not.toBeInTheDocument();
            });
        });
    });

    describe('UserItem component', () => {
        it('renders user item correctly', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            
            const userItem = screen.getByText('user2');
            expect(userItem).toBeInTheDocument();
            expect(userItem.closest('.user-item')).not.toHaveClass('active');
        });

        it('shows active state for current user', async () => {
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            
            const activeUserItem = screen.getByText('testuser').closest('.user-item');
            expect(activeUserItem).toHaveClass('active');
        });
    });

    describe('Error handling', () => {
        it('handles failed user creation gracefully', async () => {
            mockUserManagement.createUser.mockResolvedValue(false);
            
            render(<UserManager />);
            
            fireEvent.click(screen.getByLabelText('toggle-user-list'));
            fireEvent.click(screen.getByText('Create New User'));
            
            const input = screen.getByPlaceholderText('New user name');
            fireEvent.change(input, { target: { value: 'newuser' } });
            fireEvent.click(screen.getByText('Create'));
            
            await waitFor(() => {
                expect(mockUserManagement.createUser).toHaveBeenCalledWith('newuser', true);
            });
            
            // Input should still be visible since creation failed
            expect(screen.getByPlaceholderText('New user name')).toBeInTheDocument();
        });

        it('handles null current user', () => {
            mockUseCurrentUser.mockReturnValue(null);
            mockUserManagement.listUsers.mockReturnValue(['defaultuser']); // Only one user
            
            render(<UserManager />);
            
            expect(screen.getByDisplayValue('user')).toBeInTheDocument();
            expect(screen.getByLabelText('delete-current-user')).toBeDisabled();
        });
    });
});
