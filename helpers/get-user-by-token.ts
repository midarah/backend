import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";

const getUserByToken = async (token: string) => {
	const decoded: JwtPayload = jwt.verify(
		token,
		process.env.JWT_SECRET as string
	) as JwtPayload;

	const userId = decoded.id;

	const user = await UserModel.findOne({ _id: userId });

	return user;
};

export default getUserByToken;
