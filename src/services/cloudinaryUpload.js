import axios from "axios";

const CLOUD_NAME = "da4ngos4n";
const UPLOAD_PRESET = "fms_preset";

// Cloudinary upload function
const cloudinaryUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("resource_type", "auto"); // This allows all file types

  try {
    // IMPORTANT: Changed from /image/upload to /auto/upload
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      formData
    );

    console.log("Upload successful:", response.data.secure_url);
    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    console.error("Error response:", error.response?.data);
    throw new Error(
      `File upload failed: ${
        error.response?.data?.error?.message || error.message
      }`
    );
  }
};

export default cloudinaryUpload;
