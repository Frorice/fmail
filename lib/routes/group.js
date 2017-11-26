const Router = require('koa-router')();
const group = require('../controllers/group.js');

Router.get('/list', group.list);

Router.post('/save', group.insert);

Router.delete('/delete', group.delete);

module.exports = Router.routes();