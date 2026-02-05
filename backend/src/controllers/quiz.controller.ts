import prisma from "../config/prisma";
import { Request, Response } from "express";

const uuidRe =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

function isUuid(v: any) {
  return typeof v === "string" && uuidRe.test(v);
}

function safeInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/**
 * QUESTIONS JSON SHAPE (recommended)
 * {
 *   questions: [
 *     {
 *       id: "q1" (optional),
 *       prompt: "....",
 *       options: [
 *         { id: "a", text: "...", isCorrect: true },
 *         { id: "b", text: "...", isCorrect: false }
 *       ]
 *     }
 *   ]
 * }
 *
 * Attempts will submit:
 * {
 *   answers: [{ questionId: "q1", optionId: "a" }, ...]
 * }
 */

function normalizeQuizQuestionsJson(questions: any) {
  // Allow either {questions:[...]} or [...]
  const qArr = Array.isArray(questions) ? questions : Array.isArray(questions?.questions) ? questions.questions : null;
  if (!qArr) return null;

  const normalized = qArr.map((q: any, idx: number) => {
    const qId = String(q?.id || `q_${idx + 1}`);
    const prompt = String(q?.prompt || "").trim();
    const opts = Array.isArray(q?.options) ? q.options : [];
    const options = opts.map((o: any, j: number) => ({
      id: String(o?.id || `o_${j + 1}`),
      text: String(o?.text || "").trim(),
      isCorrect: !!o?.isCorrect,
    }));

    return { id: qId, prompt, options };
  });

  // Basic validation: prompts non-empty, >=2 options, exactly 1 correct
  for (const q of normalized) {
    if (!q.prompt) return null;
    if (!Array.isArray(q.options) || q.options.length < 2) return null;
    const correctCount = q.options.filter((o: { isCorrect: any; }) => o.isCorrect).length;
    if (correctCount !== 1) return null;
  }

  return { questions: normalized };
}

function scoreAttempt(quizQuestionsJson: any, answers: Array<{ questionId: string; optionId: string }>) {
  const qArr = quizQuestionsJson?.questions;
  if (!Array.isArray(qArr) || qArr.length === 0) {
    return { correct: 0, total: 0, score: 0 };
  }

  const answerMap = new Map<string, string>();
  for (const a of answers || []) {
    if (!a?.questionId || !a?.optionId) continue;
    answerMap.set(String(a.questionId), String(a.optionId));
  }

  let correct = 0;
  for (const q of qArr) {
    const picked = answerMap.get(String(q.id));
    if (!picked) continue;
    const opt = (q.options || []).find((o: any) => String(o.id) === String(picked));
    if (opt?.isCorrect) correct += 1;
  }

  const total = qArr.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, total, score };
}

/** -------------------------
 * Learner: Get active quiz
 * GET /quizzes/active?tierId=...&resourceId=...
 * Priority:
 *  1) Published quiz for (tierId + resourceId)
 *  2) Published quiz for (tierId + resourceId = null)
 * ------------------------ */
export async function getActiveQuiz(req: Request, res: Response) {
  try {
    const { tierId, resourceId } = req.query as any;

    if (!isUuid(tierId)) return res.status(400).json({ message: "tierId is required (uuid)" });
    if (resourceId != null && resourceId !== "" && !isUuid(resourceId)) {
      return res.status(400).json({ message: "resourceId must be uuid" });
    }

    // Optional: validate user has access to the tier (purchased OR free tier)
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tier = await prisma.courseTier.findUnique({ where: { id: tierId }, select: { id: true, isVipProduct: true, isBundle: true, price_usdt: true } });
    if (!tier) return res.status(404).json({ message: "Tier not found" });

    const isFreePublic = !tier.isVipProduct && !tier.isBundle && (!Number.isFinite(Number(tier.price_usdt)) || Number(tier.price_usdt) <= 0);
    if (!isFreePublic) {
      const ok = await prisma.purchase.findFirst({
        where: { userId, tierId, status: "CONFIRMED" as any },
        select: { id: true },
      });
      if (!ok) return res.status(403).json({ message: "Access denied" });
    }

    const rid = resourceId && resourceId !== "" ? String(resourceId) : null;

    const quiz =
      (rid
        ? await prisma.quiz.findFirst({
            where: { tierId, resourceId: rid, isPublished: true },
            orderBy: { createdAt: "desc" },
          })
        : null) ||
      (await prisma.quiz.findFirst({
        where: { tierId, resourceId: null, isPublished: true },
        orderBy: { createdAt: "desc" },
      }));

    if (!quiz) return res.json(null);

    // IMPORTANT: do NOT send correct answers to client.
    // Strip isCorrect if your questions json contains it.
    const q = quiz.questions as any;
    const normalized = normalizeQuizQuestionsJson(q) || { questions: [] };
    const safeQuestions = {
      questions: (normalized.questions || []).map((qq: any) => ({
        id: qq.id,
        prompt: qq.prompt,
        options: (qq.options || []).map((o: any) => ({ id: o.id, text: o.text })),
      })),
    };

    return res.json({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      passingScore: (quiz as any).passingScore ?? null,
      tierId: (quiz as any).tierId,
      resourceId: (quiz as any).resourceId ?? null,
      questions: safeQuestions,
    });
  } catch (e) {
    return res.status(400).json({ message: "Unable to load quiz" });
  }
}

/** -------------------------
 * Learner: Submit attempt
 * POST /quizzes/attempts
 * body: { quizId, tierId, resourceId?, answers: [{questionId, optionId}] }
 * Server scores it.
 * ------------------------ */
export async function submitQuizAttempt(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { quizId, tierId, resourceId, answers } = req.body || {};

    if (!isUuid(quizId)) return res.status(400).json({ message: "quizId required (uuid)" });
    if (!isUuid(tierId)) return res.status(400).json({ message: "tierId required (uuid)" });
    if (resourceId != null && resourceId !== "" && !isUuid(resourceId)) {
      return res.status(400).json({ message: "resourceId must be uuid" });
    }

    // Verify access like above
    const tier = await prisma.courseTier.findUnique({ where: { id: tierId }, select: { id: true, isVipProduct: true, isBundle: true, price_usdt: true } });
    if (!tier) return res.status(404).json({ message: "Tier not found" });

    const isFreePublic = !tier.isVipProduct && !tier.isBundle && (!Number.isFinite(Number(tier.price_usdt)) || Number(tier.price_usdt) <= 0);
    if (!isFreePublic) {
      const ok = await prisma.purchase.findFirst({
        where: { userId, tierId, status: "CONFIRMED" as any },
        select: { id: true },
      });
      if (!ok) return res.status(403).json({ message: "Access denied" });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!(quiz as any).isPublished) return res.status(403).json({ message: "Quiz not published" });

    if ((quiz as any).tierId !== tierId) {
      return res.status(400).json({ message: "Quiz does not belong to tierId" });
    }
    // If quiz is tied to a resource, enforce it
    if ((quiz as any).resourceId && resourceId && String((quiz as any).resourceId) !== String(resourceId)) {
      return res.status(400).json({ message: "Quiz does not match resourceId" });
    }

    const normalized = normalizeQuizQuestionsJson(quiz.questions as any);
    if (!normalized) return res.status(400).json({ message: "Quiz questions invalid on server" });

    const safeAnswers = Array.isArray(answers) ? answers : [];
    const scored = scoreAttempt(normalized, safeAnswers);

    const passingScore = (quiz as any).passingScore != null ? safeInt((quiz as any).passingScore, 0) : null;
    const passed = passingScore == null ? true : scored.score >= passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        tierId,
        resourceId: resourceId ? String(resourceId) : null,
        answers: { answers: safeAnswers },
        score: scored.score,
        passed,
      } as any,
    });

    // OPTIONAL: rollup into StudentProgress.quizzesScore
    // Here we store "best score so far" for that tier (simple)
    try {
      const best = await prisma.quizAttempt.aggregate({
        where: { userId, tierId },
        _max: { score: true },
      });
      const bestScore = Number(best._max.score || 0);

      await prisma.studentProgress.upsert({
        where: { unique_user_tier_progress: { userId, tierId } } as any,
        update: { quizzesScore: bestScore, updatedAt: new Date() },
        create: { userId, tierId, quizzesScore: bestScore },
      });
    } catch {
      // ignore
    }

    return res.status(201).json({
      attemptId: attempt.id,
      score: scored.score,
      passed,
      correct: scored.correct,
      total: scored.total,
    });
  } catch (e) {
    return res.status(400).json({ message: "Unable to submit quiz attempt" });
  }
}

/** Learner: list my attempts for a tier (optional convenience)
 * GET /quizzes/attempts/me?tierId=...&quizId=...
 */
export async function listMyQuizAttempts(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { tierId, quizId } = req.query as any;
    if (tierId != null && tierId !== "" && !isUuid(tierId)) return res.status(400).json({ message: "tierId must be uuid" });
    if (quizId != null && quizId !== "" && !isUuid(quizId)) return res.status(400).json({ message: "quizId must be uuid" });

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        ...(tierId ? { tierId: String(tierId) } : {}),
        ...(quizId ? { quizId: String(quizId) } : {}),
      } as any,
      orderBy: { submittedAt: "desc" },
      take: 50,
    });

    return res.json(attempts);
  } catch {
    return res.status(400).json({ message: "Unable to list attempts" });
  }
}

/** -------------------------
 * Admin: list quizzes
 * GET /quizzes?tierId=...&resourceId=...&published=...
 * ------------------------ */
export async function adminListQuizzes(req: Request, res: Response) {
  try {
    const { tierId, resourceId, published } = req.query as any;

    if (tierId != null && tierId !== "" && !isUuid(tierId)) return res.status(400).json({ message: "tierId must be uuid" });
    if (resourceId != null && resourceId !== "" && !isUuid(resourceId)) return res.status(400).json({ message: "resourceId must be uuid" });

    const where: any = {};
    if (tierId) where.tierId = String(tierId);
    if (resourceId) where.resourceId = String(resourceId);
    if (published === "true") where.isPublished = true;
    if (published === "false") where.isPublished = false;

    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(quizzes);
  } catch {
    return res.status(400).json({ message: "Unable to list quizzes" });
  }
}

export async function adminGetQuiz(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ message: "Invalid quiz id" });

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return res.status(404).json({ message: "Not found" });

    return res.json(quiz);
  } catch {
    return res.status(400).json({ message: "Unable to load quiz" });
  }
}

/** Admin: create quiz
 * POST /quizzes
 * body: { slug, title, tierId, resourceId?, questions, metadata?, passingScore?, isPublished? }
 */
export async function adminCreateQuiz(req: Request, res: Response) {
  try {
    const { slug, title, tierId, resourceId, questions, metadata, passingScore, isPublished } = req.body || {};

    if (!slug || typeof slug !== "string") return res.status(400).json({ message: "slug required" });
    if (!title || typeof title !== "string") return res.status(400).json({ message: "title required" });
    if (!isUuid(tierId)) return res.status(400).json({ message: "tierId required (uuid)" });
    if (resourceId != null && resourceId !== "" && !isUuid(resourceId)) return res.status(400).json({ message: "resourceId must be uuid" });

    const normalized = normalizeQuizQuestionsJson(questions);
    if (!normalized) return res.status(400).json({ message: "Invalid questions format (need prompts, >=2 options, exactly 1 correct)" });

    const created = await prisma.quiz.create({
      data: {
        slug,
        title,
        tierId,
        resourceId: resourceId ? String(resourceId) : null,
        questions: normalized,
        metadata: metadata ?? undefined,
        passingScore: passingScore != null ? safeInt(passingScore, 0) : null,
        isPublished: !!isPublished,
      } as any,
    });

    return res.status(201).json(created);
  } catch {
    return res.status(400).json({ message: "Unable to create quiz" });
  }
}

/** Admin: update quiz
 * PUT /quizzes/:id
 */
export async function adminUpdateQuiz(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ message: "Invalid quiz id" });

    const { slug, title, tierId, resourceId, questions, metadata, passingScore, isPublished } = req.body || {};

    const data: any = {};
    if (slug != null) data.slug = slug;
    if (title != null) data.title = title;
    if (tierId != null) {
      if (!isUuid(tierId)) return res.status(400).json({ message: "tierId must be uuid" });
      data.tierId = tierId;
    }
    if (resourceId != null) {
      if (resourceId !== "" && !isUuid(resourceId)) return res.status(400).json({ message: "resourceId must be uuid" });
      data.resourceId = resourceId ? String(resourceId) : null;
    }
    if (questions != null) {
      const normalized = normalizeQuizQuestionsJson(questions);
      if (!normalized) return res.status(400).json({ message: "Invalid questions format" });
      data.questions = normalized;
    }
    if (metadata != null) data.metadata = metadata;
    if (passingScore != null) data.passingScore = safeInt(passingScore, 0);
    if (isPublished != null) data.isPublished = !!isPublished;

    const updated = await prisma.quiz.update({ where: { id }, data });
    return res.json(updated);
  } catch {
    return res.status(400).json({ message: "Unable to update quiz" });
  }
}

export async function adminDeleteQuiz(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ message: "Invalid quiz id" });

    await prisma.quiz.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(400).json({ message: "Unable to delete quiz" });
  }
}

/** Admin: publish/unpublish
 * POST /quizzes/:id/publish
 * body: { isPublished: true/false }
 */
export async function adminPublishQuiz(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ message: "Invalid quiz id" });

    const { isPublished } = req.body || {};
    const updated = await prisma.quiz.update({
      where: { id },
      data: { isPublished: !!isPublished },
    });

    return res.json(updated);
  } catch {
    return res.status(400).json({ message: "Unable to publish quiz" });
  }
}
