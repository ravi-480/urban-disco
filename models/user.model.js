const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const secrethash = "112asdsassa";
const refreshSecret = "1222323ddffd";



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  const token = bcrypt.compare(password, this.password);
  return token
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, secrethash, {
    expiresIn: "1h",
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, refreshSecret, {
    expiresIn: "10d",
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
