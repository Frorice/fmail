'use strict';
const nodemailer = require('nodemailer');
const dns = require('native-dns');

const direct = require('nodemailer-direct-transport');

module.exports = function (mailOptions) {

  const req = dns.Request({
    question: dns.Question({
      name: '163.com',
      type: 'MX',
    }),
    server: {
      address: '114.114.114.114',
      port: 53,
      type: 'udp'
    },
    timeout: 1000,
  })

  req.on('timeout', () => console.log('DNS Timeout 超时'))
  req.on('end', () => {})
  req.send()

  req.on('message', (err, answer) => {
    const list = []
    answer.answer.forEach((a) => list.push(a.exchange))
    const mxaddres = list.length === 0 ? 'qq.com' : list[0];
    let transporter = nodemailer.createTransport(direct({
      name: mxaddres
    }));

      console.log(mailOptions)
      
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.accepted);
      });
  })
}


