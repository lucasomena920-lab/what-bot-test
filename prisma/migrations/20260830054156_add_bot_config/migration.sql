-- CreateTable
CREATE TABLE "BotConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "greeting" TEXT NOT NULL,
    "menu" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "humanSupport" TEXT NOT NULL,
    "fallback" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BotConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BotConfig_userId_key" ON "BotConfig"("userId");
