const path = require('path');

module.exports = {
  coverageThreshold: {
    global: {
      branches: 30, // TODO: > 80
      functions: 20, // TODO: > 80
      lines: 60, // TODO: > 80
      statements: 30 // TODO: > 80
    }
  },
  setupFiles: [
    path.join(__dirname, '/setupTests/enzyme')
  ],
  coveragePathIgnorePatterns: [
    'build/'
  ],
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!webpack.config.js',
    '!jest.config.js',
    '!**/node_modules/**',
    '!**/setupTests/**',
    '!**/examples/**',
    '!**/coverage/lcov-report/**'
  ]
};
