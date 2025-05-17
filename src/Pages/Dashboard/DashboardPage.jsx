import React, { useState, useEffect } from 'react';
import FilePage from '../Auth/Filepage';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc
} from 'firebase/firestore';

const DashboardPage = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderStack, setFolderStack] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate('/login');
      }
    });

    const handlePopState = () => {
      navigate(0); // reload to stay on dashboard
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const userItemsRef = collection(db, 'users', user.uid, 'items');
    const q = query(userItemsRef, where('parentId', '==', currentFolderId || null));

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
      await addDoc(collection(db, 'activity'), {
        userId: user.uid,
        type,
        name,
        action: 'created',
        timestamp: new Date(),
        ...meta
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const createFolderHandler = async () => {
    const name = prompt('Enter folder name:');
    if (!name || !user) return;
    
    try {
      const userItemsRef = collection(db, 'users', user.uid, 'items');
      const docRef = await addDoc(userItemsRef, {
        type: 'folder',
        name,
        parentId: currentFolderId || null,
        createdAt: new Date()
      });

      await logActivity('folder', name, { folderId: docRef.id });
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
    }
  };

  const createFile = async () => {
    const name = prompt('Enter file name:');
    if (!name || !user) return;
    
    try {
      const userItemsRef = collection(db, 'users', user.uid, 'items');
      const docRef = await addDoc(userItemsRef, {
        type: 'file',
        name,
        parentId: currentFolderId || null,
        createdAt: new Date(),
        url: '' // Will be filled by FilePage
      });

      // Also add an entry to the global files collection for easier access
      await addDoc(collection(db, 'files'), {
        userId: user.uid,
        itemId: docRef.id,
        name,
        createdAt: new Date(),
        parentId: currentFolderId || null
      });

      await logActivity('file', name, { fileId: docRef.id });
    } catch (error) {
      console.error("Error creating file:", error);
      alert("Failed to create file. Please try again.");
    }
  };

  const openUpload = () => setShowUpload(true);
  const goBack = () => setShowUpload(false);

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      setFolderStack([...folderStack, currentFolderId]);
      setCurrentFolderId(item.id);
    } else if (item.type === 'file' && item.url) {
      window.open(item.url, '_blank');
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
    navigate('/login');
  };

  // Function to determine file icon based on file type
  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      return '📁';
    }
    
    // For files, check the content type or file extension
    if (item.contentType) {
      // Check by content type
      if (item.contentType.startsWith('image/')) {
        return '🖼️';
      } else if (item.contentType.startsWith('video/')) {
        return '🎬';
      } else if (item.contentType.startsWith('audio/')) {
        return '🎵';
      } else if (item.contentType === 'application/pdf') {
        return '📑';
      } else if (item.contentType.includes('spreadsheet') || item.contentType.includes('excel')) {
        return '📊';
      } else if (item.contentType.includes('document') || item.contentType.includes('word')) {
        return '📝';
      } else if (item.contentType.includes('presentation') || item.contentType.includes('powerpoint')) {
        return '📽️';
      }
    }
    
    // Check by file extension if content type is not available or didn't match above
    if (item.name) {
      const extension = item.name.split('.').pop().toLowerCase();
      
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
      const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
      const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
      const documentExtensions = ['doc', 'docx', 'txt', 'rtf'];
      const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];
      const presentationExtensions = ['ppt', 'pptx'];
      const codeExtensions = ['js', 'html', 'css', 'py', 'java', 'cpp', 'php'];
      const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
      
      if (imageExtensions.includes(extension)) {
        return '🖼️';
      } else if (videoExtensions.includes(extension)) {
        return '🎬';
      } else if (audioExtensions.includes(extension)) {
        return '🎵';
      } else if (extension === 'pdf') {
        return '📑';
      } else if (spreadsheetExtensions.includes(extension)) {
        return '📊';
      } else if (documentExtensions.includes(extension)) {
        return '📝';
      } else if (presentationExtensions.includes(extension)) {
        return '📽️';
      } else if (codeExtensions.includes(extension)) {
        return '👨‍💻';
      } else if (archiveExtensions.includes(extension)) {
        return '🗜️';
      }
    }
    
    // Default file icon if no match
    return '📄';
  };

  // Custom FilePage wrapper with proper file storage
  const FilePageWrapper = () => {
    const handleFileUploadSuccess = async (fileName, fileUrl, fileType, fileSize) => {
      if (!user) return;

      try {
        // 1. Add to user's items collection first
        const userItemsRef = collection(db, 'users', user.uid, 'items');
        const fileDocRef = await addDoc(userItemsRef, {
          type: 'file',
          name: fileName,
          url: fileUrl,
          contentType: fileType,
          size: fileSize,
          parentId: currentFolderId || null,
          createdAt: new Date()
        });

        // 2. Add to global files collection for easier access
        await addDoc(collection(db, 'files'), {
          userId: user.uid,
          itemId: fileDocRef.id,
          name: fileName,
          url: fileUrl,
          contentType: fileType,
          parentId: currentFolderId || null,
          createdAt: new Date()
        });

        // 3. Log activity
        await logActivity('file', fileName, { 
          fileId: fileDocRef.id,
          action: 'uploaded'
        });
        
        // 4. Go back to dashboard
        setShowUpload(false);
      } catch (error) {
        console.error("Error saving file metadata:", error);
        alert("File uploaded but metadata could not be saved properly.");
      }
    };

    // Pass the callback to your existing FilePage component
    return (
      <FilePage 
        goBack={goBack}
        onSuccess={handleFileUploadSuccess}
      />
    );
  };

  if (showUpload) return <FilePageWrapper />;

  return (
    <div className="min-h-screen w-full bg-blue-900 text-white">
      <div className="container mx-auto px-8 py-12 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">📁 My Drive</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-medium"
          >
            🔒 Logout
          </button>
        </div>

        <div className="flex justify-center gap-8 mb-6 w-full max-w-4xl">
          <button
            onClick={createFolderHandler}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-medium flex-1 max-w-xs"
          >
            + New Folder
          </button>
          <button
            onClick={createFile}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-medium flex-1 max-w-xs"
          >
            + New File
          </button>
          <button
            onClick={openUpload}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-lg font-medium flex-1 max-w-xs"
          >
            ⬆️ Upload File
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
          {items.length === 0 ? (
            <p className="text-center text-white col-span-full text-xl mt-12">
              🚫 This folder is empty
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className="cursor-pointer bg-white text-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center"
              >
                <div className="text-5xl mb-4">
                  {getFileIcon(item)}
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">
                  {item.name}
                </h3>

                {item.type === 'file' && item.url && (
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
                        : 'Unknown date'}
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