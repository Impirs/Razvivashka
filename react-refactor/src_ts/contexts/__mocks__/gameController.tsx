// Mock for gameController.tsx to avoid sound file imports
export const GameController = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export const useGameController = () => ({
    restart: jest.fn(),
    win: jest.fn(),
    lose: jest.fn(),
    setStatus: jest.fn(),
    status: 'idle'
});

export default GameController;
