const { exec } = require('child_process');

const gadgetName = process.argv[2];
console.log(`开始打包${gadgetName}……`);
exec(`npx cross-env GADGETNAME=${gadgetName} webpack --config build/webpack.prod.js`, (error, stdout) => {
  if(error) {
    console.error(`打包出错: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});