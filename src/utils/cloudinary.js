import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      return null;
    }
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("File uploaded successfully on cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(filePath); // remove the file from local
    return null;
  }
};

export { uploadOnCloudinary };