import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import createFolder from "../../components/FolderCreator";
import uploadFileAndSave from "../../components/FileUploader";
import FileViewer from "../../components/FileViewer";
import loadUserData from "../../utils/loadUserData";
import { db } from "../../services/firebaseConfig";
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  collection, 
  addDoc 
} from 'firebase/firestore';

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingItem, setRenamingItem] = useState(null);
  const [newName, setNewName] = useState("");
  const [editingFile, setEditingFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [user, setUser] = useState({
    uid: null,
    username: "aditiawatar2004",
    name: "Aditia Watara",
    email: "aditiawatar2004@example.com"
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  // Load user data and files from Firebase on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => ({
          ...prev,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || "aditiawatar2004"
        }));
        
        try {
          setLoading(true);
          await debugFirestoreStructure(firebaseUser.uid);

          const userData = await loadUserData(firebaseUser.uid);
          setFolders(userData.folders || []);
          setFiles(userData.files || []);
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });
    
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleCreateFile = async () => {
    if (!user.uid) return;
    
    try {
      const newFile = {
        id: Date.now().toString(),
        name: "New File.txt",
        type: "file",
        content: "",
        parent: currentFolder,
        size: "0 KB",
        date: new Date().toLocaleDateString(),
      };
      
      // Save to Firebase
      await createFileInFirebase(user.uid, newFile);
      
      // Update local state
      setFiles(prev => [...prev, newFile]);
      setRenamingItem(newFile.id);
      setNewName("New File.txt");
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

const handleCreateFolder = async () => {
  if (!user.uid) {
    console.error('No user ID available');
    return;
  }
  
  try {
    console.log('Creating folder for user:', user.uid); // Debug log
    
    // Create folder in Firebase
    const result = await createFolder(user.uid, "New Folder", currentFolder);
    
    console.log('Create folder result:', result); // Debug log
    
    if (result.success) {
      // Create local folder object (use the same data structure as Firebase)
      const newFolder = result.folderData;
      
      // Update local state
      setFolders(prev => {
        const updated = [...prev, newFolder];
        console.log('Updated folders state:', updated); // Debug log
        return updated;
      });
      
      // Start renaming
      setRenamingItem(newFolder.id);
      setNewName("New Folder");
    } else {
      console.error('Failed to create folder:', result.error);
    }
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};

  const handleUploadFile = async () => {
  if (!user.uid) return;
  
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      try {
        // Upload to Cloudinary and save to Firebase
        const result = await uploadFileAndSave(user.uid, file, currentFolder);
        
        if (result.success) {
          console.log('Upload successful!');
          // Reload user data to get the file with URL
          const userData = await loadUserData(user.uid);
          setFolders(userData.folders || []);
          setFiles(userData.files || []);
        } else {
          console.error('Upload failed with error:', result.error);
          alert(`Upload failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Upload error: ${error.message}`);
      }
    }
  };
  input.click();
};

  const handleDelete = async (id, type) => {
    if (!user.uid) return;
    
    try {
      if (type === 'folder') {
        // Delete folder from Firebase
        await deleteFolderFromFirebase(user.uid, id);
        setFolders(prev => prev.filter(folder => folder.id !== id));
        
        // Also delete any files in this folder
        const filesToDelete = files.filter(file => file.parent === id);
        for (const file of filesToDelete) {
          await deleteFileFromFirebase(user.uid, file.id);
        }
        setFiles(prev => prev.filter(file => file.parent !== id));
      } else {
        // Delete file from Firebase
        await deleteFileFromFirebase(user.uid, id);
        setFiles(prev => prev.filter(file => file.id !== id));
      }
      
      // If we're in a folder that's being deleted, go up one level
      if (currentFolder === id) {
        const parent = [...folders, ...files].find(f => f.id === currentFolder);
        setCurrentFolder(parent ? parent.parent : null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleRename = async (id, newName, type) => {
    if (!user.uid) return;
    
    try {
      if (type === 'folder') {
        // Rename folder in Firebase
        await renameFolderInFirebase(user.uid, id, newName);
        setFolders(prev => 
          prev.map(item => 
            item.id === id ? { ...item, name: newName } : item
          )
        );
      } else {
        // Rename file in Firebase
        await renameFileInFirebase(user.uid, id, newName);
        setFiles(prev => 
          prev.map(item => 
            item.id === id ? { ...item, name: newName } : item
          )
        );
      }
      setRenamingItem(null);
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const handleOpenFile = (file) => {
  // Check if file has a URL (uploaded file) or content (text file)
  if (file.url) {
    // This is an uploaded file, show it in the viewer
    setViewingFile(file);
  } else {
    // This is a text file, open in editor
    setEditingFile(file);
    setFileContent(file.content || "");
  }
};

const handleCloseViewer = () => {
  setViewingFile(null);
};

  const handleSaveFile = async () => {
    if (editingFile && user.uid) {
      try {
        // Update file in Firebase
        await updateFileInFirebase(user.uid, editingFile.id, fileContent);
        
        // Update local state
        setFiles(prev => 
          prev.map(item => 
            item.id === editingFile.id 
              ? { 
                  ...item, 
                  content: fileContent,
                  size: `${(new Blob([fileContent]).size / 1024).toFixed(1)} KB`,
                  date: new Date().toLocaleDateString()
                } 
              : item
          )
        );
        setEditingFile(null);
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }
  };

  const handleOpenFolder = (folder) => {
    setCurrentFolder(folder.id);
  };

  const handleNavigateUp = () => {
    if (currentFolder) {
      const folder = folders.find(f => f.id === currentFolder);
      setCurrentFolder(folder ? folder.parent : null);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate("/");
    });
  };

  // Combine files and folders for display
  const allItems = [...folders, ...files];
  const filteredItems = allItems
    .filter(item => item.parent === currentFolder)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getCurrentPath = () => {
    if (!currentFolder) return "Home";
    
    let path = [];
    let current = allItems.find(f => f.id === currentFolder);
    
    while (current) {
      path.unshift(current.name);
      current = allItems.find(f => f.id === current.parent);
    }
    
    return ["Home", ...path].join(" / ");
  };

  // Count files and folders for profile stats
  const fileCount = files.length;
  const folderCount = folders.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-909 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="ml-2 text-xl font-bold text-blue-600 hover:text-blue-700"
              >
                Fileflow
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Profile Icon */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
          <div className="h-full overflow-y-auto">
            <nav className="mt-8 px-4">
              <button
                onClick={() => setActivePage("dashboard")}
                className={`w-full flex items-center px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activePage === "dashboard"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={() => setActivePage("fat32")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activePage === "fat32"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                FAT32 Implementation
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${profileOpen ? 'mr-80' : ''}`}>
          {activePage === "dashboard" ? (
            editingFile ? (
              // File Editor View
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Editing: {editingFile.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveFile}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFile(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your content here..."
                  />
                </div>
              </div>
            ) : (
              // File Browser View
              <div className="max-w-7xl mx-auto">
                {/* Mobile Search */}
                <div className="md:hidden mb-6">
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Breadcrumb Navigation */}
                <div className="mb-6 flex items-center">
                  {currentFolder && (
                    <button
                      onClick={handleNavigateUp}
                      className="flex items-center text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Up
                    </button>
                  )}
                  <span className="text-gray-600">{getCurrentPath()}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={handleCreateFile}
                    className="bg-white border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3 mx-auto">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Create File</span>
                  </button>

                  <button
                    onClick={handleCreateFolder}
                    className="bg-white border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3 mx-auto">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Create Folder</span>
                  </button>

                  <button
                    onClick={handleUploadFile}
                    className="bg-white border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3 mx-auto">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Upload File</span>
                  </button>
                </div>

                {/* Files List */}
                <div className="bg-white rounded-lg shadow">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-gray-500 text-lg">Nothing created yet</p>
                      <p className="text-gray-400 text-sm">Create or upload your first file to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {item.type === 'folder' ? (
                                    <button 
                                      onClick={() => handleOpenFolder(item)}
                                      className="flex items-center w-full text-left"
                                    >
                                      <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                      </svg>
                                      {renamingItem === item.id ? (
                                        <input
                                          type="text"
                                          value={newName}
                                          onChange={(e) => setNewName(e.target.value)}
                                          onBlur={() => handleRename(item.id, newName, item.type)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleRename(item.id, newName, item.type);
                                            }
                                          }}
                                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                      )}
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleOpenFile(item)}
                                      className="flex items-center w-full text-left"
                                    >
                                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      {renamingItem === item.id ? (
                                        <input
                                          type="text"
                                          value={newName}
                                          onChange={(e) => setNewName(e.target.value)}
                                          onBlur={() => handleRename(item.id, newName, item.type)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleRename(item.id, newName, item.type);
                                            }
                                          }}
                                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="relative">
                                  <button 
                                    className="p-1 hover:bg-gray-200 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Close any other open menus
                                      document.querySelectorAll('.file-menu').forEach(menu => {
                                        if (menu.id !== `menu-${item.id}`) {
                                          menu.classList.add('hidden');
                                        }
                                      });
                                      document.getElementById(`menu-${item.id}`).classList.toggle('hidden');
                                    }}
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>
                                  <div 
                                    id={`menu-${item.id}`} 
                                    className="file-menu absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10 hidden border border-gray-200"
                                  >
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingItem(item.id);
                                        setNewName(item.name);
                                        document.getElementById(`menu-${item.id}`).classList.add('hidden');
                                      }}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      Rename
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id, item.type);
                                        document.getElementById(`menu-${item.id}`).classList.add('hidden');
                                      }}
                                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">FAT32 Implementation</h2>
              <p className="text-gray-600">FAT32 simulation would be implemented here.</p>
            </div>
          )}
        </main>

        {/* Profile Panel */}
        {profileOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
              onClick={() => setProfileOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
                  <button 
                    onClick={() => setProfileOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{fileCount}</p>
                    <p className="text-sm text-gray-600">Files</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{folderCount}</p>
                    <p className="text-sm text-gray-600">Folders</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account Details</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-800">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Member since</p>
                      <p className="text-sm text-gray-800">December 2023</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* File Viewer Modal */}
{viewingFile && (
  <FileViewer 
    file={viewingFile} 
    onClose={handleCloseViewer} 
  />
)}
    </div>
  );
};

// Firebase utility functions
const createFileInFirebase = async (userId, fileData) => {
  try {
    const fileRef = doc(db, 'users', userId, 'files', fileData.id);
    await setDoc(fileRef, {
      ...fileData,
      userId: userId,
      createdAt: Date.now()
    });

    // Log activity
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'file',
      name: fileData.name,
      action: 'created',
      timestamp: new Date(),
      fileId: fileData.id,
      parentId: fileData.parent || null
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
};

const deleteFileFromFirebase = async (userId, fileId) => {
  try {
    const fileRef = doc(db, 'users', userId, 'files', fileId);
    await deleteDoc(fileRef);

    // Log activity
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'file',
      action: 'deleted',
      timestamp: new Date(),
      fileId: fileId
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

const deleteFolderFromFirebase = async (userId, folderId) => {
  try {
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await deleteDoc(folderRef);

    // Log activity
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'folder',
      action: 'deleted',
      timestamp: new Date(),
      folderId: folderId
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};
const renameFileInFirebase = async (userId, fileId, newName) => {
  try {
    const fileRef = doc(db, 'users', userId, 'files', fileId);
    await updateDoc(fileRef, {
      name: newName,
      updatedAt: Date.now()
    });

    // Log activity
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'file',
      action: 'renamed',
      timestamp: new Date(),
      fileId: fileId,
      newName: newName
    });

    return { success: true };
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};

const renameFolderInFirebase = async (userId, folderId, newName) => {
  try {
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await updateDoc(folderRef, {
      name: newName,
      updatedAt: Date.now()
    });

    // Log activity
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'folder',
      action: 'renamed',
      timestamp: new Date(),
      folderId: folderId,
      newName: newName
    });

    return { success: true };
  } catch (error) {
    console.error('Error renaming folder:', error);
    throw error;
  }
};

const updateFileInFirebase = async (userId, fileId, content) => {
  try {
    const fileRef = doc(db, 'users', userId, 'files', fileId);
    await updateDoc(fileRef, {
      content: content,
      size: `${(new Blob([content]).size / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString(),
      updatedAt: Date.now()
    });

    // Log activity
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'file',
      action: 'updated',
      timestamp: new Date(),
      fileId: fileId
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

// 4. Debug function to check Firestore structure
const debugFirestoreStructure = async (userId) => {
  try {
    // Check if user document exists
    const userDoc = doc(db, 'users', userId);
    console.log('User document reference:', userDoc);
    
    // Check folders subcollection
    const foldersRef = collection(db, 'users', userId, 'folders');
    const foldersSnapshot = await getDocs(foldersRef);
    console.log('Folders in Firestore:', foldersSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
    // Check files subcollection
    const filesRef = collection(db, 'users', userId, 'files');
    const filesSnapshot = await getDocs(filesRef);
    console.log('Files in Firestore:', filesSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
  } catch (error) {
    console.error('Error debugging Firestore structure:', error);
  }
};

export default DashboardPage;