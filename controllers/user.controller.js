const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const { uploadOncloudinary } = require("../utils/cloudinary.js");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    console.log(userId);

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    console.log(accessToken);

    const refreshToken = user.generateRefreshToken();
    console.log(refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

const registerUser = async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !email || !password || !fullName)
    return res.status(400).json({ msg: "all fields required" });
  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "User already exist" });

  const avatarLocal = req.files?.avatar?.[0]?.path;
  if (!avatarLocal) return res.status(400).json({ msg: "avatar required" });
  const coverLocal = req.files?.coverImage?.[0]?.path;
  const avatarUrl = await uploadOncloudinary(avatarLocal);
  const coverImg = coverLocal ? await uploadOncloudinary(coverLocal) : "";
  if (!avatarUrl) return res.status(400).json({ msg: "not found avatr" });

  const userData = await User.create({
    username,
    email,
    password,
    fullName,
    avatar: avatarUrl,
    coverImage: coverImg?.url || "",
  });
  res.status(201).json({ msg: "Success", userData });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: "all fields required" });
  const user = await User.findOne({ $or: [{ email }, { password }] });
  if (!user) return res.status(404).json({ msg: "User not found" });
  const checkPassword = await user.isPasswordCorrect(password);
  if (!checkPassword) return res.status(400).json({ msg: "password wrong" });
  console.log(user._id);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json({
      msg: "success",
      user,
      accessToken,
      refreshToken,
    });
};

const logout = async (req, res, next) => {
  console.log(req.user._id);

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  console.log(req.user);

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ msg: "Done" });
};

const refreshAccToken = async (req, res) => {
  const incomingRefreshToken =
    (await req.cookies?.refreshToken) || req.body.refreshToken;
  if (!incomingRefreshToken)
    return res.status(404).json({ msg: "No refresh token" });
  const decoded = jwt.verify(incomingRefreshToken, "1222323ddffd");
  const user = User.findById(decoded._id);
  if (!user) return res.status(404).json({ msg: "No User" });
  if (incomingRefreshToken !== user?.refreshToken)
    return res.status(400).json({ msg: "token not matched" });
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json({ accessToken, refreshToken });
};

const changeCurrentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isCorrect = user.isPasswordCorrect(oldPassword);
  if (!isCorrect) return res.status(400).json({ msg: "Incorrect pswd" });
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(201).json({ msg: "password changed succesfully" });
};
const getCurrentUser = async (req, res) => {
  return res.status(201).json({ data: req.user });
};

const updateUserDetails = async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email)
    return res.status(404).json({ msg: "All field required" });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { username, email } },
    { new: true }
  ).selesct("-password");
  return res.status(201).json({ data: user, msg: "updated" });
};

const getUserChannelProfile = async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    return res.status(400).json({ msg: "username required" });
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "_id",
        as: "result",
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields:{
        subscriberCount:{
          $size:"$subscribers"
        }
      }
    }
  ]);
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  refreshAccToken,
  getCurrentUser,
  changeCurrentPassword,
  updateUserDetails,
  getUserChannelProfile,
};
