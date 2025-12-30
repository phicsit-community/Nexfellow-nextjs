import React, { useRef, lazy, Suspense } from "react";
import Hero from "../../components/Landing/Hero/Hero";
import style from "./Home.module.css";

// Lazy load components that are not needed immediately
const ExploreThousandCommunities = lazy(() =>
  import(
    "../../components/Landing/ExploreThousandCommunities/ExploreThousandCommunities"
  )
);
const GetMoreWithGCCommunity = lazy(() =>
  import(
    "../../components/Landing/GetMoreWithGCCommunity/GetMoreWithGCCommunity"
  )
);
const FAQ = lazy(() => import("../../components/Landing/Faq/Faq"));
const Footer = lazy(() => import("../../components/Landing/Footer/Footer"));
const CreatorsWho = lazy(() =>
  import("../../components/Landing/creatorswho/CreatorsWho")
);
const GetVerified = lazy(() =>
  import("../../components/Landing/GetVerified/GetVerified")
);
const ContactCTA = lazy(() =>
  import("../../components/Landing/ContactCTA/ContactCTA")
);

// Loading fallback component
const LoadingFallback = () => (
  <div className={style.loadingContainer}>
    <div className={style.loadingSpinner}></div>
  </div>
);

const Home = () => {
  const getMoreRef = useRef(null);

  const scrollToSection = () => {
    if (getMoreRef.current) {
      getMoreRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={style.wideContainer}>
      <Hero scrollToSection={scrollToSection} />
      <Suspense fallback={<LoadingFallback />}>
        <GetMoreWithGCCommunity ref={getMoreRef} />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <GetVerified />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <ExploreThousandCommunities />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <ContactCTA />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <CreatorsWho />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Home;
