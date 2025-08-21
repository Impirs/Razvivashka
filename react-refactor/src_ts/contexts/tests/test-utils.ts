// Test utility to suppress React act() warnings
export const suppressReactActWarnings = () => {
    const originalError = console.error;
    
    beforeEach(() => {
        console.error = jest.fn((message, ...args) => {
            if (typeof message === 'string' && message.includes('wrapped in act(...)')) {
                return; // Suppress act() warnings
            }
            originalError.call(console, message, ...args);
        });
    });
    
    afterEach(() => {
        console.error = originalError;
    });
};
