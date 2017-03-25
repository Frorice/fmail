const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Tag = new Schema({
  name: {
    type: String,
    trim: true,
    require: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  createTime: {
    type: Date, 
    default: Date.now()
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
});

Tag.pre('save', function(next){
  var _tag = this;

  if(!_tag.isNew) {
    _tag.updateTime = Date.now();
  }

  next();
});

Tag.statics = {

  findByUser: function (user){
    return this.find({user: user});
  },

  findById: function (id){
    return this.findOne({_id: id}); 
  },

  findByName: function (name){
    return this.findOne({name: name});
  },

  removeById: function (id){
    return this.remove({_id: id});
  }
  
};

module.exports = mongoose.model('Tag', tag);