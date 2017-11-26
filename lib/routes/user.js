const Router = require('koa-router')();
const User = require('../controllers/user.js');

Router.get('/logged', User.logged);

Router.post('/signup', User.signUp);

Router.post('/signin', User.signIn);

Router.get('/signout', User.signOut);

module.exports = Router.routes();