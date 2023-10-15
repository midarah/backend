import HentaiController from "../controllers/HentaiController.js";
import { Router } from "express";
const router = Router();
// Middleware
import verifyToken from "../helpers/verify-token.js";
import { imageUpload } from "../helpers/image-upload.js";
// Rotas
router.post("/create", verifyToken, imageUpload.single("image"), HentaiController.create);
router.get("/", HentaiController.getAll);
router.get("/:id", HentaiController.getHentaiById);
router.delete("/:id", verifyToken, HentaiController.deleteHentai);
router.patch("/edit/:id", verifyToken, imageUpload.single("image"), HentaiController.updateHentai);
router.patch("/chcreate/:id", verifyToken, imageUpload.array("images"), HentaiController.createChapters);
export default router;
