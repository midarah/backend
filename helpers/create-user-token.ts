import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

interface User {
	name: string;
	_id: ObjectId; // Usando o tipo ObjectId
	// Outras propriedades do usuário, se houver
}

const createUserToken = async (user: User, req: Request, res: Response) => {
	// Criar Token
	const token = jwt.sign(
		{
			name: user.name,
			id: user._id.toString(), // Convertendo ObjectId para string
		},
		process.env.JWT_SECRET as string
	);

	// Retornar Token
	res.status(200).json({
		message: "Você está autenticado!",
		token: token,
		userId: user._id.toString(), // Convertendo ObjectId para string
	});
};

export default createUserToken;
