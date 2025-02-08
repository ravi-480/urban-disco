const jwt = require("jsonwebtoken");
const User = require("../models/user.model")
const verify = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(404).json({ msg: "Erro" });
  }
  const val = jwt.verify(token, "112asdsassa");
  const user = await User.findOne(val._id);
  if (!user) {
    return res.status(404).json({ msg: "Error no user" });
  }
  req.user = user;
  
  next()

};

module.exports = {verify}
