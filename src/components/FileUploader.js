// src/components/FileUploader.js
import cloudinaryUpload from "../utils/cloudinaryUpload";
import { db } from "../firebaseConfig";
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
      createdAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error("Error uploading or saving file:", error);
    return { success: false };
  }
};

export default uploadFileAndSave;
