const mailModel = require('../model/mail.js');

module.exports = {
  insert: function *(next){
    const ctx = this,
    data      = ctx.request.body,
    _uid      = ctx.session.user;

    let mail;

    if(!data || !data.uid){
      ctx.status = 411;
      ctx.body   = 'length required';
      return;
    }

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.status = 401;
      ctx.body   = 'unauthorized';
      return;
    }
     
    mail = yield mailModel.findById(data.mid);  
    if(mail){  
      for(let i in data.mail){
        mail[i] = data.mail[i];
      }
    }else{
      //添加mail
      mail = new mailModel(data.mail);
    }

    yield mail.save(function (err){
      if(err){
        console.error(err);
        return;
      }
      
      ctx.body = {
        status: 200
      };
    });
  },
  delete: function *(next){
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    if(!data||!data.mid){
      ctx.status = 411;
      ctx.body   = 'length required';
      return;
    }

    let mail = yield mailModel.findById(data.mid);
    if(!mail || mail.user != _uid){//防止未授权删除别人的mail
      this.status = 404;
      this.body   = 'not found';
    }else{
      let result = yield mailModel.removeById(mail._id);
      result = result.result;
      if(result.ok) {
        ctx.body = {
          status: 200,
          result: '邮件已删除'
        };
      } else {
        ctx.body = {
          status: 500,
          result: '邮件删除失败!'
        }
      }
    }
  },
  list: function *(next){
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;
    
    let mails;

    if(!data || !data.uid){
      ctx.status = 411;
      ctx.body   = 'length required';
      return;
    }

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.status = 401;
      ctx.body   = 'unauthorized';
      return;
    }

    mails = yield mailModel.findByUser(data.uid);
    if(!mails||!mails.length){
      ctx.status = 404;
      ctx.body   = 'not found';
    }else{
      ctx.body = {
        status: 200,
        mails: mails
      };
    }
  },
  get: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;
    
    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.status = 401;
      ctx.body   = 'unauthorized';
      return;
    }

    let mail = yield mailModel.findById(data.mid);
    if(!mail){
      ctx.body = {
        status: 404,
        result: '该邮件不存在！'
      };
    }else{
      ctx.body = {
        status: 200,
        result:{
          mail: mail
        }
      };
    }
  }
};