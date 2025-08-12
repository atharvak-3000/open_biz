-- CreateTable
CREATE TABLE "udyam_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aadhaar" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
