-- Add challenges + MT5 challenge tracking models

-- 1) Extend CourseProductType enum with CHALLENGE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'CourseProductType'
      AND e.enumlabel = 'CHALLENGE'
  ) THEN
    ALTER TYPE "CourseProductType" ADD VALUE 'CHALLENGE';
  END IF;
END $$;

-- 2) Add optional challenge config columns to CourseTier
ALTER TABLE IF EXISTS "CourseTier"
  ADD COLUMN IF NOT EXISTS "challengePlatform" TEXT,
  ADD COLUMN IF NOT EXISTS "challengeMeta" JSONB;

-- 3) ChallengeAccountStatus enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChallengeAccountStatus') THEN
    CREATE TYPE "ChallengeAccountStatus" AS ENUM ('PENDING','ACTIVE','FAILED','PASSED');
  END IF;
END $$;

-- 4) ChallengeAccount table
CREATE TABLE IF NOT EXISTS "ChallengeAccount" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tierId" UUID NOT NULL,
  "purchaseId" UUID NOT NULL UNIQUE,
  "status" "ChallengeAccountStatus" NOT NULL DEFAULT 'PENDING',
  "platform" TEXT,
  "mt5Login" TEXT,
  "mt5Server" TEXT,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
  CONSTRAINT "fk_challenge_account_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_challenge_account_tier" FOREIGN KEY ("tierId") REFERENCES "CourseTier"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_challenge_account_purchase" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_challenge_account_user" ON "ChallengeAccount"("userId");
CREATE INDEX IF NOT EXISTS "idx_challenge_account_tier" ON "ChallengeAccount"("tierId");

-- 5) ChallengeDailyStat table
CREATE TABLE IF NOT EXISTS "ChallengeDailyStat" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "challengeAccountId" UUID NOT NULL,
  "date" TIMESTAMP(6) NOT NULL,
  "balance" DOUBLE PRECISION,
  "equity" DOUBLE PRECISION,
  "pnl" DOUBLE PRECISION,
  "maxDailyDrawdown" DOUBLE PRECISION,
  "maxDailyProfit" DOUBLE PRECISION,
  "meta" JSONB,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
  CONSTRAINT "fk_challenge_daily_account" FOREIGN KEY ("challengeAccountId") REFERENCES "ChallengeAccount"("id") ON DELETE CASCADE,
  CONSTRAINT "uniq_challenge_daily_account_date" UNIQUE ("challengeAccountId", "date")
);

CREATE INDEX IF NOT EXISTS "idx_challenge_daily_account" ON "ChallengeDailyStat"("challengeAccountId");
CREATE INDEX IF NOT EXISTS "idx_challenge_daily_date" ON "ChallengeDailyStat"("date");
