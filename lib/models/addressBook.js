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
  remarks: {
    type: String,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  groups: {
    type: [Schema.ObjectId],
    ref: 'Group'
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

  findByGroup: function ( user, group){
    return this.find({user: user, groups: group});
  },

  removeById: function (id){
    return this.remove({_id: id});
  }

};

module.exports = mongoose.model('AddressBook', AddressBook);