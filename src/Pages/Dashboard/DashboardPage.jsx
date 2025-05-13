// import React, { useState, useEffect } from 'react';
// import FilePage from '../Auth/Filepage';
// import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
// import { db } from '../../services/firebaseConfig';
// import { useNavigate } from 'react-router-dom';

// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   query,
//   where
// } from 'firebase/firestore';

// const DashboardPage = () => {
//   const [showUpload, setShowUpload] = useState(false);
//   const [items, setItems] = useState([]);
//   const [user, setUser] = useState(null);
//   const [currentFolderId, setCurrentFolderId] = useState(null);
//   const [folderStack, setFolderStack] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         setUser(firebaseUser);
//       } else {
//         navigate('/login');
//       }
//     });

//     const handlePopState = () => {
//       navigate(0); // reload to stay on dashboard
//     };

//     window.history.pushState(null, null, window.location.href);
//     window.addEventListener('popstate', handlePopState);

//     return () => {
//       unsubscribeAuth();
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [navigate]);

//   useEffect(() => {
//     if (!user) return;

//     const q = query(collection(db, 'folder'), where('userId', '==', user.uid));
//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const data = [];
//       querySnapshot.forEach((doc) => {
//         const item = doc.data();
//         const parentId = item.parentId || null;
//         if (parentId === currentFolderId) {
//           data.push({ id: doc.id, ...item });
//         }
//       });
//       setItems(data);
//     });

//     return () => unsubscribe();
//   }, [user, currentFolderId]);

//   const logActivity = async (userId, type, name, meta = {}) => {
//     await addDoc(collection(db, 'activity'), {
//       userId,
//       type,
//       name,
//       action: 'created',
//       timestamp: new Date(),
//       ...meta
//     });
//   };

//   const createFolderHandler = async () => {
//     const name = prompt('Enter folder name:');
//     if (name && user) {
//       const docRef = await addDoc(collection(db, 'folder'), {
//         type: 'folder',
//         name,
//         userId: user.uid,
//         parentId: currentFolderId || null,
//         createdAt: new Date()
//       });

//       await logActivity(user.uid, 'folder', name, { folderId: docRef.id });
//     }
//   };

//   const createFile = async () => {
//     const name = prompt('Enter file name:');
//     if (name && user) {
//       const docRef = await addDoc(collection(db, 'folders'), {
//         type: 'file',
//         name,
//         userId: user.uid,
//         parentId: currentFolderId || null,
//         createdAt: new Date(),
//         url: ''
//       });

//       await logActivity(user.uid, 'file', name, { fileId: docRef.id });
//     }
//   };

//   const openUpload = () => setShowUpload(true);
//   const goBack = () => setShowUpload(false);

//   const handleItemDoubleClick = (item) => {
//     if (item.type === 'folder') {
//       setFolderStack([...folderStack, currentFolderId]);
//       setCurrentFolderId(item.id);
//     }
//   };

//   const goBackFolder = () => {
//     const prev = folderStack.pop();
//     setFolderStack([...folderStack]);
//     setCurrentFolderId(prev || null);
//   };

//   const handleLogout = async () => {
//     const auth = getAuth();
//     await signOut(auth);
//     navigate('/login');
//   };

//   if (showUpload) return <FilePage goBack={goBack} userId={user?.uid} />;

//   return (
//     <div className="min-h-screen w-full bg-blue-900 text-white">
//       <div className="container mx-auto px-8 py-12 flex flex-col items-center">
//         <div className="w-full flex justify-between items-center mb-8">
//           <h1 className="text-4xl font-bold">📁 My Drive</h1>
//           <button
//             onClick={handleLogout}
//             className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-medium"
//           >
//             🔒 Logout
//           </button>
//         </div>

//         <div className="flex justify-center gap-8 mb-6 w-full max-w-4xl">
//           <button
//             onClick={createFolderHandler}
//             className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-medium flex-1 max-w-xs"
//           >
//             + New Folder
//           </button>
//           <button
//             onClick={createFile}
//             className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-medium flex-1 max-w-xs"
//           >
//             + New File
//           </button>
//           <button
//             onClick={openUpload}
//             className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-lg font-medium flex-1 max-w-xs"
//           >
//             ⬆️ Upload File
//           </button>
//         </div>

//         {folderStack.length > 0 && (
//           <button
//             onClick={goBackFolder}
//             className="mb-6 text-sm text-yellow-300 underline"
//           >
//             ⬅️ Go Back
//           </button>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
//           {items.length === 0 ? (
//             <p className="text-center text-white col-span-full text-xl mt-12">
//               🚫 This folder is empty
//             </p>
//           ) : (
//             items.map((item) => (
//               <div
//                 key={item.id}
//                 onDoubleClick={() => handleItemDoubleClick(item)}
//                 className="cursor-pointer bg-white text-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center"
//               >
//                 <div className="text-5xl mb-4">
//                   {item.type === 'folder' ? '📁' : '📄'}
//                 </div>
//                 <h3 className="text-lg font-semibold text-center mb-2">
//                   {item.name}
//                 </h3>

//                 {item.type === 'file' && item.url && (
//                   <a
//                     href={item.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline text-sm mb-2"
//                   >
//                     View / Download
//                   </a>
//                 )}

//                 {item.createdAt && item.createdAt.seconds && (
//                   <p className="text-xs text-gray-500">
//                     {new Date(item.createdAt.seconds * 1000).toLocaleString()}
//                   </p>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;

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
    await addDoc(collection(db, 'activity'), {
      userId: user.uid,
      type,
      name,
      action: 'created',
      timestamp: new Date(),
      ...meta
    });
  };

  const createFolderHandler = async () => {
    const name = prompt('Enter folder name:');
    if (name && user) {
      const userItemsRef = collection(db, 'users', user.uid, 'items');
      const docRef = await addDoc(userItemsRef, {
        type: 'folder',
        name,
        parentId: currentFolderId || null,
        createdAt: new Date()
      });

      await logActivity('folder', name, { folderId: docRef.id });
    }
  };

  const createFile = async () => {
    const name = prompt('Enter file name:');
    if (name && user) {
      const userItemsRef = collection(db, 'users', user.uid, 'items');
      const docRef = await addDoc(userItemsRef, {
        type: 'file',
        name,
        parentId: currentFolderId || null,
        createdAt: new Date(),
        url: '' // optionally filled by FilePage
      });

      await logActivity('file', name, { fileId: docRef.id });
    }
  };

  const openUpload = () => setShowUpload(true);
  const goBack = () => setShowUpload(false);

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      setFolderStack([...folderStack, currentFolderId]);
      setCurrentFolderId(item.id);
    }
  };

  const goBackFolder = () => {
    const prev = folderStack.pop();
    setFolderStack([...folderStack]);
    setCurrentFolderId(prev || null);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  if (showUpload) return <FilePage goBack={goBack} userId={user?.uid} currentFolderId={currentFolderId} />;

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

        {folderStack.length > 0 && (
          <button
            onClick={goBackFolder}
            className="mb-6 text-sm text-yellow-300 underline"
          >
            ⬅️ Go Back
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
                  {item.type === 'folder' ? '📁' : '📄'}
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">
                  {item.name}
                </h3>

                {item.type === 'file' && item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm mb-2"
                  >
                    View / Download
                  </a>
                )}

                {item.createdAt && item.createdAt.seconds && (
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt.seconds * 1000).toLocaleString()}
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
