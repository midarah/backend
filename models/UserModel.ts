import mongoose from "../db/conn.js";
import { Schema, model } from "mongoose";

// 1. Criar uma Interface tipando os dados que irão no Banco de Dados.
interface IUser {
	name: string;
	email: string;
	password: string;
	image: string;
	stripe_customer_id: string;
	subscriptionInfo: [];
}

// 2. Criar um Schema que corresponda a Interface.
const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
			max: 64,
		},
		image: {
			type: String,
		},
		stripe_customer_id: String,
		subscriptionInfo: [],
	},
	{ timestamps: true }
);

// 3. Criar um Model
const UserModel = model<IUser>("User", userSchema);

// 4. Esperando a resposta da conexão entre Mongoose e MongoDB.
async function run() {
	await mongoose;
}

run().catch((err) => console.log(err));

export { UserModel };
