"use client";

import { Suspense, lazy } from "react";
import Navbar            from "@/components/Landing/Navbar/Navbar";
import Hero              from "@/components/Landing/Hero/Hero";
import ActivityTicker    from "@/components/Landing/ActivityTicker/ActivityTicker";

const ProductShowcase    = lazy(() => import("@/components/Landing/ProductShowcase/ProductShowcase"));
const HowItWorks         = lazy(() => import("@/components/Landing/HowItWorks/HowItWorks"));
const TheProblem         = lazy(() => import("@/components/Landing/TheProblem/TheProblem"));
const BuildersMap        = lazy(() => import("@/components/Landing/BuildersMap/BuildersMap"));
const LandingTestimonials = lazy(() => import("@/components/Landing/Testimonials/LandingTestimonials"));
const CtaBanner          = lazy(() => import("@/components/Landing/CtaBanner/CtaBanner"));
const Footer             = lazy(() => import("@/components/Landing/Footer/Footer"));

const Spinner = () => (
  <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 28, height: 28, border: "2px solid rgba(20,184,166,0.2)", borderTopColor: "#14b8a6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function Home() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#071a2c", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <ActivityTicker />
      <Suspense fallback={<Spinner />}><ProductShowcase /></Suspense>
      <Suspense fallback={<Spinner />}><HowItWorks /></Suspense>
      <Suspense fallback={<Spinner />}><TheProblem /></Suspense>
      <Suspense fallback={<Spinner />}><BuildersMap /></Suspense>
      <Suspense fallback={<Spinner />}><LandingTestimonials /></Suspense>
      <Suspense fallback={<Spinner />}><CtaBanner /></Suspense>
      <Suspense fallback={<Spinner />}><Footer /></Suspense>
    </div>
  );
}
