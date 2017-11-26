const tagModel = require('../models/tag.js');

module.exports = {
  insert: function *(next){
    const ctx = this,
          data = ctx.request.body;
          _uid = ctx.session.user;

    let tag = yield tagModel.findById(data.tid);
    if (tag) {
      tag.name = data.name;
    } else {
      tag = new tagModel(data);
      tag.user = _uid;
    }
    yield tag.save(function (err) {
      if (err) {
        return console.error(err);
      }
      ctx.body = {
        err: false,
        message: '标签保存成功！'
      }
    });
  },
  delete: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;


    let tag = yield tagModel.findById(data.tagId);
    if(!tag || tag.user !== _uid){
      this.body = {
        status: 404,
        errInfo: '标签不存在！'
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
          errInfo: '标签删除失败！'
        }
      }
    }
  },
  list: function *(next) {
    const ctx = this,
    data      = ctx.query,
    _uid      = ctx.session.user;

    let tags = yield tagModel.findByUser(_uid);
    if(!tags||!tags.length){
      ctx.body = {
        err: true,
        errInfo: '未找到分类!',
        result: {
          tags: tags
        }
      };
    }else{
      ctx.body = {
        err: false,
        result:{
          tags: tags
        }
      };
    }
  }
};