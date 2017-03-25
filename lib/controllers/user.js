const userModel = require('../models/user.js');

module.exports = {
  signIn: function *(next){
    const ctx = this,
          data = ctx.request.body;

    let user;
    //登录状态下不用重复登录,返回主页面
    if(ctx.session.user){
      // @TODO 返回主页面url
      return;
    }

    if(!data || !data.mailAddress || !data.pwd ){
      ctx.status = 411;
      return this.body = 'length required';
    }

    user = yield userModel.findByMainAddress(data.mailAddress);
    if(!user){
      ctx.status = 404;
      ctx.body = "not found";
    }else{
      //验证密码
      user.comparePassword(data.pwd, function(isMatch){
        if(isMatch){
          ctx.session.user = user._id;
          // @TODO 返回主页面url
        }else{
          ctx.status = 401;
          ctx.body = "unauthorized";
        }
      });
    } 
  },
  signUp: function *(next){
    const ctx = this,
          data = ctx.request.body;

    let user;

    if(!data || !data.userName || !data.pwd || !data.mailAddress){
      ctx.status = 411;
      ctx.body = 'length required';
      return;
    }

    user = yield userModel.findByMailAddress(data.mailAddress);
    if(user){
      ctx.status = 409;
      ctx.body = "conflict";
    }else{
      data.userName = data.userName.substr(0,8).replace(/</g,'&lt');//简单防xss+超过8个字符长的用户名会被截断
      user = new userModel({name: data.userName, password: data.pwd, mailAddress: data.mailAddress});
      yield user.save(function (err) {
        if (err) {
          return console.error(err);
        }
        ctx.session.user = user._id;
        // @TODO 返回主页面
      });
    }
  },
  signOut: function *(next){
    const ctx = this;
    delete ctx.session.user;
    // @TODO 返回登陆页 
  },
  //登录验证
  signRequired: function *(next){
    const ctx = this;
    if(!ctx.session.user){
      this.status = 401 
      this.body = 'unauthorized';
      return;
    }
    yield next;
  }
};