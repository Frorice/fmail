const tagModel = require('../models/tag.js');

module.exports = {
  insert: function *(next){
    const ctx = this,
          data = ctx.request.body;
          _uid = ctx.session.user;

    //若uid不是当前登录用户，拒绝
    if(_uid != data.uid){
      ctx.status = 401;
      ctx.body   = 'unauthorized';
      return;
    }

    let tag = yield tagModel.findById(data.tid);
    if (tag) {
      tag.name = data.name;
    } else {
      tag = new tagModel(data.tag);
    }
    yield tag.save(function (err) {
      if (err) {
        return console.error(err);
      }
      ctx.body = {
        status: 200,
        result: '标签保存成功！'
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

    let tag = tagModel.findById(data.tagId);
    if(!tag || tag.user !== _uid){
      this.body = {
        status: 404,
        result: '标签不存在！'
      }
    } else {
      let result = yield tagModel.removeById(tag._id);
      result = result.result;
      if(result.ok) {
        ctx.body = {
          status: 200,
          result: '标签已删除！'
        }
      } else {
        ctx.body = {
          status: 500,
          result: '标签删除失败！'
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

    let tags = tagModel.findByUser(_uid);
    if(!tags||!tags.length){
      ctx.body = {
        status: 404,
        result: '未找到标签!'
      };
    }else{
      ctx.body = {
        status: 200,
        result:{
          tags: tags
        }
      };
    }
  }
};