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
