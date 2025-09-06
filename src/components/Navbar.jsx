// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

function Navbar() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  const getAvatarLetter = () => {
    const name = user?.displayName?.trim() || user?.email?.trim() || "";
    return name ? name.charAt(0).toUpperCase() : "U";
    };

  return (
    <>
      <div className="flex justify-between items-center text-gray-700 border-b border-gray-400 bg-gray-100 py-3 px-6 m-0">
        <Link to="/" className="text-3xl font-bold">Fileflow</Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* While loading auth state, keep layout stable */}
          {loadingUser ? (
            <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
          ) : user ? (
            // Logged-in: show circular profile icon
            <Link
              to="/dashboardpage"
              className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold hover:opacity-90 transition"
              title={user.displayName || user.email || "Profile"}
            >
              {getAvatarLetter()}
            </Link>
          ) : (
            // Logged-out: show Login link (unchanged behavior)
            <Link to="/Login" className="text-3xl font-bold">Login</Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
