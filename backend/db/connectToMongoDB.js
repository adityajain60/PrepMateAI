import mongoose from "mongoose";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectToMongoDB; 


// mongoose.connect is a function provided by the Mongoose library that establishes a connection between Node.js application and a MongoDB database.