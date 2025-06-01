import prismaClient from "../config/prisma";

export const googleAuthDal = {
  registerWithGoogle: async (oauthUser: { id: string; provider: string; displayName: string; emails: { value: string }[]; _raw: string }) => {

    const isUserExists = await prismaClient.user.findUnique({
      where: {
          accountId: oauthUser.id,
          provider: oauthUser.provider,
        },
    });
    const emailExists = await prismaClient.user.findUnique({
      where: {
        email: oauthUser.emails[0].value,
      },
    });
    if (isUserExists || emailExists) {
      return isUserExists != null ? isUserExists : emailExists;
    }
    const randomSeed = Math.random().toString(36).substring(2, 15);
    let avatarUrl = `https://robohash.org/${randomSeed}.png`;
    if(!avatarUrl){
      avatarUrl ="https://res.cloudinary.com/dj-sanghvi-college/image/upload/v1748543403/utw8hnyvr3i_tlg2al.png"
    }    
    const user = await prismaClient.user.create({ 
      data: {
        id: oauthUser.id,
        accountId: oauthUser.id,
        username: oauthUser.displayName,
        provider: oauthUser.provider,
        email: oauthUser.emails[0].value,
        status: "Public",
        profile:avatarUrl,
        isVerified: JSON.parse(oauthUser._raw).email_verified,
      },
    });
    return user;
  },
};

