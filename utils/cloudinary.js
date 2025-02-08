const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: "dlxrojwkw",
  api_key: "486154395265794",
  api_secret: "-n2xYO_W3sTyllmd2hel28dkTUE",
  secure: true,
});



















const uploadOncloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Upload successful:", response.secure_url);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted:", localFilePath);
    }

    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted after failed upload:", localFilePath);
    }

    return null;
  }
};

module.exports = { uploadOncloudinary };
