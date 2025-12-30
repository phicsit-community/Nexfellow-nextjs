"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider } from "@/hooks/useTheme";
import { ConfigProvider } from "antd";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/sonner";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
                    {children}
                    <ToastContainer />
                    <Toaster />
                </ConfigProvider>
            </ThemeProvider>
        </Provider>
    );
}
