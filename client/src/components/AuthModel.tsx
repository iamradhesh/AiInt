import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../types/user";
import { FaTimes } from "react-icons/fa";
import Auth from "../pages/Auth";

const AuthModel = ({ onClose }: { onClose: () => void }) => {
  const userData = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    if (userData) {
      onClose();
    }
  }, [userData, onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}  // prevent overlay close
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
        >
          <FaTimes size={18} />
        </button>

        <Auth isModal={true} />
      </div>
    </div>
  );
};

export default AuthModel;