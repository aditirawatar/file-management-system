import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import Logo from "./Logo";
import { LogIn } from "lucide-react";
import '../animations.css';

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
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center hover-lift">
            <Logo size="default" />
          </Link>

          <div className="flex items-center gap-4">
            {loadingUser ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <Link
                to="/dashboardpage"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold hover:shadow-lg transition-all hover-lift"
                title={user.displayName || user.email || "Profile"}
              >
                {getAvatarLetter()}
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover-lift"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
