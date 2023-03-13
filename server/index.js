const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser=require('body-parser');
const multer=require('multer');
const Post=require('./models/post');
const User=require('./models/user');
const port = 8001;
const app = express();

// Middlewares
app.use(cookieParser());

// MongoDB Connection

const url = `mongodb+srv://Soumya:covbae2j64KUiUNN@userdata.da04qcr.mongodb.net/?retryWrites=true&w=majority`;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to the database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });

// Routes

app.get("/", (req, res) => {
  res.send("Home");
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
app.use(userRoutes);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/uploadedImage',express.static('uploads'))
const Storage=multer.diskStorage({
    destination:'uploads',
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    },
})
const upload=multer({
    storage:Storage
})
app.get('/doubt',async(req,res,next)=>{
    const posts=Post.find().sort({_id:-1}).limit(10).then((data)=>{
        res.json({data:data});
    }).catch((er)=>{
        console.log('error');
    });
})
app.post('/doubt',upload.single("image"),async(req,res,next)=>{
    const question=req.body.question;
    let imgUrl='';
    if(req.file!=null){
        imgUrl=req.file.path;
    }
    const date=new Date();
    const name="Tuhin";
    const comment=[];
    const post=new Post({
        name:name,
        date:date,
        question:question,
        comments:comment,
        img:imgUrl
    });
    post.save();
    res.json({msg:'posted created'});
})
app.post('/doubt/comment',async(req,res,next)=>{
    const id=req.body.id;
    const comment=req.body.comment;
    const d=new Date();
    const date=`${d.getDate()}/${d.getMonth()}/${d.getFullYear()}, ${d.getHours()}:${d.getMinutes()}`;
    console.log(date);
    const name="Soumyajit";
    const post=await Post.findOne({_id:id});
    if(post){
        post.comments.push({comment:comment,date:date,name:name});
        post.save().then().catch();
        res.json({msg:'Answer added'});
    }

});
// Server Starting
app.get('/teacher',(req,res,next)=>{
  User.find({isTeacher:true}).then((data)=>{
    res.json({data:data});
  })
})
app.listen(port, (err) => {
  if (err) {
    console.log("Some error occured");
  } else {
    console.log(`Server running on port ${port}`);
  }
});
