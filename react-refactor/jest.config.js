module.exports = {
    // Limit Jest to the TS React app folder
    roots: ['<rootDir>/src_ts'],
    // Support both *.test.* and *.spec.* in any nested folder
        testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleNameMapper: {
        // Map TS path alias "@/" -> src_ts
        '^@/(.*)$': '<rootDir>/src_ts/$1',
    },
        // Polyfills and shims before tests
        setupFiles: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    testEnvironment: 'jest-environment-jsdom',
};
