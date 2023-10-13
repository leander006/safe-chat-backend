const User = require("../model/User");

const googleAuthDal = {
  registerWithGoogle: async (oauthUser) => {
    const isUserExists = await User.findOne({
      accountId: oauthUser.id,
      provider: oauthUser.provider,
    });
    const emailExists = await User.findOne({
      email: oauthUser.emails[0].value,
    });
    if (isUserExists || emailExists) {
      return isUserExists != null ? isUserExists : emailExists;
    }
    const user = new User({
      accountId: oauthUser.id,
      username: oauthUser.displayName,
      name: oauthUser.displayName,
      provider: oauthUser.provider,
      email: oauthUser.emails[0].value,
      status: "Public",
      profile: {
        public_id: "siyz73iq0sau89vqebhm",
        url: "http://res.cloudinary.com/dj-sanghvi-college/image/upload/v1697165762/siyz73iq0sau89vqebhm.jpg",
      },
      isVerified: JSON.parse(oauthUser._raw).email_verified,
    });
    await user.save();
    return user;
  },
};

module.exports = googleAuthDal;
