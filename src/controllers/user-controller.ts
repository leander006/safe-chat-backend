import prismaClient from "../config/prisma";


export const userDal = {

    
    getOnlineUsers: async (id:string) => {
        const users = await prismaClient.user.findMany({
        where: {
            id: {
                not: id,
            }   
        },
        });
        return users;
    },
    deleteUser: async (id: string) => {
        const deletedUser = await prismaClient.user.delete({
        where: {
            id,
        },
        });
        return deletedUser;
    },
    };
