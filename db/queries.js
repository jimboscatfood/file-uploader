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

module.exports = {
  createNewUser,
  findUserByUsername,
  findUserById,
  addNewFolder,
  deleteFolder,
  findFolderByFolderId,
};
