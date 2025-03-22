/*
  Warnings:

  - You are about to drop the `ModelInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_modelId_fkey";

-- DropTable
DROP TABLE "ModelInfo";

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
