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
import Fat32Simulator from "./Fat32Simulator";
import {
  Home,
  HardDrive,
  FilePlus,
  FolderPlus,
  Upload,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  FolderOpen,
  FileText,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import '../../animations.css';
import Logo from '../../components/Logo';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          name: firebaseUser.displayName || firebaseUser.email,
          creationTime: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime
        };
        setUser(userData);

        try {
          setLoading(true);
          const data = await loadUserData(firebaseUser.uid);
          setFolders(data.folders || []);
          setFiles(data.files || []);
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

  const fileCount = files.length;
  const folderCount = folders.length;

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

      await createFileInFirebase(user.uid, newFile);
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
      const result = await createFolder(user.uid, "New Folder", currentFolder);

      if (result.success) {
        const newFolder = result.folderData;
        setFolders(prev => [...prev, newFolder]);
        setRenamingItem(newFolder.id);
        setNewName("New Folder");
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
        try {
          const result = await uploadFileAndSave(user.uid, file, currentFolder);

          if (result.success) {
            const userData = await loadUserData(user.uid);
            setFolders(userData.folders || []);
            setFiles(userData.files || []);
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
    input.click();
  };

  const handleDelete = async (id, type) => {
    if (!user.uid) return;

    try {
      if (type === 'folder') {
        await deleteFolderFromFirebase(user.uid, id);
        setFolders(prev => prev.filter(folder => folder.id !== id));

        const filesToDelete = files.filter(file => file.parent === id);
        for (const file of filesToDelete) {
          await deleteFileFromFirebase(user.uid, file.id);
        }
        setFiles(prev => prev.filter(file => file.parent !== id));
      } else {
        await deleteFileFromFirebase(user.uid, id);
        setFiles(prev => prev.filter(file => file.id !== id));
      }

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
        await renameFolderInFirebase(user.uid, id, newName);
        setFolders(prev =>
          prev.map(item =>
            item.id === id ? { ...item, name: newName } : item
          )
        );
      } else {
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
    if (file.url) {
      setViewingFile(file);
    } else {
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
        await updateFileInFirebase(user.uid, editingFile.id, fileContent);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <button onClick={() => navigate("/")} className="flex items-center">
                <Logo size="default" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-200 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center font-semibold hover:shadow-lg transition-all hover-lift"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside
          className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-all duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto pt-8">
            <nav className="px-3 space-y-1">
              <button
                onClick={() => setActivePage("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activePage === "dashboard"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className="w-5 h-5" />
                Dashboard
              </button>

              <button
                onClick={() => setActivePage("fat32")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activePage === "fat32"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <HardDrive className="w-5 h-5" />
                FAT32 Implementation
              </button>
            </nav>
          </div>
        </aside>

        <main className={`flex-1 p-6 transition-all duration-300 ${profileOpen ? 'mr-80' : ''}`}>
          {activePage === "dashboard" ? (
            editingFile ? (
              <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Editing: {editingFile.name}</h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveFile}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover-lift"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFile(null)}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-[500px] p-6 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                    placeholder="Start typing..."
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto animate-fadeIn">
                <div className="md:hidden mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files and folders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    {currentFolder && (
                      <button
                        onClick={handleNavigateUp}
                        className="p-2 rounded-lg hover:bg-white transition-all hover-lift"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home className="w-5 h-5" />
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium">{getCurrentPath()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={handleCreateFile}
                    className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all card-hover"
                  >
                    <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-4 mx-auto group-hover:bg-blue-600 transition-colors">
                      <FilePlus className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-gray-900 font-semibold text-lg">Create File</span>
                  </button>

                  <button
                    onClick={handleCreateFolder}
                    className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all card-hover"
                  >
                    <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4 mx-auto group-hover:bg-green-600 transition-colors">
                      <FolderPlus className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-gray-900 font-semibold text-lg">Create Folder</span>
                  </button>

                  <button
                    onClick={handleUploadFile}
                    className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all card-hover"
                  >
                    <div className="flex items-center justify-center w-14 h-14 bg-amber-100 rounded-xl mb-4 mx-auto group-hover:bg-amber-600 transition-colors">
                      <Upload className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-gray-900 font-semibold text-lg">Upload File</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No files yet</h3>
                      <p className="text-gray-500">Create or upload your first file to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {item.type === 'folder' ? (
                                    <button
                                      onClick={() => handleOpenFolder(item)}
                                      className="flex items-center gap-3 w-full text-left group"
                                    >
                                      <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                        <FolderOpen className="w-5 h-5 text-amber-600" />
                                      </div>
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
                                          className="px-3 py-1 border-2 border-blue-500 rounded-lg text-sm font-medium focus:outline-none"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</span>
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenFile(item)}
                                      className="flex items-center gap-3 w-full text-left group"
                                    >
                                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                      </div>
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
                                          className="px-3 py-1 border-2 border-blue-500 rounded-lg text-sm font-medium focus:outline-none"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{item.size}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                              <td className="px-6 py-4">
                                <div className="relative">
                                  <button
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      document.querySelectorAll('.file-menu').forEach(menu => {
                                        if (menu.id !== `menu-${item.id}`) {
                                          menu.classList.add('hidden');
                                        }
                                      });
                                      document.getElementById(`menu-${item.id}`).classList.toggle('hidden');
                                    }}
                                  >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                  </button>
                                  <div
                                    id={`menu-${item.id}`}
                                    className="file-menu absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10 hidden"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingItem(item.id);
                                        setNewName(item.name);
                                        document.getElementById(`menu-${item.id}`).classList.add('hidden');
                                      }}
                                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Rename
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id, item.type);
                                        document.getElementById(`menu-${item.id}`).classList.add('hidden');
                                      }}
                                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">FAT32 Implementation</h2>
              <Fat32Simulator />
            </div>
          )}
        </main>

        {profileOpen && user && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setProfileOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-80 bg-white/90 backdrop-blur-xl shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 overflow-y-auto animate-slideInRight">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center hover-lift">
                    <p className="text-3xl font-bold text-blue-600 mb-1">{fileCount}</p>
                    <p className="text-sm font-medium text-gray-700">Files</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center hover-lift">
                    <p className="text-3xl font-bold text-green-600 mb-1">{folderCount}</p>
                    <p className="text-sm font-medium text-gray-700">Folders</p>
                  </div>
                </div>

                <div className="mb-8 space-y-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Account Details</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Member since</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(user.creationTime).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Last login</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(user.lastSignInTime).toLocaleString()}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover-lift flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {viewingFile && (
        <FileViewer
          file={viewingFile}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

const createFileInFirebase = async (userId, fileData) => {
  try {
    const fileRef = doc(db, 'users', userId, 'files', fileData.id);
    await setDoc(fileRef, {
      ...fileData,
      userId: userId,
      createdAt: Date.now()
    });

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

export default DashboardPage;
