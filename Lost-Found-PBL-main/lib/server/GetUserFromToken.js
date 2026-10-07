import { cookies } from "next/headers";
import connectDB from "../connectDB";
import { verifyToken } from "../jwt";
import { userModel } from "../models/userSchema";

export async function GetUserFromToken(){
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if(!token) return null;

    try{
        const decoded = verifyToken(token);

        const user = await userModel.findById(decoded.id).select("-password -createdAt -updatedAt -__v");

        if(!user){
            return null;
        }

        return user;

    }catch(error){
        return null;
    }
}