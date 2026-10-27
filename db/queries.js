const prisma = require("../lib/prisma");

async function createNewUser(username, hashedPassword) {
  const newUser = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
      masterFolder: {
        create: {
          name: "Master Folder",
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
      masterFolder: {
        include: {
          subFolders: true,
          file: true,
        },
      },
    },
  });
  return user;
}

module.exports = {
  createNewUser,
  findUserByUsername,
  findUserById,
};
