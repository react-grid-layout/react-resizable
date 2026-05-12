/**
 * @jest-environment node
 */
// #251 - Test SSR compatibility where Element is not defined

describe('SSR compatibility', () => {
  test('propTypes.js can be imported in Node.js environment without Element global', () => {
    // In Node.js environment (jest-environment: node), Element is not defined
    expect(typeof Element).toBe('undefined');

    // This should not throw ReferenceError: Element is not defined
    expect(() => {
      require('../lib/propTypes');
    }).not.toThrow();
  });

  test('Resizable.js can be imported in Node.js environment without Element global', () => {
    expect(typeof Element).toBe('undefined');

    // This should not throw ReferenceError: Element is not defined
    expect(() => {
      require('../lib/Resizable');
    }).not.toThrow();
  });

  test('ResizableBox.js can be imported in Node.js environment without Element global', () => {
    expect(typeof Element).toBe('undefined');

    // This should not throw ReferenceError: Element is not defined
    expect(() => {
      require('../lib/ResizableBox');
    }).not.toThrow();
  });
});
