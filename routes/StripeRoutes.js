import StripeController from "../controllers/StripeController.js";
import { Router } from "express";
const router = Router();
// Middlewares
import verifyToken from "../helpers/verify-token.js";
router.get("/prices", StripeController.prices);
// Essas rotas precisam verificar se o token é válido (Falta um Middleware)
router.post("/create-subscription", verifyToken, StripeController.createSubscription);
router.get("/subscription-status", verifyToken, StripeController.getStatus);
router.get("/subscription-info", verifyToken, StripeController.subscriptionInfo);
router.get("/customer-portal", verifyToken, StripeController.customerPortal);
router.post("/webhook", StripeController.webhookStripe);
export default router;
