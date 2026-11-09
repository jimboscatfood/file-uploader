-- CreateTable
CREATE TABLE "Sharedfolder" (
    "id" TEXT NOT NULL,
    "sharedToken" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sharedfolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sharedfolder_sharedToken_key" ON "Sharedfolder"("sharedToken");

-- AddForeignKey
ALTER TABLE "Sharedfolder" ADD CONSTRAINT "Sharedfolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
