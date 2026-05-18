"use client";

import dynamic from "next/dynamic";
import PrivateLayout from "@/layouts/PrivateLayout";

const BuildersMap = dynamic(
    () => import("@/Pages/BuildersMap/BuildersMap"),
    { ssr: false, loading: () => <div style={{ height: "calc(100vh - 80px)", background: "#F1F5F9" }} /> }
);

export default function BuildersMapPage() {
    return (
        <PrivateLayout>
            <BuildersMap />
        </PrivateLayout>
    );
}
