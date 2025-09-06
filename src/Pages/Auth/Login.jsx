import { toast } from 'react-toastify';
import { useState } from "react";
import { auth, googleProvider } from '../../services/firebaseConfig'; // ✅ use centralized config
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // ✅ Google Sign-in
    const signInWithGoogle = async () => {
        setAuthing(true);

        signInWithPopup(auth, googleProvider)
            .then((response) => {
                console.log(response.user.uid);
                toast.success('Signed in with Google!');
                navigate('/dashboardpage');
            })
            .catch((error) => {
                console.error("Google login error:", error);
                setAuthing(false);
                setError(error.message);
            });
    };

    // ✅ Email/Password Sign-in
    const signInWithEmail = async () => {
        setAuthing(true);
        setError('');

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                toast.success('Logged in successfully!');
                navigate('/dashboardpage');
            })
            .catch((error) => {
                console.error("Email login error:", error);
                setError(error.message);
                setAuthing(false);
            });
    };

    return (
        <>
            <div className="w-full h-screen flex bg-neutral-800">
                <div className="w-1/2 h-full bg-neutral-200 flex flex-col p-20 justify-center">
                    <div className="w-full flex flex-col max-w-[450px] mx-auto">
                        <div className="w-full flex flex-col mb-10 text-black">
                            <h3 className="text-5xl font-bold mb-2">Login</h3>
                            <p className="text-2xl mb-4">Welcome back!</p>
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full text-black py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-0"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full text-black py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-0"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="w-full flex flex-col mb-4">
                            <button
                                className="w-full bg-black border border-black text-white my-2 py-3 font-semibold rounded-2xl"
                                onClick={signInWithEmail}
                                disabled={authing}
                            >
                                Login with email and password
                            </button>
                        </div>

                        {error && <div className="text-red-700 mb-4">{error}</div>}

                        <div className="w-full flex items-center justify-center relative py-4">
                            <div className="w-full h-[1px] bg-gray-500 "></div>
                            <p className="text-lg absolute text-white bg-black py-1 px-2">OR</p>
                        </div>

                        <button
                            className="w-full bg-white text-black font-semibold rounded-2xl my-2 py-3 text-center flex items-center justify-center cursor-pointer mt-7"
                            onClick={signInWithGoogle}
                            disabled={authing}
                        >
                            Log In With Google
                        </button>
                    </div>

                    <div className="w-full flex items-center justify-center mt-10">
                        <p className="text-sm font-normal text-black">
                            Don't have an account?{" "}
                            <span className="font-semibold cursor-pointer underline">
                                <Link to="/Signup">Sign up</Link>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
