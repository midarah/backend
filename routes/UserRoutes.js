import UserController from "../controllers/UserController.js";
import { Router } from "express";
// Invocação do Router
const router = Router();
// Middlewares
import verifyToken from "../helpers/verify-token.js";
import { imageUpload } from "../helpers/image-upload.js";
import { validateRegisterInput } from "../helpers/validate-register-input.js";
// Rotas funcionais
router.post("/register", validateRegisterInput, UserController.register);
router.post("/login", UserController.login);
router.get("/checkuser", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.patch("/edit/:id", verifyToken, imageUpload.single("image"), UserController.editUser);
export default router;
