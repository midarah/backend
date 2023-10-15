import mongoose from "../db/conn.js";
import { Schema, model } from "mongoose";

// 1. Criar uma Interface tipando os dados que irão no Banco de Dados.
interface ITags {
	tagName: string;
	definition: string;
	image: string;
}

// 2. Criar um Schema que corresponda a Interface.
const tagsSchema = new Schema<ITags>(
	{
		tagName: {
			type: String,
			required: true,
		},
		definition: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

// 3. Criar um Model
const TagsModel = model<ITags>("Tags", tagsSchema);

// 4. Esperando a resposta da conexão entre Mongoose e MongoDB.
async function run() {
	await mongoose;
}

run().catch((err) => console.log(err));

export { TagsModel };
