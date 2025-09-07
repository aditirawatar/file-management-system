// src/utils/FileUploader.js
import cloudinaryUpload from "../services/cloudinaryUpload";
import { db } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const uploadFileAndSave = async (userId, file, parentFolderId = null) => {
  try {
    console.log('Starting upload for:', file.name, 'Size:', file.size, 'bytes');
    
    const fileUrl = await cloudinaryUpload(file);
    console.log('Got URL from Cloudinary:', fileUrl);
    
    console.log('Saving to Firestore...');

    const fileId = uuidv4();
    const fileRef = doc(db, "users", userId, "files", fileId);
    await setDoc(fileRef, {
      id: fileId,
      name: file.name,
      type: "file",
      url: fileUrl,
      parent: parentFolderId,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString(),
      createdAt: new Date()
    });

    console.log('File saved successfully to Firestore!');
    return { success: true, fileId };
  } catch (error) {
    console.error("Detailed error in uploadFileAndSave:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return { success: false, error: error.message };
  }
};

export default uploadFileAndSave;