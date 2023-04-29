const express = require("express");
const app = express();
const moongose = require("mongoose");
const UserModel = require("./models/UserSchema.js");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const multer = require('multer');
const fs = require('fs');
const Post = require('./models/PostSchema.js');

const port = process.env.PORT || 8000;


const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const secret = "hdie94jiur9niur49";

app.use(express.json());
app.use(cors({credentials:true,origin:"http://localhost:3000"}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ dest: './uploads/' });
app.use('/uploads',express.static(__dirname+"/uploads"));


//oyTJLfugUORtqovo
const mongoLocalHost = "mongodb://127.0.0.1:27017/VlogWebsite";
const mongoUrlCloud2 = "mongodb+srv://rajatrajgupta19:MuWk2EcP30rQu0Ck@cluster0.lufqnmv.mongodb.net/Blog-Website";
const mongoUrlCloud = 'mongodb+srv://rajatrajgupta19:MuWk2EcP30rQu0Ck@cluster0.lufqnmv.mongodb.net/Blog-Web'
moongose.connect( mongoUrlCloud2, (err) => {
  if (err) {
    console.log("error", err.message);
  } else {
    console.log("connected");
  }
});

app.get("/", (req, res) => {
  console.log("Hello from home page");
  res.send("Helo from server side");
  res.json({ name: rajat });
});

app.post("/register",  async (req, res) => {
  console.log(req.body);
  console.log("register");
  const {name,email,pass=" "} = req.body;
  try {
    const dbr = await UserModel.findOne({email});
    if(dbr){
      res.ok(false);
      return res.send({message:"User Exists",
    userCreate:false})
    }
    
  } catch(e){
    res.send({error:"error"});
  }

  const hash = bcrypt.hashSync(pass, salt);

  try {
    const dbres = await UserModel.create({name,email,pass:hash});
    if(dbres){
      res.send({message:"User Created Succesfully",
    userCreate:true})
    }
    
  } catch (error) {
    res.send({message:"User Not Created Succesfully",
    userCreate:false});
    console.log(error);
    

    
    
  }
  

  
  
  
  
});

app.post('/login' , async (req,res) =>{

  const {email,password} = req.body;
  const ifCredentialtrue = await UserModel.findOne({email});
 

  if(ifCredentialtrue ){
    console.log(ifCredentialtrue.pass,password); 
    const passAuth = bcrypt.compareSync(password,ifCredentialtrue.pass);
 
    if(passAuth){
     const payload = {
      email,
      name:ifCredentialtrue.name
     }
     const token = jwt.sign(payload, secret);

      res.cookie('userToken' , token);
      return res.status(202).json({Sucess:true});
    }
  }
    res.send({Succes:false})
  

})

app.get('/profile' , (req,res)=>{
  console.log(req.cookies.userToken);
  jwt.verify(req.cookies.userToken,secret,{},(err,data) =>{
    if(err){
      res.json({sucess: false});
    }else{
      res.json({
        "sucess":"true",
        ...data
      })
    }
  })
 

})

app.get('/logout',(req,res)=>{
console.log(req.cookies);
res.cookie('userToken',"");
return res.json({sucess:"true"});

})


app.post('/createpost' ,upload.single('image'), async(req,res)=>{
  const {title,description,articleValue} = req.body;
  const {path,filename,originalname} = req.file;
  const arrExt = originalname.split('.');

  const ext = arrExt[arrExt.length-1];
  //console.log(ext,path,originalname);
  fs.renameSync(path,path+"."+ext);
  
var dbUser;
  jwt.verify(req.cookies.userToken,secret,{}, async (err,data) =>{
    if(err){
      console.log("Error in jwt");
      
    }else{
       const {email} = data;
       //console.log(data);
       try{
        dbUser =  await UserModel.findOne({email});
       if(dbUser){
         console.log(dbUser);
         const dbRes = await Post.create({title,description,article:articleValue,imgUrl:`${path}.${ext}`,author:dbUser.id});
         console.log(dbRes);
         res.status(201).send({sucess:true});
         
       }
     }catch(e){
      console.log(e,"err");
        res.status(400).send({sucess:false});
        
     }
      }
    })
    

  
  
})

app.get('/allposts',async (req,res)=>{
  try{
    const DbPost = await Post.find({}).populate('author',['name']).sort({createdAt: -1});
    res.json(DbPost);
  }catch(e){
    console.log("Error in allpost",e);
  }
})

app.get('/fullpost/:id', async(req,res) =>{
    
const {id} = req.params;

const FullPost = await Post.findOne({_id:id}).populate('author',['name']);
res.json(FullPost);

})


app.listen(port, "0.0.0.0",() => {
  console.log("Hello Server runing on 8000");
});
