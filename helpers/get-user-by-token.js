import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
const getUserByToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await UserModel.findOne({ _id: userId });
    return user;
};
export default getUserByToken;
