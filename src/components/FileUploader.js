// src/utils/FileUploader.js
import cloudinaryUpload from "../services/cloudinaryUpload";
import { db } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const uploadFileAndSave = async (userId, file, parentFolderId = null) => {
  try {
    const fileUrl = await cloudinaryUpload(file);

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

    return { success: true, fileId };
  } catch (error) {
    console.error("Error uploading or saving file:", error);
    return { success: false };
  }
};

export default uploadFileAndSave;