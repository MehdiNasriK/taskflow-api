import catchAsync from "../../shared/utils/catchAsync.js";
import AppError from "../../shared/utils/error.js";
import prisma from "../../shared/config/prisma.js";
import console from "node:console";

const creatWorkspace = catchAsync(async(req, res, next) => {
    const workspace = await prisma.workspace.create({
        data: {
            name: req.body.name,
            ownerId: req.user.id
        }
    })

    res.json({
        workspace,
    })
})


export default {
    creatWorkspace,
}