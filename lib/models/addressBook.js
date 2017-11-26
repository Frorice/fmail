const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const AddressBook = new Schema({
  mailAddress: {
    type: String,
    trim: true,
    require: true
  },
  name: {
    type: String,
    trim: true,
    require: true
  },
  remark: {
    type: String,
    trim: true
  },
  user: {
    type: String
  },
  groups: {
    type: [String],
    default: ["默认分组"]
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

AddressBook.pre('save', function(next){
  var _addressBook = this;

  if(!_addressBook.isNew) {
    _addressBook.updateTime = Date.now();
  }

  next();
});

AddressBook.statics = {

  findByUser: function (user){
    return this.find({user: user});
  },

  findById: function (id){
    return this.findOne({_id: id}); 
  },

  findByMailAddress: function (mailAddress){
    return this.findOne({mailAddress: mailAddress});
  },

  findByGroup: function ( user, group){
    return this.find({user: user, groups: group});
  },

  removeById: function (id){
    return this.remove({_id: id});
  }

};

module.exports = mongoose.model('AddressBook', AddressBook);