const glob = require('glob');

const entry = glob.sync(process.env.gadgetname ? `./src/gadgets/${process.env.gadgetname}/index.{js,jsx,ts,tsx}` : './src/gadgets/**/index.{js,jsx,ts,tsx}')
  .map((filename) => filename
    .replace(/\\/g, '/') // windows下会输出反斜杠，需要替换
    .replace(/^(?:.\/)?(.*)$/, './$1'))
  .reduce((entries, path) => {
    const entry = path.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx|ts|tsx)$/, '');
    entries[entry] = path;
    return entries;
  }, {});

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
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                  ],
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
};