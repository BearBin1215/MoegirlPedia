import path from 'path';
import { fileURLToPath } from 'url';
import { rspack } from '@rspack/core';
import { defineConfig } from '@rspack/cli';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  mode: 'development',
  entry: './playground/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
          type: 'javascript/auto',
        },
      },
      {
        // 原版oojs-ui/jquery的dist脚本（含两个主题脚本）按静态资源URL引入（对照工程用），不做打包执行
        test: /[\\/]node_modules[\\/][^\\/]+[\\/](dist[\\/])?(jquery|oojs|oojs-ui|oojs-ui-wikimediaui|oojs-ui-apex)\.js$/,
        type: 'asset/resource',
      },
      {
        // 普通css正常打包；原版oojs-ui主题样式被exclude后命中下方asset/source规则
        test: /\.css$/,
        exclude: /[\\/]node_modules[\\/].*oojs-ui[\\/]dist[\\/]/,
        type: 'css/auto',
      },
      {
        // 原版主题CSS以文本导出（图标url经require.context重写为构建资源URL后以Blob注入）
        test: /oojs-ui-(wikimediaui|apex)\.css$/,
        type: 'asset/source',
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
  experiments: {
    css: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'oojs-ui-react': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './playground/index.html',
    }),
    new ReactRefreshRspackPlugin(),
    new rspack.HotModuleReplacementPlugin(),
    new TsCheckerRspackPlugin(),
  ],
  devServer: {
    port: 8090,
    open: true,
  },
  devtool: 'source-map',
});
