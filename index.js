'use strict';
module.exports = function() {
  throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable");
};

module.exports.Resizable = require('./build/Resizable');
module.exports.ResizableBox = require('./build/ResizableBox');
