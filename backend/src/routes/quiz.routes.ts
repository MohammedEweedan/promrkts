import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  adminCreateQuiz,
  adminUpdateQuiz,
  adminDeleteQuiz,
  adminListQuizzes,
  adminGetQuiz,
  adminPublishQuiz,
  getActiveQuiz,
  submitQuizAttempt,
  listMyQuizAttempts,
} from "../controllers/quiz.controller";

const router = Router();

// Learner endpoints
router.get("/active", authenticate, getActiveQuiz);
router.post("/attempts", authenticate, submitQuizAttempt);
router.get("/attempts/me", authenticate, listMyQuizAttempts);

// Admin endpoints
router.get("/", authenticate, authorize("admin"), adminListQuizzes);
router.get("/:id", authenticate, authorize("admin"), adminGetQuiz);
router.post("/", authenticate, authorize("admin"), adminCreateQuiz);
router.put("/:id", authenticate, authorize("admin"), adminUpdateQuiz);
router.delete("/:id", authenticate, authorize("admin"), adminDeleteQuiz);
router.post("/:id/publish", authenticate, authorize("admin"), adminPublishQuiz);

export default router;
