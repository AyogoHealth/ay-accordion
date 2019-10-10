/*! Copyright 2019 Ayogo Health Inc. */

import cleanup from 'rollup-plugin-cleanup';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  output: {
      format: 'umd',
      banner: '/*! Copyright 2019 Ayogo Health Inc. */',
      sourceMap: true,
  },
  plugins: [
      cleanup(),
      sourcemaps()
  ]
};
