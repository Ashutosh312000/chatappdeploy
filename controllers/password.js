
const User=require('../models/user');
const uuid = require('uuid');                             
const Forgotpassword=require('../models/forgotpassword')

const sgMail = require('@sendgrid/mail')
const bcrypt=require('bcrypt');



exports.forgotpassword=async (req,res,next)=>{
    try{
        const email=req.body.email;
        const user=await User.findOne({where:{email}});
        if(user){
            const id=uuid.v4(); 
            user.createForgotpassword({id,active:true})
            .catch(err=>{        
                console.log(err);
                throw new Error(err);
            })

            
        sgMail.setApiKey(process.env.SET_API_KEY)

        const msg = {
          to: `${email}`,
          from: 'ashutoshsharma.rrps@gmail.com', 
          subject: 'Password Reset Link',
          text: 'Password Reset Now',
          html: `<a href="http://13.233.115.169:3000/password/resetpassword/${id}">Reset password</a>`,
         
        }
        
        sgMail
          .send(msg)
          .then((response) => {
            return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', success: true})
          })
          .catch((error) => {
            console.error(error)
          })
        }
        else {
            throw new Error('User doesnt exist')
        }        
    }
    catch(err){
        console.log(err);
        return res.json({ message: err, sucess: false });
    }
}


exports.resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id:id }})
    .then(forgotpasswordrequest => { 
        if(forgotpasswordrequest && forgotpasswordrequest.active==true){
            forgotpasswordrequest.update({ active: false});
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end() 

        }
        else{
            res.status(500).json('Link Is Expired');
        }
    })
    .catch(err =>{
        console.log(err);
    })
}

exports.updatepassword = (req, res) => {
    try {
        const { newpassword } = req.query; 
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => { 
            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                
                if(user) { 
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ Password: hash }).then(() => { 
                                res.status(201).json({message: 'Successfuly update the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }

}
