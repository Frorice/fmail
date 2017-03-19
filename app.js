const Koa = require('koa');

//指定启动命令的第三个参数为应用监听的端口
const port = process.argv[2];

const app = new Koa();

app.listen(port,(err) => {
  if(err){
    console.error(err);
  }

  console.log(`应用已启动，监听端口：${port}`);
});