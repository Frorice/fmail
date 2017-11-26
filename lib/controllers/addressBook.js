const addressBookModel = require('../models/addressBook.js');
const groupModel = require('../models/group.js');

module.exports = {
  insert: function *(next){
    const ctx = this,
          data = ctx.request.body;
          _uid = ctx.session.user;

    let addressBook = yield addressBookModel.findByMailAddress(data.mailAddress);
    if (addressBook) {
      for( let i in data){
        addressBook[i] && (addressBook[i] = data[i]);
      }
    }else{
      addressBook = new addressBookModel(data);
      addressBook.user = _uid;
    }
    yield addressBook.save(function (err) {
      if (err) {
        return console.error(err);
      }
      ctx.body = {
        err: false,
        message: '联系人保存成功！'
      }
    });
  },
  delete: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    let addressBook = yield addressBookModel.findById(data.addressBookId);
    if(!addressBook || addressBook.user !== _uid){
      this.body = {
        status: 404,
        errInfo: '联系人不存在！'
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
          errInfo: '联系人删除失败！'
        }
      }
    }
  },
  list: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    let groups = yield groupModel.findByUser(_uid); 
    let addressBooks = yield addressBookModel.findByGroup(_uid, "默认分组");
    if(!groups && !addressBooks){
      ctx.body = {
        status: 404,
        result: '未找到联系人!'
      };
    }else{
      let contactors = groups.map((group) => {
        return {
          name: group.name,
          _id: group._id
        }
      });

      for( let item of contactors){
        item.contactors = yield addressBookModel.findByGroup(_uid, item.name);
      }

      addressBooks.length && contactors.unshift({
        name: "默认分组",
        contactors: addressbooks
      });


      ctx.body = {
        status: 200,
        result:{
          addressBooks: contactors
        }
      };
    }
  }
};