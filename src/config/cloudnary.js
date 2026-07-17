require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const logger = require("../lib/logger");

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUD_NAME?.trim() &&
      process.env.API_KEY?.trim() &&
      process.env.API_SECRET?.trim(),
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME.trim(),
    api_key: process.env.API_KEY.trim(),
    api_secret: process.env.API_SECRET.trim(),
  });
} else {
  logger.warn("cloudinary.not_configured", {
    message: "Image upload endpoints requiring Cloudinary will fail until CLOUD_NAME, API_KEY, and API_SECRET are set.",
  });
}

const uploadToCloud = async function uploadToCloud(locaFilePath) {
  if (!isCloudinaryConfigured()) {
    return { message: "Fail", error: "Cloudinary is not configured." };
  }

  try {
    const mainFolderName = "public";
    const filePathOnCloudinary = `${mainFolderName}/${locaFilePath}`;

    const result = await cloudinary.uploader.upload(filePathOnCloudinary, {
      public_id: locaFilePath.split(".")[0],
      overwrite: true,
      unique_filename: true,
    });

    fs.unlinkSync(`public/${locaFilePath}`);
    return {
      message: "Success",
      url: result.secure_url,
    };
  } catch (error) {
    return { message: "Fail", error };
  }
};

module.exports = uploadToCloud;
module.exports.cloudinary = cloudinary;
module.exports.isCloudinaryConfigured = isCloudinaryConfigured;
