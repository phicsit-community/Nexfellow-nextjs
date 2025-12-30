import { useTheme } from "../../hooks/useTheme";
import axios from "axios";
import { Sun, Moon, Monitor } from "lucide-react";
import styles from "./ThemeToggleButton.module.css";

// function ThemeToggleButton() {
//     const { theme, setTheme } = useTheme();

//     const nextTheme = () => {
//         if (theme === "light") setTheme("dark");
//         else if (theme === "dark") setTheme("system");
//         else setTheme("light");
//     };

//     const getIcon = () => {
//         if (theme === "light")
//             return <Sun size={16} className={styles.sun} />;
//         if (theme === "dark")
//             return <Moon size={16} className={styles.moon} />;
//         return <Monitor size={16} className={styles.monitor} />;
//     };

//     const getLabel = () => {
//         if (theme === "light") return "Light";
//         if (theme === "dark") return "Dark";
//         return "System";
//     };

//     return (
//         <button
//             onClick={nextTheme}
//             className={styles.button}
//         >
//             <div className={styles.label}>
//                 {getIcon()}
//                 <span>{getLabel()} Theme</span>
//             </div>
//             <div className={styles.togglePill}>
//                 <div
//                     className={`${styles.toggleKnob} ${theme === "light"
//                         ? styles.light
//                         : theme === "dark"
//                             ? styles.dark
//                             : styles.system
//                         }`}
//                 />
//             </div>
//         </button>
//     );
// }

function ThemeToggleButton() {
    const { theme, setTheme } = useTheme();

    const saveThemePreference = async (preference) => {
        try {
            await axios.patch('user/me/theme', { theme: preference }, { withCredentials: true });
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
    };

    const nextTheme = () => {
        let newTheme;
        if (theme === "light") newTheme = "dark";
        else if (theme === "dark") newTheme = "system";
        else newTheme = "light";

        setTheme(newTheme);
        saveThemePreference(newTheme);
    };

    const getIcon = () => {
        if (theme === "light")
            return <Sun size={16} className={styles.sun} />;
        if (theme === "dark")
            return <Moon size={16} className={styles.moon} />;
        return <Monitor size={16} className={styles.monitor} />;
    };

    const getLabel = () => {
        if (theme === "light") return "Light";
        if (theme === "dark") return "Dark";
        return "System";
    };

    return (
        <button
            onClick={nextTheme}
            className={styles.button}
        >
            <div className={styles.label}>
                {getIcon()}
                <span>{getLabel()} Theme</span>
            </div>
            <div className={styles.togglePill}>
                <div
                    className={`${styles.toggleKnob} ${theme === "light"
                        ? styles.light
                        : theme === "dark"
                            ? styles.dark
                            : styles.system
                        }`}
                />
            </div>
        </button>
    );
}

export default ThemeToggleButton;
