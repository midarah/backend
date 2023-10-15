import MangakaController from "../controllers/MangakaController.js";
import { Router } from "express";
const router = Router();
// Middlewares
import verifyToken from "../helpers/verify-token.js";
import { imageUpload } from "../helpers/image-upload.js";
// Rotas
router.post("/create", verifyToken, imageUpload.single("image"), MangakaController.create);
router.get("/", MangakaController.getAllMangakas);
router.get("/:id", MangakaController.getMangakaById);
router.delete("/:id", verifyToken, MangakaController.deleteMangaka);
export default router;
