import { Router, Response, NextFunction } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import {
  getGroups,
  createGroup,
  getGroup,
  joinGroup,
  getGroupMessages,
  sendGroupMessage,
  getMyGroups,
} from "../controllers/groupsController";

const router = Router();

// Optional auth middleware
const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    next();
  } catch {
    next();
  }
};

// Groups
router.get("/", optionalAuth, getGroups);
router.post("/", authenticate, createGroup);
router.get("/my", authenticate, getMyGroups);
router.get("/:groupId", optionalAuth, getGroup);
router.post("/:groupId/join", authenticate, joinGroup);
router.get("/:groupId/messages", optionalAuth, getGroupMessages);
router.post("/:groupId/messages", authenticate, sendGroupMessage);

export default router;
