const { exec } = require('child_process');

// eslint-disable-next-line prefer-destructuring
const gadgetName = process.argv[2];
console.log(`开始打包${gadgetName || '所有小工具'}……`);
exec(
  gadgetName
    ? `cross-env GADGETNAME=${gadgetName} webpack --config build/webpack.prod.js`
    : 'webpack --config build/webpack.prod.js'
  , (error, stdout) => {
    if (error) {
      console.error(`打包出错: ${error}`);
      return;
    }
    console.log(stdout);
  },
);