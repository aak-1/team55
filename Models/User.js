const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  language: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  age: {
    type: Number,
    
  },
  accessLevel: {
    type: String,
    lowercase: true,
    enum: ["volunteer", "admin", "user", "pending"],
    required: true,
  },
  gender: {
    type: String,
    lowercase: true,
    enum: ["male", "female", "other"],
    required: true,
  },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.models.User
  ? mongoose.models.User
  : mongoose.model("User", UserSchema);
