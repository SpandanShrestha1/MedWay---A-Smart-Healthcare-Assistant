import cloudinary from "cloudinary";
import multer from "multer";

cloudinary.v2.config({
  cloud_name: "desdw1dzw",
  api_key: "551326344413366",
  api_secret: "mkQve4-xfqbTbu3rBBGsC5UWB5U",
});

const storage = new multer.memoryStorage();

export async function imageUploadUtil(file) {
  const result = await cloudinary.v2.uploader.upload(file, {
    resource_type: "auto",
  });
  return result;
}

export const upload = multer({ storage });
export default imageUploadUtil;
