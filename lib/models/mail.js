const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Mail = new Schema({
  sender: {
    type: String,
    trim: true,
    require: true
  },
  recipient: {
    type: String,
    trim: true,
    require: true
  },
  title: {
    type: String,
    trim: true,
    require: true
  },
  content: {
    type: String,
    trim: true,
    require: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  tags: {
    type: [Schema.ObjectId],
    ref: 'Tag',
    default: []
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

Mail.pre('save', function(next){
  var _mail = this;

  if(!_mail.isNew) {
    _mail.updateTime = Date.now();
  }

  next();
});

Mail.statics = {
  
  findById: function (id){
    return this.find({_id: id});
  },

  findByTag: function (user, tag){
    return this.find({user: user, tags: tag});
  },

  removeById: function (id){
    return this.remove({_id: id});
  }
};

module.exports = mongoose.model('Mail', Mail); 