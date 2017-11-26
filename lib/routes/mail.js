const Router = require('koa-router')();
const Mail = require('../controllers/mail.js');

Router.get('/detail', Mail.get);

Router.get('/list', Mail.list);

Router.post('/save', Mail.insert);

Router.delete('/delete', Mail.delete);

Router.get('/category', Mail.categoryList);

Router.post('/tagSave', Mail.tagSave);

module.exports = Router.routes();