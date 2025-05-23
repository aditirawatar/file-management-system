import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { auth, googleProvider } from '../../services/firebaseConfig.js'; 
import { signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


const Signup = () => {
    const navigate = useNavigate();

    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    console.log("Auth Object:", auth); 

    const signUpWithGoogle = async () => {
        setAuthing(true);

        signInWithPopup(auth, new GoogleAuthProvider())
            .then(response => {
                console.log("Google SignIn User:", response.user);
                navigate('/dashboardpage');
            })
            .catch(error => {
                console.error("Google SignIn Error:", error);
                setAuthing(false);
            });
    };

    const signUpWithEmail = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setAuthing(true);
        setError('');

        createUserWithEmailAndPassword(auth, email, password)
            .then(response => {
                console.log("New user:", response.user); 
                toast.success('Account created successfully!');
                navigate('/dashboardpage');
            })
            .catch(error => {
                console.error("Signup error:", error); 
                setError(error.message);
                setAuthing(false);
            });
    };

    return (
        <div className='w-full h-screen flex'>
            <div className='w-1/2 h-full flex flex-col bg-neutral-200 items-center justify-center'>
            </div>

            <div className='w-1/2 h-full bg-[#1a1a1a] flex flex-col p-20 justify-center'>
                <div className='w-full flex flex-col max-w-[450px] mx-auto'>
                    <div className='w-full flex flex-col mb-10 text-white'>
                        <h3 className='text-5xl font-bold mb-2'>Sign Up</h3>
                        <p className='text-lg mb-4'>Welcome! Please enter your information below to begin.</p>
                    </div>

                    <div className='w-full flex flex-col mb-6'>
                        <input
                            type='email'
                            placeholder='Email'
                            className='w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-0 focus:border-white'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type='password'
                            placeholder='Password'
                            className='w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-0 focus:border-white'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type='password'
                            placeholder='Re-Enter Password'
                            className='w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-0 focus:border-white'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className='text-red-500 mb-4'>{error}</div>}

                    <div className='w-full flex flex-col mb-4'>
                        <button
                            onClick={signUpWithEmail}
                            disabled={authing}
                            className='w-full bg-white border border-white text-black my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer'>
                            Sign Up With Email and Password
                        </button>
                    </div>

                    <div className='w-full flex items-center justify-center relative py-4'>
                        <div className='w-full h-[1px] bg-gray-500'></div>
                        <p className='text-lg absolute text-black bg-white px-2'>OR</p>
                    </div>

                    <button
                        onClick={signUpWithGoogle}
                        disabled={authing}
                        className='w-full bg-transparent border border-white text-white font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-7'>
                        Sign Up With Google
                    </button>
                </div>

                <div className='w-full flex items-center justify-center mt-10'>
                    <p className='text-sm font-normal text-gray-400'>Already have an account? <span className='font-semibold text-white cursor-pointer underline'><Link to='/Login'>Login</Link></span></p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
