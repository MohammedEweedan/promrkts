import { Router, Response, NextFunction } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import {
  getPosts,
  createPost,
  likePost,
  getComments,
  createComment,
  getVotes,
  castVote,
  getMyVotes,
  getPromrktsIndex,
  getProfile,
  updateProfile,
  followUser,
  searchUsers,
} from "../controllers/socialController";

const router = Router();

// Optional auth middleware - doesn't fail if no token
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

// Posts
router.get("/posts", optionalAuth, getPosts);
router.post("/posts", authenticate, createPost);
router.post("/posts/:postId/like", authenticate, likePost);
router.get("/posts/:postId/comments", optionalAuth, getComments);
router.post("/posts/:postId/comments", authenticate, createComment);

// Voting
router.get("/votes", optionalAuth, getVotes);
router.post("/votes", authenticate, castVote);
router.get("/votes/my", authenticate, getMyVotes);

// Promrkts Index
router.get("/index", optionalAuth, getPromrktsIndex);

// Profile
router.get("/profile/:userId", optionalAuth, getProfile);
router.patch("/profile", authenticate, updateProfile);
router.post("/profile/:userId/follow", authenticate, followUser);

// User Search
router.get("/users/search", optionalAuth, searchUsers);

export default router;
