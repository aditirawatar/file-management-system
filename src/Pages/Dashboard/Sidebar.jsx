import React from "react";

const Sidebar = ({ view, setView }) => {
  return (
    <div className="bg-gray-800 text-white  w-48 flex flex-col py-6 px-4">
      <h2 className="text-xl font-bold mb-8">📁 Menu</h2>
      <button
        onClick={() => setView("dashboard")}
        className={`py-2 px-4 mb-4 text-left rounded hover:bg-gray-700 ${
          view === "dashboard" ? "bg-gray-700" : ""
        }`}
      >
        🏠 Dashboard
      </button>
      <button
        onClick={() => setView("fat32")}
        className={`py-2 px-4 text-left rounded hover:bg-gray-700 ${
          view === "fat32" ? "bg-gray-700" : ""
        }`}
      >
        💾 FAT32 Simulator
      </button>
    </div>
  );
};

export default Sidebar;
