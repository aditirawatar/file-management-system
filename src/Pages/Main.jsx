//Front page
import React from "react";
import { Link } from "react-router-dom";
function Main() {

  return (
  
       <div className="min-h-screen bg-gray-100 text-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-500">Smart and Secure File Management System</p>
        </div>

      <section className="container mx-auto px-4 py-22 text-center">
        <h2 className="text-4xl text-gray-700 font-bold mb-4">Organize, Access, and Share Your Files Effortlessly</h2>
        <p className="text-lg text-gray-700 mb-8">
          FileFlow is your all-in-one file management solution — upload, manage, and collaborate in a secure and user-friendly environment.
        </p>
       <Link to="/Login"> <button className="bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-purple-800 transition">
          Get Started
        </button></Link>
      </section>

      <section className="bg-white py-20 my-20">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
            <p className="text-gray-600">Drag and drop files or upload directly from your device with lightning speed.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
            <p className="text-gray-600">All your files are encrypted and safely stored in the firebase with access control.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Collaborate & Share</h3>
            <p className="text-gray-600">Easily share files with teams or individuals and manage permissions in real time.</p>
          </div>
        </div>
      </section>
    </div>


  );
}

export default Main;
