import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const input = './lib/index.js'

const isExternal = id => id !== '\0babelHelpers' && !id.startsWith('.') && !id.startsWith('/')

const getBabelOptions = () => ({
  exclude: '**/node_modules/**',
  plugins: [
    'external-helpers'
  ]
})

export default [
  {
    input,
    output: {
      file: 'dist/react-resizable.umd.js',
      format: 'umd',
      name: 'ReactResizable',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      },
    },
    external: ['react', 'react-dom'],
    plugins: [
      nodeResolve(),
      commonjs({
        include: '**/node_modules/**',
        namedExports: { 'react-draggable': ['DraggableCore'] }
      }),
      babel(getBabelOptions()),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      sizeSnapshot(),
    ],
  },

  {
    input,
    output: { file: 'dist/react-resizable.cjs.js', format: 'cjs' },
    external: isExternal,
    plugins: [babel(getBabelOptions()), sizeSnapshot()],
  },

  {
    input,
    output: { file: 'dist/react-resizable.esm.js', format: 'es' },
    external: isExternal,
    plugins: [
      babel(getBabelOptions()),
      sizeSnapshot({ treeshake: true }),
    ],
  },
]
