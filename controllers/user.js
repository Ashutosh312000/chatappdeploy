
const User=require('../models/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')

const isstringvalid=(string)=>{
    if(string=="" || string==undefined){
        return true;
    }
    else{
        return false;
    }
}



exports.postuser=(req,res,next)=>{
    
    const {name,phoneno,email,password}=req.body.userdetails;
    if(isstringvalid(name) ||isstringvalid(email) || isstringvalid(password)){
       return res.json({message:'Fill Up The Blank Spaces'})
    }
    else{
        const saltrounds=10;
        bcrypt.hash(password,saltrounds, (err,hash)=>{
          User.create({Name:`${name}`,Phone_No:`${phoneno}`,Email:`${email}`,Password:`${hash}`})
          .then(()=>{
            res.status(201).json({message:'Your Account Is Created Please Login Now'});
          })
          .catch((err)=>{
            res.json({message:'Email/Phone.No Already Exists'})
        })    
        })
    }
    
}

function generateAccessToken(id,name,phoneno,email){ 
    return jwt.sign({userId:id,name:name,phoneno:phoneno,email:email},'u3h437843hf374y3yrhdfy3487347843yfh##@#4dfdwdsd32d#$Q#@cr3w#')
}


exports.loginuser=(req,res,next)=>{
    const {email,password}=req.body.logindetails;
    if(isstringvalid(email) || isstringvalid(password)){
       return res.json({message:'Fill Up The Blank Spaces'})
    }
    else{
        User.findAll({where:{Email:email}})
        .then(user=>{
            if(user.length>0){
                bcrypt.compare(password,user[0].Password,(err,result)=>{
                    if(result==true){
                        return res.status(200).json({message:"login successfull",token: generateAccessToken(user[0].id,user[0].Name,user[0].Phone_No,user[0].Email)});
                    }                                    
                    else{                                       
                        return res.status(401).json({message:"User not authorized"});
                    }
                })
            }
            else{
                return res.status(404).json({message:"User not found"});
            }   
        })
        .catch((err)=>{
            console.log(err);
        })
    }
}


