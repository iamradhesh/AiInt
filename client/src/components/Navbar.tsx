import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../types/user";
import { motion, AnimatePresence } from "framer-motion";
import { BsRobot, BsCoin } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";
import { HiOutlineLogout, HiOutlineClipboardList } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const ServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
import { setUserData } from "../redux/userSlice";
import AuthModel from "./AuthModel";

const popupVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.1 } },
};

const Navbar = () => {
  const user = useSelector((state: RootState) => state.user.userData);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const creditRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (creditRef.current && !creditRef.current.contains(target))
        setShowCreditPopup(false);
      if (userRef.current && !userRef.current.contains(target))
        setShowUserPopup(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        ServerUrl + "/api/auth/logout",
        {},
        { withCredentials: true },
      );

      //   console.log(res.data); // check this

      dispatch(setUserData(null));
     // navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const toggleCredit = () => {
    setShowCreditPopup((p) => !p);
    setShowUserPopup(false);
  };

  const toggleUser = () => {
    setShowUserPopup((p) => !p);
    setShowCreditPopup(false);
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-3 sm:px-4 pt-4 sm:pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-sm
          border border-gray-200 px-4 sm:px-8 py-3 sm:py-4
          flex justify-between items-center"
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0"
        >
          <div className="bg-black text-white p-2 rounded-lg flex-shrink-0">
            <BsRobot size={18} />
          </div>
          <h1 className="font-semibold text-sm sm:text-lg truncate">
            InterviewIQ.AI
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Credits */}
          <div className="relative" ref={creditRef}>
            <button
              onClick={toggleCredit}
              className="flex items-center gap-1 sm:gap-2 bg-gray-100
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                text-sm hover:bg-gray-200 transition"
            >
              <BsCoin size={16} />
              <span className="font-medium">{user?.credits ?? 0}</span>
            </button>

            <AnimatePresence>
              {showCreditPopup && (
                <motion.div
                  variants={popupVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-12 w-56 sm:w-64
                    bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-black text-white p-1.5 rounded-lg">
                      <BsCoin size={14} />
                    </div>
                    <h2 className="text-sm font-semibold">Your Credits</h2>
                  </div>

                  <p className="text-3xl font-bold mb-0.5">
                    {user?.credits ?? 0}
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    credits remaining
                  </p>

                  {/* Simple credit bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                    <div
                      className="bg-black h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((user?.credits ?? 0) / 20) * 100, 100)}%`,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                       
                        return;
                      }
                      navigate("/pricing");
                      setShowCreditPopup(false);
                    }}
                    className="w-full bg-black text-white py-2 rounded-full
                      text-sm hover:bg-gray-800 transition"
                  >
                    Buy Credits
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="relative" ref={userRef}>
            <button
              onClick={toggleUser}
              className="w-9 h-9 bg-black text-white rounded-full
                flex items-center justify-center font-semibold
                hover:bg-gray-800 transition text-sm flex-shrink-0"
            >
              {user ? (
                user.name.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            <AnimatePresence>
              {showUserPopup && (
                <motion.div
                  variants={popupVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-12 w-48 sm:w-56
                    bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50"
                >
                  {/* User info header */}
                  {user && (
                    <div className="px-3 py-2 mb-1 border-b border-gray-100">
                      <p className="font-semibold text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                       
                        return;
                      }
                      navigate("/history");
                      setShowUserPopup(false);
                    }}
                    className="flex items-center gap-2 w-full text-left
                      px-3 py-2 text-sm rounded-xl hover:bg-gray-100 transition"
                  >
                    <HiOutlineClipboardList
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    Interview History
                  </button>

                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                       
                        return;
                      }
                      handleLogout();
                      setShowUserPopup(false);
                    }}
                    className="flex items-center gap-2 w-full text-left
    px-3 py-2 text-sm rounded-xl hover:bg-red-50 transition text-red-500"
                    aria-label="Logout"
                  >
                    <HiOutlineLogout size={16} className="flex-shrink-0" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      {showAuthModal && (
        <AuthModel onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Navbar;
