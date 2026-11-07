const prisma = require("../lib/prisma");

async function createNewUser(username, hashedPassword) {
  const newUser = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
      folders: {
        create: {
          name: "Root Folder",
        },
      },
    },
  });
}

async function findUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  return user;
}

async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      folders: {
        include: {
          subFolders: true,
          file: true,
        },
      },
    },
  });
  return user;
}

async function addNewFolder(userId, folderName, parentId) {
  await prisma.folder.create({
    data: {
      userId: userId,
      name: folderName,
      parentId: parentId,
    },
  });
}

async function deleteFolder(folderId) {
  await prisma.folder.delete({
    where: { id: folderId },
  });
}

async function findFolderByFolderId(folderId) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      subFolders: true,
      file: true,
    },
  });

  return folder;
}

async function addNewFile(parentId, file, fileUrl, publicId) {
  await prisma.file.create({
    data: {
      name: file.originalname,
      fileUrl: fileUrl,
      fileSize: file.size, //in MB round with 1 decimal place
      parentId: parentId,
      publicId: publicId,
    },
  });
}

async function findFileByFileId(fileId) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  return file;
}

async function deleteFileById(fileId) {
  await prisma.file.delete({
    where: { id: fileId },
  });
}

module.exports = {
  createNewUser,
  findUserByUsername,
  findUserById,
  addNewFolder,
  deleteFolder,
  findFolderByFolderId,
  addNewFile,
  findFileByFileId,
  deleteFileById,
};
