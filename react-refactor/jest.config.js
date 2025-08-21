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
        // Map the iconMap module (which uses Vite import.meta.glob) to a mock for Jest
        '^\.\/iconMap$': '<rootDir>/src_ts/components/icon/__mocks__/iconMap.tsx',
        // Mock media files
        '\\.(mp3|wav|ogg|flac|aac|mp4|avi|mov|mkv|jpg|jpeg|png|gif|svg|webp)$': 'jest-transform-stub',
        // Mock i18n context for tests
        '^@/contexts/i18n$': '<rootDir>/src_ts/contexts/__mocks__/i18n.tsx',
        // Mock gameController context for tests
        '^@/contexts/gameController$': '<rootDir>/src_ts/contexts/__mocks__/gameController.tsx',
        // Mock useSelectiveContext hooks for tests
        '^@/hooks/useSelectiveContext$': '<rootDir>/src_ts/hooks/__mocks__/useSelectiveContext.ts',
    },
    // Polyfills and shims before tests
    setupFiles: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    testEnvironment: 'jest-environment-jsdom',
};
