import express from "express";
import protectRoute from "../middlewares/auth.middleware.js";
import { deleteAdmin, getUser, toggleAdmin } from "../controllers/user.controller.js";

const router = express.Router();


router.get("/users", protectRoute, getUser)
router.patch("/toggle-role/:id", protectRoute, toggleAdmin)
router.delete("/user/:id", protectRoute, deleteAdmin)

export default router;
