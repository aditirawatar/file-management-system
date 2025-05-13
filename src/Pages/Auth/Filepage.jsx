// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { getAuth } from 'firebase/auth';
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// const FilePage = ({ goBack }) => {
//   const [file, setFile] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [uploading, setUploading] = useState(false);
//   const [downloadURL, setDownloadURL] = useState('');

//   const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/da4ngos4n/upload';
//   const UPLOAD_PRESET = 'fms_preset';

//   const auth = getAuth();
//   const user = auth.currentUser;
//   const db = getFirestore();

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//     setProgress(0);
//     setDownloadURL('');
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       toast.error('Please select a file first!');
//       return;
//     }

//     if (!user) {
//       toast.error('User not authenticated!');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', UPLOAD_PRESET);

//     try {
//       setUploading(true);
//       const res = await axios.post(CLOUDINARY_URL, formData, {
//         onUploadProgress: (progressEvent) => {
//           const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setProgress(percent);
//         },
//       });

//       const url = res.data.secure_url;
//       setDownloadURL(url);
//       toast.success('File uploaded successfully!');

//       // ✅ Save metadata to Firestore
//       await addDoc(collection(db, "files", user.uid, "files"), {
//         name: file.name,
//         url: url,
//         type: file.type,
//         size: file.size,
//         uploadedAt: serverTimestamp(),
//       });

//       toast.success('File metadata saved to Firestore!');
//     } catch (err) {
//       console.error(err);
//       toast.error('Upload or Firestore save failed!');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="w-full h-screen bg-neutral-700 text-white flex flex-col items-center justify-center p-4 relative">
//       {goBack && (
//         <button
//           onClick={goBack}
//           className="absolute top-6 left-6 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
//         >
//           ← Back
//         </button>
//       )}

//       <div className="border p-8 mx-auto border-white rounded-3xl bg-white text-black">
//         <h2 className="text-4xl font-bold mb-6">Upload Your File</h2>
//         <input type="file" onChange={handleFileChange} className="mb-4" />
//         <button
//           onClick={handleUpload}
//           disabled={uploading}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mb-4 disabled:opacity-50"
//         >
//           {uploading ? 'Uploading...' : 'Upload'}
//         </button>

//         {progress > 0 && (
//           <div className="w-full max-w-md mb-4">
//             <div className="bg-gray-300 h-4 rounded overflow-hidden">
//               <div
//                 className="bg-green-500 h-full transition-all duration-300 ease-in-out"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//             <div className="text-black text-sm mt-1 text-center">{Math.round(progress)}%</div>
//           </div>
//         )}

//         {downloadURL && (
//           <p className="text-green-600 font-semibold">
//             File uploaded!{' '}
//             <a href={downloadURL} target="_blank" rel="noopener noreferrer" className="underline">
//               View File
//             </a>
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FilePage;

// Dashboard.jsx
import React, { useState } from 'react';
import FilePage from './FilePage';

const Dashboard = () => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'upload':
        return <FilePage goBack={() => setActivePage('home')} />;
      default:
        return (
          <div className="text-white text-center p-10">
            <h1 className="text-5xl font-bold mb-4">Welcome to File Management System</h1>
            <p className="text-lg mb-6">Securely upload, store, and manage your files</p>
            <button
              onClick={() => setActivePage('upload')}
              className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Upload Page
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-neutral-800 text-white p-6">
        <h2 className="text-3xl font-bold mb-8">FMS Dashboard</h2>
        <ul className="space-y-4">
          <li>
            <button onClick={() => setActivePage('home')} className="hover:text-blue-400">
              Home
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage('upload')} className="hover:text-blue-400">
              Upload File
            </button>
          </li>
        </ul>
      </aside>

      <main className="flex-1 bg-neutral-700">{renderPage()}</main>
    </div>
  );
};

export default Dashboard;
