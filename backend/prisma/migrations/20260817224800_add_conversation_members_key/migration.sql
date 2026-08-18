-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "membersKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_membersKey_key" ON "Conversation"("membersKey");
