#!/bin/bash
rm -rf ./build
if [ -d ./node_modules ]; then
  ./node_modules/.bin/babel --out-dir ./build ./lib
else
  ../.bin/babel --out-dir ./build ./lib
fi
# More cross-platform compatible than `rename`
find ./build -type f -name '*.jsx' -exec sh -c 'mv -f $0 ${0%.jsx}.js' {} \;
