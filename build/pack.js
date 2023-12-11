const { exec } = require('child_process');

const gadgetName = process.argv.slice(2);

exec(
  gadgetName
    ? `cross-env GADGETNAME=${gadgetName.join(",")} webpack --config build/webpack.prod.js`
    : 'webpack --config build/webpack.prod.js'
  , (error, stdout) => {
    if (error) {
      console.error(`打包出错: ${error}`);
      return;
    }
    console.log(stdout);
  },
);