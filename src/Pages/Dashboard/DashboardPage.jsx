import React, { useState, useEffect } from "react";
import FilePage from "../Auth/Filepage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  collection as firestoreCollection,
  addDoc,
  onSnapshot,
  query as firestoreQuery,
  where as firestoreWhere,
} from "firebase/firestore";

const DashboardPage = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderStack, setFolderStack] = useState([]);
  const navigate = useNavigate();
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [showFileInput, setShowFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const displayItems = showSearch && searchQuery ? searchResults : items;

  //searching
  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const userItemsRef = collection(db, "users", user.uid, "items");
      const q = query(
        userItemsRef,
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to perform search.");
    } finally {
      setIsSearching(false);
    }
  };

  // Add this useEffect for debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Recursive delete function for folders and their contents
  const deleteItem = async (item) => {
    if (!user || !item?.id) return;

    const confirmDelete = window.confirm(
      `Delete "${item.name}" and all its contents?`
    );
    if (!confirmDelete) return;

    try {
      // First check if item exists in users collection
      const userItemRef = doc(db, "users", user.uid, "items", item.id);
      const userItemSnap = await getDoc(userItemRef);

      if (!userItemSnap.exists()) {
        alert("Item not found in users collection.");
        return;
      }

      // If it's a folder, recursively delete its contents first
      if (item.type === "folder") {
        await deleteFolderContents(item.id);
      }

      // Delete from files collection if it exists there (for files only)
      if (item.type === "file") {
        const filesQuery = query(
          collection(db, "files"),
          where("itemId", "==", item.id)
        );
        const filesSnapshot = await getDocs(filesQuery);

        filesSnapshot.forEach(async (fileDoc) => {
          await deleteDoc(fileDoc.ref);
        });
      }

      // Delete all activity logs for this item
      const activityQuery = query(
        collection(db, "activity"),
        where(item.type === "file" ? "fileId" : "folderId", "==", item.id)
      );
      const activitySnapshot = await getDocs(activityQuery);

      activitySnapshot.forEach(async (activityDoc) => {
        await deleteDoc(activityDoc.ref);
      });

      // Finally delete the item itself from users collection
      await deleteDoc(userItemRef);

      alert("Item deleted successfully from all locations.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete item from all locations.");
    }
  };

  // Helper function to recursively delete folder contents
  const deleteFolderContents = async (folderId) => {
    // Get all items in this folder
    const folderItemsQuery = query(
      collection(db, "users", user.uid, "items"),
      where("parentId", "==", folderId)
    );
    const folderItemsSnapshot = await getDocs(folderItemsQuery);

    // Delete each item in the folder
    const deletePromises = [];
    folderItemsSnapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() };
      deletePromises.push(deleteItem(item)); // Recursively delete
    });

    await Promise.all(deletePromises);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/login");
      }
    });

    const handlePopState = () => {
      navigate(0); // reload to stay on dashboard
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const userItemsRef = collection(db, "users", user.uid, "items");
    const q = query(
      userItemsRef,
      where("parentId", "==", currentFolderId || null)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setItems(data);
    });

    return () => unsubscribe();
  }, [user, currentFolderId]);

  const logActivity = async (type, name, meta = {}) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "activity"), {
        userId: user.uid,
        type,
        name,
        action: "created",
        timestamp: new Date(),
        ...meta,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  //create folder ---
  const createFolderHandler = async () => {
    if (!newFolderName.trim() || !user) return;

    try {
      const userItemsRef = collection(db, "users", user.uid, "items");
      const docRef = await addDoc(userItemsRef, {
        type: "folder",
        name: newFolderName.trim(),
        parentId: currentFolderId || null,
        createdAt: new Date(),
      });

      await logActivity("folder", newFolderName.trim(), {
        folderId: docRef.id,
      });
      setNewFolderName("");
      setShowFolderInput(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
    }
  };

  // Create file --
  const createFile = async () => {
    if (!newFileName.trim() || !user) return;

    try {
      const userItemsRef = collection(db, "users", user.uid, "items");
      const docRef = await addDoc(userItemsRef, {
        type: "file",
        name: newFileName.trim(),
        parentId: currentFolderId || null,
        createdAt: new Date(),
        url: "", // Will be filled by FilePage
      });

      // Also add an entry to the global files collection
      await addDoc(collection(db, "files"), {
        userId: user.uid,
        itemId: docRef.id,
        name: newFileName.trim(),
        createdAt: new Date(),
        parentId: currentFolderId || null,
      });

      await logActivity("file", newFileName.trim(), { fileId: docRef.id });

      // Reset the form
      setNewFileName("");
      setShowFileInput(false);
    } catch (error) {
      console.error("Error creating file:", error);
      alert("Failed to create file. Please try again.");
    }
  };

  const openUpload = () => setShowUpload(true);
  const goBack = () => setShowUpload(false);

  const handleItemDoubleClick = (item) => {
    if (item.type === "folder") {
      setFolderStack([...folderStack, currentFolderId]);
      setCurrentFolderId(item.id);
    } else if (item.type === "file" && item.url) {
      window.open(item.url, "_blank");
    }
  };

  const goBackFolder = () => {
    if (folderStack.length === 0) return;

    const newStack = [...folderStack];
    const prev = newStack.pop();
    setFolderStack(newStack);
    setCurrentFolderId(prev);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate("/login");
  };

  // Function to determine file icon based on file type
  const getFileIcon = (item) => {
    if (item.type === "folder") {
      return "📁";
    }

    // For files, check the content type or file extension
    if (item.contentType) {
      // Check by content type
      if (item.contentType.startsWith("image/")) {
        return "🖼️";
      } else if (item.contentType.startsWith("video/")) {
        return "🎬";
      } else if (item.contentType.startsWith("audio/")) {
        return "🎵";
      } else if (item.contentType === "application/pdf") {
        return "📑";
      } else if (
        item.contentType.includes("spreadsheet") ||
        item.contentType.includes("excel")
      ) {
        return "📊";
      } else if (
        item.contentType.includes("document") ||
        item.contentType.includes("word")
      ) {
        return "📝";
      } else if (
        item.contentType.includes("presentation") ||
        item.contentType.includes("powerpoint")
      ) {
        return "📽️";
      }
    }

    // Check by file extension if content type is not available or didn't match above
    if (item.name) {
      const extension = item.name.split(".").pop().toLowerCase();

      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "svg",
        "webp",
      ];
      const videoExtensions = ["mp4", "mov", "avi", "wmv", "flv", "webm"];
      const audioExtensions = ["mp3", "wav", "ogg", "aac", "m4a"];
      const documentExtensions = ["doc", "docx", "txt", "rtf"];
      const spreadsheetExtensions = ["xls", "xlsx", "csv"];
      const presentationExtensions = ["ppt", "pptx"];
      const codeExtensions = ["js", "html", "css", "py", "java", "cpp", "php"];
      const archiveExtensions = ["zip", "rar", "7z", "tar", "gz"];

      if (imageExtensions.includes(extension)) {
        return "🖼️";
      } else if (videoExtensions.includes(extension)) {
        return "🎬";
      } else if (audioExtensions.includes(extension)) {
        return "🎵";
      } else if (extension === "pdf") {
        return "📑";
      } else if (spreadsheetExtensions.includes(extension)) {
        return "📊";
      } else if (documentExtensions.includes(extension)) {
        return "📝";
      } else if (presentationExtensions.includes(extension)) {
        return "📽️";
      } else if (codeExtensions.includes(extension)) {
        return "👨‍💻";
      } else if (archiveExtensions.includes(extension)) {
        return "🗜️";
      }
    }

    // Default file icon if no match
    return "📄";
  };

  // Custom FilePage wrapper with proper file storage
  const FilePageWrapper = () => {
    const handleFileUploadSuccess = async (
      fileName,
      fileUrl,
      fileType,
      fileSize
    ) => {
      if (!user) return;

      try {
        // 1. Add to user's items collection first
        const userItemsRef = collection(db, "users", user.uid, "items");
        const fileDocRef = await addDoc(userItemsRef, {
          type: "file",
          name: fileName,
          url: fileUrl,
          contentType: fileType,
          size: fileSize,
          parentId: currentFolderId || null,
          createdAt: new Date(),
        });

        // 2. Add to global files collection for easier access
        await addDoc(collection(db, "files"), {
          userId: user.uid,
          itemId: fileDocRef.id,
          name: fileName,
          url: fileUrl,
          contentType: fileType,
          parentId: currentFolderId || null,
          createdAt: new Date(),
        });

        // 3. Log activity
        await logActivity("file", fileName, {
          fileId: fileDocRef.id,
          action: "uploaded",
        });

        // 4. Go back to dashboard
        setShowUpload(false);
      } catch (error) {
        console.error("Error saving file metadata:", error);
        alert("File uploaded but metadata could not be saved properly.");
      }
    };

    // Pass the callback to your existing FilePage component
    return <FilePage goBack={goBack} onSuccess={handleFileUploadSuccess} />;
  };

  if (showUpload) return <FilePageWrapper />;

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <div className="container mx-auto px-8 py-12 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">📁 My Drive</h1>
          <button
            onClick={handleLogout}
            className="bg-white hover:bg-red-700 hover:text-white hover:cursor-pointer px-4 py-2 rounded text-black font-medium"
          >
            🔒 Logout
          </button>
        </div>

        {/* searching */}
        {showSearch && (
          <div className="w-full max-w-4xl mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files and folders..."
                className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create folder */}
        <div className="flex justify-center gap-4 mb-6 w-full max-w-4xl">
          {showFolderInput ? (
            <div className="flex flex-col items-center gap-2 bg-gray-800 p-4 rounded-xl shadow-md max-w-xs w-full">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={createFolderHandler}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowFolderInput(false);
                    setNewFolderName("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowFolderInput(true)}
              className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer px-8 py-4 rounded-lg text-xl font-bold whitespace-nowrap min-w-[180px]"
            >
              + New Folder
            </button>
          )}

          {/* create file */}
          {showFileInput ? (
            <div className="flex flex-col items-center gap-2 bg-gray-800 p-4 rounded-xl shadow-md max-w-xs w-full">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name"
                className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createFile();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={createFile}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowFileInput(false);
                    setNewFileName("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowFileInput(true)}
              className="bg-green-600 hover:bg-green-700 hover:cursor-pointer px-8 py-4 rounded-lg text-xl font-bold whitespace-nowrap min-w-[180px]"
            >
              + New File
            </button>
          )}

          <button
            onClick={openUpload}
            className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer px-8 py-4 rounded-lg text-xl font-bold whitespace-nowrap min-w-[180px]"
          >
            ⬆️ Upload File
          </button>

          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery("");
                setSearchResults([]);
              }
            }}
            className="bg-yellow-600 hover:bg-yellow-700 hover:cursor-pointer px-4 py-4 rounded-lg text-xl font-bold whitespace-nowrap min-w-[180px]"
          >
            {showSearch ? "✕ Close" : "🔍 Search"}
          </button>
        </div>

        {currentFolderId && (
          <button
            onClick={goBackFolder}
            className="mb-6 text-sm text-yellow-300 hover:text-yellow-100 underline flex items-center"
          >
            <span className="mr-1">⬅️</span> Go Back
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {displayItems.length === 0 ? (
            <p className="text-center text-white col-span-full text-xl mt-12">
              {showSearch && searchQuery
                ? "🔍 No matching items found"
                : "🚫 This folder is empty"}
            </p>
          ) : (
            displayItems.map((item) => (
              <div
                key={item.id}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className="cursor-pointer bg-white text-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center relative"
              >
                {/* dropdown menu */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(
                        openDropdownId === item.id ? null : item.id
                      );
                    }}
                    className="text-gray-600 hover:text-black text-2xl"
                  >
                    ⋮
                  </button>
                  {openDropdownId === item.id && (
                    <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item);
                          setOpenDropdownId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-5xl mb-4">{getFileIcon(item)}</div>
                <h3 className="text-lg font-semibold text-center mb-2">
                  {item.name}
                </h3>

                {item.type === "file" && item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm mb-2"
                  >
                    View / Download
                  </a>
                )}

                {item.createdAt && (
                  <p className="text-xs text-gray-500">
                    {item.createdAt instanceof Date
                      ? item.createdAt.toLocaleString()
                      : item.createdAt.seconds
                      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                      : "Unknown date"}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
