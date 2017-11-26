const Router = require('koa-router')();
const addressBook = require('../controllers/addressBook.js');

Router.get('/list', addressBook.list);

Router.post('/save', addressBook.insert);

Router.delete('/delete', addressBook.delete);

module.exports = Router.routes();