const Post = require("../Models/Post");
const AsyncHandler = require("express-async-handler");
const User = require("../models/User");
const {cloudinary} = require('../Config/cloudinary');
//@desc get all posts
//@route GET api/post/
//@access PUBLIC
exports.getAllPosts = AsyncHandler(async (req, res) => {

  if(req.user != undefined){
    const id = req.user._id;
    const userr = await User.findById(id);
    blogs = await Post.find({ language: userr.language, age: { $gte: userr.age } });
    res.render("blog", { blogs });
  }else {
    const data = {'name': undefined};
    const blogs = await Post.find({});
  res.render("blog", { blogs });
  }

  // const lang = req.query.lang ? req.query.lang : "";
  // const age = req.query.age ? Number(req.query.age) : 0;
  // try {
  //   let posts;
  //   if (lang == "" && age == 0) {
  //     posts = await Post.find();
  //   } else if (lang == "") {
  //     posts = await Post.find({ age });
  //   } else if (age == 0) {
  //     posts = await Post.find({ language: lang });
  //   } else {
  //     posts = await Post.find({ language: lang, age: { $gte: age } });
  //   }

  //   res.render("blog", posts);
  // } catch (err) {
  //   console.log("GET POSTS: ", err);
  //   const error = "Cannot get Posts!";
  //   res.render("/", error);
  // }
});

//@desc update post
//@route PUT api/post/:postid
//@access PRIVATE/ADMIN or POSTER
exports.updatePost = AsyncHandler(async (req, res) => {
  const id = req.query.id;
  try {
    const post = await Post.findById(id);
    if (!post) {
      const error = "Cannot find such a post!!";
      res.render("post", error);
    } else {
      post = req.body.post;
      await post.save();
      res.render("post", post);
    }
  } catch (err) {
    console.log("GET POSTS: ", err);
    res.render("post", err);
  }
});

//@desc Create post
//@route POST api/post/:postid
//@access PRIVATE
exports.createPost = AsyncHandler(async (req, res) => {
  try {
    const post = await Post({ ...req.body.post });
    post.audioFile =req.file;
    if (!post) {
      const error = "Could not create!!";
      res.render("post", error);
    } else {
      await post.save();
      res.redirect("/post");
    }
  } catch (err) {
    console.log("GET POSTS: ", err);
    res.render("post", err);
  }
});
