const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  isPost: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.models.Post
  ? mongoose.models.Post
  : mongoose.model("Post", PostSchema);
