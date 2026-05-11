#!/bin/bash -ex
rm -rf ./build

# Transpile TS/TSX with babel
./node_modules/.bin/babel --extensions ".ts,.tsx" --out-dir ./build ./lib

# Emit TypeScript declaration files
./node_modules/.bin/tsc --project tsconfig.build.json
