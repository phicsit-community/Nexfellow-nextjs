"use client";

import { Suspense, lazy } from "react";
import Navbar from "@/components/Landing/Navbar/Navbar";
import FeaturesHero from "@/components/Landing/FeaturesHero/FeaturesHero";
import EarlyAdopterSection from "@/components/Landing/FeaturesSections/EarlyAdopterSection";
import FeedbackSection from "@/components/Landing/FeaturesSections/FeedbackSection";
import BuilderNetworkSection from "@/components/Landing/FeaturesSections/BuilderNetworkSection";
import ComparisonTable from "@/components/Landing/ComparisonTable/ComparisonTable";

const CtaBanner = lazy(() => import("@/components/Landing/CtaBanner/CtaBanner"));
const Footer = lazy(() => import("@/components/Landing/Footer/Footer"));

const Spinner = () => (
  <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 28, height: 28, border: "2px solid rgba(20,184,166,0.2)", borderTopColor: "#14b8a6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function Features() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#071a2c", minHeight: "100vh" }}>
      <Navbar />
      <FeaturesHero />
      <EarlyAdopterSection />
      <FeedbackSection />
      <BuilderNetworkSection />
      <ComparisonTable />
      <Suspense fallback={<Spinner />}><CtaBanner /></Suspense>
      <Suspense fallback={<Spinner />}><Footer /></Suspense>
    </div>
  );
}
