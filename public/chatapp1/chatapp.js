
//getting elements from html 
const settings=document.getElementById('settings');
const section2=document.getElementById('section2');
const section3=document.getElementById('section3');
const makegroup=document.getElementById('makegroup');
const chatnames=document.getElementById('chatnames');
const chatnameh3=document.getElementById('chatnameh3');
const makinggroups=document.getElementById('makinggroups');
const closegroup=document.getElementById('closegroup');
const closesettings=document.getElementById('closesettings');
const chattoph3=document.getElementById('chattoph3');
const message=document.getElementById('messages');
const sendbtn=document.getElementById('sendbtn')
const form=document.getElementById('form')
const messagecls=document.getElementsByClassName('messagecls')
const groups=document.getElementById('groups')
const groupdatavalues=document.getElementsByClassName('addgroups');
const groupdatavalues1=document.getElementsByClassName('addgroups1');
const groupsubmitbtn=document.getElementById('groupsubmitbtn')
const groupsubmitbtn1=document.getElementById('groupsubmitbtn1')
const groupsinput=document.getElementById('groupsinput')
const alreadygroups1=document.getElementById('alreadygroups1')
const addmore=document.getElementById('addmore');
const groupdata=document.getElementsByClassName('addgroupsdiv')[0];
const admin=document.getElementById('admin')
const participantsdiv=document.getElementById('participantsdiv')
const addgroups1=document.getElementById('addgroups1')
const logout=document.getElementById('logout')
const leavegroup=document.getElementById('leavegroup')
const deletegroup=document.getElementById('deletegroup')
const type=document.getElementById('type')
const submitfile=document.getElementById('submitfile')


//initialising socket.io to make chat app live
const socket= io('http://localhost:8000');

//when you recieve a message
socket.on("receive-message",(message,currentgroup,username)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    if(currentgroup1==currentgroup){
        createmessage(username,message)
       
    }
})

//when you are added to a existing group
socket.on("youareadded1",(group)=>{
    creategroup(group)
   socket.emit('join-room',group);
})

//when you are added to a  newly created room
socket.on("addedtonewgroup",(group)=>{
    creategroup(group)
    socket.emit('join-room',group);
})

//when someone send you a file as message
socket.on("postthisfile",(data,username)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    if(data.groupId==currentgroup1){
        console.log(username)
        createLink(username,data.Message,data.filetype)
    }
    
})

//changes in settings section when you arw added to a group
socket.on('youareadded',(group)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    if(currentgroup1==group.id){
        createsettings(group.username,group.userid,false);
    }
    
})

//when someone or you get kicked from a group
socket.on('kickit',(value,currentgroup)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token)
    const userid=decodetoken.userId;
    
    if(currentgroup1==currentgroup){
        const participantsinfo=document.getElementsByClassName('participantsinfo');
        for(let i=0;i<participantsinfo.length;i++){
           if(participantsinfo[i].getAttribute('value')==value){
            participantsinfo[i].remove();
           } 
        }
        if(value==userid){
            alert(`You are kicked from the group ${chatnameh3.innerText} `)
            initialpage(currentgroup);
        }
    }
})

//when someone or you become admin 
socket.on('makeadminit',(value,currentgroup)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token)
   
    
    if(currentgroup1==currentgroup){
        const participantsinfo=document.getElementsByClassName('participantsinfo');
        for(let i=0;i<participantsinfo.length;i++){
           if(participantsinfo[i].getAttribute('value')==value){
            participantsinfo[i].lastElementChild.remove();

        const div=participantsinfo[i];

        const Admin=document.createElement('h4')
        Admin.innerText='ADMIN'
        Admin.className='admintext';
        div.appendChild(Admin)

        const removeadmin=document.createElement('button')
        removeadmin.innerText='Remove From Admin'
        removeadmin.className='removeadmin';
        div.appendChild(removeadmin)
           } 
        }
     
    }
})

//when someone or you removes as admin 
socket.on('removeasadminit',(value,currentgroup)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    const token=localStorage.getItem('token');   
    
    if(currentgroup1==currentgroup){
        const participantsinfo=document.getElementsByClassName('participantsinfo');
        for(let i=0;i<participantsinfo.length;i++){
           if(participantsinfo[i].getAttribute('value')==value){
            participantsinfo[i].lastElementChild.remove();
            participantsinfo[i].lastElementChild.remove();

      
           } 
        }
      
    }
})

//when someone leaves the group
socket.on('leavegroupit',(value,currentgroup)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token);
    const userid=decodetoken.userId;
   
    
    if(currentgroup1==currentgroup){
        const participantsinfo=document.getElementsByClassName('participantsinfo');
        for(let i=0;i<participantsinfo.length;i++){
           if(participantsinfo[i].getAttribute('value')==value){
            participantsinfo[i].remove();
           } 
        }
        if(value==userid){
            initialpage(currentgroup);
        }
      
    }
})

//when group gets deleted
socket.on('deletegroupit',(value,currentgroup)=>{
    const currentgroup1=localStorage.getItem('currentgroup')
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token);
    const userid=decodetoken.userId;
   
    
    if(currentgroup1==currentgroup){
            initialpage(currentgroup);
    }
})




//as soon as user logged in you get all the chats of the user 
window.addEventListener('DOMContentLoaded',async ()=>{
    localStorage.setItem('currentgroup','')
   
  
        
    

        const token=localStorage.getItem('token');
        const decodetoken=parseJwt(token)
    const username=decodetoken.name;
    const userid=decodetoken.userId;
   
    socket.emit('new-user-joined',userid,username)

    chatnameh3.innerText=`${username}`;
        const response= await  axios.get(`http://localhost:3000/group/getgroups`,{headers:{"Authorization" : token}})
        
        const groups=response.data
     

         
         
         
         alreadygroups1.innerHTML='';
      




        socket.emit('join-rooms',groups);

       
        for(let i=0;i<groups.length;i++){
            creategroup(groups[i]);
        }
    
   
    

}
)

//you show the group names in which current user is a participant
function creategroup(groups){

    const groupdiv=document.createElement('div')
    groupdiv.className='groupdiv';
    groupdiv.innerText=`${groups.GroupName}`
    alreadygroups1.appendChild(groupdiv)
    groupdiv.setAttribute('value',`${groups.id}`)


}


//when you open a chat for a particular group
alreadygroups1.addEventListener('click',async(e)=>{

    if(e.target.className=='groupdiv'){
      const groupid=e.target.getAttribute('value');
        localStorage.setItem('currentgroup',`${groupid}`)
       
        settings.style.display='inline-block'
        type.style.display='flex'
        const groupname=e.target.innerText
        chattoph3.innerText=`${groupname}`
        chattoph3.style.display='inline-block'
        
      let messages1=[];
      stringifiedmessages=JSON.stringify(messages1)
      localStorage.setItem('messages',stringifiedmessages)
       
          const messagesstringified=localStorage.getItem('messages');
          const messages=JSON.parse(messagesstringified)
  
          if(messages.length==0){
              lastmessageid=-1;
          }
          else{
              lastmessageid=messages[messages.length -1].id;
          }
  
          const token=localStorage.getItem('token');
          const currentgroup=localStorage.getItem('currentgroup')
          const response= await  axios.get(`http://localhost:3000/message/getmessage?lastmessageid=${lastmessageid}&groupid=${currentgroup}`,{headers:{"Authorization" : token}})
          
          
          let myarr = response.data;
        
         for(let i=0;i<myarr.length;i++){
          messages.push({Message:response.data[i].Message,username:response.data[i].user.Name,id:response.data[i].id,isLink:response.data[i].IsLink,filetype:response.data[i].filetype})
          if(messages.length>15){
              messages.shift();
          }
         }
  
         
         const messagesstringifiedagain=JSON.stringify(messages)
         localStorage.setItem('messages',`${messagesstringifiedagain}`)
          
         message.innerHTML='';
                  for (let i = 0; i < messages.length; i++) {
                      const message=messages[i].Message;
                      const username=messages[i].username;
                      const filetype=messages[i].filetype;
                      if(messages[i].isLink==true){
                      
                        createLink(username,message,filetype)
                       
                      }
                      else{
                        createmessage(username,message);
                      }
                    
                  }    



                  let admininfo=[]
                  stringifiedadmininfo=JSON.stringify(admininfo)
                  localStorage.setItem('admininfo',stringifiedadmininfo)
                 const admindetails= await  axios.get(`http://localhost:3000/message/getadmin?groupid=${currentgroup}`,{headers:{"Authorization" : token}})
                 
                  groupusers=admindetails.data[0].users
                 
                  for(let i=0;i<groupusers.length;i++){
                    admininfo.push({isAdmin:groupusers[i].usergroup.isAdmin,username:groupusers[i].Name,id:groupusers[i].id})
                   }
                   stringifiedadmininfo=JSON.stringify(admininfo)
                   localStorage.setItem('admininfo',stringifiedadmininfo)
                   
                   
                   
                   participantsdiv.innerHTML='';
                  for (let i = 0; i < admininfo.length; i++) {
                      const id=admininfo[i].id;
                      const username=admininfo[i].username;
                      const isAdmin=admininfo[i].isAdmin;
                      createsettings(username,id,isAdmin);
                  }    
        

    }

})

//when you open a chat ,the messages are shown
const createmessage=(by,text)=>{
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token)
    const username=decodetoken.name;
    const messagediv=document.createElement('div');
    if(by==username){
        messagediv.className='messageclsR'
    }else{
        messagediv.className='messageclsL'
    }
   
    const messagep=document.createElement('p')
    messagep.textContent=`${by} : ${text}`
    messagediv.appendChild(messagep)
    message.appendChild(messagediv)
}

//when you open a chat ,the messages having files are shown
const createLink=(by,text,filetype)=>{
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token)
    const username=decodetoken.name;
   
    const messagediv=document.createElement('div');
    if(by==username){
        messagediv.className='messageclsR'
        
    }else{
        messagediv.className='messageclsL'
    }
   
    if(filetype=='image'){
      
        const messagep=document.createElement('p')
        const messageimg=document.createElement('img')
        const messagea=document.createElement('a')
        messagea.setAttribute('href',`${text}`)
        messagea.setAttribute('target',`_blank`)
        messageimg.setAttribute('width','130')
        messageimg.setAttribute('height','130')
        messageimg.setAttribute('src',`${text}`)
        messagep.textContent=`${by}`
        messagep.appendChild(messagea)
        messagea.appendChild(messageimg)
        messagediv.appendChild(messagep)
        message.appendChild(messagediv)
    }
}




//when you create a new group
groupsubmitbtn.addEventListener('click',async()=>{
    try{
    const participantsdetails=[]
    const groupname=groupsinput.value

        

    for(let i=0;i<groupdatavalues.length;i++){
        if(groupdatavalues[i].value!=""){
        participantsdetails.push(groupdatavalues[i].value) ;
        }
        }
        socket.emit('join-room',groupname,participantsdetails)
    const token=localStorage.getItem('token');
    const response= await  axios.post(`http://localhost:3000/group/postgroup`,{participantsdetails,groupname},{headers:{"Authorization" : token}})
       
    if(response.status==201){
    
        socket.emit('creategroup',response.data);

    alert(response.data.message)
   }
   else if(response.status==202){
    alert(response.data.message)
   }
}
catch(err){
    throw new Error(err)
}
}

)

//when you send a message
async function send(e){
    try{
        e.preventDefault();
        const message=e.target.message.value;
        const token=localStorage.getItem('token');
        const currentgroup=localStorage.getItem('currentgroup');

        socket.emit('sent-message',message,currentgroup);

        form.reset();
        const response= await  axios.post(`http://localhost:3000/message/postmessage`,{message,currentgroup},{headers:{"Authorization" : token}})    
    }
    catch(err){
        console.log(err)
    }
}

//when you send a file
const fileform = document.getElementById('uploadForm')
fileform.addEventListener('submit', async function (e) {
  e.preventDefault();
  const token=localStorage.getItem('token');
  const decodetoken=parseJwt(token)
 
  const username=decodetoken.name;
  const groupId=localStorage.getItem('currentgroup');
  let formData = new FormData(fileform)
  let response = await axios.post(`http://localhost:3000/message/postfile/${groupId}`, formData, { headers: { "Authorization": token, "Content-Type": "multipart/form-data" } });
  let data = response.data
  console.log(username)

    socket.emit('postfile',username,data.response)

})

//when settings for the group are made
function createsettings(username,id,isAdmin){
    
    
    
    const div=document.createElement('div')
    div.className='participantsinfo';
    div.setAttribute('value',`${id}`)
    participantsdiv.appendChild(div);

    const h4=document.createElement('h4');
    h4.innerText=`${username}`
    div.appendChild(h4)
    
   
    const remove_btn=document.createElement('button');
    remove_btn.className='remove_btn';
    remove_btn.innerText='Kick'
    div.appendChild(remove_btn);
    

    if(isAdmin!=true){
    const makeadmin_btn=document.createElement('button');
    makeadmin_btn.className='makeadmin_btn';
    makeadmin_btn.innerText='+'
    div.appendChild(makeadmin_btn);
    }


    if(isAdmin==true){
        const Admin=document.createElement('h4')
        Admin.innerText='ADMIN'
        Admin.className='admintext';
        div.appendChild(Admin)

        const removeadmin=document.createElement('button')
        removeadmin.innerText='Remove From Admin'
        removeadmin.className='removeadmin';
        div.appendChild(removeadmin)
    }
    

}

//editing the participants of the group
participantsdiv.addEventListener('click',async(e)=>{
    try{
        const token=localStorage.getItem('token');
        const currentgroup=localStorage.getItem('currentgroup')
        const value=e.target.parentElement.getAttribute('value');
        if(e.target.className=='remove_btn'){ 
            const alert1 = confirm("Are you sure want to Kick?");
            if(alert1==true){
                const response= await  axios.put(`http://localhost:3000/admin/deleteparticipants`,{currentgroup,value},{headers:{"Authorization" : token}})
                alert(response.data.message)
              
                if(response.status==200){
                    socket.emit('kicked',value,currentgroup);
                    
                }
            }
           
        }
        if(e.target.className=='makeadmin_btn'){
            const alert1 = confirm("Are you sure want to Make Admin?");
            if(alert1==true){
            const response= await  axios.put(`http://localhost:3000/admin/makeparticipants`,{currentgroup,value},{headers:{"Authorization" : token}})
            alert(response.data.message)

            if(response.status==200){
                socket.emit('makeadmin',value,currentgroup);
                
            }
            }
        }
        if(e.target.className=='removeadmin'){
            const alert1 = confirm("Are you sure want to remove a Admin?");
            if(alert1==true){
            const response= await  axios.put(`http://localhost:3000/admin/deleteasadmin`,{currentgroup,value},{headers:{"Authorization" : token}})
            alert(response.data.message)

            if(response.status==200){
                socket.emit('removeasadmin',value,currentgroup);
                
            }
            }
        }
    }
    catch(err){
        throw new Error(err)
    }
   
})

//you can add more participants to a existing group
addmore.addEventListener('click',()=>{

    const addgroupsdiv1=document.createElement('div');
    addgroupsdiv1.className='addgroupsdiv';
    groups.insertBefore(addgroupsdiv1,addmore);

    const input1=document.createElement('input')
    input1.setAttribute('type','text')
    input1.setAttribute('name','groupdata')
    input1.setAttribute('placeholder','Email,Phone-No.')
    input1.className='addgroups';
    addgroupsdiv1.appendChild(input1)

    const removebtn1=document.createElement('button')
    removebtn1.innerText='X';
    removebtn1.className='removebtn'
    addgroupsdiv1.appendChild(removebtn1)

})

//when all the participants which you need to add is added and clicked submit
groupsubmitbtn1.addEventListener('click',async()=>{
    try{
    const groupid=localStorage.getItem('currentgroup')
   const  participantsdetails=addgroups1.value
   
   
    const token=localStorage.getItem('token');
    const response= await  axios.post(`http://localhost:3000/admin/addAparticipant`,{participantsdetails,groupid},{headers:{"Authorization" : token}})
    addgroups1.value=''
    if(response.status==200){
        alert(response.data.message)
        const group={userid:response.data.user,GroupName:response.data.groupname,id:groupid,username:response.data.username}
        socket.emit('addaparticipant',group);
   }
    else if(response.status==201){
        alert(response.data.message)
   }
   else if(response.status==202){
    alert(response.data.message)
   }
}
catch(err){
    throw new Error(err)
}
}

)

//when group gets deleted or you kicked from that group or you left the group
function initialpage(deletegroup){
    section3.style.display='none'
    section2.className='col-xl-9 border border-5 rounded border-primary'

    message.innerText="";

    settings.style.display='none'
    type.style.display='none'
    chattoph3.style.display='none'

    const groupdiv=document.getElementsByClassName('groupdiv')
    for(let i=0;i<groupdiv.length;i++){
        if(groupdiv[i].getAttribute('value')==deletegroup){
            groupdiv[i].remove();
        } 
     }

}

//when you logout 
logout.addEventListener('click',()=>{
    const response = confirm("Are you sure want to Logout?");
    const token=localStorage.getItem('token');
        const decodetoken=parseJwt(token)
        const userid=decodetoken.userId;
        
    if (response) {
        
        window.localStorage.clear();
        window.location.href="../loginpage/login.html"
        socket.emit('disconnect',userid)
        
    }

})

//when you leave a group
leavegroup.addEventListener('click',async (e)=>{
    const alert1 = confirm("Are you sure want to Leave Group?");
    if(alert1==true){
        const groupid=localStorage.getItem('currentgroup');
        const token=localStorage.getItem('token');
        const decodetoken=parseJwt(token)
        const userid=decodetoken.userId;
        const response= await  axios.put(`http://localhost:3000/admin/leavegroup`,{groupid},{headers:{"Authorization" : token}})
        alert(response.data.message)
       if(response.status==200){
        socket.emit('leavegroup',userid,groupid)
       }
    }
   
   
})
//when group is deleted
deletegroup.addEventListener('click',async (e)=>{
    const alert1 = confirm("Are you sure want to delete Group?");
    if(alert1==true){
    const groupid=localStorage.getItem('currentgroup');
    const token=localStorage.getItem('token');
    const decodetoken=parseJwt(token)
    const userid=decodetoken.userId;
    const response= await  axios.put(`http://localhost:3000/admin/deletegroup`,{groupid},{headers:{"Authorization" : token}})
              
    alert(response.data.message)
    if(response.status==200){
        socket.emit('deletegroup',userid,groupid)
    }
}
})

//when below buttons are clicked, some events occurs

settings.addEventListener('click',(e)=>{
    section3.style.display=='none'
    if(section3.style.display=='none'){
        section2.className='col-xl-6 border border-5 rounded border-primary'
         section3.style.display='block'
    }
    else{
        section2.className='col-xl-9 border border-5 rounded border-primary'
        section3.style.display='none'
    }
    
})


makegroup.addEventListener('click',(e)=>{
    chatnames.style.display='none'
    makinggroups.style.display='block'
    
})
closegroup.addEventListener('click',(e)=>{
    chatnames.style.display='block'
    makinggroups.style.display='none'
    
})
closesettings.addEventListener('click',(e)=>{
    section3.style.display='none'
    section2.className='col-xl-9 border border-5 rounded border-primary'
})


groups.addEventListener('click',(e)=>{
    if(e.target.className=='removebtn'){
        e.target.parentElement.remove();
    }
})

closegroup.addEventListener('click',(e)=>{
    groups.style.display='none'
    makegroup.style.display='block'
})

//this is to parse the token and get the info about current user
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

