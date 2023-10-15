import mongoose from "../db/conn.js";
import { Schema, model } from "mongoose";
// 2. Criar um Schema que corresponda a Interface.
const chapterSchema = new Schema({
    titleChapter: {
        type: String,
    },
    subtitleChapter: {
        type: String,
    },
    imagesChapter: {
        type: [String],
    },
});
const hentaiSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mangaka: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    format: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    chapters: {
        type: [Object],
    },
    user: Object,
}, { timestamps: true });
// 3. Criar um Model
const HentaiModel = model("Hentai", hentaiSchema);
const ChapterModel = model("Chapter", chapterSchema);
// 4. Esperando a resposta da conexão entre Mongoose e MongoDB.
async function run() {
    await mongoose;
}
run().catch((err) => console.log(err));
export { HentaiModel, ChapterModel };
