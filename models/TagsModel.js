import mongoose from "../db/conn.js";
import { Schema, model } from "mongoose";
// 2. Criar um Schema que corresponda a Interface.
const tagsSchema = new Schema({
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
}, { timestamps: true });
// 3. Criar um Model
const TagsModel = model("Tags", tagsSchema);
// 4. Esperando a resposta da conexão entre Mongoose e MongoDB.
async function run() {
    await mongoose;
}
run().catch((err) => console.log(err));
export { TagsModel };
