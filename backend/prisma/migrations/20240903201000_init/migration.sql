-- CreateEnum
CREATE TYPE "DataStructure" AS ENUM ('graph', 'tree');

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "stepsEnabled" BOOLEAN NOT NULL,
    "dataStructure" "DataStructure" NOT NULL,
    "initialStructure" JSONB NOT NULL,
    "expectedStructure" JSONB NOT NULL,
    "graphConfiguration" JSONB NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);
