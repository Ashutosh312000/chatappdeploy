
const User=require('../models/user');
const Message=require('../models/message');
const Group=require('../models/group');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const Sequelize = require('sequelize');
const Usergroup = require('../models/usergroup');
const { response } = require('express');
const Op = Sequelize.Op;

const isstringvalid=(string)=>{
    if(string=="" || string==undefined){
        return true;
    }
    else{
        return false;
    }
}


exports.deleteparticipants=async(req,res,next)=>{
    try{
        const {currentgroup,value}=req.body

        const response=await Usergroup.findAll({
         where:{userId:req.user.id,groupId:currentgroup,isAdmin:true}
         })
         if(response.length<1){
             res.status(202).json({message:'Only Admin Can Remove Participant From Group'})
         }
         else{
            const response1= await Usergroup.destroy({
                where:{userId:value,groupId:currentgroup}
            })


            res.status(200).json({message:'Succesfully Removed'})
         }
     
     
       
    }
    catch(err){
        console.log(err);
        res.status(500).json('Something went Wrong',err)
    }
  
}

exports.makeparticipants=async(req,res,next)=>{
    try{
        const {currentgroup,value}=req.body

        const response=await Usergroup.findAll({
         where:{userId:req.user.id,groupId:currentgroup,isAdmin:true}
     })
         if(response.length<1){
             res.status(202).json({message:'Only Admin Can Make Admin'})
         }
         else{
            const response1= await Usergroup.update(
            {
                isAdmin:true
            },
            {
                where:{userId:value,groupId:currentgroup}
            })


            res.status(200).json({message:'Succesfully Made Admin'})
         }
     
     
       
    }
    catch(err){
        console.log(err);
        res.status(500).json('Something went Wrong',err)
    }
  
}

exports.addAparticipant=async(req,res,next)=>{
    try{
        const {participantsdetails,groupid}=req.body;

        if(isstringvalid(participantsdetails)){
            return res.status(202).json({message:'Add A Participant'})
            }
           else if(isstringvalid(groupid)){
            return res.status(202).json({message:'Select A Group Chat'})
            }
            else{
                const response=await Usergroup.findAll({
                    where:{userId:req.user.id,groupId:groupid,isAdmin:true}
                        })
                    if(response.length<1){
                        res.status(202).json({message:'Only Admin Can Add Participant'})
                    }
                    else{
                        const getgroup=await Group.findByPk(groupid)
                        
                              
                           const users=await  User.findAll({where:{
                               [Op.or]:[
                                   {Email:participantsdetails},
                               {Phone_No:participantsdetails},
                               ]
                               
                           }})
                           if(users.length>0){
                            const response=await getgroup.addUsers(users)
                           
                            if(response==undefined){
                                res.status(202).json({message:'Participant Already Exists'})
                            }
                            else{
                                res.status(200).json({message:'Participant is Added',username:users[0].Name,user:users[0].id,groupname:getgroup.GroupName})
                               }
                           }
                           else{
                            res.status(201).json({message:'No Participant Found of this Email/PhoneNo.'})
                           }
                         


                    }
           
            }
        


    }
    catch(err){
        console.log(err);
        res.status(500).json('Something went Wrong',err)
    }
}



exports.deleteasadmin=async(req,res,next)=>{
    try{
        const {currentgroup,value}=req.body
        const response=await Usergroup.findAll({
            where:{userId:req.user.id,groupId:currentgroup,isAdmin:true}
            })
            if(response.length<1){
                res.status(202).json({message:'Only Admin Can Remove'})
            }
            else{

                const anyadminleft=await Usergroup.findAll({
                    where:{groupId:currentgroup,isAdmin:true},
                })
                if(anyadminleft.length>1){
                    const response1= await Usergroup.update(
                        {
                            isAdmin:false
                        },
                        {
                            where:{userId:value,groupId:currentgroup}
                        })
            
            
                        res.status(200).json({message:'Succesfully Remove From Admin'})
                }
                else{
                    res.status(202).json({message:'You Are The Only Admin Left'})
                }

                
               }
           
    }
    catch(err){
        console.log(err);
        res.status(500).json('Something went Wrong',err)
    }
}

exports.leavegroup=async(req,res,next)=>{
    try{
        const currentgroup=req.body.groupid
        const anyadminleft=await Usergroup.findAll({
            where:{groupId:currentgroup,isAdmin:true,userId:{[Op.ne]:req.user.id}},
        })
        if(anyadminleft.length>0){
            const response1= await Usergroup.destroy(
                {
                    where:{userId:req.user.id,groupId:currentgroup}
                })
    
    
                res.status(200).json({message:'Succesfully Remove From Group'})
        }
        else{
            res.status(202).json({message:'Please Make Somebody Else Admin'})
        }

    }
    catch(err){
        console.log(err);
        res.status(500).json('Something went Wrong',err)
    }
}
exports.deletegroup=async(req,res,next)=>{
    try{

        const currentgroup=req.body.groupid

        const response=await Usergroup.findAll({
            where:{userId:req.user.id,groupId:currentgroup,isAdmin:true}
            })
            if(response.length<1){
                res.status(202).json({message:'Only Admin Can Delete The Group'})
            }
            else{
                const deleteduser=await Group.destroy({
                    where:{id:currentgroup}
                })

                res.status(200).json({message:'Group Is Deleted',deleteduser})
            }

    }
    catch(err){
        console.log(err);
        res.status(500).json('Something went Wrong',err)
    }
}