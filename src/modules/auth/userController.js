import console from "node:console";
import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

const creatUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
  

  res.status(200).json({
    status: 'success',
    user,
  })
};

const deleteUser = async (req, res, next) => {
    const id = req.params.id * 1
    const user = await prisma.user.delete({
        where: {
            id,
        }
    })

    if(!user) {
      res.status(200).json({
        staus: 'success',
        user,
    })
    }

    
}

const getAllUser = async (req, res, next) => {
    const users = await prisma.user.findMany()

    res.status(200).json({
        staus: 'success',
        users,
    })
}

// const updateUser = async (req, res, next) => {
//   const id = req.params.id * 1
//   const user = await prisma.user.update({
//     where: {
//       id,
//     }
//   })
// }

export default {
    creatUser,
    deleteUser,
    getAllUser,
}
