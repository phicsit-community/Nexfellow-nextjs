"use client";

interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

interface ContactTableProps {
  users: User[];
}

export default function ContactTable({ users }: ContactTableProps) {
  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No contacts found. Add your first contact!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Name
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Username
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {users.map((user, index) => (
            <tr
              key={user._id}
              className={`hover:bg-gray-50 transition-colors ${index !== users.length - 1 ? "border-b border-gray-100" : ""
                }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                {user.username || user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                {user.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
