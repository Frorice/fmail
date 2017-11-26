const Router = require('koa-router')();
const tag = require('../controllers/tag.js');

Router.get('/list', tag.list);

Router.post('/save', tag.insert);

Router.delete('/delete', tag.delete);

module.exports = Router.routes();