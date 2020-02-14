var app=require("express")();
var server = require('http').Server(app);
var io = require('socket.io')(server, { origins: '*:*'});
var model=require("./models");
const Op = require('sequelize').Op;
var bodyParser=require("body-parser");
var cors=require("cors");

app.use(cors());
app.use(bodyParser());
var onlineUsers=[];
app.post("/backend/usercheck",async function(req,res){
    let user=await model.user.findOne({
        where:{
           username:req.body.username
        }
    })
    if(user===null){
        console.log(user)
        res.send({loggedIn:false});
    }
    else if(user.dataValues.password===req.body.password){
        res.json({loggedIn:true,username:user.dataValues.username,id:user.dataValues.id});
        getSocketObj();
    }
    else{
        res.send({loggedIn:false});
    }
})

async function getMessages(userData,id){
  let data=[];
    // await userData.map(async user => {
        for(let i=0;i<userData.length;i++){

        await model.message.findOne({
            order : [['createdAt', 'DESC']],
            where : {
                [Op.or] : [
                    {
                        recieversId : userData[i].dataValues.id,
                        sendersId : id
                    },{
                        recieversId : id,
                        sendersId : userData[i].dataValues.id
                    }
                ]
            }
        })
        .then(eachmessage=>{
            userData[i].dataValues.message=eachmessage
            
        })
        
       
    }
    console.log(2);
    return(userData);
   
}

app.post("/backend/getAllUsers",async function(req,res){
    let userData=await model.user.findAll({
        attributes : ['id','username']
    })
      console.log(1);
      let data=await getMessages(userData,req.body.id);
        console.log(3);
    res.json({"data":data,"online":onlineUsers})
})

app.post("/backend/allmessages", async function(req,res){
    let allmessages=await model.message.findAll({
       where:{
           [Op.or]:[{recieversId:req.body.id1,sendersId:req.body.id2},{recieversId:req.body.id2,sendersId:req.body.id1}]
       },
       order:[['createdAt','ASC']]
    })
    res.json(allmessages);
})
let socketObj={}

async function getSocketObj(){
   let allUsers=await model.user.findAll({
           attributes:["username"]
   })
   allUsers.map(element=>{
       createNameSpace(element.dataValues.username);
   })
  
}
var c=0;


function createNameSpace(name){
console.log(name)
try{
    if(!socketObj[name]){
        console.log('.....',name);
        var flag=0;
       let nsp= io.of(name).on('connection',function(socket){
        console.log("connected",name);
        for(let i=0;i<onlineUsers.length;i++){
            if(onlineUsers[i]===name){
                flag=1;
            }
        }
        if(flag!==1){
            // console.log("connected",name);
            onlineUsers.push(name);
            console.log(  'onlineUsers',onlineUsers);
        }
        socket.on('front to back',async function(data){
            console.log(data);
           
            let newMessage=await model.message.create({"message":data.message,"sendersId":data.from.id,"recieversId":data.to.id})
            socketObj[data.to.username].emit('back to front',newMessage)
        })
        socket.on('delete req',async function(data){
            console.log("d",data.id);
            
            await model.message.destroy({
                where:{id:data.id}
            })
            socketObj[data.to.username].emit('delete res',data.id)
        })
       });
       socketObj[name]=nsp;
       
    }
}
catch(err){
    console.log(err);
}
}



server.listen(8080);


