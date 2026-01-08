"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";
import { clearUser } from "@/lib/store/slices/userSlice";
import { FiArrowLeft, FiUser, FiMail, FiLogOut, FiKey } from "react-icons/fi";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="relative overflow-x-hidden w-full max-w-4xl min-h-screen px-8 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm cursor-pointer"
      >
        <FiArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden max-w-2xl border border-gray-100">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center text-white text-3xl font-bold backdrop-blur-xs">
              {typeof user === "string" ? user.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-semibold">Admin User</h2>
              <p className="text-white/80 text-sm mt-1">GeekMailer Administrator</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="p-2 bg-white rounded-lg text-gray-500 shadow-xs">
              <FiUser size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">User ID</p>
              <p className="font-medium text-gray-900 mt-0.5">
                {typeof user === "string" ? user : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="p-2 bg-white rounded-lg text-gray-500 shadow-xs">
              <FiMail size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Role</p>
              <p className="font-medium text-gray-900 mt-0.5">Administrator</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 space-y-4">
          <button
            onClick={() => toast.info("Password change feature coming soon")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
          >
            <FiKey size={18} />
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium shadow-sm hover:shadow-md cursor-pointer"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
