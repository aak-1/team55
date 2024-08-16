const express = require("express");
const { ensureAuthenticated, isVolunteer, isAdmin } = require("../config/auth");
const { getAllPosts, updatePost, createPost } = require("../Controller/post");
const multer = require('multer');
const {storage} = require('../Config/cloudinary');
const upload = multer({storage});
const router = express.Router();

router.get("/", getAllPosts);
router.post("/", upload.single('content') ,ensureAuthenticated, isVolunteer, createPost);
router.put("/:id", ensureAuthenticated, isAdmin, updatePost);

module.exports = router;
