/*
  Warnings:

  - Added the required column `maxPoints` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('bst_insert', 'bst_remove', 'dijkstra', 'floyd', 'kruskal', 'transitive_closure');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "maxPoints" INTEGER NOT NULL,
ADD COLUMN     "type" "AssignmentType" NOT NULL;
