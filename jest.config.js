const path = require('path');

module.exports = {
  coverageThreshold: {
    global: {
      branches: 15, // TODO: 80
      functions: 15, // TODO: 80
      lines: 15, // TODO: 80
      statements: 15 // TODO: 80
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
