
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

/** @type {import('ts-jest').JestConfigWithTsJest} */
/** @type {import('jest').Config} */
module.exports = {
  setupFiles: ['dotenv/config'],

  // silent: false,
  preset: 'ts-jest',
  // Use the appropriate test environment based on your setup.
  // For Node.js (for backend tests):
  testEnvironment: 'node',
  // For React components (for frontend tests):
  // testEnvironment: 'jsdom',

  // Specify the directories where your tests are located.
  testMatch: ['**/tests/**/*.test.(ts|tsx|js|jsx)'],

  // Setup files before running tests.
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],

  // Transform files with TypeScript using ts-jest.
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  moduleNameMapper: {
    '^services/(.*)$': '<rootDir>/src/services/$1', // Map the 'service/' alias
    '^components/(.*)$': '<rootDir>/src/components/$1', // Map the 'components/' alias
    // Add other moduleNameMapper entries as needed for your aliases.
  },
};
