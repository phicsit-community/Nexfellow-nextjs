"use client";

import { FiUserPlus, FiMail, FiUsers, FiList, FiClock } from "react-icons/fi";

interface CardProps {
  count: number | string;
  text: string;
  icon?: "users" | "mail" | "list" | "clock" | "userPlus";
}

const iconMap = {
  users: <FiUsers size={24} className="text-gray-600" />,
  mail: <FiMail size={24} className="text-gray-600" />,
  list: <FiList size={24} className="text-gray-600" />,
  clock: <FiClock size={24} className="text-gray-600" />,
  userPlus: <FiUserPlus size={24} className="text-gray-600" />,
  default: <FiUserPlus size={24} className="text-gray-600" />,
};

export default function Card({ count, text, icon }: CardProps) {
  const Icon = icon ? iconMap[icon] : iconMap.default;

  return (
    <div className="w-full rounded-xl flex justify-between items-center bg-gray-50 border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      <div className="flex flex-col gap-1">
        <h4 className="text-2xl font-bold text-gray-900">
          {count ?? 0}
        </h4>
        <p className="text-sm font-normal text-gray-500 leading-tight">{text}</p>
      </div>
      <div className="flex items-center justify-center w-10 h-10">
        {Icon}
      </div>
    </div>
  );
}
