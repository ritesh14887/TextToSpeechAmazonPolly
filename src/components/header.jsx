import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doSignOut } from '../firebase/authentication';
import { useAuth } from '../context/authContext';

export const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const handleLogout = () => {
    if (userLoggedIn) {
      doSignOut();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-[#ebebeb]">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-[12px]">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={process.env.PUBLIC_URL + "/app-logo.png"} className="h-8" alt="TTS Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white text-[16px]">
            Text to Speech Tool
          </span>
        </a>
        {userLoggedIn && (
          <button onClick={handleLogout} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
            <img src={process.env.PUBLIC_URL + "/logout.png"} className="h-8" alt="Logout Logo" />
          </button>
        )}
      </div>
    </nav>
  );
};