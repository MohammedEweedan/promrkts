import api from "./client";

export type JourneyStage =
  | "SIGNED_UP"
  | "LEARNING"
  | "COMMUNITY"
  | "DASHBOARD"
  | "EVAL_READY"
  | "EVALUATING"
  | "FUNDED"
  | "EXECUTING";

export type Journey = {
  userId: string;
  track: "LEARN" | "FUNDED" | "EXECUTE";
  stage: JourneyStage;
  evalReady: boolean;
  firstPayoutAt?: string | null;
  lastNudgeAt?: string | null;
};

export type Entitlements = {
  userId: string;
  canUseDashboard: boolean;
  maxWorkspaces: number;
  maxWidgets: number;
  canUseNews: boolean;
  canUseMultiGrid: boolean;
  canBuyEval: boolean;
  canJoinDiscord: boolean;
  canJoinTelegram: boolean;
};

export type ReadinessResponse = {
  ready: boolean;
  stage: JourneyStage;
  requirements: {
    quizPassed: boolean;
    hasCoursePurchase: boolean;
    hasCourseProgress: boolean;
    hasDashboardLayout: boolean;
  };
  missing: string[];
};

export const JOURNEY_STAGE_ORDER: JourneyStage[] = [
  "SIGNED_UP",
  "LEARNING",
  "COMMUNITY",
  "DASHBOARD",
  "EVAL_READY",
  "EVALUATING",
  "FUNDED",
  "EXECUTING",
];

export const stageRank = (stage: JourneyStage): number =>
  JOURNEY_STAGE_ORDER.indexOf(stage);

export const hasReachedStage = (
  stage: JourneyStage,
  target: JourneyStage
): boolean => stageRank(stage) >= stageRank(target);

export async function fetchJourney(): Promise<Journey> {
  const { data } = await api.get("/users/me/journey");
  return data;
}

export async function fetchEntitlements(): Promise<Entitlements> {
  const { data } = await api.get("/users/me/entitlements");
  return data;
}

export async function fetchReadiness(): Promise<ReadinessResponse> {
  const { data } = await api.get("/challenges/readiness");
  return data;
}
