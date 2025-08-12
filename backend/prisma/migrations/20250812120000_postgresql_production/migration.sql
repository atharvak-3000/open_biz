-- CreateTable
CREATE TABLE "udyam_submissions" (
    "id" SERIAL NOT NULL,
    "aadhaar" VARCHAR(12) NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "pan" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "udyam_submissions_pkey" PRIMARY KEY ("id")
);
