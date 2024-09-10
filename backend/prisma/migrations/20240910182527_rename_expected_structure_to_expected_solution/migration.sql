/*
  Warnings:

  - You are about to drop the column `expectedStructure` on the `Assignment` table. All the data in the column will be lost.
  - Added the required column `expectedSolution` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "expectedStructure",
ADD COLUMN     "expectedSolution" JSONB NOT NULL,
ALTER COLUMN "stepsEnabled" SET DEFAULT false;
