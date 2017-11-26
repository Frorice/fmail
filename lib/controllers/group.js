const groupModel = require('../models/group.js');

module.exports = {
  insert: function *(next){
    const ctx = this,
          data = ctx.request.body;
          _uid = ctx.session.user;

    let group = yield groupModel.findById(data.gid);
    if (group) {
      group.name = data.name;
    }else{
      data.user = _uid;
      group = new groupModel(data);
    }
    yield group.save(function (err) {
      if (err) {
        return console.error(err);
      }
      ctx.body = {
        err: false,
        message: '分组保存成功！'
      }
    });
  },
  delete: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    let group = yield groupModel.findById(data.groupId);
    if(!group || group.user !== _uid){
      this.body = {
        status: 404,
        result: '分组不存在！'
      }
    } else {
      let result = yield groupModel.removeById(group._id);
      result = result.result;
      if(result.ok) {
        ctx.body = {
          status: 200,
          result: '分组已删除！'
        }
      } else {
        ctx.body = {
          status: 500,
          result: '分组删除失败！'
        }
      }
    }
  },
  list: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    let groups = yield groupModel.findByUser(_uid);
    if(!groups||!groups.length){
      ctx.body = {
        err: true,
        errInfo: '未找到分组!',
        result: {
          groups: []
        }
      };
    }else{
      ctx.body = {
        err: false,
        result:{
          groups: groups
        }
      };
    }
  }
};