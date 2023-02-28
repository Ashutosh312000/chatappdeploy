const path = require('path'); 
const fs=require('fs')



const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv=require('dotenv')
dotenv.config()

const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const User=require('./models/user');
const Message=require('./models/message');
const Group=require('./models/group');
const Usergroup=require('./models/usergroup');
const Forgotpasswordreq=require('./models/forgotpassword');


const cors=require('cors');

const app = express();



app.use(cors({
  origin:"*",
}
  
));

//socket.io intialising at server end
const io=require('socket.io')(8000,{
  cors:{
    origin:'*'
  }
});
const users={};
const sockets={};
const usernames={};
io.on('connection',socket=>{
  
  socket.on('new-user-joined',(userid,username)=>{
    users[socket.id]=userid;
    usernames[socket.id]=username;
    sockets[userid]=socket.id;
  })

  socket.on('join-rooms',groups=>{
    groups.forEach(ele => {
      socket.join(ele.id)    
    });
  })

  socket.on('sent-message',(message,currentgroup)=>{
    const username=usernames[socket.id];
    io.to(currentgroup).emit("receive-message",message,currentgroup,username);
  })
  
  socket.on('kicked',(value,currentgroup)=>{
    io.to(currentgroup).emit('kickit',value,currentgroup);
  })

  socket.on('makeadmin',(value,currentgroup)=>{
    io.to(currentgroup).emit('makeadminit',value,currentgroup);
  })

  socket.on('removeasadmin',(value,currentgroup)=>{
    io.to(currentgroup).emit('removeasadminit',value,currentgroup);
  })

  socket.on('leavegroup',(value,currentgroup)=>{
    io.to(currentgroup).emit('leavegroupit',value,currentgroup);
  })

  socket.on('deletegroup',(value,currentgroup)=>{
    io.to(currentgroup).emit('deletegroupit',value,currentgroup);
  })

  socket.on('creategroup',(data)=>{
    socket.join(data.group.id);
    
    for(let i=0;i<data.allusers.length;i++){
      const socketid=sockets[data.allusers[i]];
      io.to(socketid).emit('addedtonewgroup',data.group);
    }
  })

  socket.on('addaparticipant',(group)=>{
    const socketid=sockets[group.userid];
    if(socketid!=undefined){
      io.to(socketid).emit('youareadded1',group);
      io.to(group.id).emit('youareadded',group);
    }
    
  })

  socket.on('disconnect',(userid)=>{
    delete users[socket.id]
    delete usernames[socket.id]
    delete sockets[`${userid}`]
  })

  socket.on('postfile',(username,data)=>{
    io.to(data.groupId).emit('postthisfile',data,username);
  })

  socket.on('join-room',group=>{
    socket.join(group.id)  
  })

})
//socket.io end


app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');
const adminRoutes = require('./routes/admin');
const passwordRoutes = require('./routes/password');

const accessLogStream=fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flags:'a'}
  );

app.use(helmet());
app.use(morgan('combined',{stream: accessLogStream}));

app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/group', groupRoutes);
app.use('/admin', adminRoutes);
app.use('/password', passwordRoutes);


app.use((req,res)=>{
  res.sendFile(path.join(__dirname,`public/${req.url}`))
})

User.hasMany(Message);
Message.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Group.hasMany(Message);
Message.belongsTo(Group, { constraints: true, onDelete: 'CASCADE' });
User.belongsToMany(Group, { through: Usergroup });
Group.belongsToMany(User, { through: Usergroup });
User.hasMany(Forgotpasswordreq);
Forgotpasswordreq.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

sequelize
  // .sync({ force: true })
  .sync()
  .then(result=>{
   app.listen(3000);
  })
