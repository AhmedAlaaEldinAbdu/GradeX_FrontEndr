import React from "react";
import { useTranslation } from "react-i18next";
import { FaBell, FaChevronDown } from "react-icons/fa";
import profileImage from "@gradex/assets/images/profile.png";

const Header: React.FC = () => {
   const { t } = useTranslation();

   return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
         <div className="flex items-center justify-between px-6 py-4 flex-row-reverse">
            <div className="flex items-center gap-3">
               {/* Notifications */}
               <div className="relative">
                  <button className="w-14 h-14 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                     <FaBell className="text-gray-500 text-xl" />
                     <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        1
                     </span>
                  </button>
               </div>

               {/* User Profile Dropdown */}
               <button className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                     <img
                        src={profileImage}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <span className="text-base text-gray-900 font-semibold">
                     أحمد محمد
                  </span>
                  <FaChevronDown className="text-gray-600 text-sm" />
               </button>
            </div>

            <div className="flex-1 max-w-md">
               <div className="relative">
                  <input
                     type="text"
                     placeholder={t("header.search")}
                     className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                  />
                  <svg
                     width="24"
                     height="24"
                     viewBox="0 0 24 24"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                     <path
                        d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                        fill="#878F8F"
                     />
                  </svg>
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;
