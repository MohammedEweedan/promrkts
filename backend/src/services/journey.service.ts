import prisma from "../config/prisma";

export type JourneyStage =
  | "SIGNED_UP"
  | "LEARNING"
  | "COMMUNITY"
  | "DASHBOARD"
  | "EVAL_READY"
  | "EVALUATING"
  | "FUNDED"
  | "EXECUTING";

export type JourneyTrack = "LEARN" | "FUNDED" | "EXECUTE";

const STAGE_ORDER: Record<JourneyStage, number> = {
  SIGNED_UP: 0,
  LEARNING: 1,
  COMMUNITY: 2,
  DASHBOARD: 3,
  EVAL_READY: 4,
  EVALUATING: 5,
  FUNDED: 6,
  EXECUTING: 7,
};

export function stageRank(stage: JourneyStage) {
  return STAGE_ORDER[stage] ?? 0;
}

export function hasReachedStage(current: JourneyStage, target: JourneyStage) {
  return stageRank(current) >= stageRank(target);
}

type StageReason =
  | "signup"
  | "course_purchase"
  | "course_completion"
  | "community_access"
  | "dashboard_saved"
  | "readiness_passed"
  | "challenge_purchase"
  | "challenge_passed"
  | "payout_recorded"
  | "broker_signup"
  | "manual";

export async function ensureJourney(userId: string, track: JourneyTrack = "LEARN") {
  return prisma.userJourney.upsert({
    where: { userId },
    update: {},
    create: { userId, track },
  });
}

export async function getJourney(userId: string) {
  return prisma.userJourney.findUnique({ where: { userId } });
}

function shouldAdvance(current: JourneyStage, next: JourneyStage) {
  return STAGE_ORDER[next] > STAGE_ORDER[current];
}

async function logJourneyEvent(userId: string, payload: Record<string, any>) {
  try {
    await prisma.event.create({
      data: {
        userId,
        type: "journey.stage",
        payload,
      },
    });
  } catch {
    // swallow non-critical logging errors
  }
}

export async function updateJourneyStage(
  userId: string,
  nextStage: JourneyStage,
  reason: StageReason,
  meta?: Record<string, any>
) {
  const journey = await ensureJourney(userId);
  if (!journey || !shouldAdvance(journey.stage, nextStage)) {
    return journey;
  }
  const updated = await prisma.userJourney.update({
    where: { userId },
    data: { stage: nextStage },
  });
  await logJourneyEvent(userId, { previous: journey.stage, next: nextStage, reason, ...(meta || {}) });
  return updated;
}

export async function markCourseEngagement(userId: string) {
  await updateJourneyStage(userId, "LEARNING", "course_purchase");
}

export async function markCommunityJoin(userId: string) {
  await updateJourneyStage(userId, "COMMUNITY", "community_access");
}

export async function markDashboardUsage(userId: string) {
  await updateJourneyStage(userId, "DASHBOARD", "dashboard_saved");
}

export async function setEvalReady(userId: string, ready: boolean, reason: StageReason = "readiness_passed") {
  const journey = await ensureJourney(userId);
  if (journey.evalReady === ready) return journey;
  const data: any = { evalReady: ready };
  if (ready && shouldAdvance(journey.stage, "EVAL_READY")) {
    data.stage = "EVAL_READY";
  }
  const updated = await prisma.userJourney.update({
    where: { userId },
    data,
  });
  await logJourneyEvent(userId, { previous: journey.stage, next: updated.stage, reason, evalReady: ready });
  return updated;
}

export async function markEvaluating(userId: string) {
  await updateJourneyStage(userId, "EVALUATING", "challenge_purchase");
}

export async function markFunded(userId: string) {
  await updateJourneyStage(userId, "FUNDED", "challenge_passed");
}

export async function markExecuting(userId: string) {
  await updateJourneyStage(userId, "EXECUTING", "broker_signup");
}

export async function recordPayoutEvent(userId: string, payload: { amountUsd: number; challengeAccountId: string }) {
  const journey = await ensureJourney(userId);
  const patch: any = {};
  if (!journey.firstPayoutAt) {
    patch.firstPayoutAt = new Date();
  }
  await prisma.userJourney.update({
    where: { userId },
    data: patch,
  });
  await logJourneyEvent(userId, { reason: "payout_recorded", payout: payload });
  await markFunded(userId);
}

export async function recordJourneyNudge(userId: string, meta?: Record<string, any>) {
  await prisma.userJourney.update({
    where: { userId },
    data: { lastNudgeAt: new Date() },
  });
  await logJourneyEvent(userId, { reason: "manual", action: "nudge", ...(meta || {}) });
}
