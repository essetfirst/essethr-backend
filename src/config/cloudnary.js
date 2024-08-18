require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.API_SECRET,
  api_key: process.env.API_KEY ? process.env.API_KEY : "929313577245663",
});

const uploadToCloud = async function (locaFilePath) {
  // locaFilePath :
  try {
    var mainFolderName = "public";
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
    console.log(locaFilePath.split(".")[0], filePathOnCloudinary);

    const result = await cloudinary.uploader.upload(filePathOnCloudinary, {
      public_id: locaFilePath.split(".")[0],
      overwrite: true,
      unique_filename: true,
    });
    // .then((result) => {
    //   console.log(result);
    fs.unlinkSync("public/" + locaFilePath);
    return {
      message: "Success",
      url: result.secure_url,
    };
  } catch (error) {
    // Remove file from local uploads folder
    return { message: "Fail",error };
  }
};

module.exports = uploadToCloud;
