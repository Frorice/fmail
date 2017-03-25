const addressBookModel = require('../models/addressBook.js');

module.exports = {
  insert: function *(next){
    const ctx = this,
          data = ctx.request.body;
          _uid = ctx.session.user;

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.body   = {
        status: 401,
        result: '该用户无权限！'
      };
    }

    let addressBook = yield addressBookModel.findById(data.bid);
    if (addressBook) {
      for( let i in data.addressBook){
        addressBook[i] && (addressBook[i] = data.addressBook[i]);
      }
    }else{
      addressBook = new addressBookModel(data.addressBook);
    }
    yield addressBook.save(function (err) {
      if (err) {
        return console.error(err);
      }
      ctx.body = {
        status: 200,
        result: '联系人保存成功！'
      }
    });
  },
  delete: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    if(!data||!data.uid){
      ctx.body   = {
        status: 411,
        result: '请提供操作必需的数据！'
      };
    }

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.body   = {
        status: 401,
        result: '该用户无权限！'
      };
    }

    let addressBook = addressBookModel.findById(data.addressBookId);
    if(!addressBook || addressBook.user !== _uid){
      this.body = {
        status: 404,
        result: '联系人不存在！'
      }
    } else {
      let result = yield addressBookModel.removeById(addressBook._id);
      result = result.result;
      if(result.ok) {
        ctx.body = {
          status: 200,
          result: '联系人已删除！'
        }
      } else {
        ctx.body = {
          status: 500,
          result: '联系人删除失败！'
        }
      }
    }
  },
  list: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    if(!data||!data.uid){
      ctx.body   = {
        status: 411,
        result: '请提供该操作必需的数据！'
      };
    }

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.body   = {
        status: 401,
        result: '该用户无权限！'
      };
    }

    let addressBooks = addressBookModel.findByUser(_uid);
    if(!addressBooks||!addressBooks.length){
      ctx.body = {
        status: 404,
        result: '未找到联系人!'
      };
    }else{
      ctx.body = {
        status: 200,
        result:{
          addressBooks: addressBooks
        }
      };
    }
  }
};