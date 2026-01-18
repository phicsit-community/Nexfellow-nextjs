'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/store/slices/userSlice';
import styles from './SideBar.module.css';

// Icons
import {
    FiHome,
    FiUsers,
    FiBarChart2,
    FiUserPlus,
    FiGift,
    FiCheckCircle,
    FiSend,
    FiLogOut,
} from 'react-icons/fi';

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`${styles.navLink} ${isActive ? styles.active : ''}`}
        >
            {icon}
            <p>{label}</p>
        </Link>
    );
}

export function SideBar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearUser());
        localStorage.clear();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: '/home', icon: <FiHome className={styles.sideIcon} />, label: 'Home' },
        { href: '/users', icon: <FiUsers className={styles.sideIcon} />, label: 'Users' },
        { href: '/analytics', icon: <FiBarChart2 className={styles.sideIcon} />, label: 'Analytics' },
        { href: '/referrals', icon: <FiUserPlus className={styles.sideIcon} />, label: 'Referrals' },
        { href: '/rewards', icon: <FiGift className={styles.sideIcon} />, label: 'Rewards' },
        { href: '/requests', icon: <FiCheckCircle className={styles.sideIcon} />, label: 'Verification' },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.logoDiv}>
                <div className={styles.brandName}>
                    <span className={styles.brandIcon}>G</span>
                    <span>Geek Clash</span>
                </div>
            </div>

            <div className={styles.sideContainer}>
                <div className={styles.sidebarUpper}>
                    {navItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isActive={isActive(item.href)}
                        />
                    ))}

                    <div className={styles.geekMailerDiv}>
                        <FiSend className={styles.sideIcon} />
                        <a
                            href="https://geekmailer-a7do.onrender.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.geekMailerTag}
                        >
                            Geek Mail
                        </a>
                    </div>
                </div>

                <div className={styles.sidebarLower}>
                    <div onClick={handleLogout} className={styles.logoutBtn}>
                        <FiLogOut className={styles.sideIcon} />
                        <p>Logout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
