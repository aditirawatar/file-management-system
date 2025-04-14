import React from "react";
import { Link } from "react-router-dom";
function Main() {

  return (
    <div className="border border-neutral-300 rounded-3xl w-[400px] px-3 py-3 text-center mx-auto my-32 bg-neutral-500">
      <h1 className="text-3xl font-bold text-white mb-3 mt-6">Welcome!</h1>
      <p className="text-white mb-6">
        Let's play with files. You can create or upload files, folders, data, images, your code files.
      </p>
     <Link to="/Login"> <button
        className="bg-black text-white font-semibold px-7 py-3 rounded-4xl border-0 mb-3"
      >
        Login
      </button></Link>
    </div>
  );
}

export default Main;
