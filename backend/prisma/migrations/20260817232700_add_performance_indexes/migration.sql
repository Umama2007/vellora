-- CreateIndex
CREATE INDEX "User_isPrivate_idx" ON "User"("isPrivate");

-- CreateIndex
CREATE INDEX "Post_published_visibility_idx" ON "Post"("published", "visibility");
