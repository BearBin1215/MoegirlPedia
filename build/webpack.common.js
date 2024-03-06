const glob = require('glob');
const path = require('path');

const entry = glob.sync(process.env.gadgetname ? `./src/gadgets/{${process.env.gadgetname},}/index.{js,jsx,ts,tsx}` : './src/gadgets/**/index.{js,jsx,ts,tsx}', { nocase: true })
  .map((filename) => filename
    .replace(/\\/g, '/') // windows下会输出反斜杠，需要替换
    .replace(/^(?:.\/)?(.*)$/, './$1'))
  .reduce((entries, path) => {
    const entry = path.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx|ts|tsx)$/, '');
    entries[entry] = path;
    return entries;
  }, {});

const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        [
          'autoprefixer',
        ],
        [
          'cssnano',
          {
            preset: 'default',
          },
        ],
      ],
    },
  },
};

module.exports = {
  entry,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      '@': path.resolve(__dirname, '..', 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            targets: '> 0.35%, not dead',
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          postCssLoader,
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          postCssLoader,
        ],
      },
    ],
  },
};
