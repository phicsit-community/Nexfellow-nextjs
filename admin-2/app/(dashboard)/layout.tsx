import { SideBar } from '@/components/layout/SideBar';
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/AuthGuard';
import styles from './dashboard.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className={styles.dashboardContainer}>
                <Navbar />
                <SideBar />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
