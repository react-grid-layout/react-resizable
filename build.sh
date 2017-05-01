#!/bin/bash -ex
rm -rf ./build

# Simple babel run
./node_modules/.bin/babel --out-dir ./build ./lib

# Gen flow configs
# When https://github.com/facebook/flow/issues/2830 et al are fixed we can use this, but not until then
# find ./lib -type f -name '*.js' -exec sh -c "$BIN/flow gen-flow-files \$0 --out-dir build" {} \;

# Copy original source as js.flow; flow will pick them up
find ./lib -type f -name '*.js' -exec sh -c 'cp $0 build/$(basename $0).flow' {} \;
