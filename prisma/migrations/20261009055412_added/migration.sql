/*
  Warnings:

  - You are about to drop the column `folderId` on the `File` table. All the data in the column will be lost.
  - Added the required column `parentId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "folderId",
ADD COLUMN     "parentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
