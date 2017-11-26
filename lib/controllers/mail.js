const mailModel = require('../models/mail.js');
const userModel = require('../models/user.js');
const addressBookModel = require('../models/addressBook.js');
const tagModel = require('../models/tag.js');
const sendMail = require('../mailsever/sendMail.js');
const fs = require('fs');

module.exports = {
  insert: function *(next){
    const ctx = this,
    data      = JSON.parse(ctx.request.body.fields.data),
    _uid      = ctx.session.user;
    attachFile= ctx.request.body.files.file;

    let mail;
    let user = yield userModel.findById(_uid);

    if(!data || !data.mail.recipient || !data.mail.title){
      ctx.body = {
        err: true,
        errInfo:'数据缺失！'
      }
      return;
    }

    data.mid && (data.actionType !== 2) && (mail = yield mailModel.findById(data.mid)); 
    attachFile && fs.renameSync(attachFile.path, attachFile.path+'.'+attachFile.name.split('.')[1]);
    attachFile && (data.mail.attachment = {
      name: attachFile.name,
      path: attachFile.path.split('attachments')[1]+'.'+attachFile.name.split('.')[1]
    });
    if(mail){ 
      for(let i in data.mail){
        mail[i] = data.mail[i];
      }
    }else{
      //添加mail
      data.mail.user = _uid;
      data.mail.sender = user.mailAddress+'@fmail.com';
      mail = new mailModel(data.mail);
    }
 
    mail.type = data.actionType;//邮件类别：2发件、3草稿
    

    if(mail.recipient.indexOf('fmail')==-1 && data.actionType == 2){
      let option = {
        from: `"${user.name}"<${user.mailAddress}@fmail.com>`,
        to: mail.recipient,
        subject: mail.title,
        text: mail.content.replace(/<\/?[a-zA-Z0-9]+\/?>/g,""),
        html: mail.content,
      };
      if(attachFile){
        option.attachments=[{
          filename: mail.attachment.name,
          path: attachFile.path+'.'+attachFile.name.split('.')[1]
        }]
      }
      sendMail(option);   //发送邮件
    } else if(data.actionType == 2){
      let mailAddress = mail.recipient.split("@")[0];
      let user2 = yield userModel.findByMailAddress(mailAddress);
      let recMail = new mailModel(data.mail);
      recMail.user = user2._id;
      recMail.type = 1;
      yield recMail.save(function (err){
        if(err){
          console.error(err);
          return;
        }
      })
    }

    yield mail.save(function (err){
      if(err){
        console.error(err);
        return;
      }
      let message = "发送成功！";
      if(data.actionType != 2){
        message = "保存成功！";
      }
      ctx.body = {
        err: false,
        message: message
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

    if(!data){
      ctx.body   = {
        status: 411,
        errInfo:'length required'
      };
      return;
    }

    mails = yield mailModel.findByType(_uid, data.type);
    mails = mails.map((mail)=>{
      return {
        id: mail._id,
        sender: mail.sender,
        title: mail.title,
        date: mail.updateTime
      }
    });
    if(!mails||!mails.length){
      ctx.body = {
        status: 404,
        errInfo:'not found'
      };
    }else{
      ctx.body = {
        status: 200,
        mails: mails
      };
    }
  },
  categoryList: function *(next){
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    let tags = yield tagModel.findByUser(_uid);
    let mails = tags.map((tag) => {
      return {
        name: tag.name
      }
    });

    for( let i of mails){
      i.mails = yield mailModel.findByTag(_uid, i.name);
    }

    if(!mails||!mails.length){
      ctx.body = {
        err: true,
        errInfo:'not found',
        mails: []
      };
    }else{
      ctx.body = {
        err: false,
        mails: mails
      };
    }
  },
  tagSave: function *(next){
    const ctx = this,
    data      = ctx.request.body,
    _uid      = ctx.session.user;

    let mail = yield mailModel.findById(data.mid);
    mail.tags = data.tags;
    yield mail.save(function (err){
      if(err){
        console.error(err);
        return;
      }
      let message = "修改分类成功！";
      ctx.body = {
        err: false,
        message: message
      };
    });
  },
  get: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;
    
    let mail = yield mailModel.findById(data.mid);
    if(!mail){
      ctx.body = {
        status: 404,
        result: '该邮件不存在！'
      };
    }else{
      let sender = yield addressBookModel.findByMailAddress(mail.sender);
      let recipient = yield addressBookModel.findByMailAddress(mail.recipient);
      ctx.body = {
        status: 200,
        result:{
          mail: {
            _id: mail._id,
            sender: mail.sender,
            remark: sender && sender.remark,
            recipient: (recipient && recipient.name )|| mail.recipient,
            title: mail.title,
            type: mail.type,
            content: mail.content,
            tags: mail.tags,
            attachment: mail.attachment,
            senderAvatar: "http://img3.3lian.com/2013/v12/86/103.jpg"
          }
        }
      };
    }
  }
};