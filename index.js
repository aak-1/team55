if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
// models
const User = require("./models/User");
const Post = require("./models/Post");
// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const connectDB = require("./Config/db");
const UserRoutes = require("./Routes/user.js");
const PostRoutes = require("./Routes/post.js");
require("./config/passport")(passport);
const saltedMd5=require('salted-md5');
const multer=require('multer')
const upload=multer({storage: multer.memoryStorage()})
const fileupload = require('express-fileupload');
var admin = require("firebase-admin");
const uuid = require('uuid-v4');
var serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-project-1-58a04.firebaseio.com",
  storageBucket: process.env.FIREBASE
  });
  app.locals.bucket = admin.storage().bucket()




connectDB();
//  DATABASE
const URL = process.env.MONGO_URL;
mongoose.connect(`${URL}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

connectDB();
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//   console.log("Database connected");
// });

// app.use
app.use(fileupload());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// express-session middleware && flash
// const sessionConfig = {
//   secret: "secret",
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     httpOnly: true,
//     // secure: true,
//     expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//     maxAge: 1000 * 60 * 60 * 24 * 7,
//   },
// };

// app.use(session(sessionConfig));

app.use(
  session({
    //store,
    store: MongoStore.create({
      mongoUrl: URL,
      ttl: 24 * 60 * 60, // = 14 days. Default
    }),
    name: "session",
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use("/users", UserRoutes);
app.use("/posts", PostRoutes);

app.get('/contactUs',(req,res)=>{
  res.render('contact_us');
});

app.post('/notice',async(req,res)=>{
  const currentUser = await User.findById(req.user._id);
  console.log(currentUser);
  var post = new Post({});
    post.author=currentUser._id;
    post.title=req.body.title;
    post.content = req.body.content;
    post.language= currentUser.language;
    post.age=currentUser.age;
    post.isPost= false;
  await post.save();
  res.redirect('/');
})

app.post('/upload',upload.single('file'),async(req,res)=>{
  //console.log(req.files.content);
  try{

    const name = saltedMd5(req.files.content.name, 'SUPER-S@LT!')
    var fileName = name + path.extname(req.files.content.name)
  // console.log(fileName)
    var currentUser = await User.findById(req.user._id);
    console.log(currentUser);
    fileName = `https://firebasestorage.googleapis.com/v0/b/uninhibited-b23b4.appspot.com/o/${fileName}?alt=media&amp;token=3c6056d9-6f9d-49af-9674-59f018cb8860`
    //console.log(fileName);
    async function uploadFile() {

      const metadata = {
        metadata: {
          // This line is very important. It's to create a download token.
          firebaseStorageDownloadTokens: uuid()
        },
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=31536000',
      };
    
      // Uploads a local file to the bucket
      await bucket.upload(fileName, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        metadata: metadata,
      });
    
    console.log(`${fileName} uploaded.`);
    
    }
    
    uploadFile().catch(console.error);

    var post = new Post({});
    post.author=currentUser._id;
    post.title=title;
    post.content = fileName;
    post.language= currentUser.language;
    post.age=currentUser.age;
    post.isPost= true;
    //const d = await app.locals.bucket.file(fileName).createWriteStream().end(Buffer.from(req.files.content.data));
  // console.log(d);
    await post.save();
    postsPresent = await Post.find({});
    //console.log(postsPresent)
  }catch(e){
    console.log(e);
  }
  res.redirect('/posts');
  })



app.get('/postss',(req,res)=>{
  res.render('AddAudio');
})
app.get('/postsNotices',(req,res)=>{
  res.render('AddNotice');
})

app.get("/", async(req, res) => {
  if(req.user != undefined){
    const id = req.user._id;
    const data = await User.findById(id);
   // console.log(data.phoneNumber)
    const notices = await Post.find({isPost: 0});
    res.render("home", { data, notices });
  }else {
    const data = {'name': undefined};
    const notices = await Post.find({isPost: 0});
  res.render("home", { data, notices });
  }
 
});
app.get("*", async(req, res) => {
  res.render("error");
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});
