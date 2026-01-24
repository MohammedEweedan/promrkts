-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENT', 'AMOUNT');

-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "public"."PurchaseStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('pdf', 'video');

-- CreateEnum
CREATE TYPE "public"."CommunicationStatus" AS ENUM ('OPEN', 'READ', 'ESCALATED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."CommunicationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."Affiliate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReferralAttribution" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "affiliateId" UUID,
    "code" TEXT NOT NULL,
    "medium" TEXT,
    "campaign" TEXT,
    "landingUrl" TEXT,
    "ip" TEXT,
    "ua" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReferralReward" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "affiliateId" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "tierId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUALIFIED',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoCode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "discountType" "public"."DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxGlobalRedemptions" INTEGER,
    "maxPerUser" INTEGER,
    "minSpendUsd" DOUBLE PRECISION,
    "applicableTierIds" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip" TEXT,
    "first_seen" TIMESTAMP(3),
    "last_seen" TIMESTAMP(3),
    "source" TEXT,
    "user_id" TEXT,
    "utm_campaign" TEXT,
    "utm_medium" TEXT,
    "utm_source" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pageviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "session_id" UUID NOT NULL,
    "user_agent" TEXT,

    CONSTRAINT "pageviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoRedemption" (
    "promoId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoRedemption_pkey" PRIMARY KEY ("promoId","userId","purchaseId")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cart" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseTier" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price_usdt" DOUBLE PRECISION NOT NULL,
    "price_stripe" INTEGER NOT NULL,
    "level" "public"."Level" NOT NULL,
    "trailerUrl" TEXT,
    "previewUrl" TEXT,
    "instructorName" TEXT,
    "instructorBio" TEXT,
    "instructorAvatarUrl" TEXT,
    "telegramEmbedUrl" TEXT,
    "telegramUrl" TEXT,
    "discordWidgetId" TEXT,
    "discordInviteUrl" TEXT,
    "twitterTimelineUrl" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Purchase" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tierId" UUID NOT NULL,
    "status" "public"."PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "txnHash" TEXT,
    "stripeId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refAffiliateId" UUID,
    "refCode" TEXT,
    "promoId" UUID,
    "promoCode" TEXT,
    "discountUsd" DOUBLE PRECISION,
    "finalPriceUsd" DOUBLE PRECISION,
    "pricingPath" TEXT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tierId" UUID NOT NULL,
    "type" "public"."ResourceType" NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseReview" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tierId" UUID NOT NULL,
    "userId" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityAccess" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "telegram" BOOLEAN NOT NULL DEFAULT false,
    "discord" BOOLEAN NOT NULL DEFAULT false,
    "twitter" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CommunityAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BrokerSignup" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "referralCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."banners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "image_url" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "badge" TEXT,
    "href" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB,
    "expectedPay" TEXT,
    "closingDate" TIMESTAMP(6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobApplication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "coverLetter" TEXT,
    "cvUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."communications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "course_id" TEXT,
    "course_name" TEXT,
    "locale" TEXT,
    "url" TEXT,
    "utm" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "status" "public"."CommunicationStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."CommunicationPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedAdminId" UUID,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_userId_key" ON "public"."Affiliate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_code_key" ON "public"."Affiliate"("code");

-- CreateIndex
CREATE INDEX "idx_ref_attr_affiliate" ON "public"."ReferralAttribution"("affiliateId");

-- CreateIndex
CREATE INDEX "idx_ref_reward_affiliate" ON "public"."ReferralReward"("affiliateId");

-- CreateIndex
CREATE INDEX "idx_ref_reward_purchase" ON "public"."ReferralReward"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE INDEX "idx_pageviews_session" ON "public"."pageviews"("session_id");

-- CreateIndex
CREATE INDEX "idx_promo_redemption_promo" ON "public"."PromoRedemption"("promoId");

-- CreateIndex
CREATE INDEX "idx_promo_redemption_user" ON "public"."PromoRedemption"("userId");

-- CreateIndex
CREATE INDEX "idx_promo_redemption_purchase" ON "public"."PromoRedemption"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "public"."users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_password_reset_tokens_user" ON "public"."password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_token" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user" ON "public"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_purchase_user" ON "public"."Purchase"("userId");

-- CreateIndex
CREATE INDEX "idx_purchase_tier" ON "public"."Purchase"("tierId");

-- CreateIndex
CREATE INDEX "idx_purchase_ref_affiliate" ON "public"."Purchase"("refAffiliateId");

-- CreateIndex
CREATE INDEX "idx_purchase_promo" ON "public"."Purchase"("promoId");

-- CreateIndex
CREATE INDEX "idx_review_tier" ON "public"."CourseReview"("tierId");

-- CreateIndex
CREATE INDEX "idx_review_user" ON "public"."CourseReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityAccess_userId_key" ON "public"."CommunityAccess"("userId");

-- CreateIndex
CREATE INDEX "idx_job_active" ON "public"."Job"("isActive");

-- CreateIndex
CREATE INDEX "idx_job_closing_date" ON "public"."Job"("closingDate");

-- CreateIndex
CREATE INDEX "idx_job_application_job" ON "public"."JobApplication"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "communications_ticketId_key" ON "public"."communications"("ticketId");

-- CreateIndex
CREATE INDEX "idx_communications_read" ON "public"."communications"("read");

-- CreateIndex
CREATE INDEX "idx_communications_created_at" ON "public"."communications"("created_at");

-- CreateIndex
CREATE INDEX "idx_communications_status" ON "public"."communications"("status");

-- CreateIndex
CREATE INDEX "idx_communications_assignee" ON "public"."communications"("assignedAdminId");

-- AddForeignKey
ALTER TABLE "public"."Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pageviews" ADD CONSTRAINT "pageviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."CourseTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource" ADD CONSTRAINT "Resource_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."CourseTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseReview" ADD CONSTRAINT "CourseReview_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."CourseTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseReview" ADD CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityAccess" ADD CONSTRAINT "CommunityAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrokerSignup" ADD CONSTRAINT "BrokerSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."communications" ADD CONSTRAINT "communications_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

