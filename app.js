const Koa = require('koa');
const Router = require('koa-router')();
const bodyParser = require('koa-body');
const session = require('koa-session');
const serve = require('koa-static');
const mongoose   = require('mongoose');
const fs = require('fs');

//指定启动命令的第三个参数为应用监听的端口
const port = process.argv[2];

const UserRoutes = require('./lib/routes/user.js');
const MailRoutes = require('./lib/routes/mail.js');
const AddressBookRoutes = require('./lib/routes/addressbook.js');
const GroupRoutes = require('./lib/routes/group.js');
const TagRoutes = require('./lib/routes/tag.js');

const app = new Koa();

mongoose.connect('mongodb://127.0.0.1/fmail');

app.keys = ['fmail'];
const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  maxAge: 60*60*60*24, /** (number) maxAge in ms (default is 1 days) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
};

app.use(bodyParser({formidable:{uploadDir: __dirname+'/public/attachments'},multipart: true}));
app.use(session(CONFIG, app));
app.use(serve(__dirname + '/public', { gzip: true}));


Router.get('/',function *(next){
	var index = fs.readFileSync(__dirname + '/public/html/index.html', 'utf-8');
	this.body = index;
})

Router.use('/api/user', UserRoutes);
Router.use('/api/mail', MailRoutes);
Router.use('/api/contact', AddressBookRoutes);
Router.use('/api/group', GroupRoutes);
Router.use('/api/tag', TagRoutes);
app
	.use(Router.routes())
 	.use(Router.allowedMethods());


app.listen(port,(err) => {
  if(err){
    console.error(err);
  }

  console.log(`应用已启动，监听端口：${port}`);
});