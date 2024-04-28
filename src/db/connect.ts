import mongoose from "mongoose";

export default async function dbConnect() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("MongoDB Connected Successfully...");
}
