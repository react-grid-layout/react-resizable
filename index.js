module.exports = function() {
  throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable");
};

module.exports.Resizable = require('./build/Resizable.jsx');
module.exports.ResizableBox = require('./build/ResizableBox.jsx');
