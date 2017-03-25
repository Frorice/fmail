const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Group = new Schema({
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

Group.pre('save', function(next){
  var _group = this;

  if(!_group.isNew) {
    _group.updateTime = Date.now();
  }

  next();
});

Group.statics = {

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

module.exports = mongoose.model('Group', Group);