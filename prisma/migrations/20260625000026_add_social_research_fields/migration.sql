-- CreateEnum
CREATE TYPE "StatusCategory" AS ENUM ('HIGH', 'MEDIUM', 'REJECTED');

-- AlterTable
ALTER TABLE "Beneficiary" ADD COLUMN     "buildingImage" TEXT,
ADD COLUMN     "citizenAccount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "debtReason" TEXT,
ADD COLUMN     "debtsMonthly" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "disabilityIncome" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "electricityBill" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "familyMembersCount" INTEGER DEFAULT 0,
ADD COLUMN     "finalRecommendation" TEXT,
ADD COLUMN     "foodExpenses" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "healthDetails" TEXT,
ADD COLUMN     "healthStatus" TEXT,
ADD COLUMN     "houseRent" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "internetBill" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "jobIncome" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "kitchenImage" TEXT,
ADD COLUMN     "livingRoomImage" TEXT,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "medicalExpenses" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "nationalAddress" TEXT,
ADD COLUMN     "otherIncome" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "otherIncomeSource" TEXT,
ADD COLUMN     "rentContractFile" TEXT,
ADD COLUMN     "researcherId" INTEGER,
ADD COLUMN     "socialInsurance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "statusCategory" "StatusCategory",
ADD COLUMN     "transportExpenses" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "waterBill" DOUBLE PRECISION DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
