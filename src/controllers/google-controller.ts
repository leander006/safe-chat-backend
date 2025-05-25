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
    const user = await prismaClient.user.create({ 
      data: {
        accountId: oauthUser.id,
        username: oauthUser.displayName,
        name: oauthUser.displayName,
        provider: oauthUser.provider,
        email: oauthUser.emails[0].value,
        status: "Public",
        profile: {
            public_id: "siyz73iq0sau89vqebhm",
            url: "https://res.cloudinary.com/dj-sanghvi-college/image/upload/v1697996657/noProfile_jjyqlm.jpg",
        },
        isVerified: JSON.parse(oauthUser._raw).email_verified,
      },
    });
    return user;
  },
};

