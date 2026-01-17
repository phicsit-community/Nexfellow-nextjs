"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FiSearch, FiBell } from "react-icons/fi";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user.user);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          throw new Error("User ID is missing");
        }
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [pathname]);

  const handleRedirect = () => {
    router.push("/profile");
  };

  const showSearchBar =
    pathname === "/view-emails" || pathname === "/contact";

  return (
    <header className="flex justify-between items-center h-20 w-full box-border fixed z-10 bg-white border-b border-gray-100 max-w-367.5 mx-auto">
      {/* Logo Section */}
      <div className="h-full px-6 border-r border-gray-200 flex items-center min-w-[208px]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/GeekClashLogo.svg"
            alt="Geek Clash"
            width={140}
            height={32}
            priority
          />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex box-border px-8 justify-between items-center">
        {/* Search Bar - Centered */}
        <div className="flex-1 flex justify-center">
          {showSearchBar && (
            <div className="w-full max-w-md flex items-center border border-gray-300 rounded-full px-4 py-2.5 gap-2 bg-white">
              <FiSearch className="text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-lg outline-none text-sm border-none bg-transparent placeholder-gray-400"
              />
            </div>
          )}
        </div>

        {/* Right Right Section */}
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          {showSearchBar && (
            <div onClick={toggleModal} className="cursor-pointer">
              {isModalOpen ? (
                <FiBell size={22} className="text-teal-500" />
              ) : (
                <FiBell size={22} className="text-gray-600 hover:text-gray-900" />
              )}
            </div>
          )}

          {/* User Profile Avatar */}
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : error ? (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
              ?
            </div>
          ) : (
            user && (
              <div
                onClick={handleRedirect}
                className="cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-100 bg-teal-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {typeof user === "string" ? user.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
