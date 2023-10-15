import mongoose from "../db/conn.js";
import { Schema, model } from "mongoose";
// 2. Criar um Schema que corresponda a Interface.
const mangakaSchema = new Schema({
    mangakaName: {
        type: String,
        required: true,
    },
    twitter: {
        type: String,
    },
    information: {
        type: String,
    },
    image: {
        type: String,
        required: true,
    },
}, { timestamps: true });
// 3. Criar um Model
const MangakaModel = model("Mangaka", mangakaSchema);
// 4. Esperando a resposta da conexão entre Mongoose e MongoDB.
async function run() {
    await mongoose;
}
run().catch((err) => console.log(err));
export { MangakaModel };
