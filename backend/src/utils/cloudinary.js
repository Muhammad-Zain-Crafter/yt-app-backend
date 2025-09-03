import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"

dotenv.config()
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
    // console.log("File uploaded successfully on cloudinary", response.url);

     // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
      return response;

  } catch (error) {
    fs.unlinkSync(filePath); // remove the file from local
    return null;
  }
};

const deleteFromCloudinary = async (public_id, resource_type="image") => {
    try {
        if (!public_id) {
          return null;
        }
        //delete file from cloudinary
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        });
        return result
    } catch (error) {
        console.log("delete on cloudinary failed", error);
        return error;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };