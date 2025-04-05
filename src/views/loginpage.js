import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { useAuth } from '../context/authContext';
import { firbaseAuth } from "../firebase/config";
import { doSignInWithEmailAndPassword } from '../firebase/authentication';

export const signOut = async () => {
    try {
        await firbaseAuth.signOut();
    } catch (error) {
        throw error;
    }
}

function LoginPage() {
    const { currentUser, userLoggedIn } = useAuth();
    console.log('LoginPage', currentUser?.email);
    console.log('LoginPage', userLoggedIn);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (userLoggedIn) {
            navigate('/dashboard'); // Redirect to dashboard or any other page
        }
    }, [userLoggedIn]);


    const handleLogin = async (e) => {
        debugger
        e.preventDefault();
        if (!userLoggedIn) {
            try {
                const userCredential = await doSignInWithEmailAndPassword(username, password);
                return userCredential.user;
            } catch (error) {
                setError(true);
            }

        }
        else {
            console.log('User already logged in:', currentUser.email);
            navigate('/dashboard');
        }
    };

    return (
        <>
            <Header />
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-96">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">User id/ password incorrect!</p>}
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default LoginPage;