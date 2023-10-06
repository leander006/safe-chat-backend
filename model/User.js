const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const { JWT_KEY } = require("../config/serverConfig");

const UserSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
    },
    provider: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profile: {
      public_id: String,
      url: String,
    },
    bio: {
      type: String,
      default: "",
    },
    isVerified: {
      type: String,
      default: false,
    },
  },
  { timestamps: true }
);

// UserSchema.pre("save", function (next) {
//   const user = this;
//   const encryptedPassword = bcrypt.hashSync(user.password, "SALT");
//   user.password = encryptedPassword;
//   next();
// });

// UserSchema.methods.comparePassword = function compare(password) {
//   return bcrypt.compareSync(password, this.password);
// };

UserSchema.methods.genJWT = function generate() {
  return JWT.sign({ id: this._id, email: this.email }, JWT_KEY, {
    expiresIn: "1h",
  });
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
