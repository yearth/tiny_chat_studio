/*
  Warnings:

  - You are about to drop the column `modelId` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_modelId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "modelId";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "modelId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
