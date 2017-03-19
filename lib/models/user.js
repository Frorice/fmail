const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt   = require('bcryptjs');

const SALT_COST_ROUND = 10;
const User = new Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    require: true
  },
  password: {
    type: String,
    trim: true,
    require: true
  },
  mailAddress: {
    type: String,
    trim: true,
    unique: true,
    require: true
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

User.pre('save', function (next){
  var _user = this;

  if(_user.isNew){
    //密码加密保存
    bcrypt.genSalt(SALT_COST_ROUND, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(_user.password, salt, function(err, hash) {
        if (err) return next(err);

        _user.password = hash;
        next();
      })
    }) 
  }else{
    _user.updateTime = Date.now();
    next();
  }
  
});

User.methods = {
  comparePassword: function (_password){
    return bcrypt.compareSync(_password, this.password);
  }
};

User.statics = {
  findByName: function (name){
    return this.findOne({name: name});
  },
  findByMailAddress: function (mailAddress){
    return this.findOne({mailAddress: mailAddress});
  },
  findById: function (id){
    return this.findOne({_id: id});
  }
};

module.exports = mongoose.model('User', User);

