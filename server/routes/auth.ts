import { Router } from "express";
import AuthController from "../controllers/authController";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.login);
router.get("/profile/:id", AuthController.profile);

export default router;
