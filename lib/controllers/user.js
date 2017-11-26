const userModel = require('../models/user.js');

module.exports = {
  signIn: function *(next){
    const ctx = this,
          data = ctx.request.body;

    let user;
    //登录状态下不用重复登录,返回主页面
    if(ctx.session.user){
      ctx.body = {
          sign: true
      };
      return;
    }

    if(!data || !data.mailAddress || !data.pwd ){
      this.body = {
        sign: false,
        errInfo: '数据缺失！'
      }
      return;
    }

    user = yield userModel.findByMailAddress(data.mailAddress);
    if(!user){
      ctx.body = {
        sign: false,
        errInfo: "用户不存在！"
      };
      return;
    }else{
      //验证密码
      let  isMatch = user.comparePassword(data.pwd);
      if(isMatch){
        ctx.session.user = user._id;
        ctx.body = {
          sign: true
        };
      }else{
        ctx.body = {
          sign: false,
          errInfo: '密码错误！'
        };
      }
    } 
  },
  signUp: function *(next){
    const ctx = this,
          data = ctx.request.body;

    let user;

    if(!data || !data.userName || !data.pwd || !data.mailAddress){
      ctx.body = {
        sign: false,
        errInfo:'数据缺失！'
      }
      return;
    }

    user = yield userModel.findByMailAddress(data.mailAddress);
    if(user){
      ctx.body = {
        sign: false,
        errInfo:"邮箱已注册！"
      }
    }else{
      data.userName = data.userName.substr(0,8).replace(/</g,'&lt');//简单防xss+超过8个字符长的用户名会被截断
      user = new userModel({name: data.userName, password: data.pwd, mailAddress: data.mailAddress});
      yield user.save(function (err) {
        if (err) {
          return console.error(err);
        }
        ctx.session.user = user._id;
        ctx.body = {
          sign: true
        }
      });
    }
  },
  signOut: function *(next){
    const ctx = this;
    delete ctx.session.user;
    this.body = {
      herf: "/"
    }
  },
  logged: function *(next){
    const ctx = this;
    let logged = true;
    if(!ctx.session || !ctx.session.user) {
      logged = false;
    } 

    ctx.body = {
      logged: logged
    }
  } 
};