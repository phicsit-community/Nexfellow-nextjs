"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Loader from "@/components/Loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    // Check authentication
    if (!user) {
      router.push("/login");
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col w-full max-w-367.5 mx-auto">
      <Header />
      <div className="flex w-full justify-between h-full">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="w-full md:w-[calc(100%-300px)] box-border pt-20 pb-20 md:pb-5">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
