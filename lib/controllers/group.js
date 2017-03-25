const groupModel = require('../models/group.js');

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

    let group = yield groupModel.findById(data.gid);
    if (group) {
      group.name = data.name;
    }else{
      group = new groupModel(data.group);
    }
    yield group.save(function (err) {
      if (err) {
        return console.error(err);
      }
      ctx.body = {
        status: 200,
        result: '分组保存成功！'
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
        result: '请提供删除操作必需的数据！'
      };
    }

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.body   = {
        status: 401,
        result: '该用户无权限！'
      };
    }

    let group = groupModel.findById(data.groupId);
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

    let groups = groupModel.findByUser(_uid);
    if(!groups||!groups.length){
      ctx.body = {
        status: 404,
        result: '未找到分组!'
      };
    }else{
      ctx.body = {
        status: 200,
        result:{
          groups: groups
        }
      };
    }
  }
};