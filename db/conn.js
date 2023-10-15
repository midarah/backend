import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
async function main() {
    const dbName = "MidaraDB";
    await mongoose
        .connect(process.env.DATABASE, {
        dbName: dbName,
    })
        .then(() => console.log("Conectado ao MongoDB!"));
}
main().catch((err) => console.log(err));
export default main;
