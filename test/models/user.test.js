const should = require('should');
const mongoose = require('mongoose');
const User = require ('/lib/models/user.js');

mongoose.connect('mongodb://127.0.0.1/test');

describe('test/models/user.test.js',function (){
  var user = new User({
    name: 'forice',
    password: '123456',
    mailAddress: 'frorice@fmail.com'
  });

  it('用户保存时不应该出错', function (done){
    user.save(function (err, user){
      if(err) return done(err);
      should.not.exist(err);
      should.exist(user);
      user.name.should.equal('frorice');
      user.comparePassword(123456).should.be.ok;
      user.mailAddress.should.equal('frorice@fmail.com');
      done();
    });
  });

  it('用户集当中应存在一条记录', function (){
    User.find({}).length.should.equal(1);
    User.findByName('frorice').should.be.ok;
    User.findByMailAddress('frorice@famil.com').should.be.ok;
  });

});