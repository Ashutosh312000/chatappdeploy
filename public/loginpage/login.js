

const submitbtn=document.getElementById('submitbtn');
const form=document.getElementById('form');

document.addEventListener('submitbtn', (e) => {
    e.preventDefault();
});


async function  login(e){
    try{
     e.preventDefault();
    const email=e.target.email.value;
    const password=e.target.password.value;
    
    let logindetails={
        email:email,
        password:password
    }

   await  axios.post('http://127.0.0.1:3000/user/login',{logindetails})
    .then((response)=>{
        localStorage.setItem('token',`${response.data.token}`) 
        alert(`${response.data.message}`);
        window.location.href="../chatapp1/chatapp.html" 
    })
    .catch(err=>{
        alert(`${err.response.data.message}`);
    });

    }
    catch(err){
        console.log(err);
    }
    
}