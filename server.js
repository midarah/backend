import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const port = process.env.SERVER_PORT || 5000;
// Invocação do express
const app = express();
// Configuração de pasta statica (Importante para renderizar as imagens no Frontend)
app.use(express.static("public"));
// Configuração CORS
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
// Para pegar o corpo bruto da solicitação
// app.use(express.raw({ type: "*/*" }));
// // Configuração JSON response > para transformar o corpo da solicitação em JSON
// app.use(express.json());
// Middleware personalizado para analisar o corpo da solicitação com base no Content-Type
app.use((req, res, next) => {
    const contentType = req.headers["content-type"];
    if (contentType === "multipart/form-data") {
        // Para multipart/form-data, use o multer
        express.json()(req, res, next);
    }
    else if (contentType === "application/json") {
        // Aumente o limite de tamanho máximo do corpo da solicitação para 10MB e use express.json()
        express.json()(req, res, next);
    }
    else if (req.originalUrl === "/stripe/create-subscription") {
        // Para a rota do webhook do Stripe, use express.raw() para o corpo bruto
        express.raw({ type: "*/*" })(req, res, next);
    }
    else {
        // Se não for nenhum dos tipos anteriores, continue com o processamento usual
        next();
    }
});
// Importação das Rotas (não funcionais)
import UserRoutes from "./routes/UserRoutes.js";
import StripeRoutes from "./routes/StripeRoutes.js";
import HentaiRoutes from "./routes/HentaiRoutes.js";
import MangakaRoutes from "./routes/MangakaRoutes.js";
import TagsRoutes from "./routes/TagsRoutes.js";
// Definição das rotas
app.use("/users", UserRoutes);
app.use("/stripe", express.raw({ type: "*/*" }), StripeRoutes);
app.use("/hentais", HentaiRoutes);
app.use("/mangakas", MangakaRoutes);
app.use("/tags", TagsRoutes);
// Configuração do Listen
app.listen(port, () => {
    console.log(`Servidor Rodando na porta ${port}`);
});
