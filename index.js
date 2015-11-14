export default function() {
  throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable or " +
                  "import {Resizable} from 'react-resizable'.");
};

export Resizable from './build/Resizable';
export ResizableBox from './build/ResizableBox';
