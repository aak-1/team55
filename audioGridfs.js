const express = require("express");
 const postAudioRoute = express.Router();
 const multer = require("multer");
 
 const mongodb = require("mongodb");
 const MongoClient = require("mongodb").MongoClient;
 const ObjectID = require("mongodb").ObjectID;
 

 const { Readable } = require("stream");
 
 /**
  * Create Express server && Express Router configuration.
  */
 const app = express();
 app.use("/postAudio", postAudioRoute);
 
 /**
  * Connect Mongo Driver to MongoDB.
  */
 
 /**
  * GET /postAudios/:postAudioID
  */
 postAudioRoute.get("/:postAudioID", (req, res) => {
   try {
     var postAudioID = new ObjectID(req.params.postAudioID);
   } catch (err) {
     return res.redirect();
   }
   res.set("content-type", "audio/mp3");
   res.set("accept-ranges", "bytes");
 
   let bucket = new mongodb.GridFSBucket(db, {
     bucketName: "postAudio",
   });
 
   let downloadStream = bucket.openDownloadStream(postAudioID);
 
   downloadStream.on("data", (chunk) => {
     res.write(chunk);
   });
 
   downloadStream.on("error", () => {
     res.sendStatus(404);
   });
 
   downloadStream.on("end", () => {
     res.end();
   });
 });
 
 /**
  * POST /postAudios
  */
 postAudioRoute.post("/", (req, res) => {
   const storage = multer.memoryStorage();
   const upload = multer({
     storage: storage,
     limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 },
   });
   upload.single("postAudio")(req, res, (err) => {
     if (err) {
       return res
         .status(400)
         .json({ message: "Upload Request Validation Failed" });
     } else if (!req.body.name) {
       return res
         .status(400)
         .json({ message: "No postAudio name in request body" });
     }
 
     let postAudioName = req.body.name;
 
     // Covert buffer to Readable Stream
     const readablepostAudioStream = new Readable();
     readablepostAudioStream.push(req.file.buffer);
     readablepostAudioStream.push(null);
 
     let bucket = new mongodb.GridFSBucket(db, {
       bucketName: "postAudios",
     });
 
     let uploadStream = bucket.openUploadStream(postAudioName);
     let id = uploadStream.id;
     readablepostAudioStream.pipe(uploadStream);
 
     uploadStream.on("error", () => {
       return res.status(500).json({ message: "Error uploading file" });
     });
 
     uploadStream.on("finish", () => {
       return res.status(201).json({
         message:
           "File uploaded successfully, stored under Mongo ObjectID: " + id,
       });
     });
   });
 });
 https://medium.com/@richard534/uploading-streaming-audio-using-nodejs-express-mongodb-gridfs-b031a0bcb20f