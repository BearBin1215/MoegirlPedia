const path = require('path');
const glob = require('glob');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: glob.sync('./src/gadgets/**/index.js')
        .map((filename) => filename
            .replace(/\\/g, '/')
            .replace(/^(?:.\/)?(.*)$/, './$1'))
        .reduce((entries, path) => {
            const entry = path.replace('./src/gadgets/', '').replace('/index.js', '');
            entries[entry] = path;
            return entries;
        }, {}),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/gadgets'),
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
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
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
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            })
        ]
    }
};
