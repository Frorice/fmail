const {SMTPServer} = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const server = new SMTPServer({
    logger: true,
    onAuth(auth, session, callback){
        
        callback(null, {user: auth.username }); // where 123 is the user id or similar property
    },
    onData(stream, session, callback){
        simpleParser(stream, (err, mail)=>{
          console.log(mail);
        })
        stream.on('end', callback);
    },
});

server.listen(25);