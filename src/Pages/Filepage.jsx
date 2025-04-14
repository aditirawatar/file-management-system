import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

const FilePage = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setProgress(0);
    setDownloadURL('');
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file first!');
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progressVal = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressVal);
      },
      (error) => {
        toast.error(`Upload failed: ${error.message}`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);
          toast.success('File uploaded successfully!');
        });
      }
    );
  };

  return (
    <div className="w-full  h-screen bg-neutral-700 text-white flex flex-col items-center justify-center p-2">
     <div className='border p-8 mx-auto my-auto border-white rounded-3xl bg-white '>
     <h2 className="text-5xl text-black font-bold  mb-6">Upload Your File</h2>

<input
  type="file"
  onChange={handleFileChange}
  className="mb-4 text-black"
/>

<button
  onClick={handleUpload}
  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg mb-4"
>
  Upload
</button>

{progress > 0 && (
  <div className="w-full max-w-md bg-gray-700 h-4 rounded overflow-hidden mb-4">
    <div
      className="bg-green-500 h-full"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
)}

{downloadURL && (
  <p className="text-green-400">
    File uploaded! <a href={downloadURL} target="_blank" rel="noopener noreferrer" className="underline">View File</a>
  </p>
)}
     </div>
    </div>
  );
};

export default FilePage;
