import { Router } from "express";
import { createUser, login } from "./services/auth";
const router = Router();

router.post("/api/auth/register", createUser);
router.post("/api/auth/login", login);

export default router;
