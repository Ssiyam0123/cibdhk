import mongoose from "mongoose";

export const connectDb = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`database is connected ${conn.connection.host}`)
    } catch (error) {
        console.log("error from database",error);
        process.exit(1);
    }
}