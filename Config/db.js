const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const Connection = await mongoose.connect(process.env.MONGO_URL, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(
      `MONGO DB CONNECTION ESTABLISHED!! ${Connection.connection.host}`
    );
  } catch (err) {
    console.log(`MONGO DB CONNECTION: ${err}`);
    process.exit(1);
  }
};



module.exports = connectDB;
