const path = require('path');

module.exports = {
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 70, // TODO: > 80
      functions: 70, // TODO: > 80
      lines: 80,
      statements: 75 // TODO: > 80
    }
  },
  setupFilesAfterEnv: [
    path.join(__dirname, '/setupTests/rtl')
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/flow-typed/',
  ],
  collectCoverageFrom: [
    'lib/*.{js,jsx}',
  ]
};
