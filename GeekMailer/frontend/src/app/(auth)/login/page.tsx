"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/lib/store/slices/userSlice";
import { toast } from "sonner";
import { RootState } from "@/lib/store/store";

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful. Received data:", data);

        dispatch(
          setUser({
            user: data.user,
            token: data.token,
            expiresIn: data.expiresIn,
          })
        );

        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("expiresIn", JSON.stringify(data.expiresIn));

        toast.success("Login successful");
        router.push("/");
      } else {
        console.error("Login failed. Status:", response.status);
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome To</h1>
          <h1 className="text-3xl font-bold text-teal-500">
            GeekMailer
          </h1>
          <p className="text-gray-600">
            Log-in with Admin Account to Continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
