import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const rollupGlobals = {
  'd3': 'd3'
}

export default {
  input: './index.js',
  external: Object.keys(rollupGlobals),
  name: 'd3',
  format: 'umd',
  extend: true,
  sourcemap: false,
  globals: rollupGlobals,
  plugins: [
    nodeResolve({
      module: true,
      jsnext: true,
      main: true,
      browser: false,
      extensions: ['.js'],
      preferBuiltins: true,
      jail: '/',
      only: ['d3-tip'],
      modulesOnly: false
    }),
    commonjs()
  ]
}
