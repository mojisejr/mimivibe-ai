-- CreateTable
CREATE TABLE "prompt_access_logs" (
    "id" SERIAL NOT NULL,
    "promptName" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "executionTimeMs" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_alerts" (
    "id" SERIAL NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_access_logs_promptName_idx" ON "prompt_access_logs"("promptName");

-- CreateIndex
CREATE INDEX "prompt_access_logs_userId_idx" ON "prompt_access_logs"("userId");

-- CreateIndex
CREATE INDEX "prompt_access_logs_ipAddress_idx" ON "prompt_access_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "prompt_access_logs_createdAt_idx" ON "prompt_access_logs"("createdAt");

-- CreateIndex
CREATE INDEX "prompt_access_logs_success_idx" ON "prompt_access_logs"("success");

-- CreateIndex
CREATE INDEX "security_alerts_alertType_idx" ON "security_alerts"("alertType");

-- CreateIndex
CREATE INDEX "security_alerts_severity_idx" ON "security_alerts"("severity");

-- CreateIndex
CREATE INDEX "security_alerts_userId_idx" ON "security_alerts"("userId");

-- CreateIndex
CREATE INDEX "security_alerts_ipAddress_idx" ON "security_alerts"("ipAddress");

-- CreateIndex
CREATE INDEX "security_alerts_createdAt_idx" ON "security_alerts"("createdAt");
