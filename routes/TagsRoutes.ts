import TagsController from "../controllers/TagsController.js";
import { Router } from "express";
const router = Router();

// Middlewares
import verifyToken from "../helpers/verify-token.js";
import { imageUpload } from "../helpers/image-upload.js";

// Rotas
router.post(
	"/create",
	verifyToken,
	imageUpload.single("image"),
	TagsController.create
);

router.get("/", TagsController.getAllTags);

router.get("/:id", TagsController.getTagById);

router.delete("/:id", verifyToken, TagsController.deleteTag);

export default router;
