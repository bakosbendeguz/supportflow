/*
  Warnings:

  - You are about to drop the column `assignedId` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `assigneeId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_assignedId_fkey";

-- DropIndex
DROP INDEX "Ticket_assignedId_idx";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "assignedId",
ADD COLUMN     "assigneeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Ticket_assigneeId_idx" ON "Ticket"("assigneeId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
