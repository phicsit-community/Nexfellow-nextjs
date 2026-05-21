"use client";

import Premium from "@/Pages/Premium/Premium";
import PublicLayout from "@/layouts/PublicLayout";
import PrivateRoutes from "@/utils/PrivateRoutes";

export default function PremiumPage() {
  return (
    <PrivateRoutes>
      <PublicLayout>
        <Premium />
      </PublicLayout>
    </PrivateRoutes>
  );
}
