-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "timezone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RoutineTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByAI" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoutineTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DayRoutineTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "defaultWeight" REAL NOT NULL DEFAULT 1,
    "recommendedTime" TEXT,
    "customStartTime" TEXT,
    "customEndTime" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "DayRoutineTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RoutineTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalendarDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "templateId" TEXT,
    "notes" TEXT,
    "mood" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalendarDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CalendarDay_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RoutineTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DayRoutineInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calendarDayId" TEXT NOT NULL,
    "routineItemId" TEXT NOT NULL,
    "customTitle" TEXT,
    "customWeight" REAL,
    "customRecommendedTime" TEXT,
    "customStartTime" TEXT,
    "customEndTime" TEXT,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "DayRoutineInstance_calendarDayId_fkey" FOREIGN KEY ("calendarDayId") REFERENCES "CalendarDay" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DayRoutineCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayRoutineInstanceId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "userNotes" TEXT,
    "effortRating" INTEGER,
    CONSTRAINT "DayRoutineCheck_dayRoutineInstanceId_fkey" FOREIGN KEY ("dayRoutineInstanceId") REFERENCES "DayRoutineInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calendarDayId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPossibleScore" REAL NOT NULL,
    "achievedScore" REAL NOT NULL,
    "disciplineRating" INTEGER NOT NULL,
    "focusRating" INTEGER NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyScore_calendarDayId_fkey" FOREIGN KEY ("calendarDayId") REFERENCES "CalendarDay" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklySummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "weekEndDate" DATETIME NOT NULL,
    "averageDiscipline" REAL NOT NULL,
    "averageFocus" REAL NOT NULL,
    "consistencyScore" REAL NOT NULL,
    "insights" TEXT,
    CONSTRAINT "WeeklySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIGenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "generationType" TEXT NOT NULL,
    "promptSummary" TEXT NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIGenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarDay_date_key" ON "CalendarDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DayRoutineCheck_dayRoutineInstanceId_key" ON "DayRoutineCheck"("dayRoutineInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyScore_calendarDayId_key" ON "DailyScore"("calendarDayId");
