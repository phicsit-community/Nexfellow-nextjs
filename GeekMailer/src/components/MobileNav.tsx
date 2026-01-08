"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearUser } from "@/lib/store/slices/userSlice";
import { FiHome, FiMail, FiSend, FiUsers, FiLogOut } from "react-icons/fi";

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

export default function MobileNav() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const navItems: NavItem[] = [
    { path: "/", icon: <FiHome size={20} />, label: "Home" },
    { path: "/send-email", icon: <FiSend size={20} />, label: "Send" },
    { path: "/view-emails", icon: <FiMail size={20} />, label: "Emails" },
    { path: "/contact", icon: <FiUsers size={20} />, label: "Contacts" },
  ];

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.clear();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <FiLogOut size={20} />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
}
