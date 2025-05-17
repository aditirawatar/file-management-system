import axios from "axios";

const CLOUD_NAME = "da4ngos4n";  
const UPLOAD_PRESET = "fms_preset"; 

// Cloudinary upload function
const cloudinaryUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET); 

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;  // Return the URL of the uploaded file
  } catch (error) {
    console.error("Error uploading file to Cloudinary", error);
    throw new Error("File upload failed");
  }
};

export default cloudinaryUpload;
