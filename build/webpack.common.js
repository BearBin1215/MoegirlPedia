const glob = require('glob');

const entry = glob.sync(process.env.gadgetname ? `./src/gadgets/{${process.env.gadgetname},}/index.{js,jsx}` : './src/gadgets/**/index.{js,jsx}')
  .map((filename) => filename
    .replace(/\\/g, '/') // windows下会输出反斜杠，需要替换
    .replace(/^(?:.\/)?(.*)$/, './$1'))
  .reduce((entries, path) => {
    const entry = path.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx)$/, '');
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
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          postCssLoader,
        ],
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
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          postCssLoader,
          'sass-loader',
        ],
      },
    ],
  },
};