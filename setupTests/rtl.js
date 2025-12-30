// Polyfill TextEncoder/TextDecoder for jsdom in Node 18+
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Import jest-dom matchers for extended assertions
require('@testing-library/jest-dom');
