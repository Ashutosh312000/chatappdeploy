const User=require('../models/user');
const Message=require('../models/message');
const Group=require('../models/group');
const Usergroup=require('../models/usergroup');
const uuid = require('uuid');
// const bcrypt=require('bcrypt');
// const jwt=require('jsonwebtoken')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const isstringvalid=(string)=>{
    if(string=='' || string==undefined){
        return true;
    }
    else{
        return false;
    }
}

exports.getparticipants=async (req,res,next)=>{
    try{
        const users= await User.findAll({attributes:['Name','Email'],where:{id:{[Op.ne]:req.user.id}}})
        res.status(201).json(users)
    }
    catch(err){
        console.log(err);
        res.status(500).json(err)
    }
   
}

exports.postgroup=async(req,res,next)=>{
    try{

        const groupname=req.body.groupname;
       const oldparticipantsdetails=req.body.participantsdetails;
       const participantsdetails=oldparticipantsdetails.filter(ele=>{
        if(ele!="")
        return ele
    })

       if(isstringvalid(groupname)){
        return res.status(202).json({message:'Fill Up The Group Name'})
     }
       else if(participantsdetails.length<1){
        return res.status(202).json({message:'Add Atlest One Participant'})
     }

     

        else{

            participantsdetails.push(req.user.Email)
            const id=uuid.v4();
            const group= await Group.create({GroupName:groupname,id:id});
            const users=await  User.findAll({where:{
                [Op.or]:[
                    {Email:participantsdetails},
                {Phone_No:participantsdetails},
                ]
                
            }})
            let allusers=[];
            for(let i=0;i<users.length;i++){
                let admin=false;
                allusers.push(users[i].id);
                if(users[i].id==req.user.id){
                    admin=true;
                }
               await Usergroup.create({groupId:group.id,userId:users[i].id,isAdmin:admin})
            }
            
            return res.status(201).json({message:'Group is created',group:group,allusers:allusers})
        }
       
      
    }
    catch(err){
            console.log(err)
            return res.json({message:'Some Error occured',err})
    }
}

exports.getgroups=async (req,res,next)=>{
    try{
        const groups=await req.user.getGroups(
            {  
                attributes:['GroupName','id'],
            }
        )
        const newgroup=groups.map(ele=>{
            return {GroupName:ele.GroupName,id:ele.id}
        })
        
        res.json(newgroup)
    }
    catch(err){
        console.log(err)
            return res.status(501).json({message:'Some Error occured',err})
    }
}