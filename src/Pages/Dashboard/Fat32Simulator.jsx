import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebaseConfig';

const BLOCK_SIZE_KB = 4;

const Fat32Simulator = () => {
  const [userItems, setUserItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userItemsRef = collection(db, 'users', user.uid, 'items');
      const q = query(userItemsRef);
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setUserItems(items);
    };

    fetchData();
  }, []);

  const calculateBlocks = (sizeKB) => {
    return Math.ceil((sizeKB || 1) / BLOCK_SIZE_KB);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    const totalBlocks = 32;
    const requiredBlocks = calculateBlocks(item.size);
    const allocated = Array(totalBlocks).fill({ occupied: false });

    let filled = 0;
    for (let i = 0; i < totalBlocks && filled < requiredBlocks; i++) {
      if (!allocated[i].occupied) {
        allocated[i] = {
          occupied: true,
          file: item.name,
          type: item.type,
        };
        filled++;
      }
    }
    setBlocks(allocated);
  };

  const getBlockColor = (type) => {
    if (type === 'folder') return 'bg-blue-500';
    if (type === 'file') return 'bg-yellow-400';
    return 'bg-green-500'; // upload or unknown
  };

  return (
    <div className="bg-gray-800 p-6 my-10 rounded-lg text-white shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🔧 FAT32 Simulator</h2>

      {/* Files & Folders List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {userItems.map((item) => {
          const blocksNeeded = calculateBlocks(item.size);
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded text-sm text-left truncate"
              title={item.name}
            >
              <div className="font-semibold">
                {item.name.length > 15 ? `${item.name.slice(0, 15)}...` : item.name}
              </div>
              <div className="text-xs text-gray-300">📦 {blocksNeeded} blocks</div>
            </button>
          );
        })}
      </div>

      {/* Block Info on Click */}
      {selectedItem && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Selected: {selectedItem.name}
          </h3>
          <p className="text-sm mb-2 text-gray-300">
            📁 Type: {selectedItem.type}<br />
            📦 Size: {selectedItem.size || "Unknown"} KB<br />
            🔢 Blocks: {calculateBlocks(selectedItem.size)}<br />
            📅 Created At:{" "}
            {selectedItem.createdAt?.seconds
              ? new Date(selectedItem.createdAt.seconds * 1000).toLocaleString()
              : "Unknown"}
          </p>

          <div className="grid grid-cols-8 gap-2 mt-4">
            {blocks.map((block, index) => (
              <div
                key={index}
                className={`w-8 h-8 text-xs flex items-center justify-center rounded ${
                  block.occupied ? getBlockColor(block.type) : 'bg-gray-500'
                }`}
              >
                {block.occupied ? '📄' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Fat32Simulator;
