const rollupGlobals = {
  'd3': 'd3',
  'd3-tip': 'd3-tip'
}

export default {
  input: './index.js',
  external: Object.keys(rollupGlobals),
  name: 'd3',
  format: 'umd',
  extend: true,
  sourcemap: false,
  globals: rollupGlobals
}
