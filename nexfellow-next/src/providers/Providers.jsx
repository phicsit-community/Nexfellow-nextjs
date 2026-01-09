"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider } from "@/hooks/useTheme";
import { ConfigProvider, App } from "antd";
import dynamic from "next/dynamic";
import ClientInitializer from "@/components/ClientInitializer";
import AntdGlobal from "@/components/AntdGlobal";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Lazy load toast components for better performance
const ToastContainer = dynamic(
    () => import("react-toastify").then(mod => mod.ToastContainer),
    { ssr: false }
);

const Toaster = dynamic(
    () => import("@/components/ui/sonner").then(mod => mod.Toaster),
    { ssr: false }
);

export function Providers({ children }) {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: "#24b2b4",
                        },
                    }}
                >
                    <App>
                        <AntdGlobal />
                        <ClientInitializer />
                        {children}
                        <ToastContainer />
                        <Toaster />
                    </App>
                </ConfigProvider>
            </ThemeProvider>
        </Provider>
    );
}
