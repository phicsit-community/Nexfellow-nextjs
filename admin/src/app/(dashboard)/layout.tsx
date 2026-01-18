import SideBar from '@/components/SideBar/SideBar';
import AuthGuard from '@/components/AuthGuard/AuthGuard';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-slate-800">
                <SideBar />
                {/* Main content - responsive margin with proper overflow handling */}
                <main className="flex-1 md:ml-[250px] lg:ml-[250px] mt-[60px] md:mt-0 w-full overflow-x-hidden overflow-y-auto">
                    <div className="min-h-screen">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
