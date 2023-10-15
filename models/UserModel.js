import mongoose from "../db/conn.js";
import { Schema, model } from "mongoose";
// 2. Criar um Schema que corresponda a Interface.
const userSchema = new Schema({
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
}, { timestamps: true });
// 3. Criar um Model
const UserModel = model("User", userSchema);
// 4. Esperando a resposta da conexão entre Mongoose e MongoDB.
async function run() {
    await mongoose;
}
run().catch((err) => console.log(err));
export { UserModel };
